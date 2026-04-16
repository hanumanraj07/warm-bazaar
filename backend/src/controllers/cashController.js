import mongoose from 'mongoose'
import { Bill, Expense, Payment, DayClose, CashLog, User } from '../models/index.js'
import { asyncHandler, AppError } from '../middleware/index.js'

export const openDay = asyncHandler(async (req, res) => {
  const { openingCash = 0, notes } = req.body

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const existing = await DayClose.findOne({
    date: { $gte: today, $lt: tomorrow },
  })

  if (existing) {
    throw new AppError('Day already opened. Use close day to close and reopen.', 400)
  }

  const dayClose = await DayClose.create({
    date: today,
    openingCash,
    expectedCash: openingCash,
  })

  await CashLog.create({
    type: 'OPEN',
    amount: openingCash,
    description: 'Day opened',
    expectedCash: openingCash,
    actualCash: openingCash,
    dayCloseId: dayClose._id,
    createdBy: req.user?.userId,
  })

  res.status(201).json({
    success: true,
    message: 'Day opened successfully',
    data: { dayClose },
  })
})

export const closeDay = asyncHandler(async (req, res) => {
  const { actualCash, notes } = req.body

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dayClose = await DayClose.findOne({
    date: { $gte: today, $lt: tomorrow },
  })

  if (!dayClose) {
    throw new AppError('Please open the day first', 400)
  }

  if (dayClose.isClosed) {
    throw new AppError('Day already closed', 400)
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const dayBills = await Bill.find({
      createdAt: { $gte: today, $lt: tomorrow },
      billStatus: { $ne: 'CANCELLED' },
    }).session(session)

    const dayExpenses = await Expense.find({
      createdAt: { $gte: today, $lt: tomorrow },
    }).session(session)

    const paymentsIn = await Payment.find({
      createdAt: { $gte: today, $lt: tomorrow },
      type: 'IN',
    }).session(session)

    const paymentsOut = await Payment.find({
      createdAt: { $gte: today, $lt: tomorrow },
      type: 'OUT',
    }).session(session)

    const totalSales = dayBills.reduce((sum, b) => sum + b.totalAmount, 0)
    const cashSales = dayBills
      .filter(b => b.paymentMode === 'CASH')
      .reduce((sum, b) => sum + b.totalAmount, 0)
    const upiSales = dayBills
      .filter(b => b.paymentMode === 'UPI')
      .reduce((sum, b) => sum + b.totalAmount, 0)
    const cardSales = dayBills
      .filter(b => b.paymentMode === 'CARD')
      .reduce((sum, b) => sum + b.totalAmount, 0)
    const udharSales = dayBills
      .filter(b => b.paymentMode === 'UDHAR')
      .reduce((sum, b) => sum + b.totalAmount, 0)

    const totalExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0)
    const cashReceived = paymentsIn.filter(p => p.mode === 'CASH').reduce((sum, p) => sum + p.amount, 0)
    const cashPaid = paymentsOut.filter(p => p.mode === 'CASH').reduce((sum, p) => sum + p.amount, 0)
    const paymentsInTotal = paymentsIn.reduce((sum, p) => sum + p.amount, 0)
    const paymentsOutTotal = paymentsOut.reduce((sum, p) => sum + p.amount, 0)

    const expectedCash =
      dayClose.openingCash + cashSales + cashReceived - cashPaid

    const variance = actualCash !== undefined ? actualCash - expectedCash : 0

    dayClose.closingCash = actualCash || expectedCash
    dayClose.expectedCash = expectedCash
    dayClose.actualCash = actualCash
    dayClose.variance = variance
    dayClose.totalSales = totalSales
    dayClose.totalBills = dayBills.length
    dayClose.cashSales = cashSales
    dayClose.upiSales = upiSales
    dayClose.cardSales = cardSales
    dayClose.udharSales = udharSales
    dayClose.totalProfit = dayBills.reduce((sum, b) => sum + (b.profit || 0), 0)
    dayClose.totalExpenses = totalExpenses
    dayClose.cashReceived = cashReceived
    dayClose.cashPaid = cashPaid
    dayClose.paymentsIn = paymentsInTotal
    dayClose.paymentsOut = paymentsOutTotal
    dayClose.isClosed = true
    dayClose.closedBy = req.user?.userId
    dayClose.closedAt = new Date()
    dayClose.notes = notes

    await dayClose.save({ session })
    await session.commitTransaction()

    res.status(200).json({
      success: true,
      message: 'Day closed successfully',
      data: {
        dayClose,
        summary: {
          totalSales,
          totalBills: dayBills.length,
          cashSales,
          upiSales,
          cardSales,
          udharSales,
          totalExpenses,
          expectedCash,
          actualCash,
          variance,
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

export const getTodayStatus = asyncHandler(async (req, res) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dayClose = await DayClose.findOne({
    date: { $gte: today, $lt: tomorrow },
  })

  if (!dayClose) {
    return res.status(200).json({
      success: true,
      data: {
        isOpen: false,
        message: 'Day not opened yet',
      },
    })
  }

  const dayBills = await Bill.find({
    createdAt: { $gte: today, $lt: tomorrow },
    billStatus: { $ne: 'CANCELLED' },
  })

  const currentCash =
    dayClose.openingCash +
    dayBills
      .filter(b => b.paymentMode === 'CASH')
      .reduce((sum, b) => sum + b.totalAmount, 0)

  res.status(200).json({
    success: true,
    data: {
      isOpen: !dayClose.isClosed,
      isClosed: dayClose.isClosed,
      openingCash: dayClose.openingCash,
      currentCash,
      expectedCash: dayClose.openingCash + dayBills.filter(b => b.paymentMode === 'CASH').reduce((sum, b) => sum + b.totalAmount, 0),
      totalSales: dayBills.reduce((sum, b) => sum + b.totalAmount, 0),
      billCount: dayBills.length,
    },
  })
})

export const getCashLogs = asyncHandler(async (req, res) => {
  const { startDate, endDate, limit = 50 } = req.query

  const query = {}
  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) query.createdAt.$gte = new Date(startDate)
    if (endDate) query.createdAt.$lte = new Date(endDate)
  }

  const logs = await CashLog.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate('createdBy', 'name')
    .lean()

  res.status(200).json({
    success: true,
    data: { logs },
  })
})

export const addCashAdjustment = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  let dayClose = await DayClose.findOne({
    date: { $gte: today, $lt: tomorrow },
  })

  if (!dayClose) {
    dayClose = await DayClose.create({
      date: today,
      openingCash: 0,
      expectedCash: 0,
    })
  }

  if (dayClose.isClosed) {
    throw new AppError('Cannot adjust cash for a closed day', 400)
  }

  const expectedCash = dayClose.expectedCash + amount

  const cashLog = await CashLog.create({
    type: 'ADJUSTMENT',
    amount,
    description: reason,
    expectedCash,
    actualCash: expectedCash,
    variance: 0,
    dayCloseId: dayClose._id,
    createdBy: req.user?.userId,
  })

  dayClose.expectedCash = expectedCash
  await dayClose.save()

  res.status(201).json({
    success: true,
    message: 'Cash adjustment added',
    data: { cashLog },
  })
})
