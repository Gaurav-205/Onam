import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import connectDB from './config/database.js'
import orderRoutes from './routes/orders.js'
import { logger } from './utils/logger.js'

// Load environment variables from .env file in backend directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file explicitly from backend directory
const envPath = join(__dirname, '.env')
const envResult = dotenv.config({ path: envPath })

if (envResult.error) {
  logger.warn(`⚠️ Failed to load .env file from ${envPath}:`, envResult.error.message)
} else {
  logger.info(`📄 Loaded .env file from ${envPath}`)
}

const app = express()
const PORT = process.env.PORT || 3000

// Connect to MongoDB (non-blocking - server will start even if DB fails)
let dbConnected = false
connectDB()
  .then(connected => {
    dbConnected = connected
    if (connected) {
      logger.info('✅ Database connection established')
    } else {
      logger.warn('⚠️ Server running without database - some features disabled')
    }
  })
  .catch(err => {
    logger.error('Failed to initialize database connection:', err.message)
    // Server continues to run for health checks and graceful degradation
  })

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

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
      const duration = Date.now() - start
      logger.request(req.method, req.path, res.statusCode, duration)
    })
    next()
  })
}

// Request size limits (reduced for security)
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))

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
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK', 
    message: 'Onam Festival API is running',
    timestamp: new Date().toISOString(),
    database: 'unknown'
  }

  // Check database connection
  try {
    const mongoose = await import('mongoose')
    if (mongoose.default.connection.readyState === 1) {
      health.database = 'connected'
      health.databaseName = mongoose.default.connection.name
    } else {
      health.database = 'disconnected'
      health.status = 'degraded'
      health.message = 'API running but database is not connected'
    }
  } catch (error) {
    health.database = 'error'
    health.status = 'degraded'
    health.message = 'API running but database check failed'
  }

  const statusCode = health.status === 'OK' ? 200 : 503
  res.status(statusCode).json(health)
})

// Config endpoint (public, returns non-sensitive config)
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    config: {
      payment: {
        upiId: process.env.UPI_ID || null,
        methods: ['cash', 'upi']
      },
      communication: {
        whatsappGroupLink: process.env.WHATSAPP_GROUP_LINK || null
      }
    }
  })
})

// Email test endpoint (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/test-email', async (req, res) => {
    try {
      const { testEmailConnection } = await import('./utils/emailService.js')
      const result = await testEmailConnection()
      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to test email connection',
        error: error.message
      })
    }
  })
}

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
  // Log error with request context
  logger.error(`Unhandled error on ${req.method} ${req.path}:`, err)
  
  // Don't expose internal errors in production
  const statusCode = err.status || 500
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  res.status(statusCode).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { 
      stack: err.stack,
      path: req.path,
      method: req.method
    })
  })
})

// Start server with error handling
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`)
  logger.info(`📊 Health check: http://localhost:${PORT}/health`)
  logger.info(`🔗 API base: http://localhost:${PORT}/api`)
  logger.info(`📝 Log level: ${process.env.LOG_LEVEL || 'info'}`)
  
  // Check email configuration on startup
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    logger.info(`📧 Email configured for: ${process.env.EMAIL_USER}`)
  } else {
    logger.warn(`⚠️ Email not configured - EMAIL_USER: ${process.env.EMAIL_USER ? 'SET' : 'NOT SET'}, EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET'}`)
  }
})

// Handle server errors (e.g., port already in use)
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`❌ Port ${PORT} is already in use`)
    logger.error('💡 Try one of these solutions:')
    logger.error(`   1. Stop the process using port ${PORT}`)
    logger.error(`   2. Set a different PORT in .env file (e.g., PORT=3001)`)
    logger.error(`   3. Kill the process: netstat -ano | findstr :${PORT}`)
    process.exit(1)
  } else {
    logger.error('❌ Server error:', error)
    process.exit(1)
  }
})

export default app

