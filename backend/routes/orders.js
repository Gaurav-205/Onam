import express from 'express'
import { body } from 'express-validator'
import Order from '../models/Order.js'
import { logger } from '../utils/logger.js'
import { sendOrderConfirmationEmail } from '../utils/emailService.js'
import { APP_CONFIG } from '../config/app.js'
import { orderLimiter } from '../utils/rateLimiter.js'
import { checkDatabaseConnection } from '../middleware/database.js'
import { handleValidationErrors, validateObjectId, isValidOrderStatus } from '../middleware/validation.js'

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
    logger.info(`Order created successfully: ${savedOrder.orderNumber} (${requestDuration}ms)`)

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
          logger.error(`Email sending error for order ${savedOrder.orderNumber}:`, err)
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
      whatsappLink: whatsappLink
    })

  } catch (error) {
    logger.error('Order creation error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate order number. Please try again.'
      })
    }

    // Send detailed error in development, generic in production
    const errorResponse = {
      success: false,
      message: 'Failed to create order'
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

// Get order by ID
router.get('/:orderId', validateObjectId, checkDatabaseConnection, async (req, res) => {
  try {
    const orderId = req.params.orderId.trim()
    const order = await Order.findById(orderId)
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }
    
    logger.debug(`Order fetched: ${orderId}`)

    res.json({
      success: true,
      order
    })

  } catch (error) {
    logger.error('Get order error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    })
  }
})

// Get orders by student ID or email
router.get('/', checkDatabaseConnection, async (req, res) => {
  try {
    const { studentId, email, status } = req.query
    logger.debug(`Orders query: studentId=${studentId}, email=${email}, status=${status}`)
    const query = {}

    if (studentId) {
      const sanitizedStudentId = studentId.trim()
      if (sanitizedStudentId.length > 0 && sanitizedStudentId.length <= 50) {
        query['studentInfo.studentId'] = sanitizedStudentId
      }
    }
    if (email) {
      const sanitizedEmail = email.trim().toLowerCase()
      // Basic email format validation
      if (sanitizedEmail.length > 0 && sanitizedEmail.length <= 100 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
        query['studentInfo.email'] = sanitizedEmail
      }
    }
    if (status) {
      const sanitizedStatus = status.trim()
      if (['pending', 'confirmed', 'cancelled', 'completed'].includes(sanitizedStatus)) {
        query.status = sanitizedStatus
      }
    }
    
    // Require at least one query parameter
    if (Object.keys(query).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one query parameter (studentId, email, or status) is required'
      })
    }

    const orders = await Order.find(query)
      .sort({ orderDate: -1 })
      .limit(50)
    
    logger.debug(`Orders query returned ${orders.length} results`)

    res.json({
      success: true,
      count: orders.length,
      orders
    })

  } catch (error) {
    logger.error('Get orders error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    })
  }
})

// Update order status
router.patch('/:orderId/status', validateObjectId, checkDatabaseConnection, async (req, res) => {
  try {
    const orderId = req.params.orderId.trim()
    const { status } = req.body
    
    if (!isValidOrderStatus(status)) {
      logger.warn(`Invalid status update attempt: ${status} for order ${orderId}`)
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, confirmed, cancelled, completed'
      })
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    )

    if (!order) {
      logger.warn(`Order status update failed - order not found: ${orderId}`)
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }
    
    logger.info(`Order status updated: ${order.orderNumber} -> ${status.trim()}`)

    res.json({
      success: true,
      message: 'Order status updated',
      order
    })

  } catch (error) {
    logger.error('Update order error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update order'
    })
  }
})

export default router

