/**
 * Authentication Utilities
 * JWT token generation and validation
 */

import jwt from 'jsonwebtoken'
import { logger } from './logger.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

/**
 * Generate JWT token
 * @param {Object} payload - Token payload (user id, email, role)
 * @returns {string} JWT token
 */
export const generateToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    })
  } catch (error) {
    logger.error('Error generating token:', error)
    throw new Error('Failed to generate token')
  }
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.debug('Token expired')
      return null
    }
    if (error.name === 'JsonWebTokenError') {
      logger.debug('Invalid token')
      return null
    }
    logger.error('Error verifying token:', error)
    return null
  }
}

/**
 * Extract token from Authorization header
 * @param {Object} req - Express request object
 * @returns {string|null} Token or null
 */
export const extractToken = (req) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader) {
    return null
  }
  
  // Format: "Bearer <token>"
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }
  
  return parts[1]
}

