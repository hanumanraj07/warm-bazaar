import { Router } from 'express'
import { login, getMe, createAdmin } from '../controllers/index.js'
import { auth, validate, loginSchema } from '../middleware/index.js'

const router = Router()

router.post('/login', validate(loginSchema), login)
router.get('/me', auth, getMe)
router.post('/setup', createAdmin)

export default router
