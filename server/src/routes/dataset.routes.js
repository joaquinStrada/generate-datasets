import { Router } from 'express'
import { getDatasets, getDataset, createDataset, updateDataset, deleteDataset, datasetToExcel } from '../controllers/dataset.controller'

const router = Router()

/**
 * @swagger
 * components:
 *  schemas:
 *      Dataset:
 *          type: object
 *          description: Dataset
 *          properties:
 *              id:
 *                  type: integer
 *                  description: El id del dataset
 *                  example: 1
 *              createdAt:
 *                  type: string
 *                  description: Hace cuanto fue creado el dataset
 *                  example: 2 dias
 *              name:
 *                  type: string
 *                  description: El nombre del dataset
 *                  example: bitcoin
 *              description:
 *                  type: string
 *                  description: La descripcion del dataset
 *                  example: esta es la moneda de bitcoin
 *              coinId:
 *                  type: string
 *                  description: El id de la criptomoneda segun coingecko
 *                  example: bitcoin
 *              firstDate:
 *                  type: string
 *                  description: La fecha de inicio del dataset
 *                  example: 2014-07-14T03:00:00.000Z
 *              endDate:
 *                  type: string
 *                  description: La fecha final del dataset
 *                  example: 2014-07-24T03:00:00.000Z
 *              data:
 *                  type: array
 *                  description: los tipos de datos del dataset
 *                  items:
 *                      type: string
 *                      description: El tipo de dato del dataset
 *                  example: ["current_price","market_cap","total_volume","price_change_24h","price_change_percentage_24h","market_cap_change_24h","market_cap_change_percentage_24h"]
 *              predictData:
 *                  type: array
 *                  description: los tipos de datos de prediccion del dataset
 *                  items:
 *                      type: string
 *                      description: El tipo de dato de prediccion del dataset
 *                      example: current_price
 *              validityData:
 *                  type: number
 *                  description: El porcentage de datos de validacion del dataset
 *                  example: 20
 *              dataset:
 *                  type: string
 *                  description: La url del dataset generado
 *                  example: /public/datasets/dff33c9d-c6da-42f8-8724-b19f8b33b852.json
 *              status:
 *                  type: string
 *                  description: El estado del dataset
 *                  example: pending
 *          required:
 *              - name
 *              - description
 *              - coinId
 *              - firstDate
 *              - endDate
 *              - data
 *              - predictData
 *              - validityData
 *      Error:
 *          type: object
 *          description: Error del servidor
 *          properties:
 *              error:
 *                  type: boolean
 *                  description: indica si ha ocurrido un error
 *                  example: true
 *              message:
 *                  type: string
 *                  description: mensaje del servidor
 *                  example: Ha ocurrido un error
 *      notFound:
 *          type: object
 *          description: Dataset no encontrado
 *          properties:
 *              error:
 *                  type: boolean
 *                  description: Indica si hubo un error
 *                  example: true
 *              message:
 *                  type: string
 *                  description: El mensaje del servidor
 *                  example: Dataset no encontrado
 *  parameters:
 *      datasetId:
 *          name: id
 *          in: path
 *          required: true
 *          schema:
 *              type: integer
 *              description: El id del dataset
 *          description: El id del dataset
 */

/**
 * @swagger
 * tags:
 *  name: Datasets
 *  description: Dataset endpoints
 */

/**
 * @swagger
 * /api/v1/datasets/:
 *  get:
 *      summary: Devuelve la lista de datasets
 *      tags: [Datasets]
 *      responses:
 *          200:
 *              description: La lista de datasets
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error:
 *                                  type: boolean,
 *                                  description: indica si hubo un error
 *                                  example: false
 *                              data:
 *                                  type: array
 *                                  items:
 *                                      $ref: '#/components/schemas/Dataset'
 *          500:
 *              description: Error del servidor
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *                      
 */
router.get('/', getDatasets)

