import { Expense } from '../models/index.js'
import { asyncHandler, AppError } from '../middleware/index.js'

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create({
    ...req.body,
    createdBy: req.user.userId,
  })

  res.status(201).json({
    success: true,
    message: 'Expense recorded successfully',
    data: { expense },
  })
})

export const getExpenses = asyncHandler(async (req, res) => {
  const { category, startDate, endDate, minAmount, maxAmount, page = 1, limit = 50 } = req.query

  const query = {}

  if (category) {
    query.category = category
  }

  if (minAmount || maxAmount) {
    query.amount = {}
    if (minAmount) query.amount.$gte = parseFloat(minAmount)
    if (maxAmount) query.amount.$lte = parseFloat(maxAmount)
  }

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) query.createdAt.$gte = new Date(startDate)
    if (endDate) query.createdAt.$lte = new Date(endDate)
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)

  const [expenses, total, stats] = await Promise.all([
    Expense.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Expense.countDocuments(query),
    Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
  ])

  const categoryStats = await Expense.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ])

  res.status(200).json({
    success: true,
    data: {
      expenses,
      stats: {
        totalAmount: stats[0]?.totalAmount || 0,
        count: stats[0]?.count || 0,
      },
      categoryStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  })
})

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndDelete(req.params.id)

  if (!expense) {
    throw new AppError('Expense not found', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Expense deleted successfully',
  })
})
