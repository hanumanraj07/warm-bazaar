import { Product, Bill, Customer, Supplier, Expense, DayClose } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'

export const getSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query

  const matchStage = { billStatus: 'COMPLETED' }
  if (startDate || endDate) {
    matchStage.createdAt = {}
    if (startDate) matchStage.createdAt.$gte = new Date(startDate)
    if (endDate) matchStage.createdAt.$lte = new Date(endDate)
  }

  let dateFormat
  switch (groupBy) {
    case 'month':
      dateFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } }
      break
    case 'year':
      dateFormat = { $dateToString: { format: '%Y', date: '$createdAt' } }
      break
    default:
      dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
  }

  const salesByDate = await Bill.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: dateFormat,
        totalSales: { $sum: '$totalAmount' },
        totalProfit: { $sum: '$profit' },
        totalCost: { $sum: '$costAmount' },
        billCount: { $sum: 1 },
        avgBillValue: { $avg: '$totalAmount' },
      },
    },
    { $sort: { _id: 1 } },
  ])

  const salesByCategory = await Bill.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        category: { $first: '$items.name' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.total' },
        billCount: { $sum: 1 },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 20 },
  ])

  const salesByPaymentMode = await Bill.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$paymentMode',
        totalAmount: { $sum: '$totalAmount' },
        count: { $sum: 1 },
      },
    },
  ])

  res.status(200).json({
    success: true,
    data: {
      byDate: salesByDate,
      byCategory: salesByCategory,
      byPaymentMode: salesByPaymentMode,
    },
  })
})

export const getProfitReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query

  const matchStage = { billStatus: 'COMPLETED' }
  if (startDate || endDate) {
    matchStage.createdAt = {}
    if (startDate) matchStage.createdAt.$gte = new Date(startDate)
    if (endDate) matchStage.createdAt.$lte = new Date(endDate)
  }

  const profitData = await Bill.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalCost: { $sum: '$costAmount' },
        totalProfit: { $sum: '$profit' },
        billCount: { $sum: 1 },
      },
    },
  ])

  const expenseData = await Expense.aggregate([
    {
      $match: {
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { $gte: new Date(startDate) } : {}),
                ...(endDate ? { $lte: new Date(endDate) } : {}),
              },
            }
          : {}),
      },
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ])

  const totalExpenses = expenseData.reduce((sum, e) => sum + e.total, 0)
  const netProfit = (profitData[0]?.totalProfit || 0) - totalExpenses

  const topProfitableItems = await Bill.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        name: { $first: '$items.name' },
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.total' },
        totalCost: { $sum: '$items.costTotal' },
        profit: { $sum: { $subtract: ['$items.total', '$items.costTotal'] } },
      },
    },
    { $addFields: { profitMargin: { $multiply: [{ $divide: ['$profit', '$totalRevenue'] }, 100] } } },
    { $sort: { profit: -1 } },
    { $limit: 10 },
  ])

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalRevenue: profitData[0]?.totalRevenue || 0,
        totalCost: profitData[0]?.totalCost || 0,
        grossProfit: profitData[0]?.totalProfit || 0,
        totalExpenses,
        netProfit,
        profitMargin: profitData[0]?.totalRevenue > 0
          ? ((profitData[0]?.totalProfit / profitData[0]?.totalRevenue) * 100).toFixed(2)
          : 0,
      },
      byExpenseCategory: expenseData,
      topProfitableItems,
    },
  })
})

export const getInsights = asyncHandler(async (req, res) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    topSelling,
    peakHours,
    customerInsights,
    stockInsights,
  ] = await Promise.all([
    Bill.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, billStatus: 'COMPLETED' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]),

    Bill.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, billStatus: 'COMPLETED' } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]),

    Customer.aggregate([
      { $match: { isActive: true, totalUdhar: { $gt: 0 } } },
      { $sort: { totalUdhar: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: 1,
          phone: 1,
          totalUdhar: 1,
          daysSinceLastPurchase: {
            $divide: [{ $subtract: [new Date(), '$updatedAt'] }, 1000 * 60 * 60 * 24],
          },
        },
      },
    ]),

    Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          lowStock: {
            $sum: { $cond: [{ $lte: ['$stock', '$lowStockThreshold'] }, 1, 0] },
          },
          outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
          avgStockValue: { $avg: { $multiply: ['$stock', '$costPrice'] } },
        },
      },
    ]),
  ])

  const insights = {
    bestSellingProducts: topSelling,
    peakHours: peakHours.map(p => ({
      hour: p._id,
      billCount: p.count,
      revenue: p.revenue,
      timeRange: `${p._id}:00 - ${p._id + 1}:00`,
    })),
    highUdharCustomers: customerInsights,
    stockHealth: stockInsights[0] || { totalProducts: 0, lowStock: 0, outOfStock: 0, avgStockValue: 0 },
    recommendations: [],
  }

  if (stockInsights[0]?.outOfStock > 0) {
    insights.recommendations.push({
      type: 'URGENT',
      message: `${stockInsights[0].outOfStock} products are out of stock. Restock immediately.`,
    })
  }

  if (stockInsights[0]?.lowStock > 0) {
    insights.recommendations.push({
      type: 'WARNING',
      message: `${stockInsights[0].lowStock} products are running low on stock.`,
    })
  }

  if (topSelling.length > 0) {
    insights.recommendations.push({
      type: 'INFO',
      message: `"${topSelling[0].name}" is your best seller with ${topSelling[0].totalSold} units this week.`,
    })
  }

  res.status(200).json({
    success: true,
    data: { insights },
  })
})

