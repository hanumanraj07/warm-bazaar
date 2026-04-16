const today = '2026-03-23'

export const shopProfile = {
  name: 'Sharma Kirana & General Store',
  tagline: 'Daily billing, stock, and ledger control for a busy neighbourhood shop.',
}

export const categories = [
  'All',
  'Grains',
  'Oil',
  'Snacks',
  'Dairy',
  'Spices',
  'Beverages',
  'Cleaning',
  'Personal Care',
  'Pulses',
]

export const units = ['kg', 'ltr', 'pcs', 'g', 'ml', 'dozen', 'pack']

export const products = [
  { id: 'p1', name: 'Aashirvaad Atta 10kg', category: 'Grains', price: 438, stock: 24, unit: 'pcs', lowThreshold: 8, barcode: '8901725130011' },
  { id: 'p2', name: 'India Gate Basmati Rice', category: 'Grains', price: 92, stock: 110, unit: 'kg', lowThreshold: 18, barcode: '8901042955012' },
  { id: 'p3', name: 'Fortune Sunflower Oil', category: 'Oil', price: 176, stock: 8, unit: 'ltr', lowThreshold: 10, barcode: '8906000140369' },
  { id: 'p4', name: 'Saffola Gold Oil', category: 'Oil', price: 214, stock: 5, unit: 'ltr', lowThreshold: 8, barcode: '8901088060527' },
  { id: 'p5', name: 'Toor Dal Premium', category: 'Pulses', price: 162, stock: 40, unit: 'kg', lowThreshold: 10, barcode: '8901234500112' },
  { id: 'p6', name: 'Chana Dal', category: 'Pulses', price: 112, stock: 36, unit: 'kg', lowThreshold: 10, barcode: '8901234500113' },
  { id: 'p7', name: 'Moong Dal', category: 'Pulses', price: 136, stock: 18, unit: 'kg', lowThreshold: 8, barcode: '8901234500114' },
  { id: 'p8', name: 'Amul Taaza Milk 1L', category: 'Dairy', price: 60, stock: 0, unit: 'ltr', lowThreshold: 6, barcode: '8901262030014' },
  { id: 'p9', name: 'Amul Butter 500g', category: 'Dairy', price: 288, stock: 14, unit: 'pcs', lowThreshold: 5, barcode: '8901262050043' },
  { id: 'p10', name: 'Parle-G Family Pack', category: 'Snacks', price: 10, stock: 200, unit: 'pcs', lowThreshold: 40, barcode: '8901719120013' },
  { id: 'p11', name: 'Maggi 4 Pack', category: 'Snacks', price: 58, stock: 66, unit: 'pcs', lowThreshold: 18, barcode: '8901058862618' },
  { id: 'p12', name: 'Haldiram Bhujia', category: 'Snacks', price: 68, stock: 26, unit: 'pcs', lowThreshold: 10, barcode: '8904069300122' },
  { id: 'p13', name: 'Tata Salt 1kg', category: 'Spices', price: 29, stock: 58, unit: 'pcs', lowThreshold: 12, barcode: '8901719121003' },
  { id: 'p14', name: 'MDH Garam Masala', category: 'Spices', price: 98, stock: 3, unit: 'pcs', lowThreshold: 6, barcode: '8901082011013' },
  { id: 'p15', name: 'Everest Haldi Powder', category: 'Spices', price: 76, stock: 7, unit: 'pcs', lowThreshold: 8, barcode: '8901781120019' },
  { id: 'p16', name: 'Bournvita 500g', category: 'Beverages', price: 240, stock: 9, unit: 'pcs', lowThreshold: 4, barcode: '8901030879283' },
  { id: 'p17', name: 'Red Label Tea 500g', category: 'Beverages', price: 292, stock: 20, unit: 'pcs', lowThreshold: 5, barcode: '8901030816226' },
  { id: 'p18', name: 'Surf Excel Easy Wash', category: 'Cleaning', price: 216, stock: 15, unit: 'pcs', lowThreshold: 5, barcode: '8901030829776' },
  { id: 'p19', name: 'Vim Dishwash Bar', category: 'Cleaning', price: 35, stock: 38, unit: 'pcs', lowThreshold: 10, barcode: '8901030829684' },
  { id: 'p20', name: 'Colgate MaxFresh', category: 'Personal Care', price: 120, stock: 21, unit: 'pcs', lowThreshold: 5, barcode: '8901314007257' },
]

