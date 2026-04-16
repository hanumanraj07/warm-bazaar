import { Router } from 'express'
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/index.js'
import { auth } from '../middleware/index.js'

const router = Router()

router.use(auth)

router.get('/', getCustomers)
router.get('/:id', getCustomer)
router.post('/', createCustomer)
router.put('/:id', updateCustomer)
router.delete('/:id', deleteCustomer)

export default router
