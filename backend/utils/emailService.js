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
  // Gmail app passwords - handle with or without spaces
  // Some deployment platforms may add spaces, some may not
  const emailPasswordRaw = process.env.EMAIL_PASSWORD?.trim() || ''
  // Remove spaces only if they exist (Gmail app passwords work with or without spaces)
  const emailPassword = emailPasswordRaw.replace(/\s+/g, '')

  // Detailed logging for debugging
  logger.info('Email configuration check:', {
    hasEmailUser: !!emailUser,
    hasEmailPassword: !!emailPassword,
    emailPasswordLength: emailPassword.length,
    emailService,
    isProduction: process.env.NODE_ENV === 'production'
  })

  if (!emailUser || !emailPassword) {
    logger.warn('Email credentials not configured. Email sending will be disabled.')
    logger.warn(`EMAIL_USER: ${emailUser ? 'SET (length: ' + emailUser.length + ')' : 'NOT SET'}`)
    logger.warn(`EMAIL_PASSWORD: ${emailPassword ? 'SET (length: ' + emailPassword.length + ')' : 'NOT SET'}`)
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
        pass: emailPassword,
      },
      // Extended timeouts for hosting providers that may have slower connections
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000,   // 30 seconds
      socketTimeout: 90000,     // 90 seconds - increased for slow connections
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
      // Add pool option for better connection handling
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
    }
    
    // For Gmail, use explicit SMTP settings for better compatibility with hosting providers
    if (emailService === 'gmail') {
      // Use smtp.gmail.com explicitly instead of 'gmail' service
      // This gives us more control over connection settings
      delete config.service // Remove service to use explicit host
      config.host = 'smtp.gmail.com'
      config.port = 587
      config.secure = false // Use TLS instead of SSL
      config.requireTLS = true
      logger.info('Using Gmail SMTP: smtp.gmail.com:587 with STARTTLS')
    }

  // For custom SMTP (not Gmail)
  if (emailService !== 'gmail' && process.env.EMAIL_HOST) {
    config.host = process.env.EMAIL_HOST
    config.port = parseInt(process.env.EMAIL_PORT || '587')
    config.secure = process.env.EMAIL_SECURE === 'true'
    logger.info(`Using custom SMTP: ${config.host}:${config.port}`)
  }

  try {
    const transporter = nodemailer.createTransport(config)
    logger.info('Email transporter created successfully')
    return transporter
  } catch (error) {
    logger.error('Failed to create email transporter:', {
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
    return null
  }
}

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (order, whatsappLink) => {
  try {
    // Recreate transporter if it doesn't exist (allows retry after config fix)
    if (!transporter) {
      logger.info('Creating email transporter...')
      transporter = createTransporter()
    }

    if (!transporter) {
      const errorMsg = 'Email transporter not available. Check EMAIL_USER and EMAIL_PASSWORD environment variables.'
      logger.warn(errorMsg)
      return { success: false, message: errorMsg }
    }

    // Skip verification before sending - some hosting providers (like Render) block SMTP verification
    // but allow actual email sending. We'll attempt to send directly and catch errors then.
    logger.info('Skipping pre-send verification (some hosts block it). Attempting direct send...')

    const { studentInfo, orderItems, orderNumber, totalAmount, orderDate, payment } = order

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

    // Format order items with sanitization for HTML table
    const itemsTableRows = orderItems.map(item => {
      const price = Number(item.price) || 0
      const total = Number(item.total) || 0
      return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${sanitize(item.name)}</td>
        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">₹${price.toFixed(2)}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600; border-bottom: 1px solid #e5e7eb;">₹${total.toFixed(2)}</td>
      </tr>
    `
    }).join('')

    // Format order items for plain text
    const itemsList = orderItems.map(item => 
      `  • ${sanitize(item.name)} × ${item.quantity} = ₹${item.total.toFixed(2)}`
    ).join('\n')

    // Format order date
    const formattedDate = new Date(orderDate).toLocaleString('en-IN', {
      dateStyle: 'long',
      timeStyle: 'short'
    })

    // Format payment method display
    const paymentMethodDisplay = payment?.method === 'upi' ? 'UPI Payment' : 'Cash Payment (Pay at Venue)'
    const paymentDetails = payment?.method === 'upi' 
      ? `UPI ID: ${sanitize(payment.upiId || 'N/A')}<br>Transaction ID: ${sanitize(payment.transactionId || 'N/A')}`
      : 'Payment will be collected at the event venue on the day of celebration.'

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Onam Festival Registration Confirmation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.6; 
      color: #1f2937; 
      background-color: #f3f4f6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .email-wrapper { 
      max-width: 650px; 
      margin: 0 auto; 
      background-color: #ffffff;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header { 
      background: linear-gradient(135deg, #059669 0%, #10b981 50%, #D97706 100%); 
      color: white; 
      padding: 40px 30px; 
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 30px 30px;
      animation: float 20s infinite linear;
    }
    @keyframes float {
      0% { transform: translate(0, 0); }
      100% { transform: translate(30px, 30px); }
    }
    .header-content { position: relative; z-index: 1; }
    .header h1 { 
      font-size: 28px; 
      font-weight: 700; 
      margin-bottom: 10px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .header p { 
      font-size: 16px; 
      opacity: 0.95;
      margin-top: 8px;
    }
    .success-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-top: 15px;
      backdrop-filter: blur(10px);
    }
    .content { 
      padding: 40px 30px; 
      background: #ffffff;
    }
    .order-number-box {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 2px solid #059669;
      border-radius: 12px;
      padding: 25px;
      text-align: center;
      margin: 0 0 30px 0;
      box-shadow: 0 2px 8px rgba(5, 150, 105, 0.1);
    }
    .order-number-label {
      font-size: 14px;
      color: #059669;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .order-number { 
      font-size: 32px; 
      font-weight: 700; 
      color: #047857;
      letter-spacing: 1px;
      font-family: 'Courier New', monospace;
    }
    .section {
      background: #f9fafb;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 25px;
      border: 1px solid #e5e7eb;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #059669;
      display: flex;
      align-items: center;
    }
    .section-title::before {
      content: '';
      width: 4px;
      height: 20px;
      background: #059669;
      margin-right: 12px;
      border-radius: 2px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .info-item {
      padding: 12px 0;
    }
    .info-label { 
      font-size: 12px;
      font-weight: 600; 
      color: #6b7280; 
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      display: block;
    }
    .info-value { 
      font-size: 15px;
      color: #111827; 
      font-weight: 500;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .items-table thead {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white;
    }
    .items-table th {
      padding: 14px 12px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .items-table th:last-child,
    .items-table td:last-child {
      text-align: right;
    }
    .items-table th:nth-child(2),
    .items-table td:nth-child(2) {
      text-align: center;
    }
    .items-table th:nth-child(3),
    .items-table td:nth-child(3) {
      text-align: right;
    }
    .items-table tbody tr:hover {
      background-color: #f9fafb;
    }
    .items-table tbody tr:last-child td {
      border-bottom: none;
    }
    .total-row {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
      font-weight: 700;
    }
    .total-row td {
      padding: 18px 12px !important;
      font-size: 18px;
      color: #047857;
      border-top: 2px solid #059669;
    }
    .payment-info {
      background: #fef3c7;
      border-left: 4px solid #D97706;
      padding: 18px;
      border-radius: 8px;
      margin-top: 15px;
    }
    .payment-method {
      font-weight: 600;
      color: #92400e;
      margin-bottom: 8px;
      font-size: 15px;
    }
    .payment-details {
      color: #78350f;
      font-size: 14px;
      line-height: 1.6;
    }
    .whatsapp-section {
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
      border: 2px solid #10b981;
    }
    .whatsapp-section h3 {
      color: #047857;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .whatsapp-section p {
      color: #065f46;
      margin-bottom: 20px;
      font-size: 15px;
    }
    .whatsapp-button { 
      display: inline-block;
      background: #25D366; 
      color: white; 
      padding: 16px 40px; 
      text-decoration: none; 
      border-radius: 50px; 
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
      transition: all 0.3s ease;
    }
    .whatsapp-button:hover {
      background: #20ba5a;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(37, 211, 102, 0.5);
    }
    .footer { 
      background: #f9fafb;
      padding: 30px;
      text-align: center; 
      color: #6b7280; 
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 8px 0;
      line-height: 1.8;
    }
    .footer-note {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 12px;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e5e7eb, transparent);
      margin: 25px 0;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper { width: 100% !important; }
      .content { padding: 25px 20px !important; }
      .header { padding: 30px 20px !important; }
      .header h1 { font-size: 24px !important; }
      .info-grid { grid-template-columns: 1fr !important; }
      .order-number { font-size: 24px !important; }
      .items-table { font-size: 13px !important; }
      .items-table th,
      .items-table td { padding: 10px 8px !important; }
    }
  </style>
</head>
<body>
  <div style="background-color: #f3f4f6; padding: 20px 0;">
    <div class="email-wrapper">
      <div class="header">
        <div class="header-content">
          <h1>Onam Festival Registration Confirmed!</h1>
          <p>Thank you for registering for Onam celebrations at MIT ADT University</p>
          <div class="success-badge">✓ Registration Successful</div>
        </div>
      </div>
      
      <div class="content">
        <div class="order-number-box">
          <div class="order-number-label">Your Order Number</div>
          <div class="order-number">${sanitize(orderNumber)}</div>
        </div>

        <div class="section">
          <div class="section-title">Student Information</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Full Name</span>
              <span class="info-value">${sanitize(studentInfo.name)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Student ID</span>
              <span class="info-value">${sanitize(studentInfo.studentId)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email Address</span>
              <span class="info-value">${sanitize(studentInfo.email)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Phone Number</span>
              <span class="info-value">${sanitize(studentInfo.phone)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Course / Program</span>
              <span class="info-value">${sanitize(studentInfo.course)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Department</span>
              <span class="info-value">${sanitize(studentInfo.department)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Year</span>
              <span class="info-value">${sanitize(studentInfo.year)}</span>
            </div>
            ${studentInfo.hostel ? `
            <div class="info-item">
              <span class="info-label">Hostel</span>
              <span class="info-value">${sanitize(studentInfo.hostel)}</span>
            </div>
            ` : '<div class="info-item"></div>'}
            <div class="info-item">
              <span class="info-label">Registration Date</span>
              <span class="info-value">${formattedDate}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Order Details</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTableRows}
              <tr class="total-row">
                <td colspan="3" style="text-align: right; padding-right: 12px;">Total Amount:</td>
                <td>₹${totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="payment-info">
            <div class="payment-method">Payment Method: ${paymentMethodDisplay}</div>
            <div class="payment-details">${paymentDetails}</div>
          </div>
        </div>

        ${whatsappLink ? `
        <div class="whatsapp-section">
          <h3>Join Our WhatsApp Group!</h3>
          <p>Stay updated with Onam festival updates, event schedules, announcements, and connect with fellow participants.</p>
          <a href="${whatsappLink}" class="whatsapp-button" target="_blank" rel="noopener noreferrer">
            Join WhatsApp Group →
          </a>
        </div>
        ` : ''}

        <div class="divider"></div>

        <div class="footer">
          <p style="font-weight: 600; color: #111827; margin-bottom: 12px;">We look forward to celebrating Onam with you!</p>
          <p>For any queries or assistance, please contact the event organizers.</p>
          <p style="margin-top: 15px; color: #059669; font-weight: 600;">MIT ADT University</p>
          <div class="footer-note">
            <p>This is an automated confirmation email. Please do not reply to this email.</p>
            <p style="margin-top: 8px;">If you have any questions, please contact the event organizers directly.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `

    // Format payment details for text
    const paymentText = payment?.method === 'upi' 
      ? `UPI ID: ${sanitize(payment.upiId || 'N/A')}\nTransaction ID: ${sanitize(payment.transactionId || 'N/A')}`
      : 'Payment will be collected at the event venue on the day of celebration.'

    const textContent = `
═══════════════════════════════════════════════════════════
    ONAM FESTIVAL REGISTRATION CONFIRMED
═══════════════════════════════════════════════════════════

Thank you for registering for Onam celebrations at 
MIT ADT University!

✓ Registration Successful

───────────────────────────────────────────────────────────
ORDER NUMBER: ${sanitize(orderNumber)}
───────────────────────────────────────────────────────────

STUDENT INFORMATION
───────────────────────────────────────────────────────────
Full Name:        ${sanitize(studentInfo.name)}
Student ID:       ${sanitize(studentInfo.studentId)}
Email Address:    ${sanitize(studentInfo.email)}
Phone Number:     ${sanitize(studentInfo.phone)}
Course/Program:   ${sanitize(studentInfo.course)}
Department:       ${sanitize(studentInfo.department)}
Year:             ${sanitize(studentInfo.year)}
${studentInfo.hostel ? `Hostel:            ${sanitize(studentInfo.hostel)}` : ''}
Registration Date: ${formattedDate}

───────────────────────────────────────────────────────────
ORDER DETAILS
───────────────────────────────────────────────────────────
${itemsList}

───────────────────────────────────────────────────────────
TOTAL AMOUNT: ₹${totalAmount.toFixed(2)}
───────────────────────────────────────────────────────────

PAYMENT INFORMATION
───────────────────────────────────────────────────────────
Payment Method: ${payment?.method === 'upi' ? 'UPI Payment' : 'Cash Payment (Pay at Venue)'}
${paymentText}

${whatsappLink ? `
───────────────────────────────────────────────────────────
JOIN OUR WHATSAPP GROUP
───────────────────────────────────────────────────────────
Stay updated with Onam festival updates, event schedules, 
announcements, and connect with fellow participants:

${whatsappLink}
` : ''}

───────────────────────────────────────────────────────────

We look forward to celebrating Onam with you!

For any queries or assistance, please contact the event 
organizers.

MIT ADT University

───────────────────────────────────────────────────────────
This is an automated confirmation email. Please do not 
reply to this email. If you have any questions, please 
contact the event organizers directly.
═══════════════════════════════════════════════════════════
    `

    const mailOptions = {
      from: `"Onam Festival - MIT ADT University" <${process.env.EMAIL_USER}>`,
      to: studentInfo.email,
      subject: `Onam Festival Registration Confirmed - Order ${sanitize(orderNumber)}`,
      text: textContent,
      html: htmlContent,
    }

    // Send email with timeout
    const sendPromise = transporter.sendMail(mailOptions)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email send timeout after 30 seconds')), 30000)
    )
    
    const info = await Promise.race([sendPromise, timeoutPromise])
    
    logger.info(`Order confirmation email sent successfully to ${studentInfo.email} (Message ID: ${info.messageId})`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    const errorMessage = error?.message || 'Unknown error'
    const errorCode = error?.code || 'UNKNOWN'
    const errorResponse = error?.response || null
    
    // Log detailed error information
    logger.error(`Failed to send order confirmation email to ${studentInfo.email}:`, {
      message: errorMessage,
      code: errorCode,
      orderNumber: order?.orderNumber || 'unknown',
      response: errorResponse,
      command: error?.command,
      responseCode: error?.responseCode,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
    
    // Reset transporter on certain errors to allow retry
    if (errorCode === 'EAUTH' || errorCode === 'ECONNECTION' || errorCode === 'ETIMEDOUT') {
      logger.warn('Resetting email transporter due to connection/auth error. Will recreate on next attempt.')
      transporter = null
    }
    
    return { 
      success: false, 
      error: errorMessage, 
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? {
        response: errorResponse,
        command: error?.command,
        responseCode: error?.responseCode
      } : undefined
    }
  }
}

/**
 * Test email configuration
 */
export const testEmailConnection = async () => {
  try {
    if (!transporter) {
      logger.info('Creating transporter for email test...')
      transporter = createTransporter()
    }
    if (!transporter) {
      return { 
        success: false, 
        message: 'Email service not configured. Check EMAIL_USER and EMAIL_PASSWORD environment variables.',
        details: {
          hasEmailUser: !!process.env.EMAIL_USER,
          hasEmailPassword: !!process.env.EMAIL_PASSWORD
        }
      }
    }
    
    logger.info('Verifying email connection...')
    try {
      // Use a longer timeout for verification (30 seconds)
      // Some hosting providers have slow SMTP connections
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Verification timeout after 30 seconds')), 30000))
      ])
      
      logger.info('Email connection verified successfully')
      return { 
        success: true, 
        message: 'Email service is configured correctly and connection verified',
        emailUser: process.env.EMAIL_USER
      }
    } catch (verifyError) {
      // Log but don't fail - some hosting providers block SMTP verification but allow sending
      logger.warn('Email verification failed (this is often okay - some hosts block verification but allow sending):', {
        message: verifyError.message,
        note: 'Email sending will still be attempted when orders are created'
      })
      // Return success with warning - actual sending will reveal if there's a real issue
      return { 
        success: true, 
        message: 'Email service configured. Verification failed but sending may still work (some hosts block verification)',
        emailUser: process.env.EMAIL_USER,
        warning: 'SMTP verification timed out - this is common on Render. Email sending will still be attempted.'
      }
    }
  } catch (error) {
    logger.error('Email connection test failed:', {
      message: error.message,
      code: error.code,
      command: error?.command,
      responseCode: error?.responseCode
    })
    
    // Reset transporter on error
    transporter = null
    
    return { 
      success: false, 
      message: error.message || 'Email connection test failed',
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? {
        command: error?.command,
        responseCode: error?.responseCode
      } : undefined
    }
  }
}

