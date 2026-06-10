import mongoose from 'mongoose'
import { randomUUID } from 'crypto'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { logger } from '../utils/logger.js'
import { APP_CONFIG } from '../config/app.js'

// In-memory mock product store fallback
const mockProducts = new Map([
  ['mundu-001', { productId: 'mundu-001', name: 'Mundu', priceValue: 280, stock: 15 }],
  ['saree-001', { productId: 'saree-001', name: 'Kerala Saree', priceValue: 350, stock: 12 }],
  ['sadya-001', { productId: 'sadya-001', name: 'Sadya', priceValue: 250, stock: 30 }]
])

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
 * Generate a mock order number
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
   * Fetch all products (database or mock)
   */
  getProducts: async () => {
    if (isDbConnected()) {
      return await Product.find().lean()
    }
    return Array.from(mockProducts.values())
  },

  /**
   * Fetch single product by its ID
   */
  getProductById: async (productId) => {
    if (isDbConnected()) {
      return await Product.findOne({ productId }).lean()
    }
    return mockProducts.get(productId) || null
  },

  /**
   * Create a new order with atomic transactions/locks
   */
  createOrder: async (orderData) => {
    if (isDbConnected()) {
      const session = await mongoose.startSession()
      let useTransaction = true
      
      try {
        session.startTransaction()
      } catch (err) {
        useTransaction = false
        session.endSession()
      }

      if (useTransaction) {
        try {
          // 1. Verify and deduct stock atomically inside transaction
          for (const item of orderData.orderItems) {
            const product = await Product.findOne({ productId: item.id }).session(session)
            if (!product) {
              throw new Error(`Product not found: ${item.name}`)
            }
            if (product.stock < item.quantity) {
              throw new Error(`Insufficient stock for ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}`)
            }
            product.stock -= item.quantity
            await product.save({ session })
          }

          // 2. Create the order
          const order = new Order(orderData)
          const savedOrder = await order.save({ session })

          await session.commitTransaction()
          session.endSession()
          return savedOrder
        } catch (error) {
          await session.abortTransaction()
          session.endSession()
          throw error
        }
      } else {
        // Fallback for standalone MongoDB: Atomic updates + compensation writes
        const deductedItems = []
        try {
          for (const item of orderData.orderItems) {
            const updatedProduct = await Product.findOneAndUpdate(
              { productId: item.id, stock: { $gte: item.quantity } },
              { $inc: { stock: -item.quantity } },
              { new: true }
            )

            if (!updatedProduct) {
              throw new Error(`Insufficient stock for ${item.name}`)
            }

            deductedItems.push({ id: item.id, quantity: item.quantity })
          }

          // Save the order
          const order = new Order(orderData)
          return await order.save()
        } catch (error) {
          // Rollback stock deductions
          for (const item of deductedItems) {
            await Product.updateOne(
              { productId: item.id },
              { $inc: { stock: item.quantity } }
            )
          }
          throw error
        }
      }
    }

    // Fallback: In-memory store
    // 1. Validate stock first
    for (const item of orderData.orderItems) {
      const product = mockProducts.get(item.id)
      if (!product) {
        throw new Error(`Product not found: ${item.name}`)
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}`)
      }
    }

    // 2. Deduct stock in-memory
    for (const item of orderData.orderItems) {
      const product = mockProducts.get(item.id)
      product.stock -= item.quantity
    }

    const id = randomUUID()
    const orderNumber = generateMockOrderNumber()
    const now = new Date()

    const mockOrder = {
      _id: id,
      orderNumber,
      idempotencyKey: orderData.idempotencyKey || null,
      studentInfo: orderData.studentInfo,
      orderItems: orderData.orderItems.map(item => ({
        ...item,
        total: Number(item.total) || (Number(item.price) * Number(item.quantity))
      })),
      payment: {
        method: orderData.payment.method,
        upiId: orderData.payment.upiId || null,
        transactionId: orderData.payment.transactionId || null,
        gatewayPaymentId: orderData.payment.gatewayPaymentId || null,
        verificationStatus: orderData.payment.verificationStatus || 'unverified'
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
    if (queryObj.idempotencyKey) {
      ordersList = ordersList.filter(o => o.idempotencyKey === queryObj.idempotencyKey)
    }

    ordersList.sort((a, b) => {
      const timeA = new Date(a.orderDate).getTime()
      const timeB = new Date(b.orderDate).getTime()
      return sort.orderDate === 1 ? timeA - timeB : timeB - timeA
    })

    return ordersList.slice(skip, skip + limit)
  },

  /**
   * Count documents matching query filters
   */
  countOrders: async (queryObj) => {
    if (isDbConnected()) {
      return await Order.countDocuments(queryObj)
    }

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
   * Update order status and payment verification status
   */
  updateOrderStatus: async (orderId, status, paymentVerificationStatus) => {
    const updateObj = {}
    if (status) updateObj.status = status.trim()
    if (paymentVerificationStatus) updateObj['payment.verificationStatus'] = paymentVerificationStatus

    if (isDbConnected()) {
      return await Order.findByIdAndUpdate(
        orderId,
        { $set: updateObj },
        { new: true, runValidators: true }
      )
    }

    const order = mockOrders.get(orderId)
    if (!order) return null

    const updatedOrder = {
      ...order,
      ...updateObj,
      payment: {
        ...order.payment,
        ...(paymentVerificationStatus && { verificationStatus: paymentVerificationStatus })
      },
      updatedAt: new Date()
    }

    mockOrders.set(orderId, updatedOrder)
    logger.info(`[MockDB] Updated mock order ${order.orderNumber} status -> ${status || order.status}, payment -> ${paymentVerificationStatus || order.payment.verificationStatus}`)
    return updatedOrder
  }
}
