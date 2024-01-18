import { config as dotenv } from 'dotenv'
import path from 'path'
dotenv()

export const config = {
	express: {
		host: process.env.SERVER_HOST || `http://localhost:${process.env.PORT || 3000}`,
		port: process.env.PORT || 3000
	},
	cors: {
		origin: process.env.CORS_ORIGIN || '*',
		optionsSuccessStatus: 200
	},
	database: {
		host: process.env.MYSQL_HOST || 'localhost',
		port: process.env.MYSQL_PORT || 3306,
		user: process.env.MYSQL_USER || 'root',
		password: process.env.MYSQL_PASS || '',
		database: process.env.MYSQL_DB_NAME || 'generate-datasets'
	},
	dataset: {
		delayTime: process.env.DELAY_TIME || 12000,
		folderDatasets: process.env.FOLDER_DATASETS || path.join(__dirname, '../public/datasets')
	}
}