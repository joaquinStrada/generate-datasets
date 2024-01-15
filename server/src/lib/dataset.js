import axios from 'axios'
import { getConnection } from './database'
import { sendMessage } from '../socket'
import { config } from './config'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuid } from 'uuid'

export const validateCoin = async (coinId, firstDate, endDate) => {
	const dateFirst = new Date(firstDate)
	const dateEnd = new Date(endDate)

	const strFirstDate = `${dateFirst.getDate()}-${dateFirst.getMonth() + 1}-${dateFirst.getFullYear()}`
	const strEndDate = `${dateEnd.getDate()}-${dateEnd.getMonth() + 1}-${dateEnd.getFullYear()}`
    
	try {
		const resFirstDate = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/history`, {
			params: {
				date: strFirstDate,
				localization: 'es'
			}
		})

		const resEndDate = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/history`, {
			params: {
				date: strEndDate,
				localization: 'es'
			}
		})

		if (resFirstDate.status === 200 && !resFirstDate.data.market_data) {
			return {
				error: true,
				message: 'No existen datos para la fecha inicial seleccionada'
			}
		} else if (resEndDate.status === 200 && !resEndDate.data.market_data) {
			return {
				error: true,
				message: 'No existen datos para la fecha final seleccionada'
			}
		} else {
			return {
				error: false
			}
		}
	} catch (err) {
		if (err.response && err.response.status === 404 && err.response.data && err.response.data.error === 'coin not found') {
			return {
				error: true,
				message: 'Moneda no encontrada'
			}
		} else {
			throw err
		}
	}
}

const delay = time => new Promise(resolve => setTimeout(() => resolve(time), time))

export const generateDataset = async datasetId => {
	try {
		// obtenemos y manipulamos los datos
		const [ [ dataset ] ] = await getConnection().query('SELECT `coinId`, `firstDate`, `endDate`, `data`, `predictData`, `validityData` FROM `datasets` WHERE `id` = ?', [datasetId])

		dataset.firstDate = new Date(dataset.firstDate).getTime()
		dataset.endDate = new Date(dataset.endDate).getTime()
		dataset.data = JSON.parse(dataset.data)
		dataset.predictData = JSON.parse(dataset.predictData)

		console.log(dataset)
		// Generamos el dataset
		const responses = []
		const diffDate = dataset.endDate - dataset.firstDate
		let waitTime = (diffDate / (24 * 60 * 60 * 1000)) * (config.dataset.delayTime / 1000)

		await getConnection().query('UPDATE `datasets` SET `status` = "downloading" WHERE `id` = ?', [datasetId])
		sendMessage('dataset', {
			datasetId,
			status: 'downloading',
			percentage: 0,
			waitTime
		})

		for (let dateIndex = dataset.firstDate; dateIndex <= dataset.endDate; dateIndex += 24 * 60 * 60 * 1000) {
			const date = new Date(dateIndex)
			const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
			const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${dataset.coinId}/history`, {
				params: {
					date: dateStr,
					localization: 'es'
				}
			})

			if (response.status === 200) {
				responses.push(response.data)
			}

			// Notificamos a los usuarios del progreso
			const percentage = ((dateIndex - dataset.firstDate) * 100) / diffDate
			waitTime = ((dataset.endDate - dateIndex) / (24 * 60 * 60 * 1000)) * (config.dataset.delayTime / 1000)
			sendMessage('dataset', {
				datasetId,
				status: 'downloading',
				percentage,
				waitTime
			})

			// Esperamos un tiempo para no colapsar la api
			await delay(config.dataset.delayTime)
		}

		// Procesamos las respuestas
		const data = []
		const predictData = []

		await getConnection().query('UPDATE `datasets` SET `status` = "procesing" WHERE `id` = ?', [datasetId])
		sendMessage('dataset', {
			datasetId,
			status: 'procesing',
			percentage: 0
		})

		for (let index = 0; index < responses.length; index++) {
			const dataElement = dataset.data.map(property => extractData(property, responses, index))
			const predictDataElement = dataset.predictData.map(property => extractData(property, responses, index))

			data.push(dataElement)
			predictData.push(predictDataElement)

			// Notificamos a los usuarios del progreso
			sendMessage('dataset', {
				datasetId,
				status: 'procesing',
				percentage: ((index + 1) * 100) / responses.length
			})
		}

		data.pop()
		predictData.shift()

		// Guardamos el dataset
		const trainData = 100 - dataset.validityData
		const lengthData = (trainData * data.length) / 100
		const fileName = uuid() + '.json'
		const fileDataset = {
			data: data.slice(0, lengthData),
			predictData: predictData.slice(0, lengthData),
			validityData: data.slice(lengthData, data.length),
			validityPredictData: predictData.slice(lengthData, predictData.length)
		}

		await fs.writeFile(path.join(config.dataset.folderDatasets, fileName), JSON.stringify(fileDataset), 'utf-8')

		await getConnection().query('UPDATE `datasets` SET `dataset` = ?, `status` = "generated" WHERE `id` = ?', [fileName, datasetId])

		// Notificamos al usuario de que el dataset ha sido creado
		sendMessage('dataset', {
			datasetId,
			status: 'generated'
		})
	} catch (err) {
		console.error(err)
		sendMessage('dataset', {
			datasetId,
			status: 'error'
		})
	}
}

const extractData = (property, responses, index) => {
	if (property === 'current_price') {
		return responses[index].market_data.current_price.usd
	} else if (property === 'market_cap') {
		return responses[index].market_data.market_cap.usd
	} else if (property === 'total_volume') {
		return responses[index].market_data.total_volume.usd
	} else if (property === 'price_change_24h') {
		return index > 0 ? 
			responses[index].market_data.current_price.usd - responses[index - 1].market_data.current_price.usd
			: 0
	} else if (property === 'price_change_percentage_24h' && index > 0) {
		const priceChange24h = responses[index].market_data.current_price.usd - responses[index - 1].market_data.current_price.usd
		return priceChange24h * 100 / responses[index].market_data.current_price.usd
	} else if (property === 'price_change_percentage_24h') {
		return 0
	} else if (property === 'market_cap_change_24h') {
		return index > 0 ? 
			responses[index].market_data.market_cap.usd - responses[index - 1].market_data.market_cap.usd
			: 0
	} else if (property === 'market_cap_change_percentage_24h' && index > 0) {
		const marketCapChange24h = responses[index].market_data.market_cap.usd - responses[index - 1].market_data.market_cap.usd
		return marketCapChange24h * 100 / responses[index].market_data.market_cap.usd
	} else if (property === 'market_cap_change_percentage_24h') {
		return 0
	} else {
		throw new Error('La propiedad no esta definida')
	}
}