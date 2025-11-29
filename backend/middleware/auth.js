/**
 * Authentication Middleware
 * Validates JWT tokens and attaches user to request
 */

import { verifyToken, extractToken } from '../utils/auth.js'
import User from '../models/User.js'
import { logger } from '../utils/logger.js'

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from header
    const token = extractToken(req)
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.',
        code: 'AUTH_TOKEN_MISSING'
      })
    }
    
    // Verify token
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.',
        code: 'AUTH_TOKEN_INVALID'
      })
    }
    
    // Get user from database
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please login again.',
        code: 'USER_NOT_FOUND'
      })
    }
    
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
        code: 'USER_INACTIVE'
      })
    }
    
    // Attach user to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      studentId: user.studentId,
      name: user.name,
      role: user.role
    }
    
    next()
  } catch (error) {
    logger.error('Authentication error:', error)
    res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again.',
      code: 'AUTH_ERROR'
    })
  }
}

/**
 * Authorization middleware
 * Checks if user has required role
 * @param {string[]} allowedRoles - Array of allowed roles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      })
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}`)
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions. You do not have access to this resource.',
        code: 'INSUFFICIENT_PERMISSIONS'
      })
    }
    
    next()
  }
}