/**
 * @swagger
 * /api/v1/datasets/{id}:
 *  get:
 *      summary: Obtenemos un dataset
 *      tags: [Datasets]
 *      parameters:
 *        - $ref: '#/components/parameters/datasetId'
 *      responses:
 *          200:
 *              description: El dataset
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error:
 *                                  type: boolean
 *                                  description: Indica si hubo un error
 *                                  example: false
 *                              data:
 *                                  $ref: '#/components/schemas/Dataset'
 *          404:
 *              description: Dataset no encontrado
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/notFound'
 *          500:
 *              description: Error del servidor
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 */
router.get('/:id', getDataset)

/**
 * @swagger
 * /api/v1/datasets/:
 *  post:
 *      summary: Crear nuevo dataset
 *      tags: [Datasets]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Dataset'
 *      responses:
 *          200:
 *              description: el nuevo dataset
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          description: El nuevo dataset
 *                          properties:
 *                              error:
 *                                  type: boolean
 *                                  description: Indica si hubo un error
 *                                  example: false
 *                              data:
 *                                  $ref: '#/components/schemas/Dataset'
 *          400:
 *              description: Error en el envio de datos
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          description: respuesta del servidor
 *                          properties:
 *                              error:
 *                                  type: boolean
 *                                  description: Indica si hubo un error
 *                                  example: true
 *                              message:
 *                                  type: string
 *                                  description: La respuesta del servidor
 *                                  example: Ya existe otro dataset con el mismo nombre
 *          500:
 *              description: Error del servidor
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 */
router.post('/', createDataset)

/**
 * @swagger
 * /api/v1/datasets/{id}:
 *  put:
 *      summary: Actualizar dataset
 *      tags: [Datasets]
 *      parameters:
 *          - $ref: '#/components/parameters/datasetId'
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      description: Los nuevos datos del dataset
 *                      properties:
 *                          name:
 *                              type: string
 *                              description: El nuevo nombre del dataset
 *                              example: bitcoin update
 *                          description:
 *                              type: string
 *                              description: La nueva descripcion del dataset
 *                              example: La criptomoneda de bitcoin
 *      responses:
 *          200:
 *              description: El dataset actualizado
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          description: Dataset actualizado
 *                          properties:
 *                              error:
 *                                  type: boolean
 *                                  description: indica si hubo un error
 *                                  example: false
 *                              data:
 *                                  $ref: '#/components/schemas/Dataset'
 *          400:
 *              description: Error en el envio de datos
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          description: Error en el envio de datos
 *                          properties:
 *                              error:
 *                                  type: boolean
 *                                  description: Indica si hubo un error
 *                                  example: true
 *                              message:
 *                                  type: string
 *                                  description: mensaje del servidor
 *                                  example: Ya existe otro dataset con el mismo nombre
 *          404:
 *              description: Dataset no encontrado
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/notFound'
 *          500:
 *              description: Error del servidor
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 */
router.put('/:id', updateDataset)

/**
 * @swagger
 * /api/v1/datasets/{id}:
 *  delete:
 *      summary: Eliminar dataset
 *      tags: [Datasets]
 *      parameters:
 *          - $ref: '#/components/parameters/datasetId'
 *      responses:
 *          200:
 *              description: Dataset eliminado satisfactoriamente
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          description: Dataset eliminado
 *                          properties:
 *                              error:
 *                                  type: boolean
 *                                  description: Indica si hubo un error
 *                                  example: false
 *                              message:
 *                                  type: string
 *                                  description: El mensaje del servidor
 *                                  example: Dataset N° 3 eliminado satisfactoriamente
 *          404:
 *              description: Dataset no encontrado
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/notFound'
 *          500:
 *              description: Error del servidor
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 */
router.delete('/:id', deleteDataset)

/**
 * @swagger
 * /api/v1/datasets/{id}/excel:
 *  get:
 *      summary: Obtener dataset en formato excel
 *      tags: [Datasets]
 *      parameters:
 *          - $ref: '#/components/parameters/datasetId'
 *      responses:
 *          200:
 *              description: excel generado a partir del dataset
 *              content:
 *                  application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *                      schema:
 *                          type: binary
 *                          description: dataset en formato excel
 *          404:
 *              description: Dataset no encontrado
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/notFound'
 *          500:
 *              description: Error del servidor
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/Error'
 */
router.get('/:id/excel', datasetToExcel)

export default router