import { schemaGenerateDataset } from '../joi/dataset.joi'
import { getConnection } from '../lib/database'
import { validateCoin, generateDataset } from '../lib/dataset'
import format from 'timeago-es/timeago-es'
import { sendMessage } from '../socket'

export const getDatasets = (req, res) => {
	res.json('oh yeah!!!')
}

export const getDataset = (req, res) => {
	res.json('oh yeah!!!')
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
		const [ [ datasetBD ] ] = await getConnection().query('SELECT `id`, `createdAt`, `name`, `description`, `coinId`, `firstDate`, `endDate`, `data`, `predictData`, `validityData`, `status` FROM `datasets` WHERE `id` = ?', [insertId])
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