import { Router } from 'express'
import {
  recordCustomerPayment,
  recordSupplierPayment,
  getPayments,
} from '../controllers/index.js'
import { auth, validate, paymentSchema } from '../middleware/index.js'

const router = Router()

router.use(auth)

router.get('/', getPayments)
router.post('/customer', validate(paymentSchema), recordCustomerPayment)
router.post('/supplier', validate(paymentSchema), recordSupplierPayment)

export default router
