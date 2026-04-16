import mongoose from 'mongoose'
import { Product, Supplier, Purchase } from '../models/index.js'
import { asyncHandler, AppError } from '../middleware/index.js'

export const createPurchase = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { supplierId, items, totalAmount, paidAmount = 0, notes } = req.body

    const supplier = await Supplier.findById(supplierId).session(session)

    if (!supplier) {
      throw new AppError('Supplier not found', 404)
    }

    for (const item of items) {
      if (item.productId) {
        const product = await Product.findById(item.productId).session(session)

        if (product) {
          product.stock += item.quantity
          await product.save({ session })
        }
      }
    }

    supplier.totalPayable += Math.max(0, totalAmount - paidAmount)
    await supplier.save({ session })

    const purchase = await Purchase.create(
      [
        {
          supplierId,
          supplierName: supplier.name,
          items,
          totalAmount,
          paidAmount,
          remainingAmount: Math.max(0, totalAmount - paidAmount),
          paymentStatus: paidAmount >= totalAmount ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'PENDING',
          notes,
        },
      ],
      { session }
    )

    await session.commitTransaction()

    const populatedPurchase = await Purchase.findById(purchase[0]._id)
      .populate('supplierId', 'name phone totalPayable')
      .lean()

    res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: { purchase: populatedPurchase },
    })
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
})

export const getPurchases = asyncHandler(async (req, res) => {
  const { supplierId, startDate, endDate, status, page = 1, limit = 50 } = req.query

  const query = {}

  if (supplierId) {
    query.supplierId = supplierId
  }

  if (status) {
    query.paymentStatus = status
  }

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) query.createdAt.$gte = new Date(startDate)
    if (endDate) query.createdAt.$lte = new Date(endDate)
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)

  const [purchases, total, stats] = await Promise.all([
    Purchase.find(query)
      .populate('supplierId', 'name phone totalPayable')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Purchase.countDocuments(query),
    Purchase.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalRemaining: { $sum: '$remainingAmount' },
          count: { $sum: 1 },
        },
      },
    ]),
  ])

  res.status(200).json({
    success: true,
    data: {
      purchases,
      stats: {
        totalAmount: stats[0]?.totalAmount || 0,
        totalPaid: stats[0]?.totalPaid || 0,
        totalRemaining: stats[0]?.totalRemaining || 0,
        count: stats[0]?.count || 0,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  })
})

export const getPurchase = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id)
    .populate('supplierId', 'name phone totalPayable')
    .lean()

  if (!purchase) {
    throw new AppError('Purchase not found', 404)
  }

  res.status(200).json({
    success: true,
    data: { purchase },
  })
})
