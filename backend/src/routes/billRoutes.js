import { Router } from 'express'
import {
  createBill,
  getBills,
  getRecentBills,
  getBill,
  cancelBill,
  editBill,
  returnBill,
  getBillPDF,
} from '../controllers/index.js'
import { auth, validate, billSchema } from '../middleware/index.js'

const router = Router()

router.use(auth)

router.get('/recent', getRecentBills)
router.get('/:id/pdf', getBillPDF)
router.get('/', getBills)
router.get('/:id', getBill)
router.post('/', validate(billSchema), createBill)
router.patch('/:id/edit', editBill)
router.post('/:id/return', returnBill)
router.patch('/:id/cancel', cancelBill)

export default router
