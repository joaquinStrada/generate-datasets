import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import { config } from './lib/config'
import datasetRouter from './routes/dataset.routes'

// Initializing app
const app = express()

// Settings
app.set('port', config.express.port)

// Middelwares
app.use(morgan('dev'))
app.use(cors(config.cors))
app.use(express.json())

// Routes
app.use('/api/v1/datasets', datasetRouter)

// Static files

export default app