import mongoose from 'mongoose'
import { logger } from '../utils/logger.js'

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/onam-festival'
    
    // Set connection options with improved settings
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
    }

    const conn = await mongoose.connect(mongoUri, options)

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`)
    logger.info(`📦 Database: ${conn.connection.name}`)

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected')
    })

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnected')
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      logger.info('MongoDB connection closed through app termination')
      process.exit(0)
    })

    return true
  } catch (error) {
    // Extract error message properly
    const errorMessage = error?.message || error?.toString() || 'Unknown error'
    logger.error('❌ MongoDB connection failed:', errorMessage)
    logger.warn('⚠️ Server will continue without database connection')
    logger.warn('⚠️ Some features may not work until MongoDB is available')
    
    // Don't exit - allow server to start for health checks and graceful degradation
    return false
  }
}

export default connectDB

