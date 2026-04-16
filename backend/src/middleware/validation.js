import { z } from 'zod'

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))

        return res.status(400).json({
          success: false,
          status: 'fail',
          message: 'Validation Error',
          errors,
        })
      }

      return res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Invalid input data',
      })
    }
  }
}

export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.query)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))

        return res.status(400).json({
          success: false,
          status: 'fail',
          message: 'Invalid query parameters',
          errors,
        })
      }

      next()
    }
  }
}

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  category: z.string().default('General'),
  price: z.any(),
  costPrice: z.any().optional(),
  stock: z.any().optional(),
  unit: z.string().default('pcs'),
  lowStockThreshold: z.any().optional(),
  barcode: z.string().optional(),
  hsnCode: z.string().optional(),
  gstRate: z.any().optional(),
  expiryDate: z.string().optional(),
  manufacturingDate: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.string().optional(),
  price: z.any().optional(),
  costPrice: z.any().optional(),
  stock: z.any().optional(),
  unit: z.string().optional(),
  lowStockThreshold: z.any().optional(),
  barcode: z.string().optional(),
  hsnCode: z.string().optional(),
  gstRate: z.any().optional(),
  isActive: z.boolean().optional(),
})

export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required').max(100),
  phone: z.string().max(15).optional(),
  email: z.string().optional().transform(v => v || undefined),
  address: z.string().optional().transform(v => v || undefined),
})

export const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').max(100),
  phone: z.string().max(15).optional(),
  email: z.string().optional().transform(v => v || undefined),
  address: z.string().optional().transform(v => v || undefined),
  businessName: z.string().optional().transform(v => v || undefined),
})

export const billItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1),
  price: z.number().min(0),
  costPrice: z.number().min(0).optional(),
  quantity: z.number().int().min(1),
  total: z.number().min(0),
  costTotal: z.number().min(0).optional(),
})

export const billSchema = z.object({
  items: z.array(billItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().min(0),
  discount: z.number().min(0).optional().default(0),
  totalAmount: z.number().min(0),
  paymentMode: z.enum(['CASH', 'UPI', 'CARD', 'UDHAR']),
  customerId: z.string().optional(),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
})

export const purchaseItemSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(1),
  quantity: z.number().int().min(1),
  unit: z.enum(['kg', 'ltr', 'pcs', 'g', 'ml', 'dozen', 'pack']).optional().default('pcs'),
  costPrice: z.number().min(0),
  total: z.number().min(0),
})

export const purchaseSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
  totalAmount: z.number().min(0),
  paidAmount: z.number().min(0).optional().default(0),
  notes: z.string().optional(),
})

export const paymentSchema = z.object({
  type: z.enum(['CUSTOMER', 'SUPPLIER']),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  amount: z.number().min(1, 'Amount must be at least 1'),
  paymentMode: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'OTHER']).optional().default('CASH'),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

export const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  amount: z.number().min(1, 'Amount must be at least 1'),
  category: z.enum([
    'RENT',
    'ELECTRICITY',
    'WATER',
    'SALARY',
    'TRANSPORT',
    'MAINTENANCE',
    'SUPPLIES',
    'OTHER',
  ]).optional().default('OTHER'),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
