import mongoose from 'mongoose'

const productBatchSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
    },
    initialQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiryDate: {
      type: Date,
      index: true,
    },
    manufacturingDate: {
      type: Date,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Purchase',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

productBatchSchema.index({ productId: 1, expiryDate: 1 })
productBatchSchema.index({ expiryDate: 1 })

productBatchSchema.virtual('isExpired').get(function () {
  if (!this.expiryDate) return false
  return new Date() > this.expiryDate
})

productBatchSchema.virtual('isExpiringSoon').get(function () {
  if (!this.expiryDate) return false
  const twoDaysFromNow = new Date()
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)
  return this.expiryDate <= twoDaysFromNow && this.expiryDate > new Date()
})

productBatchSchema.virtual('daysUntilExpiry').get(function () {
  if (!this.expiryDate) return null
  const diff = new Date(this.expiryDate) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

productBatchSchema.set('toJSON', { virtuals: true })
productBatchSchema.set('toObject', { virtuals: true })

export const ProductBatch = mongoose.model('ProductBatch', productBatchSchema)
