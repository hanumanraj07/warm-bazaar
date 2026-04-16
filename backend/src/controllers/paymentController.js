import mongoose from 'mongoose'
import { Customer, Supplier, Payment } from '../models/index.js'
import { asyncHandler, AppError } from '../middleware/index.js'

export const recordCustomerPayment = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { customerId, amount, paymentMode = 'CASH', reference, notes } = req.body

    if (!customerId) {
      throw new AppError('Customer ID is required', 400)
    }

    const customer = await Customer.findById(customerId).session(session)

    if (!customer) {
      throw new AppError('Customer not found', 404)
    }

    const paymentAmount = Math.min(amount, customer.totalUdhar)

    customer.totalUdhar = Math.max(0, customer.totalUdhar - paymentAmount)
    await customer.save({ session })

    const payment = await Payment.create(
      [
        {
          type: 'CUSTOMER',
          customerId,
          customerName: customer.name,
          amount: paymentAmount,
          paymentMode,
          reference,
          notes,
          createdBy: req.user.userId,
        },
      ],
      { session }
    )

    await session.commitTransaction()

    const populatedPayment = await Payment.findById(payment[0]._id)
      .populate('customerId', 'name phone totalUdhar')
      .lean()

    res.status(201).json({
      success: true,
      message: `Payment of ₹${paymentAmount.toLocaleString('en-IN')} recorded successfully`,
      data: {
        payment: populatedPayment,
        customer: {
          id: customer._id,
          name: customer.name,
          remainingUdhar: customer.totalUdhar,
        },
      },
    })
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
})

export const recordSupplierPayment = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { supplierId, amount, paymentMode = 'CASH', reference, notes } = req.body

    if (!supplierId) {
      throw new AppError('Supplier ID is required', 400)
    }

    const supplier = await Supplier.findById(supplierId).session(session)

    if (!supplier) {
      throw new AppError('Supplier not found', 404)
    }

    const paymentAmount = Math.min(amount, supplier.totalPayable)

    supplier.totalPayable = Math.max(0, supplier.totalPayable - paymentAmount)
    await supplier.save({ session })

    const payment = await Payment.create(
      [
        {
          type: 'SUPPLIER',
          supplierId,
          supplierName: supplier.name,
          amount: paymentAmount,
          paymentMode,
          reference,
          notes,
          createdBy: req.user.userId,
        },
      ],
      { session }
    )

    await session.commitTransaction()

    const populatedPayment = await Payment.findById(payment[0]._id)
      .populate('supplierId', 'name phone totalPayable')
      .lean()

    res.status(201).json({
      success: true,
      message: `Payment of ₹${paymentAmount.toLocaleString('en-IN')} recorded successfully`,
      data: {
        payment: populatedPayment,
        supplier: {
          id: supplier._id,
          name: supplier.name,
          remainingPayable: supplier.totalPayable,
        },
      },
    })
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
})

export const getPayments = asyncHandler(async (req, res) => {
  const { type, customerId, supplierId, startDate, endDate, page = 1, limit = 50 } = req.query

  const query = {}

  if (type) {
    query.type = type
  }

  if (customerId) {
    query.customerId = customerId
  }

  if (supplierId) {
    query.supplierId = supplierId
  }

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) query.createdAt.$gte = new Date(startDate)
    if (endDate) query.createdAt.$lte = new Date(endDate)
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)

  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate('customerId', 'name phone')
      .populate('supplierId', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Payment.countDocuments(query),
  ])

  res.status(200).json({
    success: true,
    data: {
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  })
})
