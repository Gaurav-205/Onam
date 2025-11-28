import mongoose from 'mongoose'
import { logger } from '../utils/logger.js'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/onam-festival', {
      // Remove deprecated options for newer mongoose versions
    })

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`)
    logger.info(`📦 Database: ${conn.connection.name}`)

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected')
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      logger.info('MongoDB connection closed through app termination')
      process.exit(0)
    })

  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error)
    process.exit(1)
  }
}

export default connectDB

