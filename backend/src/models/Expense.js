import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [200, 'Expense title cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be at least 1'],
    },
    category: {
      type: String,
      enum: {
        values: [
          'RENT',
          'ELECTRICITY',
          'WATER',
          'SALARY',
          'TRANSPORT',
          'MAINTENANCE',
          'SUPPLIES',
          'OTHER',
        ],
        message: 'Invalid expense category',
      },
      default: 'OTHER',
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
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

expenseSchema.index({ category: 1, createdAt: -1 })
expenseSchema.index({ amount: 1 })
expenseSchema.index({ date: -1 })

expenseSchema.set('toJSON', { virtuals: true })
expenseSchema.set('toObject', { virtuals: true })

export const Expense = mongoose.model('Expense', expenseSchema)
