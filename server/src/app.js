import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import path from 'path'
import { config } from './lib/config'
import datasetRouter from './routes/dataset.routes'

// Swagger
import swaggerUI from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import { options } from './lib/swaggerOptions'

// Initializing app
const app = express()

// Settings
app.set('port', config.express.port)

// Middelwares
app.use(morgan('dev'))
app.use(cors(config.cors))
app.use(express.json())

// Routes
const specs = swaggerJSDoc(options)

app.use('/api/v1/datasets', datasetRouter)
app.use('/api', swaggerUI.serve, swaggerUI.setup(specs))

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')))

export default app