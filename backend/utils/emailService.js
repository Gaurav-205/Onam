/**
 * Email Service Utility
 * Orchestrates transport configuration, template generation, and sending.
 */

import { logger } from './logger.js'
import { APP_CONFIG } from '../config/app.js'
import {
  getEmailIdentity,
  getOrCreateTransporter,
  isCloudEnvironment,
  resetTransporter,
} from './email/transport.js'
import { sendWithTimeout } from './email/sender.js'
import { buildOrderConfirmationMail, buildTestEmailMail } from './email/templates.js'

const shouldResetTransport = (errorCode) => {
  return errorCode === 'EAUTH' || errorCode === 'ECONNECTION' || errorCode === 'ETIMEDOUT'
}

const getFriendlyErrorMessage = (errorCode, fallback) => {
  if (errorCode === 'EAUTH') {
    return 'Email authentication failed. Please check EMAIL_USER and EMAIL_PASSWORD. For Gmail, ensure you are using an App Password.'
  }
  if (errorCode === 'ECONNECTION') {
    return 'Email connection failed. Please check your network connection and email service configuration.'
  }
  if (errorCode === 'ETIMEDOUT') {
    return 'Email sending timed out. The email service may be slow or unavailable. Please try again later.'
  }
  return fallback
}

const resolveEmailIdentity = () => {
  const transportIdentity = getEmailIdentity()
  const emailFromName = APP_CONFIG.COMMUNICATION.EMAIL_FROM_NAME || transportIdentity.emailFromName
  const emailUser = transportIdentity.emailUser

  if (!emailUser) {
    throw new Error('EMAIL_USER environment variable is not set')
  }

  return { emailFromName, emailUser }
}

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (order, whatsappLink) => {
  try {
    const transporter = await getOrCreateTransporter()
    if (!transporter) {
      const errorMsg = 'Email transporter not available. Check EMAIL_USER and EMAIL_PASSWORD environment variables.'
      logger.warn(errorMsg)
      return { success: false, message: errorMsg }
    }

    logger.info('Skipping pre-send verification (some hosts block it). Attempting direct send...')

    const { emailFromName, emailUser } = resolveEmailIdentity()
    const mailOptions = buildOrderConfirmationMail({
      order,
      whatsappLink,
      emailFromName,
      emailUser,
    })

    const timeoutMs = isCloudEnvironment() ? 90000 : 30000
    const info = await sendWithTimeout(transporter, mailOptions, timeoutMs)

    logger.info(`Order confirmation email sent successfully to ${mailOptions.to} (Message ID: ${info.messageId})`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    const errorMessage = error?.message || 'Unknown error'
    const errorCode = error?.code || 'UNKNOWN'

    const recipientEmail = order?.studentInfo?.email || order?.email || 'unknown'
    const orderNum = order?.orderNumber || 'unknown'

    logger.error(`Failed to send order confirmation email to ${recipientEmail}:`, {
      message: errorMessage,
      code: errorCode,
      orderNumber: orderNum,
      response: error?.response || null,
      command: error?.command,
      responseCode: error?.responseCode,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })

    if (shouldResetTransport(errorCode)) {
      logger.warn('Resetting email transporter due to connection/auth error. Will recreate on next attempt.')
      resetTransporter()
    }

    return {
      success: false,
      message: getFriendlyErrorMessage(errorCode, errorMessage),
      error: errorMessage,
      code: errorCode,
      details: process.env.NODE_ENV === 'development'
        ? {
          response: error?.response || null,
          command: error?.command,
          responseCode: error?.responseCode,
          originalError: errorMessage,
        }
        : undefined,
    }
  }
}

/**
 * Test email configuration (verify connection)
 */
export const testEmailConnection = async () => {
  try {
    const transporter = await getOrCreateTransporter()
    if (!transporter) {
      return {
        success: false,
        message: 'Email service not configured. Check EMAIL_USER and EMAIL_PASSWORD environment variables.',
        details: {
          hasEmailUser: !!process.env.EMAIL_USER,
          hasEmailPassword: !!process.env.EMAIL_PASSWORD,
        },
      }
    }

    const isCloudEnv = isCloudEnvironment()
    const verificationTimeout = isCloudEnv ? 60000 : 30000

    logger.info(`Verifying email connection (timeout: ${verificationTimeout / 1000}s)...`)

    try {
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Verification timeout after ${verificationTimeout / 1000} seconds`)), verificationTimeout)),
      ])

      logger.info('Email connection verified successfully')
      return {
        success: true,
        message: 'Email service is configured correctly and connection verified',
        emailUser: process.env.EMAIL_USER,
      }
    } catch (verifyError) {
      const platform = process.env.RENDER === 'true' || !!process.env.RENDER_SERVICE_NAME
        ? 'Render'
        : process.env.VERCEL
          ? 'Vercel'
          : process.env.RAILWAY_ENVIRONMENT
            ? 'Railway'
            : isCloudEnv
              ? 'Cloud'
              : 'Local'

      logger.warn('Email verification failed (this is often okay - some hosts block verification but allow sending):', {
        message: verifyError.message,
        platform,
        note: 'Email sending will still be attempted when orders are created',
      })

      const warningMessage = isCloudEnv
        ? `SMTP verification timed out - this is common on ${platform}. Email sending will still be attempted.`
        : 'SMTP verification timed out. Email sending will still be attempted.'

      return {
        success: true,
        message: 'Email service configured. Verification failed but sending may still work (some hosts block verification)',
        emailUser: process.env.EMAIL_USER,
        warning: warningMessage,
      }
    }
  } catch (error) {
    logger.error('Email connection test failed:', {
      message: error.message,
      code: error.code,
      command: error?.command,
      responseCode: error?.responseCode,
    })

    resetTransporter()

    return {
      success: false,
      message: error.message || 'Email connection test failed',
      code: error.code,
      details: process.env.NODE_ENV === 'development'
        ? {
          command: error?.command,
          responseCode: error?.responseCode,
        }
        : undefined,
    }
  }
}

/**
 * Send a test email to verify email sending functionality
 */
export const sendTestEmail = async (testEmail) => {
  try {
    const transporter = await getOrCreateTransporter()
    if (!transporter) {
      const errorMsg = 'Email transporter not available. Check EMAIL_USER and EMAIL_PASSWORD environment variables.'
      logger.warn(errorMsg)
      return { success: false, message: errorMsg }
    }

    const { emailFromName, emailUser } = resolveEmailIdentity()
    const mailOptions = buildTestEmailMail({ testEmail, emailFromName, emailUser })

    logger.info(`Sending test email to ${testEmail}...`)

    const timeoutMs = process.env.NODE_ENV === 'production' ? 60000 : 30000
    const info = await sendWithTimeout(transporter, mailOptions, timeoutMs)

    logger.info(`Test email sent successfully to ${testEmail} (Message ID: ${info.messageId})`)
    return {
      success: true,
      message: `Test email sent successfully to ${testEmail}`,
      messageId: info.messageId,
      emailFrom: `${emailFromName} <${emailUser}>`,
      emailTo: testEmail,
    }
  } catch (error) {
    const errorMessage = error?.message || 'Unknown error'
    const errorCode = error?.code || 'UNKNOWN'

    logger.error(`Failed to send test email to ${testEmail}:`, {
      message: errorMessage,
      code: errorCode,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })

    if (shouldResetTransport(errorCode)) {
      logger.warn('Resetting email transporter due to connection/auth error. Will recreate on next attempt.')
      resetTransporter()
    }

    return {
      success: false,
      message: errorMessage,
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined,
    }
  }
}

