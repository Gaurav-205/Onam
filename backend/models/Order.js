import mongoose from 'mongoose'
import { APP_CONFIG } from '../config/app.js'
import { logger } from '../utils/logger.js'

const orderItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false })

const studentInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    required: true,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post Graduate']
  },
  hostel: {
    type: String,
    trim: true,
    default: null
  }
}, { _id: false })

const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: ['cash', 'upi']
  },
  upiId: {
    type: String,
    trim: true,
    default: null
  },
  transactionId: {
    type: String,
    trim: true,
    default: null
  }
}, { _id: false })

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: false, // Generated in pre-save hook
    index: true,
    validate: {
      validator: function(v) {
        // This validator will run after pre-save hook
        return v != null && v.trim() !== ''
      },
      message: 'Order number must be generated'
    }
  },
  studentInfo: {
    type: studentInfoSchema,
    required: true
  },
  orderItems: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: (items) => items.length > 0,
      message: 'Order must have at least one item'
    }
  },
  payment: {
    type: paymentSchema,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  orderDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  notes: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: true
})

// Counter schema for atomic order number generation
// Uses counterId field to identify counters (e.g., "order_20241128")
const counterSchema = new mongoose.Schema({
  counterId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  sequence: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: false,
  versionKey: false
})

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema)

// Generate unique order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const datePrefix = `${year}${month}${day}`
    const prefix = APP_CONFIG?.ORDER?.PREFIX || 'ONAM'
    
    // Set fallback orderNumber immediately
    const timestamp = Date.now().toString().slice(-8)
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    this.orderNumber = `${prefix}-${datePrefix}-${timestamp}${randomSuffix}`
    
    // Try to use atomic counter if database is connected
    try {
      if (mongoose.connection?.readyState === 1) {
        const counterId = `order_${datePrefix}`
        
        // Use findOneAndUpdate with upsert to atomically increment or create
        // First try to increment existing counter
        let counter = await Counter.findOneAndUpdate(
          { counterId },
          { $inc: { sequence: 1 } },
          { new: true }
        )
        
        // If counter doesn't exist, create it with sequence 1
        if (!counter) {
          try {
            counter = await Counter.create({ counterId, sequence: 1 })
          } catch (createError) {
            // If creation fails (race condition), try to increment again
            if (createError.code === 11000) {
              counter = await Counter.findOneAndUpdate(
                { counterId },
                { $inc: { sequence: 1 } },
                { new: true, upsert: false }
              )
              // If still null after retry, use fallback
              if (!counter) {
                throw new Error('Counter creation and retry both failed')
              }
            } else {
              throw createError
            }
          }
        }
        
        // Validate counter exists and has valid sequence
        if (counter && counter.sequence > 0) {
          const padding = APP_CONFIG?.ORDER?.NUMBER_PADDING || 4
          const paddedSequence = String(counter.sequence).padStart(padding, '0')
          this.orderNumber = `${prefix}-${datePrefix}-${paddedSequence}`
        }
      }
    } catch (error) {
      // Counter failed - fallback already set, continue silently
      // Log only in development to avoid production noise
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Counter lookup failed, using fallback order number:', error.message)
      }
    }
  }
  
  // Final safety check
  if (!this.orderNumber?.trim()) {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const datePrefix = `${year}${month}${day}`
    const timestamp = Date.now().toString()
    const randomSuffix = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
    this.orderNumber = `ONAM-${datePrefix}-${timestamp}${randomSuffix}`
  }
  
  next()
})

// Index for faster queries
orderSchema.index({ 'studentInfo.email': 1 })
orderSchema.index({ 'studentInfo.studentId': 1 })
orderSchema.index({ orderDate: -1 })
orderSchema.index({ status: 1 })

const Order = mongoose.model('Order', orderSchema)

export default Order
