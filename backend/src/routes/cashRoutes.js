import { Router } from 'express'
import {
  openDay,
  closeDay,
  getTodayStatus,
  getCashLogs,
  addCashAdjustment,
} from '../controllers/index.js'
import { auth } from '../middleware/index.js'

const router = Router()

router.use(auth)

router.get('/today', getTodayStatus)
router.get('/logs', getCashLogs)
router.post('/open', openDay)
router.post('/close', closeDay)
router.post('/adjust', addCashAdjustment)

export default router
