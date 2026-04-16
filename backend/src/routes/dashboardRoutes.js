import { Router } from 'express'
import { getDashboardSummary } from '../controllers/index.js'
import { auth } from '../middleware/index.js'

const router = Router()

router.use(auth)

router.get('/summary', getDashboardSummary)

export default router
