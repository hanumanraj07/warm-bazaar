import mongoose from 'mongoose'

const billItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    returnedQty: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    costTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true }
)

const returnItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      trim: true,
    },
    returnedAt: {
      type: Date,
      default: Date.now,
    },
    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: true }
)

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    items: {
      type: [billItemSchema],
      required: [true, 'Bill must have at least one item'],
      validate: {
        validator: (items) => items.length > 0,
        message: 'Bill must have at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    originalAmount: {
      type: Number,
      min: 0,
    },
    returnAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMode: {
      type: String,
      enum: {
        values: ['CASH', 'UPI', 'CARD', 'UDHAR'],
        message: 'Payment mode must be CASH, UPI, CARD, or UDHAR',
      },
      required: [true, 'Payment mode is required'],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    customerName: {
      type: String,
    },
    billStatus: {
      type: String,
      enum: ['COMPLETED', 'CANCELLED', 'REFUNDED', 'PARTIAL_RETURN'],
      default: 'COMPLETED',
    },
    returns: {
      type: [returnItemSchema],
      default: [],
    },
    profit: {
      type: Number,
      default: 0,
    },
    costAmount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    editedAt: {
      type: Date,
    },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

billSchema.index({ createdAt: -1 })
billSchema.index({ paymentMode: 1 })
billSchema.index({ customerId: 1 })
billSchema.index({ totalAmount: 1 })
billSchema.index({ billStatus: 1 })
billSchema.index({ 'items.productId': 1 })

billSchema.pre('save', async function (next) {
  if (!this.billNumber) {
    const date = new Date()
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
    const count = await mongoose.model('Bill').countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    })
    this.billNumber = `INV${dateStr}${(count + 1).toString().padStart(4, '0')}`
  }
  
  if (!this.originalAmount) {
    this.originalAmount = this.totalAmount
  }
  
  next()
})

billSchema.virtual('netAmount').get(function () {
  return this.totalAmount - this.returnAmount
})

billSchema.virtual('isFullyReturned').get(function () {
  return this.returnAmount >= this.totalAmount
})

billSchema.set('toJSON', { virtuals: true })
billSchema.set('toObject', { virtuals: true })

export const Bill = mongoose.model('Bill', billSchema)
