import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { Customer, Supplier } from '../models/index.js'
import { asyncHandler, AppError } from '../middleware/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOAD_DIR = path.join(__dirname, '../uploads/avatars')

export const uploadAvatar = asyncHandler(async (req, res) => {
  const { type, id } = req.params

  if (!req.file) {
    throw new AppError('No file uploaded', 400)
  }

  const Model = type === 'customer' ? Customer : type === 'supplier' ? Supplier : null
  if (!Model) {
    fs.unlinkSync(req.file.path)
    throw new AppError('Invalid type. Use "customer" or "supplier"', 400)
  }

  const entity = await Model.findById(id)
  if (!entity) {
    fs.unlinkSync(req.file.path)
    throw new AppError(`${type} not found`, 404)
  }

  if (entity.photo) {
    const oldPath = path.join(UPLOAD_DIR, entity.photo)
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath)
    }
  }

  const ext = path.extname(req.file.originalname).toLowerCase()
  const fileName = `${type}-${id}-${Date.now()}${ext}`
  const outputPath = path.join(UPLOAD_DIR, fileName)

  await sharp(req.file.path)
    .resize(300, 300, { fit: 'cover', position: 'center' })
    .toFormat(ext === '.png' ? 'png' : 'jpeg', { quality: 85 })
    .toFile(outputPath)

  fs.unlinkSync(req.file.path)

  entity.photo = fileName
  await entity.save()

  res.status(200).json({
    success: true,
    message: 'Photo uploaded successfully',
    data: { photo: fileName },
  })
})

export const removeAvatar = asyncHandler(async (req, res) => {
  const { type, id } = req.params

  const Model = type === 'customer' ? Customer : type === 'supplier' ? Supplier : null
  if (!Model) {
    throw new AppError('Invalid type. Use "customer" or "supplier"', 400)
  }

  const entity = await Model.findById(id)
  if (!entity) {
    throw new AppError(`${type} not found`, 404)
  }

  if (entity.photo) {
    const oldPath = path.join(UPLOAD_DIR, entity.photo)
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath)
    }
    entity.photo = null
    await entity.save()
  }

  res.status(200).json({
    success: true,
    message: 'Photo removed successfully',
  })
})
