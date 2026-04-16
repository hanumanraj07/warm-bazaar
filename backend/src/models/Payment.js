import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ['CUSTOMER', 'SUPPLIER'],
        message: 'Payment type must be CUSTOMER or SUPPLIER',
      },
      required: [true, 'Payment type is required'],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    customerName: {
      type: String,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    supplierName: {
      type: String,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be at least 1'],
    },
    paymentMode: {
      type: String,
      enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'OTHER'],
      default: 'CASH',
    },
    reference: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

paymentSchema.index({ type: 1, createdAt: -1 })
paymentSchema.index({ customerId: 1 })
paymentSchema.index({ supplierId: 1 })

paymentSchema.set('toJSON', { virtuals: true })
paymentSchema.set('toObject', { virtuals: true })

export const Payment = mongoose.model('Payment', paymentSchema)
