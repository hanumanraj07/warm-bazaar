import { Router } from 'express'
import { uploadAvatar, removeAvatar } from '../controllers/uploadController.js'
import { upload } from '../middleware/upload.js'
import { auth } from '../middleware/index.js'

const router = Router()

router.use(auth)

router.post('/:type/:id/photo', upload.single('photo'), uploadAvatar)
router.delete('/:type/:id/photo', removeAvatar)

export default router
