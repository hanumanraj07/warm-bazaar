import { Router } from 'express'
import {
  createExpense,
  getExpenses,
  deleteExpense,
} from '../controllers/index.js'
import { auth, validate, expenseSchema } from '../middleware/index.js'

const router = Router()

router.use(auth)

router.get('/', getExpenses)
router.post('/', validate(expenseSchema), createExpense)
router.delete('/:id', deleteExpense)

export default router
