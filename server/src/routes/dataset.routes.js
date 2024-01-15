import { Router } from 'express'
import { getDatasets, getDataset, createDataset, updateDataset, deleteDataset } from '../controllers/dataset.controller'

const router = Router()

router.get('/', getDatasets)

router.get('/:id', getDataset)

router.post('/', createDataset)

router.put('/:id', updateDataset)

router.delete('/:id', deleteDataset)

export default router