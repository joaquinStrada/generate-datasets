import mysql from 'mysql2/promise'
import { config } from './config'

let conn

export const createConnection = async () => {
	try {
		conn = await mysql.createConnection(config.database)

		console.log('DB is connected to', config.database.host)
	} catch (err) {
		console.error(err)
	}
}

export const getConnection = () => {
	if (conn) {
		return conn
	} else {
		return false
	}
}