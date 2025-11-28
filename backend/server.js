import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import connectDB from './config/database.js'
import orderRoutes from './routes/orders.js'
import { logger } from './utils/logger.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Connect to MongoDB
connectDB()

// CORS Configuration with validation
// Supports multiple origins: comma-separated in FRONTEND_URL env var
// Default includes localhost for development and Netlify for production
const defaultOrigins = [
  'http://localhost:5173',
  'https://onammitadt.netlify.app'
]

const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : defaultOrigins

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.) in development
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true)
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Request size limits
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

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

// Apply rate limiting to all requests
app.use('/api/', limiter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Onam Festival API is running',
    timestamp: new Date().toISOString()
  })
})

// Config endpoint (public, returns non-sensitive config)
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    config: {
      payment: {
        upiId: process.env.UPI_ID || null,
        methods: ['cash', 'upi']
      }
    }
  })
})

// API Routes
// Apply stricter rate limiting to order creation
app.use('/api/orders', orderRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  })
})

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`)
  logger.info(`📊 Health check: http://localhost:${PORT}/health`)
  logger.info(`🔗 API base: http://localhost:${PORT}/api`)
  logger.info(`📝 Log level: ${process.env.LOG_LEVEL || 'info'}`)
})

export default app

