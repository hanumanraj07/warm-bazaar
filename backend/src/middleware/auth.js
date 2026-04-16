import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { User } from '../models/index.js'

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      })
    }

    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(token, config.jwt.secret)

    const user = await User.findById(decoded.userId)

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found.',
      })
    }

    req.user = {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      })
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error.',
    })
  }
}

export const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  })
}
