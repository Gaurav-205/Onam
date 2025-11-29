import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import connectDB from './config/database.js'
import orderRoutes from './routes/orders.js'
import authRoutes from './routes/auth.js'
import { logger } from './utils/logger.js'
import { defaultLimiter, lightLimiter } from './utils/rateLimiter.js'
import { getDatabaseStatus } from './middleware/database.js'
import { APP_CONFIG } from './config/app.js'
import { getCSRFToken, csrfProtection } from './middleware/csrf.js'

// Load environment variables from .env file in backend directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file explicitly from backend directory
// Note: On production platforms like Render, environment variables are set via dashboard
// so .env file may not exist - this is normal and expected
const envPath = join(__dirname, '.env')
const envResult = dotenv.config({ path: envPath })

if (envResult.error) {
  // Only log warning in development - in production (Render), env vars come from platform
  if (process.env.NODE_ENV === 'development') {
    logger.warn(`Failed to load .env file from ${envPath}:`, envResult.error.message)
  }
  // Silently continue in production - environment variables are set via platform
} else {
  logger.info(`Loaded .env file from ${envPath}`)
}

const app = express()
const PORT = process.env.PORT || 3000

// Trust proxy - Required for Render and other reverse proxy hosting providers
// This allows Express to correctly identify client IPs behind proxies
// Set to a specific number (1) instead of true for better security with rate limiting
// Render typically has 1 proxy (load balancer), so we trust only the first proxy
const isDevelopment = process.env.NODE_ENV === 'development'
const isRender = process.env.RENDER === 'true' || !!process.env.RENDER_SERVICE_NAME
// Trust only the first proxy (more secure than true, prevents IP spoofing)
// Set to 1 for hosted environments, false for local development
const trustProxyValue = (!isDevelopment || isRender) ? 1 : false

app.set('trust proxy', trustProxyValue)

if (trustProxyValue) {
  logger.info(`Trust proxy enabled: trusting ${trustProxyValue} proxy(ies) (development mode: ${isDevelopment}, Render: ${isRender})`)
} else {
  logger.info('Trust proxy disabled (local development mode)')
}

// CORS Configuration with validation - MUST be before other middleware
// This ensures CORS headers are set before any route handlers
// Supports multiple origins: comma-separated in FRONTEND_URL env var
// Default includes localhost for development and Netlify for production
const defaultOrigins = isDevelopment
  ? [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://onammitadt.netlify.app'
    ]
  : [
      'https://onammitadt.netlify.app'
    ]

let allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, '')).filter(url => url.length > 0)
  : [...defaultOrigins]

// Always include Netlify origin if not already present (normalize URLs for comparison)
const normalizedOrigins = allowedOrigins.map(url => url.replace(/\/$/, ''))
if (!normalizedOrigins.includes('https://onammitadt.netlify.app')) {
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
    
    // Normalize origin (remove trailing slash) for comparison
    const normalizedOrigin = origin.replace(/\/$/, '')
    
    // Check if origin is allowed (compare normalized)
    if (allowedOrigins.includes(origin) || allowedOrigins.includes(normalizedOrigin)) {
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
  
  // Normalize origin for comparison (remove trailing slash)
  const normalizedOrigin = origin ? origin.replace(/\/$/, '') : null
  
  // Check if origin is allowed (or no origin for health checks)
  if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes(normalizedOrigin)) {
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

// Apply rate limiting to all API requests
app.use('/api/', defaultLimiter)

// Apply CSRF protection to state-changing API requests
// Note: GET requests are excluded in the middleware itself
app.use('/api/', csrfProtection)

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK', 
    message: 'Onam Festival API is running',
    timestamp: new Date().toISOString(),
    database: 'unknown'
  }

  // Check database connection
  const dbStatus = await getDatabaseStatus()
  if (dbStatus.connected) {
      health.database = 'connected'
    health.databaseName = dbStatus.databaseName
    } else {
      health.database = 'disconnected'
      health.status = 'degraded'
      health.message = 'API running but database is not connected'
  }

  const statusCode = health.status === 'OK' ? 200 : 503
  res.status(statusCode).json(health)
})

// Config endpoint (public, returns non-sensitive config)
app.get('/api/config', lightLimiter, (req, res) => {
  res.json({
    success: true,
    config: {
      payment: {
        upiId: APP_CONFIG.PAYMENT.UPI_ID || null,
        methods: APP_CONFIG.PAYMENT.METHODS
      },
      communication: {
        whatsappGroupLink: APP_CONFIG.COMMUNICATION.WHATSAPP_GROUP_LINK || null
      }
    }
  })
})

