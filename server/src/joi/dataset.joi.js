import Joi from 'joi'
import JoiDate from '@joi/date'

Joi.extend(JoiDate)

const variablesDataset = [
	'current_price',
	'market_cap',
	'total_volume',
	'price_change_24h',
	'price_change_percentage_24h',
	'market_cap_change_24h', 
	'market_cap_change_percentage_24h'
]


export const schemaGenerateDataset = Joi.object({
	name: Joi.string().min(6).max(50).required(),
	description: Joi.string().min(6).max(255).required(),
	coinId: Joi.string().min(3).max(10).required(),
	firstDate: Joi.date().required(),
	endDate: Joi.date().required(),
	data: Joi.array().items(Joi.string().pattern(new RegExp(`^(${variablesDataset.join('|')})$`))).min(1).max(variablesDataset.length).required(),
	predictData: Joi.array().items(Joi.string().pattern(new RegExp(`^(${variablesDataset.join('|')})$`))).min(1).max(variablesDataset.length).required(),
	validityData: Joi.number().min(0).max(100).required()
})

export const schemaUpdate = Joi.object({
	id: Joi.number().integer().min(1).max(9999999999).required(),
	name: Joi.string().min(6).max(50).required(),
	description: Joi.string().min(6).max(255).required()
})