export const customers = [
  {
    id: 'c1',
    name: 'Ramesh Kumar',
    phone: '9876543210',
    pending: 3200,
    transactions: [
      { id: 'ct1', date: `${today}T10:25:00`, type: 'BILL', amount: 1450, description: 'Bill #BK1023' },
      { id: 'ct2', date: '2026-03-22T14:10:00', type: 'PAYMENT', amount: 1000, description: 'Cash payment received' },
      { id: 'ct3', date: '2026-03-20T11:00:00', type: 'BILL', amount: 2750, description: 'Bill #BK1018' },
    ],
  },
  {
    id: 'c2',
    name: 'Sunita Devi',
    phone: '9988776655',
    pending: 5600,
    transactions: [
      { id: 'ct4', date: `${today}T09:02:00`, type: 'BILL', amount: 3200, description: 'Bill #BK1022' },
      { id: 'ct5', date: '2026-03-21T16:30:00', type: 'BILL', amount: 2400, description: 'Bill #BK1019' },
    ],
  },
  {
    id: 'c3',
    name: 'Arjun Singh',
    phone: '9123456789',
    pending: 1800,
    transactions: [
      { id: 'ct6', date: '2026-03-22T12:00:00', type: 'BILL', amount: 800, description: 'Bill #BK1020' },
      { id: 'ct7', date: '2026-03-20T18:00:00', type: 'PAYMENT', amount: 1000, description: 'UPI payment received' },
      { id: 'ct8', date: '2026-03-19T10:00:00', type: 'BILL', amount: 2000, description: 'Bill #BK1015' },
    ],
  },
  {
    id: 'c4',
    name: 'Priya Sharma',
    phone: '9567891234',
    pending: 4250,
    transactions: [
      { id: 'ct9', date: `${today}T08:35:00`, type: 'BILL', amount: 4250, description: 'Bill #BK1024' },
    ],
  },
  {
    id: 'c5',
    name: 'Manoj Verma',
    phone: '9345678912',
    pending: 3600,
    transactions: [
      { id: 'ct10', date: '2026-03-21T11:00:00', type: 'BILL', amount: 5600, description: 'Bill #BK1017' },
      { id: 'ct11', date: '2026-03-22T09:30:00', type: 'PAYMENT', amount: 2000, description: 'Cash payment received' },
    ],
  },
]

export const suppliers = [
  {
    id: 's1',
    name: 'Gupta Wholesale Traders',
    phone: '9811223344',
    pending: 15200,
    lastPurchase: '2026-03-22',
    purchases: [
      { id: 'sp1', date: '2026-03-22', items: 'Rice, Atta, Dal', qty: '185 kg', amount: 8500, paid: 0 },
      { id: 'sp2', date: '2026-03-18', items: 'Oil, Spices', qty: '84 pcs', amount: 12000, paid: 5300 },
    ],
    payments: [{ id: 'spp1', date: '2026-03-20', amount: 5300, mode: 'NEFT' }],
  },
  {
    id: 's2',
    name: 'Sharma Dairy Farm',
    phone: '9922334455',
    pending: 8400,
    lastPurchase: today,
    purchases: [
      { id: 'sp3', date: today, items: 'Milk, Butter, Paneer', qty: '72 units', amount: 4200, paid: 0 },
      { id: 'sp4', date: '2026-03-20', items: 'Milk, Curd', qty: '60 units', amount: 4200, paid: 0 },
    ],
    payments: [],
  },
  {
    id: 's3',
    name: 'National FMCG Distributors',
    phone: '9633445566',
    pending: 10600,
    lastPurchase: '2026-03-21',
    purchases: [
      { id: 'sp5', date: '2026-03-21', items: 'Biscuits, Noodles, Tea, Namkeen', qty: '132 cartons', amount: 18600, paid: 8000 },
    ],
    payments: [{ id: 'spp2', date: '2026-03-21', amount: 8000, mode: 'UPI' }],
  },
]

