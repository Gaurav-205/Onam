import mongoose from 'mongoose'
import { randomUUID } from 'crypto'
import Order from '../models/Order.js'
import { logger } from '../utils/logger.js'
import { APP_CONFIG } from '../config/app.js'

// In-memory store fallback when MongoDB is disconnected
const mockOrders = new Map()
let mockSequence = 0

/**
 * Check if the database connection is fully active
 */
const isDbConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1
}

/**
 * Generate a mock order number (matches mongoose pre-save structure)
 */
const generateMockOrderNumber = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const datePrefix = `${year}${month}${day}`
  const prefix = APP_CONFIG?.ORDER?.PREFIX || 'ONAM'
  
  mockSequence += 1
  const padding = APP_CONFIG?.ORDER?.NUMBER_PADDING || 4
  const paddedSequence = String(mockSequence).padStart(padding, '0')
  return `${prefix}-${datePrefix}-${paddedSequence}`
}

export const OrderService = {
  /**
   * Create a new order
   */
  createOrder: async (orderData) => {
    if (isDbConnected()) {
      const order = new Order(orderData)
      return await order.save()
    }

    // Fallback: In-memory store
    const id = randomUUID()
    const orderNumber = generateMockOrderNumber()
    const now = new Date()

    const mockOrder = {
      _id: id,
      orderNumber,
      studentInfo: orderData.studentInfo,
      orderItems: orderData.orderItems.map(item => ({
        ...item,
        total: Number(item.total) || (Number(item.price) * Number(item.quantity))
      })),
      payment: {
        method: orderData.payment.method,
        upiId: orderData.payment.upiId || null,
        transactionId: orderData.payment.transactionId || null,
        verificationStatus: 'unverified'
      },
      totalAmount: orderData.totalAmount,
      status: 'pending',
      orderDate: orderData.orderDate ? new Date(orderData.orderDate) : now,
      notes: orderData.notes || null,
      createdAt: now,
      updatedAt: now
    }

    mockOrders.set(id, mockOrder)
    logger.info(`[MockDB] Saved mock order: ${orderNumber}`)
    return mockOrder
  },

  /**
   * Find order by ID
   */
  getOrderById: async (orderId) => {
    if (isDbConnected()) {
      return await Order.findById(orderId)
    }

    // Fallback: In-memory store
    return mockOrders.get(orderId) || null
  },

  /**
   * Find orders matching query filters
   */
  getOrders: async (queryObj, options = {}) => {
    const { sort = { orderDate: -1 }, skip = 0, limit = 50 } = options

    if (isDbConnected()) {
      return await Order.find(queryObj)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
    }

    // Fallback: In-memory store
    let ordersList = Array.from(mockOrders.values())

    // Apply filters
    if (queryObj['studentInfo.studentId']) {
      const studentId = queryObj['studentInfo.studentId'].toLowerCase()
      ordersList = ordersList.filter(o => o.studentInfo?.studentId?.toLowerCase() === studentId)
    }
    if (queryObj['studentInfo.email']) {
      const email = queryObj['studentInfo.email'].toLowerCase()
      ordersList = ordersList.filter(o => o.studentInfo?.email?.toLowerCase() === email)
    }
    if (queryObj.status) {
      const status = queryObj.status
      ordersList = ordersList.filter(o => o.status === status)
    }

    // Apply sort (only support orderDate sorting for mock)
    ordersList.sort((a, b) => {
      const timeA = new Date(a.orderDate).getTime()
      const timeB = new Date(b.orderDate).getTime()
      return sort.orderDate === 1 ? timeA - timeB : timeB - timeA
    })

    // Apply pagination
    return ordersList.slice(skip, skip + limit)
  },

  /**
   * Count documents matching query filters
   */
  countOrders: async (queryObj) => {
    if (isDbConnected()) {
      return await Order.countDocuments(queryObj)
    }

    // Fallback: In-memory store
    let ordersList = Array.from(mockOrders.values())

    if (queryObj['studentInfo.studentId']) {
      const studentId = queryObj['studentInfo.studentId'].toLowerCase()
      ordersList = ordersList.filter(o => o.studentInfo?.studentId?.toLowerCase() === studentId)
    }
    if (queryObj['studentInfo.email']) {
      const email = queryObj['studentInfo.email'].toLowerCase()
      ordersList = ordersList.filter(o => o.studentInfo?.email?.toLowerCase() === email)
    }
    if (queryObj.status) {
      const status = queryObj.status
      ordersList = ordersList.filter(o => o.status === status)
    }

    return ordersList.length
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId, status) => {
    if (isDbConnected()) {
      return await Order.findByIdAndUpdate(
        orderId,
        { status: status.trim() },
        { new: true, runValidators: true }
      )
    }

    // Fallback: In-memory store
    const order = mockOrders.get(orderId)
    if (!order) return null

    const updatedOrder = {
      ...order,
      status: status.trim(),
      updatedAt: new Date()
    }

    mockOrders.set(orderId, updatedOrder)
    logger.info(`[MockDB] Updated mock order ${order.orderNumber} status -> ${status}`)
    return updatedOrder
  }
}
