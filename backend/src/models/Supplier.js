import mongoose from 'mongoose'

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
      maxlength: [100, 'Supplier name cannot exceed 100 characters'],
    },
    businessName: {
      type: String,
      trim: true,
      maxlength: [200, 'Business name cannot exceed 200 characters'],
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
    totalPayable: {
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

supplierSchema.index({ name: 'text', phone: 1 })
supplierSchema.index({ totalPayable: 1 })

supplierSchema.virtual('hasPending').get(function () {
  return this.totalPayable > 0
})

supplierSchema.set('toJSON', { virtuals: true })
supplierSchema.set('toObject', { virtuals: true })

export const Supplier = mongoose.model('Supplier', supplierSchema)
