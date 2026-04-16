import { Router } from 'express'
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/index.js'
import { auth } from '../middleware/index.js'

const router = Router()

router.use(auth)

router.get('/', getSuppliers)
router.get('/:id', getSupplier)
router.post('/', createSupplier)
router.put('/:id', updateSupplier)
router.delete('/:id', deleteSupplier)

export default router
