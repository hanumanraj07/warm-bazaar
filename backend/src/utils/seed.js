import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grocery_shop'

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  stock: Number,
  unit: String,
  lowStockThreshold: Number,
  barcode: String,
})

const customerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  totalUdhar: Number,
})

const supplierSchema = new mongoose.Schema({
  name: String,
  phone: String,
  totalPayable: Number,
})

const Product = mongoose.model('Product', productSchema)
const Customer = mongoose.model('Customer', customerSchema)
const Supplier = mongoose.model('Supplier', supplierSchema)
const User = mongoose.model(
  'User',
  new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    isActive: Boolean,
  })
)

const products = [
  { name: 'Aashirvaad Atta 10kg', category: 'Grains', price: 438, stock: 24, unit: 'pcs', lowStockThreshold: 8, barcode: '8901725130011' },
  { name: 'India Gate Basmati Rice', category: 'Grains', price: 92, stock: 110, unit: 'kg', lowStockThreshold: 18, barcode: '8901042955012' },
  { name: 'Fortune Sunflower Oil', category: 'Oil', price: 176, stock: 8, unit: 'ltr', lowStockThreshold: 10, barcode: '8906000140369' },
  { name: 'Saffola Gold Oil', category: 'Oil', price: 214, stock: 5, unit: 'ltr', lowStockThreshold: 8, barcode: '8901088060527' },
  { name: 'Toor Dal Premium', category: 'Pulses', price: 162, stock: 40, unit: 'kg', lowStockThreshold: 10, barcode: '8901234500112' },
  { name: 'Chana Dal', category: 'Pulses', price: 112, stock: 36, unit: 'kg', lowStockThreshold: 10, barcode: '8901234500113' },
  { name: 'Moong Dal', category: 'Pulses', price: 136, stock: 18, unit: 'kg', lowStockThreshold: 8, barcode: '8901234500114' },
  { name: 'Amul Taaza Milk 1L', category: 'Dairy', price: 60, stock: 0, unit: 'ltr', lowStockThreshold: 6, barcode: '8901262030014' },
  { name: 'Amul Butter 500g', category: 'Dairy', price: 288, stock: 14, unit: 'pcs', lowStockThreshold: 5, barcode: '8901262050043' },
  { name: 'Parle-G Family Pack', category: 'Snacks', price: 10, stock: 200, unit: 'pcs', lowStockThreshold: 40, barcode: '8901719120013' },
  { name: 'Maggi 4 Pack', category: 'Snacks', price: 58, stock: 66, unit: 'pcs', lowStockThreshold: 18, barcode: '8901058862618' },
  { name: 'Haldiram Bhujia', category: 'Snacks', price: 68, stock: 26, unit: 'pcs', lowStockThreshold: 10, barcode: '8904069300122' },
  { name: 'Tata Salt 1kg', category: 'Spices', price: 29, stock: 58, unit: 'pcs', lowStockThreshold: 12, barcode: '8901719121003' },
  { name: 'MDH Garam Masala', category: 'Spices', price: 98, stock: 3, unit: 'pcs', lowStockThreshold: 6, barcode: '8901082011013' },
  { name: 'Everest Haldi Powder', category: 'Spices', price: 76, stock: 7, unit: 'pcs', lowStockThreshold: 8, barcode: '8901781120019' },
  { name: 'Bournvita 500g', category: 'Beverages', price: 240, stock: 9, unit: 'pcs', lowStockThreshold: 4, barcode: '8901030879283' },
  { name: 'Red Label Tea 500g', category: 'Beverages', price: 292, stock: 20, unit: 'pcs', lowStockThreshold: 5, barcode: '8901030816226' },
  { name: 'Surf Excel Easy Wash', category: 'Cleaning', price: 216, stock: 15, unit: 'pcs', lowStockThreshold: 5, barcode: '8901030829776' },
  { name: 'Vim Dishwash Bar', category: 'Cleaning', price: 35, stock: 38, unit: 'pcs', lowStockThreshold: 10, barcode: '8901030829684' },
  { name: 'Colgate MaxFresh', category: 'Personal Care', price: 120, stock: 21, unit: 'pcs', lowStockThreshold: 5, barcode: '8901314007257' },
]

const customers = [
  { name: 'Ramesh Kumar', phone: '9876543210', totalUdhar: 3200 },
  { name: 'Sunita Devi', phone: '9988776655', totalUdhar: 5600 },
  { name: 'Arjun Singh', phone: '9123456789', totalUdhar: 1800 },
  { name: 'Priya Sharma', phone: '9567891234', totalUdhar: 4250 },
  { name: 'Manoj Verma', phone: '9345678912', totalUdhar: 3600 },
]

const suppliers = [
  { name: 'Gupta Wholesale Traders', phone: '9811223344', totalPayable: 15200 },
  { name: 'Sharma Dairy Farm', phone: '9922334455', totalPayable: 8400 },
  { name: 'National FMCG Distributors', phone: '9633445566', totalPayable: 10600 },
]

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    await Product.deleteMany({})
    await Customer.deleteMany({})
    await Supplier.deleteMany({})

    const hashedPassword = await bcrypt.hash('admin123', 12)
    await User.findOneAndUpdate(
      { email: 'admin@sharmakirana.com' },
      {
        name: 'Admin',
        email: 'admin@sharmakirana.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
      { upsert: true }
    )

    await Product.insertMany(products)
    await Customer.insertMany(customers)
    await Supplier.insertMany(suppliers)

    console.log('Seed data inserted successfully!')
    console.log(`
📦 Products: ${products.length}
👥 Customers: ${customers.length}
🚚 Suppliers: ${suppliers.length}
🔐 Admin login: admin@sharmakirana.com / admin123
    `)

    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seed()
