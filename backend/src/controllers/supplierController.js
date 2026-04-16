import { Supplier, Purchase, Payment } from '../models/index.js'
import { asyncHandler, AppError } from '../middleware/index.js'

export const getSuppliers = asyncHandler(async (req, res) => {
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

  const [suppliers, total] = await Promise.all([
    Supplier.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)).lean(),
    Supplier.countDocuments(query),
  ])

  const totalPayable = await Supplier.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, total: { $sum: '$totalPayable' } } },
  ])

  res.status(200).json({
    success: true,
    data: {
      suppliers,
      summary: {
        totalPayable: totalPayable[0]?.total || 0,
        supplierCount: await Supplier.countDocuments({ isActive: true, totalPayable: { $gt: 0 } }),
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

export const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id).lean()

  if (!supplier) {
    throw new AppError('Supplier not found', 404)
  }

  const [purchases, payments] = await Promise.all([
    Purchase.find({ supplierId: req.params.id })
      .sort({ createdAt: -1 })
      .lean(),
    Payment.find({ supplierId: req.params.id })
      .sort({ createdAt: -1 })
      .lean(),
  ])

  const transactions = [
    ...purchases.map((purchase) => ({
      id: purchase._id.toString(),
      type: 'PURCHASE',
      description: `Purchase - ${purchase.items?.map((i) => i.name).join(', ') || 'Items'}`,
      amount: purchase.totalAmount,
      date: purchase.createdAt,
      items: purchase.items,
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
    data: { supplier, transactions },
  })
})

export const createSupplier = asyncHandler(async (req, res) => {
  console.log('Creating supplier - Request body:', JSON.stringify(req.body))
  
  try {
    const { name, phone, email, address, businessName } = req.body
    
    console.log('Extracted - name:', name, 'phone:', phone)
    
    if (!name || !phone) {
      throw new AppError('Name and phone are required', 400)
    }
    
    const query = { phone }
    if (email) query.email = email
    
    const existingSupplier = await Supplier.findOne(query)

    if (existingSupplier) {
      throw new AppError('Supplier with this phone already exists', 400)
    }

    const supplier = await Supplier.create({ name, phone, email, address, businessName })
    console.log('Supplier created successfully:', supplier._id)

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: { supplier },
    })
  } catch (error) {
    console.error('Create supplier error:', error.message)
    throw error
  }
})

export const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).lean()

  if (!supplier) {
    throw new AppError('Supplier not found', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Supplier updated successfully',
    data: { supplier },
  })
})

export const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id)

  if (!supplier) {
    throw new AppError('Supplier not found', 404)
  }

  if (supplier.totalPayable > 0) {
    throw new AppError('Cannot delete supplier with pending payments', 400)
  }

  supplier.isActive = false
  await supplier.save()

  res.status(200).json({
    success: true,
    message: 'Supplier deleted successfully',
  })
})
