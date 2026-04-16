import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Customer name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [15, 'Phone number cannot exceed 15 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    totalUdhar: {
      type: Number,
      min: 0,
      default: 0,
    },
    photo: {
      type: String,
      default: null,
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

customerSchema.index({ name: 'text', phone: 1 })
customerSchema.index({ totalUdhar: 1 })

customerSchema.virtual('hasPending').get(function () {
  return this.totalUdhar > 0
})

customerSchema.set('toJSON', { virtuals: true })
customerSchema.set('toObject', { virtuals: true })

export const Customer = mongoose.model('Customer', customerSchema)
