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

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  config.frontendUrl,
]

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Cross-Origin-Resource-Policy', 'cross-origin')
  next()
}, express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  },
}))

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

app.use('/api', limiter)

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

const startServer = async () => {
  try {
    await connectDB()

    const adminExists = await User.findOne({ email: config.admin.email })
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: config.admin.email,
        password: config.admin.password,
        role: 'ADMIN',
      })
      console.log('✓ Admin user created:', config.admin.email)
    }

    app.listen(config.port, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏪 Grocery Shop Management API                            ║
║                                                            ║
║   Server running on port ${config.port}                         
║   Environment: ${config.nodeEnv}                              
║   API Base URL: http://localhost:${config.port}/api            
║                                                            ║
║   Endpoints:                                               ║
║   • POST   /api/auth/login                                 ║
║   • GET    /api/products                                   ║
║   • GET    /api/customers                                 ║
║   • GET    /api/suppliers                                 ║
║   • GET    /api/bills                                     ║
║   • GET    /api/purchases                                 ║
║   • GET    /api/expenses                                  ║
║   • GET    /api/dashboard/summary                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
