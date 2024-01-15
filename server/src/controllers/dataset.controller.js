import { schemaGenerateDataset } from '../joi/dataset.joi'
import { getConnection } from '../lib/database'
import { validateCoin, generateDataset } from '../lib/dataset'
import format from 'timeago-es/timeago-es'
import { sendMessage } from '../socket'

export const getDatasets = async (req, res) => {
	try {
		let [ datasets ] = await getConnection().query('SELECT * FROM `datasets`')

		datasets = datasets.map(({id, createdAt, name, description, coinId, firstDate,
			endDate, data, predictData, validityData, dataset, status}) => ({
			id,
			createdAt: format(createdAt),
			name,
			description,
			coinId,
			firstDate,
			endDate,
			data: JSON.parse(data),
			predictData: JSON.parse(predictData),
			validityData,
			dataset: dataset ? `/public/datasets/${dataset}` : '',
			status
		}))

		res.json({
			error: true,
			data: datasets
		})
	} catch (err) {
		console.error(err)
		res.status(500).json({
			error: true,
			message: 'Ha ocurrido un error'
		})
	}
}

export const getDataset = async (req, res) => {
	const { id } = req.params
	
	try {
		const [ dataset ] = await getConnection().query('SELECT * FROM `datasets` WHERE `id` = ?', [id])

		if (dataset.length === 0) {
			return res.status(404).json({
				error: true,
				message: 'Id no encontrado'
			})
		}

		dataset[0].createdAt = format(dataset[0].createdAt)
		dataset[0].data = JSON.parse(dataset[0].data)
		dataset[0].predictData = JSON.parse(dataset[0].predictData)
		dataset[0].dataset = dataset[0].dataset ? `/public/datasets/${dataset[0].dataset}` : ''

		res.json({
			error: false,
			data: dataset[0]
		})
	} catch (err) {
		console.error(err)
		res.status(500).json({
			error: true,
			message: 'Ha ocurrido un error'
		})
	}
}

export const createDataset = async (req, res) => {
	const { 
		name, 
		description, 
		coinId, 
		firstDate, 
		endDate, 
		data, 
		predictData, 
		validityData } = req.body

	// Validamos los campos
	const { error } = schemaGenerateDataset.validate({
		name,
		description,
		coinId,
		firstDate,
		endDate,
		data,
		predictData,
		validityData
	})

	if (error) {
		return res.status(400).json({
			error: true,
			message: error.details[0].message
		})
	} else if (new Date(firstDate).getTime() > new Date(endDate).getTime()) {
		return res.status(400).json({
			error: true,
			message: 'La fecha inicial no puede ser mayor a la fecha final'
		})
	}

	try {
		// Validamos que el nombre del dataset no exista
		const [ isExistDataset ] = await getConnection().query('SELECT COUNT(*) FROM `datasets` WHERE `name` = ?', [name])

		if (isExistDataset[0]['COUNT(*)'] > 0) {
			return res.status(400).json({
				error: true,
				message: 'Ya existe otro dataset con el mismo nombre'
			})
		}

		// Validamos que la moneda exista y que las fechas sean correctas
		const isValidCoin = await validateCoin(coinId, firstDate, endDate)

		if (isValidCoin.error) {
			return res.status(400).json(isValidCoin)
		}

		// Guardamos el dataset
		const newDataset = {
			name,
			description,
			coinId,
			firstDate,
			endDate,
			data: JSON.stringify(data),
			predictData: JSON.stringify(predictData),
			validityData,
			status: 'pending'
		}

		const [ { insertId } ] = await getConnection().query('INSERT INTO `datasets` SET ?', [newDataset])
		const [ [ datasetBD ] ] = await getConnection().query('SELECT * FROM `datasets` WHERE `id` = ?', [insertId])
		datasetBD.createdAt = format(datasetBD.createdAt)
		datasetBD.data = JSON.parse(datasetBD.data)
		datasetBD.predictData = JSON.parse(datasetBD.predictData)

		generateDataset(insertId)

		sendMessage('created-dataset', datasetBD)

		res.json({
			error: false,
			data: datasetBD
		})
	} catch (err) {
		console.error(err)
		res.status(500).json({
			error: true,
			message: 'Ha ocurrido un error'
		})
	}
}

export const updateDataset = (req, res) => {
	res.json('oh yeah!!!')
}

export const deleteDataset = (req, res) => {
	res.json('oh yeah!!!')
}