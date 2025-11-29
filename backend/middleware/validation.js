/**
 * Validation Middleware Utilities
 * Common validation patterns and error responses
 */

import { validationResult } from 'express-validator'

/**
 * Middleware to handle validation errors from express-validator
 * Returns 400 with validation errors if validation fails
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    })
  }
  
  next()
}

/**
 * Validate MongoDB ObjectId format
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId format
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false
  return /^[a-f\d]{24}$/i.test(id.trim())
}

/**
 * Validate order status
 * @param {string} status - Status to validate
 * @returns {boolean} True if valid status
 */
export const isValidOrderStatus = (status) => {
  if (!status || typeof status !== 'string') return false
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
  return validStatuses.includes(status.trim())
}

/**
 * Middleware to validate ObjectId in route parameters
 */
export const validateObjectId = (req, res, next) => {
  const { orderId } = req.params
  
  if (!isValidObjectId(orderId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order ID format',
    })
  }
  
  next()
}

