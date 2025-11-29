/**
 * Request ID Middleware
 * Adds a unique request ID to each request for better tracing and debugging
 */

import { randomBytes } from 'crypto'

/**
 * Middleware to add a unique request ID to each request
 * The request ID is added to req.id and can be used in logs
 */
export const requestIdMiddleware = (req, res, next) => {
  // Generate a unique request ID (8 bytes = 16 hex characters)
  req.id = randomBytes(8).toString('hex')
  
  // Add request ID to response headers for client tracking
  res.setHeader('X-Request-ID', req.id)
  
  next()
}

/**
 * Get request ID from request object
 * @param {Object} req - Express request object
 * @returns {string} Request ID
 */
export const getRequestId = (req) => {
  return req.id || 'unknown'
}

