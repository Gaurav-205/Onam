import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  priceValue: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  version: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Index for query optimization
productSchema.index({ productId: 1 }, { unique: true })

const Product = mongoose.models.Product || mongoose.model('Product', productSchema)

export default Product
