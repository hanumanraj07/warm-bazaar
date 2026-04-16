import { Router } from 'express'
import authRoutes from './authRoutes.js'
import productRoutes from './productRoutes.js'
import customerRoutes from './customerRoutes.js'
import supplierRoutes from './supplierRoutes.js'
import billRoutes from './billRoutes.js'
import purchaseRoutes from './purchaseRoutes.js'
import paymentRoutes from './paymentRoutes.js'
import expenseRoutes from './expenseRoutes.js'
import dashboardRoutes from './dashboardRoutes.js'
import reportsRoutes from './reportsRoutes.js'
import cashRoutes from './cashRoutes.js'
import uploadRoutes from './uploadRoutes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/products', productRoutes)
router.use('/customers', customerRoutes)
router.use('/suppliers', supplierRoutes)
router.use('/bills', billRoutes)
router.use('/purchases', purchaseRoutes)
router.use('/payments', paymentRoutes)
router.use('/expenses', expenseRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/reports', reportsRoutes)
router.use('/cash', cashRoutes)
router.use('/upload', uploadRoutes)

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Grocery Shop API is running',
    timestamp: new Date().toISOString(),
  })
})

export default router
