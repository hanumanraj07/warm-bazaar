import { Product, Customer, Supplier, Bill, Purchase, Expense, ProductBatch, DayClose, Payment } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - 6)

  const twoDaysFromNow = new Date(today)
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)

  const results = await Promise.allSettled([
    Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          billStatus: 'COMPLETED',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
    ]),
    Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          billStatus: 'COMPLETED',
        },
      },
      {
        $group: {
          _id: null,
          profit: { $sum: '$profit' },
        },
      },
    ]),
    Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          type: 'CUSTOMER',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
    Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          billStatus: 'COMPLETED',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
    ]),
    Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          billStatus: 'COMPLETED',
        },
      },
      {
        $group: {
          _id: null,
          profit: { $sum: '$profit' },
        },
      },
    ]),
    Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          type: 'CUSTOMER',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
    Customer.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$totalUdhar' } } },
    ]),
    Supplier.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$totalPayable' } } },
    ]),
    Expense.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true,
    })
      .sort({ stock: 1 })
      .limit(10)
      .select('name stock lowStockThreshold unit price category')
      .lean(),
    Bill.find({ billStatus: 'COMPLETED' })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('billNumber totalAmount paymentMode customerId customerName createdAt profit')
      .lean(),
    Bill.aggregate([
      { $match: { createdAt: { $gte: startOfWeek }, billStatus: 'COMPLETED' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$totalAmount' },
          profit: { $sum: '$profit' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Payment.aggregate([
      { $match: { createdAt: { $gte: startOfWeek }, type: 'CUSTOMER' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Bill.aggregate([
      { $match: { billStatus: 'COMPLETED' } },
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
      { $limit: 10 },
    ]),
    Product.find({ isActive: true, stock: { $gt: 0 } })
      .sort({ updatedAt: -1 })
      .limit(8)
      .select('name price stock unit')
      .lean(),
    ProductBatch.find({
      expiryDate: { $lte: twoDaysFromNow, $gte: today },
      isActive: true,
      quantity: { $gt: 0 },
    })
      .populate('productId', 'name category')
      .sort({ expiryDate: 1 })
      .limit(5)
      .lean(),
    DayClose.findOne({
      date: { $gte: today, $lt: tomorrow },
    }),
  ])

  const safe = (index, fallback = null) =>
    results[index].status === 'fulfilled' ? results[index].value : fallback

  const todaySalesResult = safe(0, [])
  const todayProfitResult = safe(1, [])
  const todayPaymentsResult = safe(2, [])
  const monthlyRevenueResult = safe(3, [])
  const monthlyProfitResult = safe(4, [])
  const monthlyPaymentsResult = safe(5, [])
  const totalUdhar = safe(6, [])
  const totalPayable = safe(7, [])
  const monthlyExpenses = safe(8, [])
  const lowStockProducts = safe(9, [])
  const recentBills = safe(10, [])
  const weeklySales = safe(11, [])
  const weeklyPayments = safe(12, [])
  const topProducts = safe(13, [])
  const quickAddProducts = safe(14, [])
  const expiringProducts = safe(15, [])
  const dayStatus = safe(16, null)

  const todaySales = (todaySalesResult[0]?.total || 0) + (todayPaymentsResult[0]?.total || 0)
  const todayBills = (todaySalesResult[0]?.count || 0) + (todayPaymentsResult[0]?.count || 0)
  const todayProfit = todayProfitResult[0]?.profit || 0
  const monthlyRevenue = (monthlyRevenueResult[0]?.total || 0) + (monthlyPaymentsResult[0]?.total || 0)
  const monthlyBills = (monthlyRevenueResult[0]?.count || 0) + (monthlyPaymentsResult[0]?.count || 0)
  const monthlyProfit = monthlyProfitResult[0]?.profit || 0
  const netProfit = monthlyProfit - (monthlyExpenses[0]?.total || 0)

  const weeklyChart = generateWeeklyChart(weeklySales, weeklyPayments, startOfWeek)

  const expiringSoon = (expiringProducts || []).map(b => ({
    productId: b.productId?._id,
    name: b.productId?.name,
    category: b.productId?.category,
    batchNumber: b.batchNumber,
    quantity: b.quantity,
    expiryDate: b.expiryDate,
    daysUntilExpiry: b.expiryDate
      ? Math.ceil((new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
      : null,
  }))

  res.status(200).json({
    success: true,
    data: {
      todaySales,
      todayBills,
      todayProfit,
      monthlyRevenue,
      monthlyBills,
      monthlyProfit,
      netProfit,
      totalUdhar: totalUdhar[0]?.total || 0,
      totalPayable: totalPayable[0]?.total || 0,
      monthlyExpenses: monthlyExpenses[0]?.total || 0,
      lowStock: lowStockProducts || [],
      expiringSoon,
      recentBills: (recentBills || []).map((bill) => ({
        id: bill._id,
        billNumber: bill.billNumber,
        amount: bill.totalAmount,
        profit: bill.profit,
        mode: bill.paymentMode,
        customer: bill.customerId?.name || bill.customerName,
        time: bill.createdAt,
      })),
      weeklyChart,
      topSelling: (topProducts || []).map((p) => ({
        productId: p._id,
        name: p.name,
        sold: p.totalSold,
        revenue: p.totalRevenue,
      })),
      quickAddProducts: (quickAddProducts || []).map((p) => ({
        id: p._id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        unit: p.unit,
      })),
      cashStatus: { isOpen: false },
    },
  })
})

function generateWeeklyChart(weeklySales, weeklyPayments, startOfWeek) {
  const chart = []
  const salesMap = new Map(weeklySales.map((s) => [s._id, s]))
  const paymentsMap = new Map(weeklyPayments.map((p) => [p._id, p]))

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    const dateStr = date.toISOString().slice(0, 10)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })

    const salesData = salesMap.get(dateStr)
    const paymentData = paymentsMap.get(dateStr)

    chart.push({
      day: dayName,
      date: dateStr,
      amount: (salesData?.total || 0) + (paymentData?.total || 0),
      profit: salesData?.profit || 0,
      count: (salesData?.count || 0) + (paymentData?.count || 0),
    })
  }

  return chart
}
