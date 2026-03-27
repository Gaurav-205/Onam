const sanitize = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export const buildOrderConfirmationMail = ({ order, whatsappLink, emailFromName, emailUser }) => {
  if (!order || typeof order !== 'object') {
    throw new Error('Invalid order object provided')
  }

  const studentInfo = order.studentInfo || {}
  const orderItems = order.orderItems || []
  const orderNumber = order.orderNumber || 'N/A'
  const totalAmount = Number(order.totalAmount || 0)
  const orderDate = order.orderDate || new Date()
  const payment = order.payment || {}

  if (!studentInfo || typeof studentInfo !== 'object') {
    throw new Error('Order missing required field: studentInfo')
  }
  if (!studentInfo.email || typeof studentInfo.email !== 'string') {
    throw new Error('Order missing required field: studentInfo.email')
  }
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    throw new Error('Order missing required field: orderItems (must be a non-empty array)')
  }
  if (!orderNumber || typeof orderNumber !== 'string') {
    throw new Error('Order missing required field: orderNumber')
  }

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

  const itemsList = orderItems.map(item => `  • ${sanitize(item.name)} × ${item.quantity} = ₹${Number(item.total || 0).toFixed(2)}`).join('\n')

  const formattedDate = new Date(orderDate).toLocaleString('en-IN', {
    dateStyle: 'long',
    timeStyle: 'short'
  })

  const paymentMethodDisplay = payment?.method === 'upi' ? 'UPI Payment' : 'Cash Payment (Pay at Venue)'
  const paymentDetails = payment?.method === 'upi'
    ? `UPI ID: ${sanitize(payment.upiId || 'N/A')}<br>Transaction ID: ${sanitize(payment.transactionId || 'N/A')}`
    : 'Payment will be collected at the event venue on the day of celebration.'

  const paymentText = payment?.method === 'upi'
    ? `UPI ID: ${sanitize(payment.upiId || 'N/A')}\nTransaction ID: ${sanitize(payment.transactionId || 'N/A')}`
    : 'Payment will be collected at the event venue on the day of celebration.'

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Onam Festival Registration Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f3f4f6; padding: 20px;">
  <div style="max-width: 650px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #D97706 100%); color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0 0 8px 0;">Onam Festival Registration Confirmed!</h1>
      <p style="margin: 0;">Thank you for registering for Onam celebrations at MIT ADT University</p>
    </div>
    <div style="padding: 24px;">
      <p><strong>Order Number:</strong> ${sanitize(orderNumber)}</p>
      <p><strong>Registration Date:</strong> ${formattedDate}</p>
      <h3>Student Information</h3>
      <p>
        <strong>Name:</strong> ${sanitize(studentInfo.name)}<br>
        <strong>Student ID:</strong> ${sanitize(studentInfo.studentId)}<br>
        <strong>Email:</strong> ${sanitize(studentInfo.email)}<br>
        <strong>Phone:</strong> ${sanitize(studentInfo.phone)}<br>
        <strong>Course:</strong> ${sanitize(studentInfo.course)}<br>
        <strong>Department:</strong> ${sanitize(studentInfo.department)}<br>
        <strong>Year:</strong> ${sanitize(studentInfo.year)}
      </p>
      <h3>Order Details</h3>
      <table style="width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e5e7eb;">
        <thead style="background: #059669; color: #fff;">
          <tr>
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
            <th style="padding: 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsTableRows}
          <tr>
            <td colspan="3" style="padding: 12px; text-align: right;"><strong>Total Amount:</strong></td>
            <td style="padding: 12px; text-align: right;"><strong>₹${totalAmount.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
      <h3>Payment Information</h3>
      <p><strong>Payment Method:</strong> ${paymentMethodDisplay}</p>
      <p>${paymentDetails}</p>
      ${whatsappLink ? `<p><a href="${whatsappLink}" target="_blank" rel="noopener noreferrer">Join WhatsApp Group</a></p>` : ''}
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p>We look forward to celebrating Onam with you!</p>
      <p style="color: #6b7280; font-size: 13px;">This is an automated confirmation email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `

  const text = `
═══════════════════════════════════════════════════════════
    ONAM FESTIVAL REGISTRATION CONFIRMED
═══════════════════════════════════════════════════════════

Thank you for registering for Onam celebrations at MIT ADT University!

ORDER NUMBER: ${sanitize(orderNumber)}
Registration Date: ${formattedDate}

STUDENT INFORMATION
───────────────────────────────────────────────────────────
Full Name:        ${sanitize(studentInfo.name)}
Student ID:       ${sanitize(studentInfo.studentId)}
Email Address:    ${sanitize(studentInfo.email)}
Phone Number:     ${sanitize(studentInfo.phone)}
Course/Program:   ${sanitize(studentInfo.course)}
Department:       ${sanitize(studentInfo.department)}
Year:             ${sanitize(studentInfo.year)}

ORDER DETAILS
───────────────────────────────────────────────────────────
${itemsList}

TOTAL AMOUNT: ₹${totalAmount.toFixed(2)}

PAYMENT INFORMATION
───────────────────────────────────────────────────────────
Payment Method: ${paymentMethodDisplay}
${paymentText}
${whatsappLink ? `\nWhatsApp Group: ${whatsappLink}\n` : ''}
`

  return {
    to: studentInfo.email,
    subject: `Onam Festival Registration Confirmed - Order ${sanitize(orderNumber)}`,
    text,
    html,
    from: `\"${emailFromName}\" <${emailUser}>`
  }
}

export const buildTestEmailMail = ({ testEmail, emailFromName, emailUser }) => {
  if (!testEmail || typeof testEmail !== 'string' || !testEmail.includes('@')) {
    throw new Error('Valid email address is required')
  }

  const sentAt = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'medium' })

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Test Email</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f3f4f6; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px;">
    <h1 style="color: #059669;">✓ Test Email Successful!</h1>
    <p>This is a test email from the Onam Festival email service.</p>
    <ul>
      <li>From: ${emailFromName} &lt;${emailUser}&gt;</li>
      <li>To: ${sanitize(testEmail)}</li>
      <li>Service: ${process.env.EMAIL_SERVICE || 'gmail'}</li>
      <li>Status: Connected and sending emails successfully</li>
    </ul>
    <p>Sent at ${sentAt}</p>
  </div>
</body>
</html>
  `

  const text = `
ONAM FESTIVAL - TEST EMAIL
From: ${emailFromName} <${emailUser}>
To: ${testEmail}
Service: ${process.env.EMAIL_SERVICE || 'gmail'}
Status: Connected and sending emails successfully
Sent at: ${sentAt}
  `

  return {
    from: `\"${emailFromName}\" <${emailUser}>`,
    to: testEmail.trim(),
    subject: 'Onam Festival - Test Email',
    text,
    html
  }
}
