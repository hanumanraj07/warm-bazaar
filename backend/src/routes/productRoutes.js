import { Router } from 'express'
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts,
  getReorderSuggestions,
  getExpiringProducts,
  getDeadStock,
  addBatch,
  searchExternalProducts,
} from '../controllers/index.js'
import { auth, validate, productSchema, updateProductSchema } from '../middleware/index.js'

const router = Router()

router.use(auth)

router.get('/low-stock', getLowStockProducts)
router.get('/reorder-suggestions', getReorderSuggestions)
router.get('/expiring', getExpiringProducts)
router.get('/dead-stock', getDeadStock)
router.get('/search', searchExternalProducts)
router.get('/', getProducts)
router.get('/:id', getProduct)
router.post('/', validate(productSchema), createProduct)
router.put('/:id', validate(updateProductSchema), updateProduct)
router.patch('/:id/stock', updateStock)
router.post('/:id/batch', addBatch)
router.delete('/:id', deleteProduct)

export default router
