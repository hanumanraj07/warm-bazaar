import { Customer, Bill, Payment } from '../models/index.js'
import { asyncHandler, AppError } from '../middleware/index.js'

export const getCustomers = asyncHandler(async (req, res) => {
  const { search, sort = 'name', order = 'asc', page = 1, limit = 50 } = req.query

  const query = { isActive: true }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ]
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const sortObj = { [sort]: order === 'asc' ? 1 : -1 }

  const [customers, total] = await Promise.all([
    Customer.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)).lean(),
    Customer.countDocuments(query),
  ])

  const totalPending = await Customer.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, total: { $sum: '$totalUdhar' } } },
  ])

  res.status(200).json({
    success: true,
    data: {
      customers,
      summary: {
        totalPending: totalPending[0]?.total || 0,
        customerCount: await Customer.countDocuments({ isActive: true, totalUdhar: { $gt: 0 } }),
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

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id).lean()

  if (!customer) {
    throw new AppError('Customer not found', 404)
  }

  const [bills, payments] = await Promise.all([
    Bill.find({ customerId: req.params.id, billStatus: { $ne: 'CANCELLED' } })
      .sort({ createdAt: -1 })
      .lean(),
    Payment.find({ customerId: req.params.id })
      .sort({ createdAt: -1 })
      .lean(),
  ])

  const transactions = [
    ...bills.map((bill) => ({
      id: bill._id.toString(),
      type: 'BILL',
      description: `Bill ${bill.billNumber || ''} - ${bill.items?.map((i) => i.name).join(', ') || 'Items'}`,
      amount: bill.totalAmount,
      date: bill.createdAt,
      billNumber: bill.billNumber,
      items: bill.items,
      paymentMode: bill.paymentMode,
    })),
    ...payments.map((payment) => ({
      id: payment._id.toString(),
      type: 'PAYMENT',
      description: `${payment.paymentMode} payment`,
      amount: payment.amount,
      date: payment.createdAt,
      mode: payment.paymentMode,
      notes: payment.notes,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  res.status(200).json({
    success: true,
    data: { customer, transactions },
  })
})

export const createCustomer = asyncHandler(async (req, res) => {
  console.log('Creating customer - Request body:', JSON.stringify(req.body))
  
  try {
    const { name, phone, email, address } = req.body
    
    console.log('Extracted - name:', name, 'phone:', phone, 'email:', email, 'address:', address)
    
    if (!name || !phone) {
      throw new AppError('Name and phone are required', 400)
    }
    
    const query = { phone }
    if (email) query.email = email
    
    const existingCustomer = await Customer.findOne(query)

    if (existingCustomer) {
      throw new AppError('Customer with this phone already exists', 400)
    }

    const customer = await Customer.create({ name, phone, email, address })
    console.log('Customer created successfully:', customer._id)

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: { customer },
    })
  } catch (error) {
    console.error('Create customer error:', error.message)
    throw error
  }
})

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).lean()

  if (!customer) {
    throw new AppError('Customer not found', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Customer updated successfully',
    data: { customer },
  })
})

export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id)

  if (!customer) {
    throw new AppError('Customer not found', 404)
  }

  if (customer.totalUdhar > 0) {
    throw new AppError('Cannot delete customer with pending udhar', 400)
  }

  customer.isActive = false
  await customer.save()

  res.status(200).json({
    success: true,
    message: 'Customer deleted successfully',
  })
})
