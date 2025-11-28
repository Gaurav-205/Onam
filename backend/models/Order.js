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

// Counter schema for atomic order number generation
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence: { type: Number, default: 0 }
}, { _id: false })

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema)

// Generate unique order number before saving
// Uses atomic counter to prevent race conditions
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    try {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const datePrefix = `${year}${month}${day}`
      const counterId = `order_${datePrefix}`
      
      // Atomic increment using findOneAndUpdate
      const counter = await Counter.findByIdAndUpdate(
        counterId,
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
      )
      
      const sequenceNumber = counter.sequence
      const paddedSequence = String(sequenceNumber).padStart(APP_CONFIG.ORDER.NUMBER_PADDING, '0')
      this.orderNumber = `${APP_CONFIG.ORDER.PREFIX}-${datePrefix}-${paddedSequence}`
    } catch (error) {
      // Fallback: use timestamp-based unique number if counter fails
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const datePrefix = `${year}${month}${day}`
      const timestamp = Date.now().toString().slice(-8)
      this.orderNumber = `${APP_CONFIG.ORDER.PREFIX}-${datePrefix}-${timestamp}`
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

