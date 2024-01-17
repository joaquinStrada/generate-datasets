import { Router } from 'express'
import { getDatasets, getDataset, createDataset, updateDataset, deleteDataset, datasetToExcel } from '../controllers/dataset.controller'

const router = Router()

router.get('/', getDatasets)

router.get('/:id', getDataset)

router.post('/', createDataset)

router.put('/:id', updateDataset)

router.delete('/:id', deleteDataset)

router.get('/:id/excel', datasetToExcel)

export default router