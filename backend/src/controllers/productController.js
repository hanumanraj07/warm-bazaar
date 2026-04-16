import { Product, ProductBatch, Alert } from '../models/index.js'
import { asyncHandler, AppError } from '../middleware/index.js'
import { catalog } from '../data/catalog.js'

export const getProducts = asyncHandler(async (req, res) => {
  const { search, category, lowStock, sort = 'name', order = 'asc', page = 1, limit = 100 } = req.query

  const query = { isActive: true }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { barcode: { $regex: search, $options: 'i' } },
    ]
  }

  if (category && category !== 'All') {
    query.category = category
  }

  if (lowStock === 'true') {
    query.$expr = { $lte: ['$stock', '$lowStockThreshold'] }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const sortObj = { [sort]: order === 'asc' ? 1 : -1 }

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)).lean(),
    Product.countDocuments(query),
  ])

  const categories = await Product.distinct('category', { isActive: true })

  const externalProducts = catalog.map(item => ({
    name: item.name,
    image: item.image,
    category: item.category,
  }))

  res.status(200).json({
    success: true,
    data: {
      products,
      externalProducts,
      categories: ['All', ...categories],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  })
})

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean()

  if (!product) {
    throw new AppError('Product not found', 404)
  }

  const batches = await ProductBatch.find({ productId: req.params.id, isActive: true, quantity: { $gt: 0 } })
    .sort({ expiryDate: 1 })
    .lean()

  res.status(200).json({
    success: true,
    data: { product, batches },
  })
})

export const createProduct = asyncHandler(async (req, res) => {
  const { expiryDate, manufacturingDate, ...rest } = req.body
  
  const productData = {
    ...rest,
    price: Number(rest.price) || 0,
    costPrice: Number(rest.costPrice) || 0,
    stock: Math.floor(Number(rest.stock)) || 0,
    lowStockThreshold: Math.floor(Number(rest.lowStockThreshold)) || 10,
    gstRate: Number(rest.gstRate) || 0,
  }

  const product = await Product.create(productData)

  if (expiryDate) {
    await ProductBatch.create({
      productId: product._id,
      quantity: productData.stock,
      initialQuantity: productData.stock,
      costPrice: productData.costPrice,
      expiryDate,
      manufacturingDate,
    })
  }

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product },
  })
})

export const updateProduct = asyncHandler(async (req, res) => {
  const updateData = { ...req.body }
  
  if (updateData.price !== undefined) updateData.price = Number(updateData.price)
  if (updateData.costPrice !== undefined) updateData.costPrice = Number(updateData.costPrice)
  if (updateData.stock !== undefined) updateData.stock = Math.floor(Number(updateData.stock))
  if (updateData.lowStockThreshold !== undefined) updateData.lowStockThreshold = Math.floor(Number(updateData.lowStockThreshold))
  if (updateData.gstRate !== undefined) updateData.gstRate = Number(updateData.gstRate)

  const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).lean()

  if (!product) {
    throw new AppError('Product not found', 404)
  }

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: { product },
  })
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )

  if (!product) {
    throw new AppError('Product not found', 404)
  }

  await ProductBatch.updateMany({ productId: req.params.id }, { isActive: false })

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  })
})

export const updateStock = asyncHandler(async (req, res) => {
  const { stock, type = 'set', batchInfo } = req.body

  const product = await Product.findById(req.params.id)

  if (!product) {
    throw new AppError('Product not found', 404)
  }

  let newStock
  if (type === 'set') {
    newStock = Math.max(0, stock)
  } else if (type === 'add') {
    newStock = product.stock + Math.max(0, stock)
  } else if (type === 'reduce') {
    newStock = Math.max(0, product.stock - Math.max(0, stock))
  }

  product.stock = newStock
  await product.save()

  if (batchInfo && batchInfo.expiryDate) {
    await ProductBatch.create({
      productId: product._id,
      quantity: Math.max(0, stock),
      initialQuantity: Math.max(0, stock),
      costPrice: batchInfo.costPrice || product.costPrice,
      expiryDate: batchInfo.expiryDate,
      manufacturingDate: batchInfo.manufacturingDate,
      supplierId: batchInfo.supplierId,
    })
  }

  res.status(200).json({
    success: true,
    message: 'Stock updated successfully',
    data: { product },
  })
})

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    isActive: true,
  })
    .sort({ stock: 1 })
    .lean()

  await Alert.createAlert({
    type: products.length > 0 ? 'LOW_STOCK' : undefined,
    severity: 'MEDIUM',
    title: 'Low Stock Alert',
    message: `${products.length} products are running low on stock`,
  }).catch(() => {})

  res.status(200).json({
    success: true,
    data: { products },
  })
})

