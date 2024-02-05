import axios from 'axios'
import { config } from './config'

export const Api = axios.create({
	baseURL: `${config.api.host}/api/v1/datasets`,
	headers: {
		'Content-Type': 'application/json'
	}
})