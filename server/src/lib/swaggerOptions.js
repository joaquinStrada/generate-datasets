import packageInfo from '../../package.json'
import { config } from './config'

const replaceName = name => name.toLowerCase().split('_')
	.map(name => name.charAt(0).toUpperCase() + name.slice(1)).join(' ')

export const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: replaceName(packageInfo.name),
			description: packageInfo.description,
			version: packageInfo.version
		},
		servers: [
			{
				url: config.express.host
			}
		]
	},
	apis: [
		'./src/routes/*.js'
	]
}

