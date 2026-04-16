import { Router } from 'express'
import {
  getSalesReport,
  getProfitReport,
  getInsights,
  getAlerts,
  getCustomerLastOrder,
  exportData,
} from '../controllers/index.js'
import { auth } from '../middleware/index.js'

const router = Router()

router.use(auth)

router.get('/sales', getSalesReport)
router.get('/profit', getProfitReport)
router.get('/insights', getInsights)
router.get('/alerts', getAlerts)
router.get('/export', exportData)

export default router
