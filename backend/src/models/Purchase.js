import mongoose from 'mongoose'

const purchaseItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      enum: ['kg', 'ltr', 'pcs'],
      default: 'pcs',
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
)

const purchaseSchema = new mongoose.Schema(
  {
    purchaseNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
    },
    supplierName: {
      type: String,
    },
    items: {
      type: [purchaseItemSchema],
      required: [true, 'Purchase must have at least one item'],
      validate: {
        validator: (items) => items.length > 0,
        message: 'Purchase must have at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      min: 0,
      default: function () {
        return this.totalAmount - this.paidAmount
      },
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PARTIAL', 'PAID'],
      default: 'PENDING',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

purchaseSchema.index({ createdAt: -1 })
purchaseSchema.index({ supplierId: 1 })
purchaseSchema.index({ totalAmount: 1 })

purchaseSchema.pre('save', async function (next) {
  if (!this.purchaseNumber) {
    const count = await mongoose.model('Purchase').countDocuments()
    this.purchaseNumber = `PUR${Date.now().toString(36).toUpperCase()}${(count + 1).toString().padStart(4, '0')}`
  }

  if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'PAID'
    this.remainingAmount = 0
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'PARTIAL'
    this.remainingAmount = this.totalAmount - this.paidAmount
  }

  next()
})

purchaseSchema.set('toJSON', { virtuals: true })
purchaseSchema.set('toObject', { virtuals: true })

export const Purchase = mongoose.model('Purchase', purchaseSchema)
