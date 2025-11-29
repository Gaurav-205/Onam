import express from 'express'
import { body, query } from 'express-validator'
import Order from '../models/Order.js'
import { logger } from '../utils/logger.js'
import { sendOrderConfirmationEmail } from '../utils/emailService.js'
import { APP_CONFIG } from '../config/app.js'
import { orderLimiter, queryLimiter } from '../utils/rateLimiter.js'
import { checkDatabaseConnection } from '../middleware/database.js'
import { handleValidationErrors, validateObjectId, isValidOrderStatus } from '../middleware/validation.js'
import { getRequestId } from '../middleware/requestId.js'

const router = express.Router()

// Validation and sanitization middleware
const validateOrder = [
  // Sanitize and validate student info
  body('studentInfo.name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
  body('studentInfo.studentId')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Student ID is required')
    .isLength({ max: 50 })
    .withMessage('Student ID must be less than 50 characters'),
  body('studentInfo.email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Valid email is required')
    .isLength({ max: 100 })
    .withMessage('Email must be less than 100 characters'),
  body('studentInfo.phone')
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Valid 10-digit phone number is required'),
  body('studentInfo.course')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Course is required')
    .isLength({ max: 50 })
    .withMessage('Course must be less than 50 characters'),
  body('studentInfo.department')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Department is required')
    .isLength({ max: 50 })
    .withMessage('Department must be less than 50 characters'),
  body('studentInfo.year')
    .trim()
    .isIn(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post Graduate'])
    .withMessage('Valid year is required'),
  body('studentInfo.hostel')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage('Hostel must be less than 50 characters'),
  
  // Validate order items
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('At least one item is required')
    .isLength({ max: 50 })
    .withMessage('Maximum 50 items allowed'),
  body('orderItems.*.id')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Item ID is required')
    .isLength({ max: 50 })
    .withMessage('Item ID must be less than 50 characters'),
  body('orderItems.*.name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Item name is required')
    .isLength({ max: 100 })
    .withMessage('Item name must be less than 100 characters'),
  body('orderItems.*.quantity')
    .isInt({ min: 1, max: 99 })
    .withMessage('Valid quantity is required (1-99)'),
  body('orderItems.*.price')
    .isFloat({ min: 0, max: 100000 })
    .withMessage('Valid price is required (0-100000)'),
  
  // Validate payment
  body('payment.method')
    .isIn(['cash', 'upi'])
    .withMessage('Valid payment method is required'),
  body('payment.upiId')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage('UPI ID must be less than 50 characters'),
  body('payment.transactionId')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage('Transaction ID must be less than 100 characters'),
  
  // Validate total amount
  body('totalAmount')
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Valid total amount is required (0-1000000)'),
  
  // Validate notes if provided
  body('notes')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
]

// Create new order (with stricter rate limiting)
router.post('/', orderLimiter, validateOrder, handleValidationErrors, checkDatabaseConnection, async (req, res) => {
  const requestId = getRequestId(req)
  const requestStartTime = Date.now()
  
  try {

    const { studentInfo, orderItems, payment, totalAmount, orderDate } = req.body

    // Additional validation for UPI payment
    if (payment.method === 'upi') {
      if (!payment.upiId || !payment.transactionId) {
        return res.status(400).json({
          success: false,
          message: 'UPI ID and Transaction ID are required for UPI payment'
        })
      }
    }

    // Calculate total from items to verify (with safety checks)
    const calculatedTotal = orderItems.reduce((sum, item) => {
      const itemTotal = Number(item.total) || 0
      if (isNaN(itemTotal) || itemTotal < 0) {
        throw new Error('Invalid item total in order')
      }
      return sum + itemTotal
    }, 0)
    
    // Validate total amount (allow small floating point differences)
    const totalAmountNum = Number(totalAmount)
    if (isNaN(totalAmountNum) || totalAmountNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid total amount'
      })
    }
    
    if (Math.abs(calculatedTotal - totalAmountNum) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Total amount mismatch',
        ...(process.env.NODE_ENV === 'development' && {
          details: {
            calculated: calculatedTotal,
            provided: totalAmountNum
          }
        })
      })
    }

    // Create order (orderDate is optional - schema will default to Date.now)
    const orderData = {
      studentInfo,
      orderItems,
      payment,
      totalAmount,
      status: 'pending'
    }
    
    // Only include orderDate if provided (schema has default)
    if (orderDate) {
      orderData.orderDate = new Date(orderDate)
    }

    const order = new Order(orderData)

    const savedOrder = await order.save()
    
    const requestDuration = Date.now() - requestStartTime
    logger.info(`[${requestId}] Order created successfully: ${savedOrder.orderNumber} (${requestDuration}ms)`)

    // Get WhatsApp link for response and email
    const whatsappLink = APP_CONFIG.COMMUNICATION.WHATSAPP_GROUP_LINK || null

    // Send confirmation email (non-blocking)
    try {
      const orderPlainObject = savedOrder.toObject ? savedOrder.toObject() : JSON.parse(JSON.stringify(savedOrder))
      sendOrderConfirmationEmail(orderPlainObject, whatsappLink)
        .then(result => {
          if (result.success) {
            logger.info(`Order confirmation email sent for order ${savedOrder.orderNumber}`)
          } else {
            logger.warn(`Failed to send email for order ${savedOrder.orderNumber}: ${result.message}`)
          }
        })
        .catch(err => {
          const errorMessage = err?.message || err?.error || 'Unknown error occurred'
          logger.error(`Email sending error for order ${savedOrder.orderNumber}:`, {
            message: errorMessage,
            error: err
          })
        })
    } catch (emailError) {
      logger.error(`Error initiating email for order ${savedOrder.orderNumber}:`, emailError)
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        orderId: savedOrder._id,
        orderNumber: savedOrder.orderNumber,
        status: savedOrder.status,
        totalAmount: savedOrder.totalAmount,
        orderDate: savedOrder.orderDate
      },
      whatsappLink: whatsappLink,
      requestId
    })

  } catch (error) {
    logger.error(`[${requestId}] Order creation error:`, {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate order number. Please try again.',
        requestId
      })
    }

    // Send detailed error in development, generic in production
    const errorResponse = {
      success: false,
      message: 'Failed to create order',
      requestId
    }
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = error.message
      errorResponse.stack = error.stack
      errorResponse.details = {
        code: error.code,
        name: error.name,
        type: error.constructor.name
      }
    }
    
    res.status(500).json(errorResponse)
  }
})

