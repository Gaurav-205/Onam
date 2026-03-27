import nodemailer from 'nodemailer'
import { logger } from '../logger.js'

let transporter = null

export const isCloudEnvironment = () => {
  return (
    process.env.RENDER === 'true' ||
    !!process.env.RENDER_SERVICE_NAME ||
    !!process.env.VERCEL ||
    !!process.env.RAILWAY_ENVIRONMENT ||
    !!process.env.HEROKU ||
    process.env.NODE_ENV === 'production'
  )
}

export const resetTransporter = () => {
  transporter = null
}

const buildTransportConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  const isRender = process.env.RENDER === 'true' || !!process.env.RENDER_SERVICE_NAME
  const isVercel = !!process.env.VERCEL
  const isRailway = !!process.env.RAILWAY_ENVIRONMENT
  const isCloud = isCloudEnvironment()

  const emailService = process.env.EMAIL_SERVICE || 'gmail'
  const emailUser = process.env.EMAIL_USER?.trim()
  const emailPasswordRaw = process.env.EMAIL_PASSWORD?.trim() || ''
  const emailPassword = emailPasswordRaw.replace(/\s+/g, '')

  logger.info('Email configuration check:', {
    hasEmailUser: !!emailUser,
    hasEmailPassword: !!emailPassword,
    emailPasswordLength: emailPassword.length,
    emailService,
    isProduction,
    isCloud,
    deploymentPlatform: isRender
      ? 'Render'
      : isVercel
        ? 'Vercel'
        : isRailway
          ? 'Railway'
          : isProduction
            ? 'Production'
            : 'Development'
  })

  if (!emailUser || !emailPassword) {
    logger.warn('Email credentials not configured. Email sending will be disabled.')
    logger.warn(`EMAIL_USER: ${emailUser ? `SET (length: ${emailUser.length})` : 'NOT SET'}`)
    logger.warn(`EMAIL_PASSWORD: ${emailPassword ? `SET (length: ${emailPassword.length})` : 'NOT SET'}`)
    if (process.env.NODE_ENV === 'production') {
      logger.error('CRITICAL: Email credentials missing in production! Check environment variables.')
    }
    return null
  }

  logger.info(`Email service configured for: ${emailUser}`)

  const config = {
    service: emailService,
    auth: {
      user: emailUser,
      pass: emailPassword
    },
    connectionTimeout: isCloud ? 120000 : 90000,
    greetingTimeout: isCloud ? 90000 : 60000,
    socketTimeout: isCloud ? 180000 : 120000,
    debug: process.env.EMAIL_DEBUG === 'true',
    logger: process.env.EMAIL_DEBUG === 'true',
    pool: true,
    maxConnections: 1,
    maxMessages: 3,
    tls: {
      rejectUnauthorized: !isCloud,
      minVersion: 'TLSv1.2',
      ciphers: isCloud ? 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA' : undefined
    },
    ...(isCloud && {
      retries: 3,
      retryDelay: 2000
    })
  }

  if (emailService === 'gmail') {
    delete config.service
    config.host = 'smtp.gmail.com'

    if (process.env.EMAIL_PORT) {
      config.port = parseInt(process.env.EMAIL_PORT)
      config.secure = process.env.EMAIL_SECURE === 'true' || config.port === 465
      config.requireTLS = !config.secure && config.port === 587
      logger.info(`Using Gmail SMTP with custom port: smtp.gmail.com:${config.port} (secure: ${config.secure})`)
    } else if (isCloud) {
      config.port = 465
      config.secure = true
      config.requireTLS = false
      logger.info('Using Gmail SMTP (cloud-optimized): smtp.gmail.com:465 with SSL')
      logger.info('Port 465 is more reliable on cloud providers. If issues persist, try EMAIL_PORT=587')
    } else {
      config.port = 587
      config.secure = false
      config.requireTLS = true
      logger.info('Using Gmail SMTP: smtp.gmail.com:587 with STARTTLS')
    }
  }

  if (process.env.EMAIL_PORT && emailService === 'gmail') {
    config.port = parseInt(process.env.EMAIL_PORT)
    if (process.env.EMAIL_SECURE !== undefined) {
      config.secure = process.env.EMAIL_SECURE === 'true'
      config.requireTLS = !config.secure
    } else {
      config.secure = config.port === 465
      config.requireTLS = config.port === 587
    }
    logger.info(`Using Gmail SMTP with override: smtp.gmail.com:${config.port} (secure: ${config.secure})`)
  } else if (process.env.EMAIL_HOST) {
    config.host = process.env.EMAIL_HOST
    config.port = parseInt(process.env.EMAIL_PORT || (config.secure ? '465' : '587'))
    config.secure = process.env.EMAIL_SECURE === 'true' || config.port === 465
    config.requireTLS = !config.secure && config.port === 587
    logger.info(`Using custom SMTP (override): ${config.host}:${config.port} (secure: ${config.secure})`)
  } else if (emailService !== 'gmail' && process.env.EMAIL_SERVICE) {
    logger.info(`Using service: ${emailService}`)
  }

  return config
}

const createTransporter = () => {
  const config = buildTransportConfig()
  if (!config) {
    return null
  }

  try {
    const instance = nodemailer.createTransport(config)
    logger.info('Email transporter created successfully')
    return instance
  } catch (error) {
    logger.error('Failed to create email transporter:', {
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
    return null
  }
}

export const getOrCreateTransporter = async () => {
  if (!transporter) {
    logger.info('Creating email transporter...')
    transporter = createTransporter()

    if (!transporter) {
      logger.warn('First transporter creation attempt failed. Retrying...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      transporter = createTransporter()
    }
  }

  return transporter
}

export const getEmailIdentity = () => {
  const emailFromName = process.env.EMAIL_FROM_NAME || 'Onam Festival - MIT ADT University'
  const emailUser = process.env.EMAIL_USER?.trim()
  return { emailFromName, emailUser }
}
