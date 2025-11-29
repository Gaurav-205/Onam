import mongoose from 'mongoose'
import { logger } from '../utils/logger.js'

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/onam-festival'
    
    // Validate MONGODB_URI format
    if (!mongoUri || typeof mongoUri !== 'string') {
      logger.error('MONGODB_URI is not set or invalid')
      throw new Error('MONGODB_URI environment variable is required')
    }
    
    // Trim whitespace (common issue when copying/pasting)
    mongoUri = mongoUri.trim()
    
    // Check if URI starts with valid scheme
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
      logger.error('MONGODB_URI has invalid format. Must start with mongodb:// or mongodb+srv://')
      logger.error(`URI length: ${mongoUri.length}, First 20 chars: ${mongoUri.substring(0, 20)}...`)
      throw new Error('Invalid MONGODB_URI format. Must start with mongodb:// or mongodb+srv://')
    }
    
    // Ensure database name is set in connection string
    // MongoDB Atlas URIs should have format: mongodb+srv://user:pass@cluster/dbname?options
    // If no database name is specified (ends with / or ?), add 'onam-festival'
    if (mongoUri) {
      // Check if URI has a database name (has /dbname before ? or at end)
      const hasDbName = /\/[^/?]+(\?|$)/.test(mongoUri)
      
      if (!hasDbName) {
        // No database name found, add it
        if (mongoUri.includes('?')) {
          // Has query params: insert /onam-festival before ?
          mongoUri = mongoUri.replace('?', '/onam-festival?')
        } else if (mongoUri.endsWith('/')) {
          // Ends with /: append database name
          mongoUri = mongoUri + 'onam-festival'
        } else {
          // No / at end: append /onam-festival
          mongoUri = mongoUri + '/onam-festival'
        }
        logger.info('Database name not found in MONGODB_URI, using: onam-festival')
      }
    }
    
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

    logger.info(`MongoDB Connected: ${conn.connection.host}`)
    logger.info(`Database: ${conn.connection.name}`)

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected')
    })

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected')
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      logger.info('MongoDB connection closed through app termination')
      process.exit(0)
    })

    return true
  } catch (error) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error'
    logger.error('MongoDB connection failed:', errorMessage)
    logger.warn('Server will continue without database connection')
    logger.warn('Some features may not work until MongoDB is available')
    return false
  }
}

export default connectDB

