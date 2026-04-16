import { Router } from 'express'
import {
  createPurchase,
  getPurchases,
  getPurchase,
} from '../controllers/index.js'
import { auth, validate, purchaseSchema } from '../middleware/index.js'

const router = Router()

router.use(auth)

router.get('/', getPurchases)
router.get('/:id', getPurchase)
router.post('/', validate(purchaseSchema), createPurchase)

export default router
