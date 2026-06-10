import express from 'express'
import { OrderService } from '../services/OrderService.js'
import { logger } from '../utils/logger.js'
import { getRequestId } from '../middleware/requestId.js'
import { checkDatabaseConnection } from '../middleware/database.js'
import { queryLimiter } from '../utils/rateLimiter.js'

const router = express.Router()

// Get all products
router.get('/', queryLimiter, checkDatabaseConnection, async (req, res) => {
  const requestId = getRequestId(req)
  try {
    const products = await OrderService.getProducts()
    res.json({
      success: true,
      products,
      requestId
    })
  } catch (error) {
    logger.error(`[${requestId}] Failed to fetch products:`, error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      requestId
    })
  }
})

export default router