// Validation for query parameters
const validateQueryParams = [
  query('studentId')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1, max: 50 })
    .withMessage('Student ID must be between 1 and 50 characters'),
  query('email')
    .optional()
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Valid email is required')
    .isLength({ max: 100 })
    .withMessage('Email must be less than 100 characters'),
  query('status')
    .optional()
    .trim()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Status must be one of: pending, confirmed, cancelled, completed'),
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be between 1 and 1000')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: APP_CONFIG.PAGINATION.MAX_LIMIT })
    .withMessage(`Limit must be between 1 and ${APP_CONFIG.PAGINATION.MAX_LIMIT}`)
    .toInt(),
]

// Get order by ID
router.get('/:orderId', queryLimiter, validateObjectId, checkDatabaseConnection, async (req, res) => {
  const requestId = getRequestId(req)
  
  try {
    const orderId = req.params.orderId.trim()
    const order = await Order.findById(orderId)
    
    if (!order) {
      logger.debug(`[${requestId}] Order not found: ${orderId}`)
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        requestId
      })
    }
    
    logger.debug(`[${requestId}] Order fetched: ${orderId}`)

    res.json({
      success: true,
      order,
      requestId
    })

  } catch (error) {
    logger.error(`[${requestId}] Get order error:`, error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      requestId
    })
  }
})

// Get orders by student ID or email (with pagination)
router.get('/', queryLimiter, validateQueryParams, handleValidationErrors, checkDatabaseConnection, async (req, res) => {
  const requestId = getRequestId(req)
  
  try {
    const { studentId, email, status, page = 1, limit } = req.query
    
    // Build query object
    const queryObj = {}

    if (studentId) {
      queryObj['studentInfo.studentId'] = studentId.trim()
    }
    if (email) {
      queryObj['studentInfo.email'] = email.trim().toLowerCase()
    }
    if (status) {
      queryObj.status = status.trim()
    }
    
    // Require at least one query parameter
    if (Object.keys(queryObj).length === 0) {
      logger.warn(`[${requestId}] Orders query with no parameters`)
      return res.status(400).json({
        success: false,
        message: 'At least one query parameter (studentId, email, or status) is required',
        requestId
      })
    }

    // Pagination configuration
    const pageNum = parseInt(page) || 1
    const limitNum = limit ? parseInt(limit) : APP_CONFIG.PAGINATION.DEFAULT_LIMIT
    const maxLimit = APP_CONFIG.PAGINATION.MAX_LIMIT
    const finalLimit = Math.min(limitNum, maxLimit)
    const skip = (pageNum - 1) * finalLimit

    logger.debug(`[${requestId}] Orders query: studentId=${studentId || 'N/A'}, email=${email || 'N/A'}, status=${status || 'N/A'}, page=${pageNum}, limit=${finalLimit}`)

    // Get total count for pagination metadata
    const totalCount = await Order.countDocuments(queryObj)
    const totalPages = Math.ceil(totalCount / finalLimit)

    // Fetch orders with pagination
    const orders = await Order.find(queryObj)
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(finalLimit)
      .lean() // Use lean() for better performance when not modifying documents
    
    logger.debug(`[${requestId}] Orders query returned ${orders.length} results (page ${pageNum}/${totalPages}, total: ${totalCount})`)

    res.json({
      success: true,
      count: orders.length,
      total: totalCount,
      page: pageNum,
      totalPages,
      limit: finalLimit,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
      orders,
      requestId
    })

  } catch (error) {
    logger.error(`[${requestId}] Get orders error:`, error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      requestId
    })
  }
})

// Update order status
router.patch('/:orderId/status', queryLimiter, validateObjectId, checkDatabaseConnection, async (req, res) => {
  const requestId = getRequestId(req)
  
  try {
    const orderId = req.params.orderId.trim()
    const { status } = req.body
    
    if (!isValidOrderStatus(status)) {
      logger.warn(`[${requestId}] Invalid status update attempt: ${status} for order ${orderId}`)
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, confirmed, cancelled, completed',
        requestId
      })
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: status.trim() },
      { new: true, runValidators: true }
    )

    if (!order) {
      logger.warn(`[${requestId}] Order status update failed - order not found: ${orderId}`)
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        requestId
      })
    }
    
    logger.info(`[${requestId}] Order status updated: ${order.orderNumber} -> ${status.trim()}`)

    res.json({
      success: true,
      message: 'Order status updated',
      order,
      requestId
    })

  } catch (error) {
    logger.error(`[${requestId}] Update order error:`, error)
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      requestId
    })
  }
})

export default router

