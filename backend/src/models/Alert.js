import mongoose from 'mongoose'

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'LOW_STOCK',
        'OUT_OF_STOCK',
        'EXPIRING_SOON',
        'EXPIRED',
        'HIGH_UDHAR',
        'PENDING_PAYMENT',
        'DEAD_STOCK',
        'CASH_VARIANCE',
        'DAILY_REMINDER',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    referenceType: {
      type: String,
      enum: ['PRODUCT', 'CUSTOMER', 'SUPPLIER', 'BILL', 'DAY_CLOSE'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDismissed: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
)

alertSchema.index({ type: 1, isRead: 1 })
alertSchema.index({ isDismissed: 1, createdAt: -1 })
alertSchema.index({ severity: 1 })

alertSchema.statics.createAlert = async function (data) {
  const existingAlert = await this.findOne({
    referenceId: data.referenceId,
    referenceType: data.referenceType,
    type: data.type,
    isDismissed: false,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  })

  if (existingAlert) {
    return existingAlert
  }

  return this.create(data)
}

export const Alert = mongoose.model('Alert', alertSchema)
