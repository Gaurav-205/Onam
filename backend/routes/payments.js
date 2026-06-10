import express from 'express'
import { body } from 'express-validator'
import { OrderService } from '../services/OrderService.js'
import { logger } from '../utils/logger.js'
import { sendOrderConfirmationEmail } from '../utils/emailService.js'
import { APP_CONFIG } from '../config/app.js'
import { orderLimiter } from '../utils/rateLimiter.js'
import { checkDatabaseConnection } from '../middleware/database.js'
import { handleValidationErrors, validateObjectId } from '../middleware/validation.js'
import { getRequestId } from '../middleware/requestId.js'

const router = express.Router()

// Route: POST /api/payments/process
// Simulates processing a credit/debit card or UPI payment via a gateway API call
router.post(
  '/process',
  orderLimiter,
  [
    body('orderId').trim().notEmpty().withMessage('Order ID is required'),
    body('paymentMethod').isIn(['upi', 'card']).withMessage('Payment method must be upi or card'),
    body('cardDetails').optional().isObject().withMessage('Card details must be an object'),
    body('upiId').optional().trim().isLength({ max: 50 }).withMessage('UPI ID must be less than 50 characters')
  ],
  handleValidationErrors,
  checkDatabaseConnection,
  async (req, res) => {
    const requestId = getRequestId(req)
    const { orderId, paymentMethod, upiId } = req.body

    try {
      // Find the order
      const order = await OrderService.getOrderById(orderId)
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
          requestId
        })
      }

      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Order cannot be paid. Current status: ${order.status}`,
          requestId
        })
      }

      logger.info(`[${requestId}] Initiating payment processing for order ${order.orderNumber} via ${paymentMethod}`)

      // Simulate payment gateway delay (e.g. Stripe or Razorpay api request)
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Generate a simulated transaction reference
      const gatewayPaymentId = `pay_${Math.random().toString(36).substring(2, 15).toUpperCase()}`
      
      // Update order and payment verification
      const updatedOrder = await OrderService.updateOrderStatus(
        orderId, 
        'confirmed', // Update status to confirmed on successful payment
        'verified'   // Set verificationStatus to verified
      )

      // Set the gateway payment ID on the order
      if (updatedOrder.payment) {
        updatedOrder.payment.gatewayPaymentId = gatewayPaymentId
        if (paymentMethod === 'upi' && upiId) {
          updatedOrder.payment.upiId = upiId
          updatedOrder.payment.transactionId = `tx_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        }
        await updatedOrder.save?.().catch(err => logger.error(`Failed to save payment id:`, err))
      }

      logger.info(`[${requestId}] Payment successful for order ${updatedOrder.orderNumber}. Gateway Ref: ${gatewayPaymentId}`)

      // Send confirmation email (non-blocking)
      const whatsappLink = APP_CONFIG.COMMUNICATION.WHATSAPP_GROUP_LINK || null
      try {
        const orderPlainObject = updatedOrder.toObject ? updatedOrder.toObject() : JSON.parse(JSON.stringify(updatedOrder))
        sendOrderConfirmationEmail(orderPlainObject, whatsappLink)
          .then(result => {
            if (result.success) {
              logger.info(`[${requestId}] Confirmation email sent for order ${updatedOrder.orderNumber}`)
            }
          })
          .catch(err => {
            logger.error(`Error sending email for order ${updatedOrder.orderNumber}:`, err)
          })
      } catch (emailError) {
        logger.error(`Email initiation error:`, emailError)
      }

      res.json({
        success: true,
        message: 'Payment processed and verified successfully',
        transaction: {
          gatewayPaymentId,
          orderNumber: updatedOrder.orderNumber,
          status: updatedOrder.status,
          verificationStatus: updatedOrder.payment?.verificationStatus || 'verified'
        },
        requestId
      })

    } catch (error) {
      logger.error(`[${requestId}] Payment processing error:`, error)
      res.status(500).json({
        success: false,
        message: 'Payment processing failed',
        requestId,
        error: error.message
      })
    }
  }
)

// Route: POST /api/payments/webhook
// Simulates PSP webhook callback notifying backend of transaction completions asynchronously
router.post(
  '/webhook',
  checkDatabaseConnection,
  async (req, res) => {
    const requestId = getRequestId(req)
    const { event, data } = req.body

    logger.info(`[${requestId}] Received simulated payment gateway webhook event: ${event}`)

    if (!event || !data || !data.orderId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook payload structure',
        requestId
      })
    }

    try {
      const { orderId } = data
      const order = await OrderService.getOrderById(orderId)
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
          requestId
        })
      }

      if (event === 'payment.captured') {
        logger.info(`[${requestId}] Webhook: Confirming order ${order.orderNumber} on payment capture`)
        
        const updatedOrder = await OrderService.updateOrderStatus(orderId, 'confirmed', 'verified')
        if (updatedOrder.payment) {
          updatedOrder.payment.gatewayPaymentId = data.gatewayPaymentId || `pay_wh_${Math.random().toString(36).substring(2, 10)}`
          await updatedOrder.save?.()
        }

        // Send confirmation email
        const whatsappLink = APP_CONFIG.COMMUNICATION.WHATSAPP_GROUP_LINK || null
        const orderPlainObject = updatedOrder.toObject ? updatedOrder.toObject() : JSON.parse(JSON.stringify(updatedOrder))
        sendOrderConfirmationEmail(orderPlainObject, whatsappLink).catch(err => {
          logger.error('Webhook confirmation email fail:', err)
        })

        return res.json({ success: true, message: 'Webhook processed. Order confirmed.', requestId })
      } else if (event === 'payment.failed') {
        logger.warn(`[${requestId}] Webhook: Cancelling order ${order.orderNumber} on payment failure`)
        
        // Restore stock since order failed! (Idempotency and transactional safety)
        if (order.status !== 'cancelled') {
          for (const item of order.orderItems) {
            const Product = (await import('../models/Product.js')).default
            await Product.updateOne({ productId: item.id }, { $inc: { stock: item.quantity } })
          }
        }

        await OrderService.updateOrderStatus(orderId, 'cancelled', 'failed')
        return res.json({ success: true, message: 'Webhook processed. Order cancelled due to payment failure.', requestId })
      }

      res.status(400).json({
        success: false,
        message: `Unhandled event type: ${event}`,
        requestId
      })

    } catch (error) {
      logger.error(`[${requestId}] Webhook handler error:`, error)
      res.status(500).json({
        success: false,
        message: 'Internal server error handling webhook',
        requestId
      })
    }
  }
)

export default router
