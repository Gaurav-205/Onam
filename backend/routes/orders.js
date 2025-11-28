import express from 'express'
import { body, validationResult } from 'express-validator'
import rateLimit from 'express-rate-limit'
import Order from '../models/Order.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// Stricter rate limit for order creation
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 order creations per 15 minutes
  message: {
    success: false,
    message: 'Too many order requests. Please wait before creating another order.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

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
router.post('/', orderLimiter, validateOrder, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { studentInfo, orderItems, payment, totalAmount } = req.body

    // Additional validation for UPI payment
    if (payment.method === 'upi') {
      if (!payment.upiId || !payment.transactionId) {
        return res.status(400).json({
          success: false,
          message: 'UPI ID and Transaction ID are required for UPI payment'
        })
      }
    }

    // Calculate total from items to verify
    const calculatedTotal = orderItems.reduce((sum, item) => sum + item.total, 0)
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Total amount mismatch'
      })
    }

    // Create order
    const order = new Order({
      studentInfo,
      orderItems,
      payment,
      totalAmount,
      status: 'pending'
    })

    const savedOrder = await order.save()

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        orderId: savedOrder._id,
        orderNumber: savedOrder.orderNumber,
        status: savedOrder.status,
        totalAmount: savedOrder.totalAmount,
        orderDate: savedOrder.orderDate
      }
    })

  } catch (error) {
    logger.error('Order creation error:', error)
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate order number. Please try again.'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Get order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

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
router.get('/', async (req, res) => {
  try {
    const { studentId, email, status } = req.query
    const query = {}

    if (studentId) {
      query['studentInfo.studentId'] = studentId
    }
    if (email) {
      query['studentInfo.email'] = email.toLowerCase()
    }
    if (status) {
      query.status = status
    }

    const orders = await Order.find(query)
      .sort({ orderDate: -1 })
      .limit(50)

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
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body
    
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true, runValidators: true }
    )

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

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

