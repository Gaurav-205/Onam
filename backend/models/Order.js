import mongoose from 'mongoose'
import { APP_CONFIG } from '../config/app.js'

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
    required: true,
    index: true
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

// Generate unique order number before saving
// Uses atomic operation to prevent race conditions
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const datePrefix = `${year}${month}${day}`
    const orderPrefix = `${APP_CONFIG.ORDER.PREFIX}-${datePrefix}-`
    
    // Use findOneAndUpdate with upsert for atomic counter
    // This prevents race conditions in concurrent order creation
    let attempts = 0
    const maxAttempts = 10
    
    while (attempts < maxAttempts) {
      try {
        // Find the highest order number for today
        const todayOrders = await mongoose.model('Order')
          .find({ orderNumber: { $regex: `^${orderPrefix}` } })
          .sort({ orderNumber: -1 })
          .limit(1)
          .select('orderNumber')
          .lean()
        
        let nextNumber = 1
        if (todayOrders.length > 0 && todayOrders[0].orderNumber) {
          const lastNumber = parseInt(todayOrders[0].orderNumber.split('-').pop(), 10)
          nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1
        }
        
        // Generate candidate order number
        const candidateOrderNumber = `${orderPrefix}${String(nextNumber).padStart(APP_CONFIG.ORDER.NUMBER_PADDING, '0')}`
        
        // Try to set it atomically (will fail if duplicate exists)
        this.orderNumber = candidateOrderNumber
        
        // Check if this order number already exists
        const exists = await mongoose.model('Order').findOne({ orderNumber: candidateOrderNumber })
        if (!exists) {
          // Order number is unique, proceed
          break
        }
        
        // If exists, increment and try again
        attempts++
        if (attempts >= maxAttempts) {
          // Fallback: use timestamp-based unique number
          const timestamp = Date.now().toString().slice(-6)
          this.orderNumber = `${orderPrefix}${timestamp}`
        }
      } catch (error) {
        // On error, use timestamp fallback
        const timestamp = Date.now().toString().slice(-6)
        this.orderNumber = `${orderPrefix}${timestamp}`
        break
      }
    }
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

