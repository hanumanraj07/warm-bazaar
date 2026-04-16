import mongoose from 'mongoose'
import { Product, Customer, Bill, ProductBatch } from '../models/index.js'
import { asyncHandler, AppError } from '../middleware/index.js'

export const createBill = asyncHandler(async (req, res) => {
  console.log('createBill called with body:', JSON.stringify(req.body, null, 2))

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { items, subtotal, discount = 0, totalAmount, paymentMode, customerId, notes, createdBy } = req.body

    console.log('Parsed - items:', items.length, 'subtotal:', subtotal, 'totalAmount:', totalAmount, 'paymentMode:', paymentMode)

    let totalCost = 0
    const processedItems = []

    for (const item of items) {
      console.log('Processing item:', item)
      const product = await Product.findById(item.productId).session(session)

      if (!product) {
        throw new AppError(`Product ${item.name} not found`, 404)
      }

      console.log('Product found:', product.name, 'stock:', product.stock, 'costPrice:', product.costPrice)

      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${item.name}. Available: ${product.stock} ${product.unit}`,
          400
        )
      }

      const itemCost = (product.costPrice || 0) * item.quantity
      totalCost += itemCost

      await Product.findByIdAndUpdate(
        product._id,
        {
          $inc: {
            stock: -item.quantity,
            totalSold: item.quantity,
            totalRevenue: item.total,
            totalCost: itemCost,
          },
        },
        { session }
      )

      processedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        costPrice: product.costPrice || 0,
        quantity: item.quantity,
        total: item.total,
        costTotal: itemCost,
      })
    }

    console.log('Processed items:', processedItems.length, 'totalCost:', totalCost)

    let customer = null
    if (paymentMode === 'UDHAR') {
      if (!customerId) {
        throw new AppError('Customer is required for UDHAR payment mode', 400)
      }

      customer = await Customer.findById(customerId).session(session)

      if (!customer) {
        throw new AppError('Customer not found', 404)
      }

      customer.totalUdhar += totalAmount
      await customer.save({ session })
    }

    const profit = totalAmount - totalCost

    console.log('Creating bill with profit:', profit)

    const bill = await Bill.create(
      [
        {
          items: processedItems,
          subtotal,
          discount,
          totalAmount,
          originalAmount: totalAmount,
          paymentMode,
          customerId: customer?._id,
          customerName: customer?.name,
          notes,
          profit,
          costAmount: totalCost,
          createdBy,
        },
      ],
      { session }
    )

    await session.commitTransaction()

    console.log('Bill created successfully:', bill[0]._id)

    const populatedBill = await Bill.findById(bill[0]._id)
      .populate('customerId', 'name phone totalUdhar')
      .lean()

    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    })
      .select('name stock lowStockThreshold unit')
      .lean()

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: {
        bill: populatedBill,
        lowStockProducts,
      },
    })
  } catch (error) {
    console.error('createBill error:', error.message, error.stack)
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
})

export const getBills = asyncHandler(async (req, res) => {
  const { startDate, endDate, paymentMode, customerId, page = 1, limit = 50 } = req.query

  const query = { billStatus: { $ne: 'CANCELLED' } }

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) query.createdAt.$gte = new Date(startDate)
    if (endDate) query.createdAt.$lte = new Date(endDate)
  }

  if (paymentMode) {
    query.paymentMode = paymentMode
  }

  if (customerId) {
    query.customerId = customerId
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)

  const [bills, total, stats] = await Promise.all([
    Bill.find(query)
      .populate('customerId', 'name phone totalUdhar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Bill.countDocuments(query),
    Bill.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profit' },
          totalCost: { $sum: '$costAmount' },
          count: { $sum: 1 },
        },
      },
    ]),
  ])

  res.status(200).json({
    success: true,
    data: {
      bills,
      stats: {
        totalAmount: stats[0]?.totalAmount || 0,
        totalProfit: stats[0]?.totalProfit || 0,
        totalCost: stats[0]?.totalCost || 0,
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

export const getRecentBills = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5

  const bills = await Bill.find({ billStatus: 'COMPLETED' })
    .populate('customerId', 'name')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()

  res.status(200).json({
    success: true,
    data: { bills },
  })
})

export const getBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id)
    .populate('customerId', 'name phone totalUdhar')
    .lean()

  if (!bill) {
    throw new AppError('Bill not found', 404)
  }

  res.status(200).json({
    success: true,
    data: { bill },
  })
})

export const editBill = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { items, subtotal, discount, totalAmount, notes } = req.body
    const bill = await Bill.findById(req.params.id).session(session)

    if (!bill) {
      throw new AppError('Bill not found', 404)
    }

    if (bill.billStatus === 'CANCELLED') {
      throw new AppError('Cannot edit a cancelled bill', 400)
    }

    if (bill.returns?.length > 0) {
      throw new AppError('Cannot edit a bill with returns. Cancel and create new.', 400)
    }

    for (const oldItem of bill.items) {
      await Product.findByIdAndUpdate(
        oldItem.productId,
        { $inc: { stock: oldItem.quantity, totalSold: -oldItem.quantity, totalRevenue: -oldItem.total, totalCost: -oldItem.costTotal } },
        { session }
      )
    }

    let totalCost = 0
    const processedItems = []

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session)

      if (!product) {
        throw new AppError(`Product ${item.name} not found`, 404)
      }

      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${item.name}. Available: ${product.stock}`,
          400
        )
      }

      const itemCost = product.costPrice * item.quantity
      totalCost += itemCost

      product.stock -= item.quantity
      product.totalSold += item.quantity
      product.totalRevenue += item.total
      product.totalCost += itemCost
      await product.save({ session })

      processedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        costPrice: product.costPrice,
        quantity: item.quantity,
        total: item.total,
        costTotal: itemCost,
      })
    }

    const profit = totalAmount - totalCost
    const diff = totalAmount - bill.totalAmount

    if (diff !== 0 && bill.paymentMode === 'UDHAR' && bill.customerId) {
      await Customer.findByIdAndUpdate(
        bill.customerId,
        { $inc: { totalUdhar: diff } },
        { session }
      )
    }

    bill.items = processedItems
    bill.subtotal = subtotal
    bill.discount = discount
    bill.totalAmount = totalAmount
    bill.profit = profit
    bill.costAmount = totalCost
    bill.notes = notes
    bill.editedAt = new Date()
    await bill.save({ session })

    await session.commitTransaction()

    const populatedBill = await Bill.findById(bill._id)
      .populate('customerId', 'name phone totalUdhar')
      .lean()

    res.status(200).json({
      success: true,
      message: 'Bill updated successfully',
      data: { bill: populatedBill },
    })
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
})

