/**
 * Authentication Routes
 * Handles user registration, login, and token refresh
 */

import express from 'express'
import { body } from 'express-validator'
import User from '../models/User.js'
import { generateToken } from '../utils/auth.js'
import { logger } from '../utils/logger.js'
import { handleValidationErrors } from '../middleware/validation.js'
import { checkDatabaseConnection } from '../middleware/database.js'
import { lightLimiter } from '../utils/rateLimiter.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Validation middleware
const validateRegister = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Valid email is required')
    .isLength({ max: 100 })
    .withMessage('Email must be less than 100 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .isLength({ max: 100 })
    .withMessage('Password must be less than 100 characters'),
  body('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required')
    .isLength({ max: 50 })
    .withMessage('Student ID must be less than 50 characters'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
]

const validateLogin = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
]

// Register new user
router.post('/register', lightLimiter, validateRegister, handleValidationErrors, checkDatabaseConnection, async (req, res) => {
  try {
    const { email, password, studentId, name } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { studentId: studentId.trim() }
      ]
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or student ID already exists.',
        code: 'USER_EXISTS'
      })
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase().trim(),
      password,
      studentId: studentId.trim(),
      name: name.trim(),
      role: 'user'
    })

    await user.save()

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    })

    logger.info(`New user registered: ${user.email} (${user.studentId})`)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        studentId: user.studentId,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    logger.error('Registration error:', error)
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or student ID already exists.',
        code: 'USER_EXISTS'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    })
  }
})

// Login user
router.post('/login', lightLimiter, validateLogin, handleValidationErrors, checkDatabaseConnection, async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        code: 'INVALID_CREDENTIALS'
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
        code: 'USER_INACTIVE'
      })
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for email: ${email}`)
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        code: 'INVALID_CREDENTIALS'
      })
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    })

    logger.info(`User logged in: ${user.email} (${user.studentId})`)

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        studentId: user.studentId,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    logger.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    })
  }
})

// Get current user (requires authentication)
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        code: 'USER_NOT_FOUND'
      })
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        studentId: user.studentId,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    logger.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user information.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    })
  }
})

export default router

