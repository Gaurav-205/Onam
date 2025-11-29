/**
 * Rate Limiter Configuration Utility
 * Centralized rate limiting configuration to avoid duplication
 */

import rateLimit from 'express-rate-limit'

/**
 * Common rate limiter options used across all limiters
 */
const COMMON_RATE_LIMITER_OPTIONS = {
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  validate: false, // Disable strict validation (trust proxy is set to 1, which is secure)
}

/**
 * Create a rate limiter with common options
 * @param {Object} options - Rate limiter configuration
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.message - Error message
 * @param {Function} [options.skip] - Optional skip function
 * @returns {Function} Express rate limiter middleware
 */
export const createRateLimiter = ({
  windowMs,
  max,
  message,
  skip,
}) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests. Please try again later.',
    },
    ...COMMON_RATE_LIMITER_OPTIONS,
    ...(skip && { skip }),
  })
}

/**
 * Default rate limiter - 100 requests per 15 minutes
 */
export const defaultLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for health check in production
    return req.path === '/health' && process.env.NODE_ENV === 'production'
  },
})

/**
 * Light rate limiter - 30 requests per minute
 */
export const lightLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: 'Too many requests. Please try again later.',
})

/**
 * Strict rate limiter for order creation - 10 requests per 15 minutes
 */
export const orderLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many order requests. Please wait before creating another order.',
})

