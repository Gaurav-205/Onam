/**
 * Database Connection Middleware
 * Centralized database connection checking to avoid duplication
 */

import { logger } from '../utils/logger.js'

/**
 * Middleware to check if database is connected
 * Returns 503 if database is not available
 */
export const checkDatabaseConnection = async (req, res, next) => {
  try {
    const mongoose = await import('mongoose')
    
    if (mongoose.default.connection.readyState !== 1) {
      const endpoint = `${req.method} ${req.path}`
      logger.warn(`Database not connected for ${endpoint}`)
      
      return res.status(503).json({
        success: false,
        message: 'Database is not available. Please try again later.',
      })
    }
    
    next()
  } catch (error) {
    logger.error('Error checking database connection:', error)
    return res.status(503).json({
      success: false,
      message: 'Database is not available. Please try again later.',
    })
  }
}

/**
 * Check database connection and return status
 * @returns {Promise<{connected: boolean, databaseName?: string}>}
 */
export const getDatabaseStatus = async () => {
  try {
    const mongoose = await import('mongoose')
    
    if (mongoose.default.connection.readyState === 1) {
      return {
        connected: true,
        databaseName: mongoose.default.connection.name,
      }
    }
    
    return { connected: false }
  } catch (error) {
    logger.error('Error getting database status:', error)
    return { connected: false }
  }
}