// CSRF token endpoint (public, returns CSRF token for frontend)
app.get('/api/csrf-token', lightLimiter, getCSRFToken)

// Helper function to get email configuration status (without sensitive data)
const getEmailConfigStatus = () => {
  return {
    hasEmailUser: !!process.env.EMAIL_USER,
    hasEmailPassword: !!process.env.EMAIL_PASSWORD,
    emailService: process.env.EMAIL_SERVICE || 'gmail',
    isProduction: process.env.NODE_ENV === 'production',
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
  }
}

// Email test endpoint (available in all environments for debugging)
app.get('/api/test-email', lightLimiter, async (req, res) => {
  try {
    const { testEmailConnection } = await import('./utils/emailService.js')
    const result = await testEmailConnection()
    
    res.json({
      ...result,
      config: getEmailConfigStatus()
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
app.get('/api/email-diagnostics', lightLimiter, async (req, res) => {
  const config = getEmailConfigStatus()
  res.json({
    success: true,
    ...config,
    emailPasswordLength: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  })
})

// Send test email endpoint (for testing email functionality)
app.post('/api/test-email-send', lightLimiter, async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Valid email address is required in the request body. Send: { "email": "your-email@example.com" }'
      })
    }
    
    const { sendTestEmail } = await import('./utils/emailService.js')
    const result = await sendTestEmail(email)
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        messageId: result.messageId,
        emailFrom: result.emailFrom,
        emailTo: result.emailTo,
        config: getEmailConfigStatus()
      })
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        code: result.code,
        config: getEmailConfigStatus(),
        ...(result.details && { details: result.details })
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
      config: getEmailConfigStatus(),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    })
  }
})

// API Routes
// Authentication routes (public)
app.use('/api/auth', authRoutes)

// Order routes (protected - require authentication)
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
  
  // Check email configuration on startup and verify connection
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    const emailUser = process.env.EMAIL_USER.trim()
    logger.info(`Email configured for: ${emailUser}`)
    
    // Detect deployment platform for better logging
    const isRender = process.env.RENDER === 'true' || !!process.env.RENDER_SERVICE_NAME
    const isVercel = !!process.env.VERCEL
    const platform = isRender ? 'Render' : isVercel ? 'Vercel' : process.env.NODE_ENV === 'production' ? 'Production' : 'Development'
    logger.info(`Deployment platform: ${platform}`)
    
    // Verify email connection on startup (non-blocking)
    import('./utils/emailService.js').then(({ testEmailConnection }) => {
      testEmailConnection()
        .then(result => {
          if (result.success) {
            logger.info('✓ Email service verified and ready')
            if (result.warning) {
              logger.warn(`⚠ ${result.warning}`)
            }
          } else {
            logger.warn(`⚠ Email service verification failed: ${result.message}`)
            if (result.code) {
              logger.warn(`Error code: ${result.code}`)
            }
            logger.warn('Email sending may still work - verification is often blocked by cloud providers')
          }
        })
        .catch(err => {
          logger.error('Failed to verify email service on startup:', err.message)
          logger.warn('Email sending will still be attempted when orders are created')
        })
    }).catch(err => {
      logger.error('Failed to import email service for startup check:', err.message)
    })
  } else {
    const emailUserStatus = process.env.EMAIL_USER ? 'SET' : 'NOT SET'
    const emailPassStatus = process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET'
    logger.warn(`Email not configured - EMAIL_USER: ${emailUserStatus}, EMAIL_PASSWORD: ${emailPassStatus}`)
    logger.warn('Order confirmation emails will not be sent. Set EMAIL_USER and EMAIL_PASSWORD environment variables.')
  }
  
  // Production warnings
  if (isProduction) {
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost')) {
      logger.warn('Warning: Using localhost MongoDB URI in production. Update MONGODB_URI in environment variables.')
    }
    // Check if any allowed origin contains localhost (not just FRONTEND_URL env var)
    const hasLocalhost = allowedOrigins.some(origin => origin.includes('localhost'))
    if (hasLocalhost) {
      logger.warn('Warning: localhost origins detected in CORS configuration. Set FRONTEND_URL environment variable to remove localhost origins in production.')
    }
    // Warn if FRONTEND_URL is not set in production
    if (!process.env.FRONTEND_URL) {
      logger.warn('Warning: FRONTEND_URL environment variable is not set. Using default origins. Set FRONTEND_URL for production deployment.')
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