export const returnBill = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { items, reason } = req.body
    const bill = await Bill.findById(req.params.id).session(session)

    if (!bill) {
      throw new AppError('Bill not found', 404)
    }

    if (bill.billStatus === 'CANCELLED') {
      throw new AppError('Cannot return a cancelled bill', 400)
    }

    let totalReturnAmount = 0
    const returns = []

    for (const returnItem of items) {
      const billItem = bill.items.find(
        i => i.productId.toString() === returnItem.productId
      )

      if (!billItem) {
        throw new AppError(`Item not found in bill`, 400)
      }

      const maxReturnable = billItem.quantity - billItem.returnedQty
      const returnQty = Math.min(returnItem.quantity, maxReturnable)

      if (returnQty <= 0) {
        continue
      }

      const returnAmount = (billItem.price * returnQty) - ((billItem.discount || 0) / billItem.quantity * returnQty)
      totalReturnAmount += returnAmount

      billItem.returnedQty += returnQty

      await Product.findByIdAndUpdate(
        returnItem.productId,
        { $inc: { stock: returnQty } },
        { session }
      )

      returns.push({
        productId: returnItem.productId,
        name: billItem.name,
        quantity: returnQty,
        amount: returnAmount,
        reason: reason || 'Customer return',
        returnedAt: new Date(),
      })
    }

    bill.returns.push(...returns)
    bill.returnAmount = (bill.returnAmount || 0) + totalReturnAmount
    bill.billStatus = bill.returnAmount >= bill.totalAmount ? 'REFUNDED' : 'PARTIAL_RETURN'
    bill.editedAt = new Date()

    if (bill.paymentMode === 'UDHAR' && bill.customerId) {
      await Customer.findByIdAndUpdate(
        bill.customerId,
        { $inc: { totalUdhar: -totalReturnAmount } },
        { session }
      )
    }

    await bill.save({ session })
    await session.commitTransaction()

    const populatedBill = await Bill.findById(bill._id)
      .populate('customerId', 'name phone totalUdhar')
      .lean()

    res.status(200).json({
      success: true,
      message: 'Return processed successfully',
      data: {
        bill: populatedBill,
        returnAmount: totalReturnAmount,
        returnCount: returns.length,
      },
    })
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
})

export const cancelBill = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const bill = await Bill.findById(req.params.id).session(session)

    if (!bill) {
      throw new AppError('Bill not found', 404)
    }

    if (bill.billStatus === 'CANCELLED') {
      throw new AppError('Bill is already cancelled', 400)
    }

    for (const item of bill.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            stock: item.quantity - item.returnedQty,
            totalSold: -(item.quantity - item.returnedQty),
            totalRevenue: -item.total,
            totalCost: -item.costTotal,
          },
        },
        { session }
      )
    }

    if (bill.paymentMode === 'UDHAR' && bill.customerId) {
      const returnableAmount = bill.totalAmount - bill.returnAmount
      await Customer.findByIdAndUpdate(
        bill.customerId,
        { $inc: { totalUdhar: -returnableAmount } },
        { session }
      )
    }

    bill.billStatus = 'CANCELLED'
    await bill.save({ session })

    await session.commitTransaction()

    res.status(200).json({
      success: true,
      message: 'Bill cancelled successfully',
      data: { bill },
    })
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
})

export const getBillPDF = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id)
    .populate('customerId', 'name phone')
    .lean()

  if (!bill) {
    throw new AppError('Bill not found', 404)
  }

  const pdfData = {
    billNumber: bill.billNumber,
    date: bill.createdAt,
    items: bill.items.map(item => ({
      name: item.name,
      quantity: item.quantity - item.returnedQty,
      price: item.price,
      total: item.total - (item.price * item.returnedQty),
    })),
    subtotal: bill.subtotal,
    discount: bill.discount,
    totalAmount: bill.netAmount || bill.totalAmount,
    paymentMode: bill.paymentMode,
    customer: bill.customerId?.name,
    profit: bill.profit,
  }

  res.status(200).json({
    success: true,
    data: { pdfData },
  })
})
