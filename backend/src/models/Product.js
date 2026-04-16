import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    costPrice: {
      type: Number,
      default: 0,
      min: [0, 'Cost price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      enum: {
        values: ['kg', 'ltr', 'pcs', 'g', 'ml', 'dozen', 'pack'],
        message: 'Unit must be one of: kg, ltr, pcs, g, ml, dozen, pack',
      },
      default: 'pcs',
    },
    lowStockThreshold: {
      type: Number,
      min: 0,
      default: 10,
    },
    barcode: {
      type: String,
      sparse: true,
      index: true,
    },
    hsnCode: {
      type: String,
      sparse: true,
    },
    gstRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    mrp: {
      type: Number,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    salesHistory: [
      {
        date: { type: Date },
        quantity: { type: Number },
        billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' },
      },
    ],
    totalSold: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

productSchema.index({ name: 'text', category: 1 })
productSchema.index({ stock: 1 })
productSchema.index({ lowStockThreshold: 1 })
productSchema.index({ isActive: 1 })
productSchema.index({ category: 1 })

productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.lowStockThreshold
})

productSchema.virtual('isOutOfStock').get(function () {
  return this.stock === 0
})

productSchema.virtual('profit').get(function () {
  return this.price - this.costPrice
})

productSchema.virtual('profitMargin').get(function () {
  if (this.price === 0) return 0
  return ((this.price - this.costPrice) / this.price) * 100
})

productSchema.set('toJSON', { virtuals: true })
productSchema.set('toObject', { virtuals: true })

export const Product = mongoose.model('Product', productSchema)
