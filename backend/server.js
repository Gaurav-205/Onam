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
  logger.warn(`Failed to load .env file from ${envPath}:`, envResult.error.message)
} else {
  logger.info(`Loaded .env file from ${envPath}`)
}

const app = express()
const PORT = process.env.PORT || 3000

// CORS Configuration with validation - MUST be before other middleware
// This ensures CORS headers are set before any route handlers
// Supports multiple origins: comma-separated in FRONTEND_URL env var
// Default includes localhost for development and Netlify for production
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://onammitadt.netlify.app'
]

let allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim()).filter(url => url.length > 0)
  : [...defaultOrigins]

// Always include Netlify origin if not already present
if (!allowedOrigins.includes('https://onammitadt.netlify.app')) {
  allowedOrigins.push('https://onammitadt.netlify.app')
}

// Log allowed origins
logger.info(`CORS allowed origins: ${allowedOrigins.join(', ')}`)

// CORS middleware configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, Postman, curl, health checks)
    if (!origin) {
      return callback(null, true)
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      // Log blocked origins for debugging
      logger.warn(`CORS blocked request from origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`)
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}

// Explicitly handle OPTIONS preflight requests FIRST (before CORS middleware)
// This ensures preflight requests are handled correctly
app.options('*', (req, res) => {
  const origin = req.headers.origin
  
  // Check if origin is allowed (or no origin for health checks)
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Max-Age', '86400')
    res.sendStatus(204)
  } else {
    logger.warn(`CORS OPTIONS blocked from origin: ${origin}`)
    res.status(403).json({ error: 'Not allowed by CORS' })
  }
})

// Apply CORS middleware to all routes (after OPTIONS handler)
app.use(cors(corsOptions))

// Connect to MongoDB (non-blocking - server will start even if DB fails)
connectDB()
  .then(connected => {
    if (connected) {
      logger.info('Database connection established')
    } else {
      logger.warn('Server running without database - some features disabled')
    }
  })
  .catch(err => {
    logger.error('Failed to initialize database connection:', err.message)
  })

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

// Security: Request size limits (reduced for security)
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))

// Request timeout middleware (increased for order creation which may take longer)
app.use((req, res, next) => {
  // Longer timeout for order creation endpoint
  const timeout = req.path.includes('/orders') && req.method === 'POST' ? 60000 : 30000
  req.setTimeout(timeout, () => {
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        message: 'Request timeout'
      })
    }
  })
  next()
})

// Security: Add security headers
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block')
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Content Security Policy
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;")
  }
  next()
})

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
  skip: (req) => {
    // Skip rate limiting for health check in production
    return req.path === '/health' && process.env.NODE_ENV === 'production'
  }
})

// Light rate limiting for config endpoint
const configLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply rate limiting to all API requests
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
app.get('/api/config', configLimiter, (req, res) => {
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

// Email test endpoint (available in all environments for debugging)
app.get('/api/test-email', configLimiter, async (req, res) => {
  try {
    const { testEmailConnection } = await import('./utils/emailService.js')
    const result = await testEmailConnection()
    
    // Include configuration status (without sensitive data)
    const emailConfig = {
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPassword: !!process.env.EMAIL_PASSWORD,
      emailService: process.env.EMAIL_SERVICE || 'gmail',
      isProduction: process.env.NODE_ENV === 'production'
    }
    
    res.json({
      ...result,
      config: emailConfig
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to test email connection',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    })
  }
})

// Email diagnostic endpoint (production-safe, shows configuration status)
app.get('/api/email-diagnostics', configLimiter, async (req, res) => {
  const diagnostics = {
    success: true,
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
    emailService: process.env.EMAIL_SERVICE || 'gmail',
    hasEmailUser: !!process.env.EMAIL_USER,
    hasEmailPassword: !!process.env.EMAIL_PASSWORD,
    emailPasswordLength: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  }
  
  res.json(diagnostics)
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

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`)
  
  server.close(() => {
    logger.info('HTTP server closed')
    
    // Close database connection
    import('mongoose').then(mongoose => {
      mongoose.default.connection.close(false, () => {
        logger.info('MongoDB connection closed')
        process.exit(0)
      })
    }).catch(() => {
      process.exit(0)
    })
  })
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10000)
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  gracefulShutdown('uncaughtException')
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason })
  gracefulShutdown('unhandledRejection')
})

// Start server with error handling
const server = app.listen(PORT, () => {
  const isProduction = process.env.NODE_ENV === 'production'
  const serverUrl = isProduction 
    ? `Server running on port ${PORT}` 
    : `http://localhost:${PORT}`
  
  logger.info(`Server running on ${serverUrl}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
  
  if (isProduction) {
    logger.info(`Health check: /health`)
    logger.info(`API base: /api`)
  } else {
    logger.info(`Health check: http://localhost:${PORT}/health`)
    logger.info(`API base: http://localhost:${PORT}/api`)
  }
  
  logger.info(`Log level: ${process.env.LOG_LEVEL || 'info'}`)
  
  // Check email configuration on startup
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    logger.info(`Email configured for: ${process.env.EMAIL_USER}`)
  } else {
    logger.warn(`Email not configured - EMAIL_USER: ${process.env.EMAIL_USER ? 'SET' : 'NOT SET'}, EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET'}`)
  }
  
  // Production warnings
  if (isProduction) {
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost')) {
      logger.warn('Warning: Using localhost MongoDB URI in production. Update MONGODB_URI in environment variables.')
    }
    if (!process.env.FRONTEND_URL || process.env.FRONTEND_URL.includes('localhost')) {
      logger.warn('Warning: Using localhost in FRONTEND_URL. Update FRONTEND_URL in environment variables.')
    }
  }
})

// Handle server errors (e.g., port already in use)
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`)
    logger.error('Try one of these solutions:')
    logger.error(`  1. Stop the process using port ${PORT}`)
    logger.error(`  2. Set a different PORT in .env file (e.g., PORT=3001)`)
    if (process.platform === 'win32') {
      logger.error(`  3. Kill the process: netstat -ano | findstr :${PORT}`)
    } else {
      logger.error(`  3. Kill the process: lsof -ti:${PORT} | xargs kill`)
    }
    process.exit(1)
  } else {
    logger.error('Server error:', error)
    process.exit(1)
  }
})

// Set server timeout (60 seconds to allow for order creation which may take longer)
server.timeout = 60000
server.keepAliveTimeout = 65000
server.headersTimeout = 66000

export default app

