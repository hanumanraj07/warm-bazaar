import { categories, createMockDatabase, quickAddIds } from '../mockData'
import { generateId, isSameDay } from '../utils/helpers'

let db = createMockDatabase()

const delay = (payload, timeout = 120) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(payload)), timeout)
  })

const sortByDateDesc = (collection, key) =>
  [...collection].sort((left, right) => new Date(right[key]) - new Date(left[key]))

const sortAlphabetically = (collection, key) => [...collection].sort((left, right) => left[key].localeCompare(right[key]))

const lastSevenDaysLabels = () => {
  const dates = []
  const now = new Date()
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now)
    date.setDate(now.getDate() - offset)
    dates.push({
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
    })
  }
  return dates
}

const getDashboardSnapshot = () => {
  const todaySales = db.bills
    .filter((bill) => isSameDay(bill.time))
    .reduce((sum, bill) => sum + bill.amount, 0)

  const todayBills = db.bills.filter((bill) => isSameDay(bill.time)).length

  const now = new Date()
  const monthlyRevenue = db.bills
    .filter((bill) => {
      const billDate = new Date(bill.time)
      return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, bill) => sum + bill.amount, 0)

  const monthlyExpenses = db.suppliers
    .flatMap((supplier) => supplier.purchases)
    .filter((purchase) => {
      const purchaseDate = new Date(purchase.date)
      return (
        purchaseDate.getMonth() === now.getMonth() &&
        purchaseDate.getFullYear() === now.getFullYear()
      )
    })
    .reduce((sum, purchase) => sum + purchase.amount, 0)

  const weeklyChart = lastSevenDaysLabels().map(({ key, label }) => ({
    day: label,
    amount: db.bills
      .filter((bill) => bill.time.slice(0, 10) === key)
      .reduce((sum, bill) => sum + bill.amount, 0),
  }))

  const topSellingMap = new Map()
  db.bills.forEach((bill) => {
    bill.items.forEach((item) => {
      const current = topSellingMap.get(item.productId) ?? { name: item.name, sold: 0 }
      current.sold += item.qty
      topSellingMap.set(item.productId, current)
    })
  })

  return {
    todaySales,
    todayBills,
    monthlyRevenue,
    totalUdhar: db.customers.reduce((sum, customer) => sum + customer.pending, 0),
    totalPayable: db.suppliers.reduce((sum, supplier) => sum + supplier.pending, 0),
    monthlyExpenses,
    weeklyChart,
    lowStock: db.products
      .filter((product) => product.stock <= product.lowThreshold)
      .sort((left, right) => left.stock - right.stock)
      .slice(0, 5),
    recentBills: sortByDateDesc(db.bills, 'time').slice(0, 5),
    topSelling: [...topSellingMap.values()].sort((left, right) => right.sold - left.sold).slice(0, 6),
  }
}

export const mockApi = {
  getProducts: async () => delay(sortAlphabetically(db.products, 'name')),

  createProduct: async (product) => {
    const created = { ...product, id: generateId('product') }
    db.products = [created, ...db.products]
    return delay(created)
  },

  updateProduct: async (productId, updates) => {
    let updatedProduct = null
    db.products = db.products.map((product) => {
      if (product.id !== productId) return product
      updatedProduct = { ...product, ...updates }
      return updatedProduct
    })
    return delay(updatedProduct)
  },

  deleteProduct: async (productId) => {
    db.products = db.products.filter((product) => product.id !== productId)
    return delay({ success: true, productId })
  },

  getCustomers: async () =>
    delay(
      sortAlphabetically(db.customers, 'name').map((customer) => ({
        ...customer,
        transactions: sortByDateDesc(customer.transactions, 'date'),
      })),
    ),

  addCustomerPayment: async ({ customerId, amount, mode = 'Cash' }) => {
    let updatedCustomer = null
    db.customers = db.customers.map((customer) => {
      if (customer.id !== customerId) return customer
      updatedCustomer = {
        ...customer,
        pending: Math.max(0, customer.pending - amount),
        transactions: [
          {
            id: generateId('payment'),
            date: new Date().toISOString(),
            type: 'PAYMENT',
            amount,
            description: `${mode} payment received`,
          },
          ...customer.transactions,
        ],
      }
      return updatedCustomer
    })
    return delay(updatedCustomer)
  },

  getSuppliers: async () =>
    delay(
      sortAlphabetically(db.suppliers, 'name').map((supplier) => ({
        ...supplier,
        payments: sortByDateDesc(supplier.payments, 'date'),
        purchases: sortByDateDesc(supplier.purchases, 'date'),
      })),
    ),

  addSupplierPayment: async ({ supplierId, amount, mode = 'Cash' }) => {
    let updatedSupplier = null
    db.suppliers = db.suppliers.map((supplier) => {
      if (supplier.id !== supplierId) return supplier
      updatedSupplier = {
        ...supplier,
        pending: Math.max(0, supplier.pending - amount),
        payments: [
          {
            id: generateId('supplier_payment'),
            date: new Date().toISOString().slice(0, 10),
            amount,
            mode,
          },
          ...supplier.payments,
        ],
      }
      return updatedSupplier
    })
    return delay(updatedSupplier)
  },

  addSupplierPurchase: async ({ supplierId, items, qty, amount }) => {
    let updatedSupplier = null
    db.suppliers = db.suppliers.map((supplier) => {
      if (supplier.id !== supplierId) return supplier
      updatedSupplier = {
        ...supplier,
        pending: supplier.pending + amount,
        lastPurchase: new Date().toISOString().slice(0, 10),
        purchases: [
          {
            id: generateId('supplier_purchase'),
            date: new Date().toISOString().slice(0, 10),
            items,
            qty,
            amount,
            paid: 0,
          },
          ...supplier.purchases,
        ],
      }
      return updatedSupplier
    })
    return delay(updatedSupplier)
  },

  getBills: async () => delay(sortByDateDesc(db.bills, 'time')),

  saveBill: async ({ cart, paymentMode, customerId, discount }) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
    const total = Math.max(0, subtotal - (Number(discount) || 0))
    const selectedCustomer = db.customers.find((customer) => customer.id === customerId) ?? null

    const bill = {
      id: generateId('bill').slice(0, 10).toUpperCase(),
      time: new Date().toISOString(),
      amount: total,
      mode: paymentMode,
      customer: paymentMode === 'Udhar' ? selectedCustomer?.name ?? null : null,
      discount: Number(discount) || 0,
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
      })),
    }

    db.products = db.products.map((product) => {
      const soldItem = cart.find((item) => item.id === product.id)
      if (!soldItem) return product
      return {
        ...product,
        stock: Math.max(0, product.stock - soldItem.qty),
      }
    })

    if (paymentMode === 'Udhar' && selectedCustomer) {
      db.customers = db.customers.map((customer) => {
        if (customer.id !== selectedCustomer.id) return customer
        return {
          ...customer,
          pending: customer.pending + total,
          transactions: [
            {
              id: generateId('ledger'),
              date: bill.time,
              type: 'BILL',
              amount: total,
              description: `Bill #${bill.id}`,
            },
            ...customer.transactions,
          ],
        }
      })
    }

    db.bills = [bill, ...db.bills]

    return delay({
      bill,
      lowStockProducts: db.products.filter((product) => product.stock > 0 && product.stock <= product.lowThreshold),
    })
  },

  getDashboard: async () => delay(getDashboardSnapshot()),

  getQuickAddProducts: async () =>
    delay(
      quickAddIds
        .map((id) => db.products.find((product) => product.id === id))
        .filter(Boolean),
    ),

  getCategories: async () => delay(categories),
}
