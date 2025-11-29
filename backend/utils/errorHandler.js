/**
 * Error Response Utilities
 * Centralized error response formatting to avoid duplication
 */

import { logger } from './logger.js'

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {Object} [details] - Additional error details (development only)
 * @returns {Object} Error response object
 */
export const createErrorResponse = (message, statusCode = 500, details = null) => {
  const response = {
    success: false,
    message,
  }

  // Add details in development mode only
  if (process.env.NODE_ENV === 'development' && details) {
    response.details = details
  }

  return { statusCode, response }
}

/**
 * Handle and log errors with standardized response
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {string} context - Context where error occurred (e.g., 'Order creation')
 * @returns {Object} Error response object with statusCode and response
 */
export const handleError = (error, req, context) => {
  // Log error with context
  logger.error(`${context} error:`, {
    message: error.message,
    code: error.code,
    name: error.name,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  })

  // Handle specific error types
  if (error.code === 11000) {
    return createErrorResponse(
      'Duplicate entry. Please try again.',
      400
    )
  }

  // Default error response
  const isDevelopment = process.env.NODE_ENV === 'development'
  const details = isDevelopment ? {
    error: error.message,
    stack: error.stack,
    code: error.code,
    name: error.name,
    type: error.constructor.name,
  } : null

  return createErrorResponse(
    `Failed to ${context.toLowerCase()}`,
    500,
    details
  )
}

/**
 * Create a success response
 * @param {string} message - Success message
 * @param {Object} [data] - Additional data
 * @param {number} [statusCode=200] - HTTP status code
 * @returns {Object} Success response object
 */
export const createSuccessResponse = (message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    ...(data && { ...data }),
  }

  return { statusCode, response }
}

