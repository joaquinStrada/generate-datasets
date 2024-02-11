import axios from 'axios'
import { getConnection } from './database'
import { sendMessage } from '../socket'
import { config } from './config'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuid } from 'uuid'
import Excel4Node from 'excel4node'

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
			status: 'generated',
			pathDataset: `/public/datasets/${fileName}`
		})
	} catch (err) {
		if (err.response && err.response.status === 429) {
			sendMessage('dataset', {
				datasetId,
				status: 'error',
				message: 'Servidor sobrecargado, lo intentaremos de nuevo en un minuto'
			})
            
			setTimeout(() => generateDataset(datasetId), 60000)
		} else {
			console.error(err)
			sendMessage('dataset', {
				datasetId,
				status: 'error',
				message: 'Ha ocurrido un error'
			})
		}
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

export const datasetToExcel = async datasetId => {
	// Obtenemos el dataset
	const [ [ datasetBD ] ] = await getConnection().query('SELECT `name`, `firstDate`, `data`, `predictData`, `validityData`, `dataset` FROM `datasets` WHERE `id` = ?', [datasetId])
	
	datasetBD.firstDate = new Date(datasetBD.firstDate).getTime()
	datasetBD.data = JSON.parse(datasetBD.data)
	datasetBD.predictData = JSON.parse(datasetBD.predictData)

	// Obtenemos el json del dataset
	const pathDataset = path.join(__dirname, '../public/datasets', datasetBD.dataset)
	const fileDataset = await fs.readFile(pathDataset, 'utf8')
	const jsonDataset = JSON.parse(fileDataset)

	// Generamos el excel
	const excel = new Excel4Node.Workbook()
	const style = excel.createStyle({
		font: {
			color: '#000000',
			fontSize: 12
		}
	})

	// Generamos la hoja Data
	const wsData = excel.addWorksheet('Data')

	// Encabezados de la hoja data
	wsData.cell(1, 1).string('Fecha').style(style)

	for (let i = 0; i < datasetBD.data.length; i++) {
		wsData.cell(1, i + 2)
			.string(datasetBD.data[i])
			.style(style)
	}

	// Datos de la hoja data
	for (let row = 0; row < jsonDataset.data.length; row++) {
		const dateDay = new Date(datasetBD.firstDate + (row * 24 * 60 * 60 * 1000))
		wsData.cell(row + 2, 1)
			.string(`${dateDay.getDate()}/${dateDay.getMonth() + 1}/${dateDay.getFullYear()}`)
			.style(style)

		for (let col = 0; col < jsonDataset.data[row].length; col++) {
			wsData.cell(row + 2, col + 2)
				.number(jsonDataset.data[row][col])
				.style(style)
		}
	}

	// Generamos la hoja predictData
	const wsPredictData = excel.addWorksheet('Predict Data')

	// Encabezados de la hoja predictData
	wsPredictData.cell(1,1).string('Fecha').style(style)

	for (let i = 0; i < datasetBD.predictData.length; i++) {
		wsPredictData.cell(1, i + 2)
			.string(datasetBD.predictData[i])
			.style(style)
	}

	// Datos de la hoja predictData
	for (let row = 0; row < jsonDataset.predictData.length; row++) {
		const dateDay = new Date(datasetBD.firstDate + ((row + 1) * 24 * 60 * 60 * 1000))
		wsPredictData.cell(row + 2, 1)
			.string(`${dateDay.getDate()}/${dateDay.getMonth() + 1}/${dateDay.getFullYear()}`)
			.style(style)

		for (let col = 0; col < jsonDataset.predictData[row].length; col++) {
			wsPredictData.cell(row + 2, col + 2)
				.number(jsonDataset.predictData[row][col])
				.style(style)
		}
	}

	// Verificamos si tenemos validity data
	if (datasetBD.validityData > 0) {
		// Generamos la hoja validityData
		const wsValidityData = excel.addWorksheet('Validity Data')

		// Encabezados de la hoja validityData
		wsValidityData.cell(1, 1).string('Fecha').style(style)

		for (let i = 0; i < datasetBD.data.length; i++) {
			wsValidityData.cell(1, i + 2)
				.string(datasetBD.data[i])
				.style(style)
		}

		// Datos de la hoja validityData
		for (let row = 0; row < jsonDataset.validityData.length; row++) {
			const dateDay = new Date(datasetBD.firstDate + (row * 24 * 60 * 60 * 1000))
			wsValidityData.cell(row + 2, 1)
				.string(`${dateDay.getDate()}/${dateDay.getMonth() + 1}/${dateDay.getFullYear()}`)
				.style(style)

			for (let col = 0; col < jsonDataset.validityData[row].length; col++) {
				wsValidityData.cell(row + 2, col + 2)
					.number(jsonDataset.validityData[row][col])
					.style(style)
			}
		}

		// Generamos la hoja validityPredictData
		const wsValidityPredictData = excel.addWorksheet('Validity Predict Data')

		// Encabezados de la hoja validityPredictData
		wsValidityPredictData.cell(1, 1).string('Fecha').style(style)

		for (let i = 0; i < datasetBD.predictData.length; i++) {
			wsValidityPredictData.cell(1, i + 2)
				.string(datasetBD.predictData[i])
				.style(style)
		}

		// Datos de la hoja validityPredictData
		for (let row = 0; row < jsonDataset.validityPredictData.length; row++) {
			const dateDay = new Date(datasetBD.firstDate + ((row + 1) * 24 * 60 * 60 * 1000))
			wsValidityPredictData.cell(row + 2, 1)
				.string(`${dateDay.getDate()}/${dateDay.getMonth() + 1}/${dateDay.getFullYear()}`)
				.style(style)

			for (let col = 0; col < jsonDataset.validityPredictData[row].length; col++) {
				wsValidityPredictData.cell(row + 2, col + 2)
					.number(jsonDataset.validityPredictData[row][col])
					.style(style)
			}
		}
	}

	// Guardamos el archivo excel
	const pathExcel = path.join(__dirname, `../public/datasets/${datasetBD.name}.xlsx`)
	
	return new Promise((resolve, reject) => {
		excel.write(pathExcel, err => {
			if (err) {
				reject(err)
			} else {
				resolve(pathExcel)
			}
		})
	})
}