export const getReorderSuggestions = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const products = await Product.find({ isActive: true, stock: { $gt: 0 } }).lean()

  const suggestions = []

  for (const product of products) {
    const salesInWeek = product.salesHistory
      ? product.salesHistory
          .filter(s => new Date(s.date) >= sevenDaysAgo)
          .reduce((sum, s) => sum + s.quantity, 0)
      : 0

    const avgDailySales = salesInWeek / 7
    const daysUntilStockOut = avgDailySales > 0 ? product.stock / avgDailySales : Infinity

    let suggestedReorderQty = 0
    if (daysUntilStockOut <= 7) {
      const targetStock = avgDailySales * 30
      suggestedReorderQty = Math.max(0, Math.ceil(targetStock - product.stock))
    }

    if (product.stock <= product.lowStockThreshold || daysUntilStockOut <= 7) {
      suggestions.push({
        productId: product._id,
        name: product.name,
        category: product.category,
        currentStock: product.stock,
        lowThreshold: product.lowStockThreshold,
        avgDailySales: Math.round(avgDailySales * 100) / 100,
        daysUntilStockOut: daysUntilStockOut === Infinity ? null : Math.round(daysUntilStockOut),
        suggestedReorderQty,
        priority: daysUntilStockOut <= 3 ? 'HIGH' : daysUntilStockOut <= 7 ? 'MEDIUM' : 'LOW',
      })
    }
  }

  suggestions.sort((a, b) => (a.daysUntilStockOut || 999) - (b.daysUntilStockOut || 999))

  res.status(200).json({
    success: true,
    data: { suggestions },
  })
})

export const getExpiringProducts = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + parseInt(days))

  const batches = await ProductBatch.find({
    expiryDate: { $lte: futureDate, $gte: new Date() },
    isActive: true,
    quantity: { $gt: 0 },
  })
    .populate('productId', 'name category stock unit')
    .sort({ expiryDate: 1 })
    .lean()

  const expiring = batches.map(b => ({
    batchId: b._id,
    productId: b.productId?._id,
    name: b.productId?.name,
    category: b.productId?.category,
    batchNumber: b.batchNumber,
    quantity: b.quantity,
    expiryDate: b.expiryDate,
    daysUntilExpiry: b.expiryDate ? Math.ceil((new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : null,
    status: b.expiryDate && new Date(b.expiryDate) < new Date() ? 'EXPIRED' : 'EXPIRING_SOON',
  }))

  res.status(200).json({
    success: true,
    data: { expiring },
  })
})

export const getDeadStock = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const products = await Product.find({
    isActive: true,
    stock: { $gt: 0 },
    $or: [
      { salesHistory: { $size: 0 } },
      { salesHistory: { $not: { $elemMatch: { date: { $gte: thirtyDaysAgo } } } } },
    ],
  })
    .sort({ stock: -1 })
    .lean()

  const deadStock = products.map(p => ({
    productId: p._id,
    name: p.name,
    category: p.category,
    stock: p.stock,
    unit: p.unit,
    value: p.stock * p.costPrice,
    lastSale: p.salesHistory?.length > 0
      ? p.salesHistory.reduce((latest, s) => new Date(s.date) > new Date(latest.date) ? s : latest)
      : null,
  }))

  res.status(200).json({
    success: true,
    data: { deadStock },
  })
})

export const addBatch = asyncHandler(async (req, res) => {
  const { productId, quantity, costPrice, expiryDate, manufacturingDate, batchNumber } = req.body

  const product = await Product.findById(productId)
  if (!product) {
    throw new AppError('Product not found', 404)
  }

  const batch = await ProductBatch.create({
    productId,
    batchNumber,
    quantity,
    initialQuantity: quantity,
    costPrice: costPrice || product.costPrice,
    expiryDate,
    manufacturingDate,
  })

  product.stock += quantity
  await product.save()

  res.status(201).json({
    success: true,
    message: 'Batch added successfully',
    data: { batch, newStock: product.stock },
  })
})

export const searchExternalProducts = asyncHandler(async (req, res) => {
  const { q } = req.query
  if (!q) {
    return res.status(200).json({ success: true, data: [] })
  }

  const response = await axios.get(
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&json=1&page_size=20`
  )

  const products = response.data.products
    .map(item => ({
      name: item.product_name,
      image: item.image_url,
    }))
    .filter(p => p.name && p.image)

  res.json(products)
})