export const getAlerts = asyncHandler(async (req, res) => {
  const today = new Date()
  const twoDaysFromNow = new Date(today)
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)

  const [
    lowStockProducts,
    expiringProducts,
    highUdharCustomers,
    pendingSupplierPayments,
  ] = await Promise.all([
    Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true,
    })
      .select('name stock lowStockThreshold unit category')
      .sort({ stock: 1 })
      .limit(10)
      .lean(),

    Product.aggregate([
      {
        $lookup: {
          from: 'productbatches',
          localField: '_id',
          foreignField: 'productId',
          as: 'batches',
        },
      },
      { $unwind: '$batches' },
      {
        $match: {
          'batches.expiryDate': { $lte: twoDaysFromNow, $gte: today },
          'batches.quantity': { $gt: 0 },
          'batches.isActive': true,
        },
      },
      {
        $project: {
          name: 1,
          category: 1,
          batchNumber: '$batches.batchNumber',
          quantity: '$batches.quantity',
          expiryDate: '$batches.expiryDate',
          daysLeft: {
            $divide: [{ $subtract: ['$batches.expiryDate', new Date()] }, 1000 * 60 * 60 * 24],
          },
        },
      },
      { $sort: { daysLeft: 1 } },
      { $limit: 10 },
    ]),

    Customer.find({
      isActive: true,
      totalUdhar: { $gt: 500 },
    })
      .select('name phone totalUdhar')
      .sort({ totalUdhar: -1 })
      .limit(5)
      .lean(),

    Supplier.aggregate([
      { $match: { isActive: true, totalPayable: { $gt: 0 } } },
      { $sort: { totalPayable: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: 1,
          businessName: 1,
          phone: 1,
          totalPayable: 1,
        },
      },
    ]),
  ])

  const alerts = []

  for (const product of lowStockProducts) {
    alerts.push({
      type: product.stock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
      severity: product.stock === 0 ? 'CRITICAL' : 'HIGH',
      title: product.stock === 0 ? 'Out of Stock' : 'Low Stock',
      message: `${product.name} has only ${product.stock} ${product.unit} left`,
      referenceId: product._id,
      referenceType: 'PRODUCT',
      actionUrl: `/inventory`,
    })
  }

  for (const batch of expiringProducts) {
    alerts.push({
      type: batch.daysLeft <= 0 ? 'EXPIRED' : 'EXPIRING_SOON',
      severity: batch.daysLeft <= 0 ? 'CRITICAL' : 'MEDIUM',
      title: batch.daysLeft <= 0 ? 'Expired Product' : 'Expiring Soon',
      message: `${batch.name} (Batch: ${batch.batchNumber}) expires in ${Math.ceil(batch.daysLeft)} days`,
      referenceId: batch._id,
      referenceType: 'PRODUCT',
    })
  }

  for (const customer of highUdharCustomers) {
    alerts.push({
      type: 'HIGH_UDHAR',
      severity: 'MEDIUM',
      title: 'High Udhar',
      message: `${customer.name} has pending udhar of ₹${customer.totalUdhar}`,
      referenceId: customer._id,
      referenceType: 'CUSTOMER',
      actionUrl: `/customers`,
    })
  }

  for (const supplier of pendingSupplierPayments) {
    alerts.push({
      type: 'PENDING_PAYMENT',
      severity: 'LOW',
      title: 'Supplier Payment Pending',
      message: `₹${supplier.totalPayable} payable to ${supplier.name}`,
      referenceId: supplier._id,
      referenceType: 'SUPPLIER',
      actionUrl: `/suppliers`,
    })
  }

  alerts.sort((a, b) => {
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  res.status(200).json({
    success: true,
    data: {
      alerts,
      summary: {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'CRITICAL').length,
        high: alerts.filter(a => a.severity === 'HIGH').length,
        medium: alerts.filter(a => a.severity === 'MEDIUM').length,
        low: alerts.filter(a => a.severity === 'LOW').length,
      },
    },
  })
})

export const getCustomerLastOrder = asyncHandler(async (req, res) => {
  const { customerId } = req.params

  const lastBill = await Bill.findOne({
    customerId,
    billStatus: { $ne: 'CANCELLED' },
  })
    .sort({ createdAt: -1 })
    .lean()

  if (!lastBill) {
    return res.status(200).json({
      success: true,
      data: { lastOrder: null },
    })
  }

  res.status(200).json({
    success: true,
    data: {
      lastOrder: {
        billId: lastBill._id,
        billNumber: lastBill.billNumber,
        date: lastBill.createdAt,
        items: lastBill.items,
        totalAmount: lastBill.totalAmount,
      },
    },
  })
})

export const exportData = asyncHandler(async (req, res) => {
  const { type = 'products' } = req.query

  let data
  let filename

  switch (type) {
    case 'products':
      data = await Product.find({ isActive: true })
        .select('name category price costPrice stock unit lowStockThreshold totalSold')
        .lean()
      filename = 'products_export.csv'
      break
    case 'customers':
      data = await Customer.find({ isActive: true })
        .select('name phone email address totalUdhar createdAt')
        .lean()
      filename = 'customers_export.csv'
      break
    case 'suppliers':
      data = await Supplier.find({ isActive: true })
        .select('name businessName phone email address totalPayable createdAt')
        .lean()
      filename = 'suppliers_export.csv'
      break
    case 'bills':
      data = await Bill.find({ billStatus: 'COMPLETED' })
        .populate('customerId', 'name')
        .select('billNumber items subtotal discount totalAmount profit paymentMode createdAt')
        .sort({ createdAt: -1 })
        .limit(1000)
        .lean()
      filename = 'bills_export.csv'
      break
    default:
      throw new AppError('Invalid export type', 400)
  }

  if (!data || data.length === 0) {
    return res.status(200).json({
      success: true,
      data: { data: [], message: 'No data to export' },
    })
  }

  res.status(200).json({
    success: true,
    data: { data, filename, type },
  })
})
