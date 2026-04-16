import mongoose from 'mongoose'
import { config } from './index.js'

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri)

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected')
    })

    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      console.log('🔴 MongoDB connection closed through app termination')
      process.exit(0)
    })

    return conn
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`)
    process.exit(1)
  }
}
