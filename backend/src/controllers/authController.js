import { User } from '../models/index.js'
import { generateToken, asyncHandler, AppError } from '../middleware/index.js'
import { config } from '../config/index.js'

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  let user = await User.findOne({ email }).select('+password')

  if (!user) {
    throw new AppError('Invalid email or password', 401)
  }

  const isPasswordValid = await user.comparePassword(password)

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401)
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 401)
  }

  user.lastLogin = new Date()
  await user.save()

  const token = generateToken(user._id)

  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  })
})

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId)

  if (!user) {
    throw new AppError('User not found', 404)
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
  })
})

export const createAdmin = asyncHandler(async (req, res) => {
  const existingUser = await User.findOne({ email: config.admin.email })

  if (existingUser) {
    return res.status(200).json({
      success: true,
      message: 'Admin user already exists',
      data: { userId: existingUser._id },
    })
  }

  const user = await User.create({
    name: 'Admin',
    email: config.admin.email,
    password: config.admin.password,
    role: 'ADMIN',
  })

  res.status(201).json({
    success: true,
    message: 'Admin user created successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  })
})