export const bills = [
  {
    id: 'b1',
    time: `${today}T17:30:00`,
    amount: 485,
    mode: 'Cash',
    customer: null,
    discount: 0,
    items: [
      { productId: 'p10', name: 'Parle-G Family Pack', qty: 5, price: 10 },
      { productId: 'p13', name: 'Tata Salt 1kg', qty: 3, price: 29 },
      { productId: 'p11', name: 'Maggi 4 Pack', qty: 2, price: 58 },
      { productId: 'p19', name: 'Vim Dishwash Bar', qty: 2, price: 35 },
    ],
  },
  {
    id: 'b2',
    time: `${today}T16:15:00`,
    amount: 1240,
    mode: 'UPI',
    customer: null,
    discount: 20,
    items: [
      { productId: 'p2', name: 'India Gate Basmati Rice', qty: 5, price: 92 },
      { productId: 'p3', name: 'Fortune Sunflower Oil', qty: 2, price: 176 },
      { productId: 'p13', name: 'Tata Salt 1kg', qty: 4, price: 29 },
      { productId: 'p15', name: 'Everest Haldi Powder', qty: 4, price: 76 },
    ],
  },
  {
    id: 'b3',
    time: `${today}T15:00:00`,
    amount: 3200,
    mode: 'Udhar',
    customer: 'Sunita Devi',
    discount: 0,
    items: [
      { productId: 'p1', name: 'Aashirvaad Atta 10kg', qty: 4, price: 438 },
      { productId: 'p5', name: 'Toor Dal Premium', qty: 5, price: 162 },
      { productId: 'p3', name: 'Fortune Sunflower Oil', qty: 3, price: 176 },
      { productId: 'p10', name: 'Parle-G Family Pack', qty: 6, price: 10 },
    ],
  },
  {
    id: 'b4',
    time: `${today}T13:45:00`,
    amount: 750,
    mode: 'Cash',
    customer: null,
    discount: 0,
    items: [
      { productId: 'p11', name: 'Maggi 4 Pack', qty: 5, price: 58 },
      { productId: 'p12', name: 'Haldiram Bhujia', qty: 4, price: 68 },
      { productId: 'p13', name: 'Tata Salt 1kg', qty: 2, price: 29 },
      { productId: 'p19', name: 'Vim Dishwash Bar', qty: 4, price: 35 },
    ],
  },
  {
    id: 'b5',
    time: `${today}T12:00:00`,
    amount: 1450,
    mode: 'Udhar',
    customer: 'Ramesh Kumar',
    discount: 0,
    items: [
      { productId: 'p2', name: 'India Gate Basmati Rice', qty: 6, price: 92 },
      { productId: 'p5', name: 'Toor Dal Premium', qty: 4, price: 162 },
      { productId: 'p17', name: 'Red Label Tea 500g', qty: 1, price: 292 },
    ],
  },
  {
    id: 'b6',
    time: '2026-03-22T18:40:00',
    amount: 1690,
    mode: 'UPI',
    customer: null,
    discount: 0,
    items: [
      { productId: 'p1', name: 'Aashirvaad Atta 10kg', qty: 2, price: 438 },
      { productId: 'p2', name: 'India Gate Basmati Rice', qty: 4, price: 92 },
      { productId: 'p3', name: 'Fortune Sunflower Oil', qty: 2, price: 176 },
      { productId: 'p9', name: 'Amul Butter 500g', qty: 1, price: 288 },
    ],
  },
  {
    id: 'b7',
    time: '2026-03-21T19:10:00',
    amount: 2080,
    mode: 'Cash',
    customer: null,
    discount: 50,
    items: [
      { productId: 'p5', name: 'Toor Dal Premium', qty: 7, price: 162 },
      { productId: 'p11', name: 'Maggi 4 Pack', qty: 5, price: 58 },
      { productId: 'p16', name: 'Bournvita 500g', qty: 2, price: 240 },
      { productId: 'p17', name: 'Red Label Tea 500g', qty: 1, price: 292 },
    ],
  },
  {
    id: 'b8',
    time: '2026-03-20T17:25:00',
    amount: 980,
    mode: 'UPI',
    customer: null,
    discount: 0,
    items: [
      { productId: 'p10', name: 'Parle-G Family Pack', qty: 10, price: 10 },
      { productId: 'p12', name: 'Haldiram Bhujia', qty: 5, price: 68 },
      { productId: 'p15', name: 'Everest Haldi Powder', qty: 5, price: 76 },
      { productId: 'p19', name: 'Vim Dishwash Bar', qty: 5, price: 35 },
    ],
  },
  {
    id: 'b9',
    time: '2026-03-19T15:55:00',
    amount: 1380,
    mode: 'Cash',
    customer: null,
    discount: 0,
    items: [
      { productId: 'p2', name: 'India Gate Basmati Rice', qty: 5, price: 92 },
      { productId: 'p6', name: 'Chana Dal', qty: 4, price: 112 },
      { productId: 'p13', name: 'Tata Salt 1kg', qty: 2, price: 29 },
      { productId: 'p10', name: 'Parle-G Family Pack', qty: 8, price: 10 },
    ],
  },
  {
    id: 'b10',
    time: '2026-03-18T14:20:00',
    amount: 2210,
    mode: 'UPI',
    customer: null,
    discount: 0,
    items: [
      { productId: 'p1', name: 'Aashirvaad Atta 10kg', qty: 3, price: 438 },
      { productId: 'p3', name: 'Fortune Sunflower Oil', qty: 4, price: 176 },
      { productId: 'p17', name: 'Red Label Tea 500g', qty: 2, price: 292 },
      { productId: 'p9', name: 'Amul Butter 500g', qty: 1, price: 288 },
    ],
  },
]

export const quickAddIds = ['p10', 'p2', 'p5', 'p3', 'p1', 'p11', 'p13', 'p17']

export function createMockDatabase() {
  return {
    products: structuredClone(products),
    customers: structuredClone(customers),
    suppliers: structuredClone(suppliers),
    bills: structuredClone(bills),
  }
}
