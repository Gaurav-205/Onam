/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 * 
 * For stateless REST APIs, CSRF protection uses a token-based approach:
 * 1. Frontend requests a CSRF token from /api/csrf-token
 * 2. Frontend includes token in X-CSRF-Token header for state-changing requests
 * 3. Backend validates the token using a secret key
 */

import crypto from 'crypto'
import { logger } from '../utils/logger.js'

// In-memory token store (in production, use Redis or database)
// Format: { token: { createdAt, origin } }
const tokenStore = new Map()

// Clean up old tokens every 10 minutes
const TOKEN_EXPIRY = 30 * 60 * 1000 // 30 minutes
setInterval(() => {
  const now = Date.now()
  for (const [token, data] of tokenStore.entries()) {
    if (now - data.createdAt > TOKEN_EXPIRY) {
      tokenStore.delete(token)
    }
  }
}, 10 * 60 * 1000) // Run every 10 minutes

/**
 * Generate CSRF token
 * @param {string} origin - Request origin for validation
 * @returns {string} CSRF token
 */
export const generateCSRFToken = (origin) => {
  const token = crypto.randomBytes(32).toString('hex')
  tokenStore.set(token, {
    createdAt: Date.now(),
    origin: origin || null
  })
  return token
}

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @param {string} origin - Request origin
 * @returns {boolean} True if token is valid
 */
export const validateCSRFToken = (token, origin) => {
  if (!token) return false
  
  const tokenData = tokenStore.get(token)
  if (!tokenData) return false
  
  // Check if token expired
  if (Date.now() - tokenData.createdAt > TOKEN_EXPIRY) {
    tokenStore.delete(token)
    return false
  }
  
  // Validate origin if provided
  if (origin && tokenData.origin && tokenData.origin !== origin) {
    return false
  }
  
  // Token is valid - delete it (one-time use)
  tokenStore.delete(token)
  return true
}

/**
 * CSRF Protection Middleware
 * Validates CSRF token for state-changing operations (POST, PUT, PATCH, DELETE)
 */
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  // Skip CSRF for health check and public endpoints
  if (req.path === '/health' || 
      req.path === '/api/config' || 
      req.path === '/api/csrf-token' ||
      req.path.startsWith('/api/auth')) {
    return next()
  }

  // For development, allow bypass if CSRF_DISABLED is set
  if (process.env.NODE_ENV === 'development' && process.env.CSRF_DISABLED === 'true') {
    return next()
  }

  // Get token from header
  const token = req.headers['x-csrf-token'] || req.headers['x-csrf-token']
  const origin = req.headers.origin || req.headers.referer

  // Validate token
  if (!token) {
    logger.warn(`CSRF token missing for ${req.method} ${req.path} from ${req.ip}`)
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing. Please refresh the page and try again.',
      code: 'CSRF_TOKEN_MISSING'
    })
  }

  if (!validateCSRFToken(token, origin)) {
    logger.warn(`CSRF token invalid for ${req.method} ${req.path} from ${req.ip}`)
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired CSRF token. Please refresh the page and try again.',
      code: 'CSRF_TOKEN_INVALID'
    })
  }

  // Token is valid
  next()
}

/**
 * CSRF Token Endpoint
 * Returns a CSRF token for the frontend to use
 */
export const getCSRFToken = (req, res) => {
  const origin = req.headers.origin || req.headers.referer
  const token = generateCSRFToken(origin)
  
  res.json({
    success: true,
    csrfToken: token,
    message: 'Include this token in X-CSRF-Token header for state-changing requests'
  })
}

