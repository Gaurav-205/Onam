/**
 * Email Service Utility
 * Handles sending emails for order confirmations
 */

import nodemailer from 'nodemailer'
import { logger } from './logger.js'

// Create reusable transporter
let transporter = null

const createTransporter = () => {
  // Use Gmail SMTP or custom SMTP based on environment
  const emailService = process.env.EMAIL_SERVICE || 'gmail'
  const emailUser = process.env.EMAIL_USER?.trim()
  // Gmail app passwords have spaces - remove all spaces for authentication
  // Format from .env: "oike gcpd aeyk uang" -> "oikegcpaeykuang"
  const emailPassword = process.env.EMAIL_PASSWORD?.trim().replace(/\s+/g, '')

  if (!emailUser || !emailPassword) {
    logger.warn('Email credentials not configured. Email sending will be disabled.')
    logger.warn(`EMAIL_USER: ${emailUser ? 'SET' : 'NOT SET'}, EMAIL_PASSWORD: ${emailPassword ? 'SET' : 'NOT SET'}`)
    return null
  }
  
  logger.info(`Email service configured for: ${emailUser}`)

  const config = {
    service: emailService,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  }

  // For custom SMTP (not Gmail)
  if (emailService !== 'gmail' && process.env.EMAIL_HOST) {
    config.host = process.env.EMAIL_HOST
    config.port = parseInt(process.env.EMAIL_PORT || '587')
    config.secure = process.env.EMAIL_SECURE === 'true'
  }

  return nodemailer.createTransport(config)
}

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (order, whatsappLink) => {
  try {
    if (!transporter) {
      transporter = createTransporter()
    }

    if (!transporter) {
      logger.warn('Email transporter not available. Skipping email send.')
      return { success: false, message: 'Email service not configured' }
    }

    const { studentInfo, orderItems, orderNumber, totalAmount, orderDate } = order

    // Sanitize user input to prevent XSS in email
    const sanitize = (str) => {
      if (!str || typeof str !== 'string') return ''
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
    }

    // Format order items with sanitization
    const itemsList = orderItems.map(item => 
      `  • ${sanitize(item.name)} × ${item.quantity} = ₹${item.total}`
    ).join('\n')

    // Format order date
    const formattedDate = new Date(orderDate).toLocaleString('en-IN', {
      dateStyle: 'long',
      timeStyle: 'short'
    })

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #D97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .order-number { font-size: 24px; font-weight: bold; color: #059669; text-align: center; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-label { font-weight: bold; color: #6b7280; }
    .info-value { color: #111827; }
    .items-list { background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .total { font-size: 20px; font-weight: bold; color: #059669; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px solid #059669; }
    .whatsapp-button { display: inline-block; background: #25D366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: bold; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Onam Festival Registration Confirmed!</h1>
      <p>Thank you for registering for Onam celebrations at MIT ADT University</p>
    </div>
    <div class="content">
      <div class="order-details">
        <div class="order-number">Order Number: ${sanitize(orderNumber)}</div>
        
        <div class="info-row">
          <span class="info-label">Name:</span>
          <span class="info-value">${sanitize(studentInfo.name)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Student ID:</span>
          <span class="info-value">${sanitize(studentInfo.studentId)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${sanitize(studentInfo.email)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone:</span>
          <span class="info-value">${sanitize(studentInfo.phone)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Course:</span>
          <span class="info-value">${sanitize(studentInfo.course)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Department:</span>
          <span class="info-value">${sanitize(studentInfo.department)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Year:</span>
          <span class="info-value">${sanitize(studentInfo.year)}</span>
        </div>
        ${studentInfo.hostel ? `
        <div class="info-row">
          <span class="info-label">Hostel:</span>
          <span class="info-value">${sanitize(studentInfo.hostel)}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Order Date:</span>
          <span class="info-value">${formattedDate}</span>
        </div>
      </div>

      <div class="order-details">
        <h3 style="margin-top: 0;">Order Items:</h3>
        <div class="items-list">
          <pre style="margin: 0; font-family: inherit;">${itemsList}</pre>
        </div>
        <div class="total">Total Amount: ₹${totalAmount}</div>
      </div>

      ${whatsappLink ? `
      <div style="text-align: center; margin: 30px 0;">
        <h3>Join Our WhatsApp Group!</h3>
        <p>Stay updated with Onam festival updates, event schedules, and more:</p>
        <a href="${whatsappLink}" class="whatsapp-button" target="_blank">
          Join WhatsApp Group
        </a>
      </div>
      ` : ''}

      <div class="footer">
        <p>We look forward to celebrating Onam with you!</p>
        <p>For any queries, please contact the event organizers.</p>
        <p style="margin-top: 20px; color: #9ca3af;">This is an automated confirmation email. Please do not reply.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `

    const textContent = `
Onam Festival Registration Confirmed!

Thank you for registering for Onam celebrations at MIT ADT University.

Order Number: ${sanitize(orderNumber)}

Student Information:
- Name: ${sanitize(studentInfo.name)}
- Student ID: ${sanitize(studentInfo.studentId)}
- Email: ${sanitize(studentInfo.email)}
- Phone: ${sanitize(studentInfo.phone)}
- Course: ${sanitize(studentInfo.course)}
- Department: ${sanitize(studentInfo.department)}
- Year: ${sanitize(studentInfo.year)}
${studentInfo.hostel ? `- Hostel: ${sanitize(studentInfo.hostel)}` : ''}
- Order Date: ${formattedDate}

Order Items:
${itemsList}

Total Amount: ₹${totalAmount}

${whatsappLink ? `
Join Our WhatsApp Group!
Stay updated with Onam festival updates, event schedules, and more:
${whatsappLink}
` : ''}

We look forward to celebrating Onam with you!
For any queries, please contact the event organizers.

---
This is an automated confirmation email. Please do not reply.
    `

    const mailOptions = {
      from: `"Onam Festival - MIT ADT University" <${process.env.EMAIL_USER}>`,
      to: studentInfo.email,
      subject: `Onam Festival Registration Confirmed - Order ${sanitize(orderNumber)}`,
      text: textContent,
      html: htmlContent,
    }

    const info = await transporter.sendMail(mailOptions)
    logger.info(`Order confirmation email sent to ${studentInfo.email} (Message ID: ${info.messageId})`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    const errorMessage = error?.message || 'Unknown error'
    const errorCode = error?.code || 'UNKNOWN'
    logger.error(`Failed to send order confirmation email to ${studentInfo.email}:`, {
      message: errorMessage,
      code: errorCode,
      orderNumber: order.orderNumber
    })
    return { success: false, error: errorMessage, code: errorCode }
  }
}

/**
 * Test email configuration
 */
export const testEmailConnection = async () => {
  try {
    if (!transporter) {
      transporter = createTransporter()
    }
    if (!transporter) {
      return { success: false, message: 'Email service not configured' }
    }
    await transporter.verify()
    return { success: true, message: 'Email service is configured correctly' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

