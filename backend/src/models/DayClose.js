import mongoose from 'mongoose'

const cashLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['OPEN', 'CLOSE', 'SALE', 'EXPENSE', 'PAYMENT_IN', 'PAYMENT_OUT', 'ADJUSTMENT'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMode: {
      type: String,
      enum: ['CASH', 'UPI', 'CARD'],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    referenceType: {
      type: String,
      enum: ['BILL', 'EXPENSE', 'PAYMENT', 'DAY_CLOSE', 'ADJUSTMENT'],
    },
    description: {
      type: String,
      trim: true,
    },
    expectedCash: {
      type: Number,
    },
    actualCash: {
      type: Number,
    },
    variance: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dayCloseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DayClose',
    },
  },
  {
    timestamps: true,
  }
)

cashLogSchema.index({ createdAt: -1 })
cashLogSchema.index({ type: 1, createdAt: -1 })

const dayCloseSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    openingCash: {
      type: Number,
      default: 0,
    },
    closingCash: {
      type: Number,
      default: 0,
    },
    expectedCash: {
      type: Number,
      default: 0,
    },
    actualCash: {
      type: Number,
    },
    variance: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalBills: {
      type: Number,
      default: 0,
    },
    cashSales: {
      type: Number,
      default: 0,
    },
    upiSales: {
      type: Number,
      default: 0,
    },
    cardSales: {
      type: Number,
      default: 0,
    },
    udharSales: {
      type: Number,
      default: 0,
    },
    totalProfit: {
      type: Number,
      default: 0,
    },
    totalExpenses: {
      type: Number,
      default: 0,
    },
    cashReceived: {
      type: Number,
      default: 0,
    },
    cashPaid: {
      type: Number,
      default: 0,
    },
    paymentsIn: {
      type: Number,
      default: 0,
    },
    paymentsOut: {
      type: Number,
      default: 0,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    closedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    cashLogs: [cashLogSchema],
  },
  {
    timestamps: true,
  }
)

dayCloseSchema.index({ date: -1 })
dayCloseSchema.index({ isClosed: 1 })

dayCloseSchema.pre('save', function (next) {
  if (this.isClosed && !this.closedAt) {
    this.closedAt = new Date()
  }
  next()
})

export const DayClose = mongoose.model('DayClose', dayCloseSchema)
export const CashLog = mongoose.model('CashLog', cashLogSchema)
