import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from './config/index.js'
import { connectDB } from './config/db.js'
import routes from './routes/index.js'
import { notFound, errorHandler } from './middleware/index.js'
import { User } from './models/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const isVercel = Boolean(process.env.VERCEL)
let initPromise = null

const normalizeOrigin = (origin = '') => origin.trim().replace(/\/+$/, '')
const vercelProjectOriginPattern = /^https:\/\/warm-bazaar(?:-[a-z0-9-]+)?\.vercel\.app$/i

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  normalizeOrigin(config.frontendUrl),
])

app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = normalizeOrigin(origin)
      const isAllowed =
        !normalizedOrigin ||
        allowedOrigins.has(normalizedOrigin) ||
        vercelProjectOriginPattern.test(normalizedOrigin)

      if (isAllowed) {
        callback(null, true)
      } else {
        callback(new Error(`Not allowed by CORS: ${normalizedOrigin}`))
      }
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use(
  '/uploads',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Cross-Origin-Resource-Policy', 'cross-origin')
    next()
  },
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    },
  })
)

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'))
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

const initializeApp = async () => {
  if (initPromise) return initPromise

  initPromise = (async () => {
    await connectDB()

    const adminUser = await User.findOne({ email: config.admin.email }).select('+password')
    if (!adminUser) {
      await User.create({
        name: 'Admin',
        email: config.admin.email,
        password: config.admin.password,
        role: 'ADMIN',
      })
      console.log('Admin user created:', config.admin.email)
      return
    }

    // Keep default admin credentials in sync with env for predictable first login.
    adminUser.name = adminUser.name || 'Admin'
    adminUser.role = 'ADMIN'
    adminUser.isActive = true
    adminUser.password = config.admin.password
    await adminUser.save()
  })()

  return initPromise
}

app.use('/api', limiter)
app.use('/api', async (req, res, next) => {
  try {
    await initializeApp()
    next()
  } catch (error) {
    next(error)
  }
})

app.use('/api', routes)
app.use(notFound)
app.use(errorHandler)

if (!isVercel) {
  const startServer = async () => {
    try {
      await initializeApp()
      app.listen(config.port, () => {
        console.log(`API server running on port ${config.port} (${config.nodeEnv})`)
      })
    } catch (error) {
      console.error('Failed to start server:', error)
      process.exit(1)
    }
  }

  startServer()
}

export default app
