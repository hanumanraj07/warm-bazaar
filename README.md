# Warm Bazaar - Grocery Shop Management System

A complete POS (Point of Sale) and inventory management system designed for Indian kirana shops. Built with a mobile-first approach, it helps shopkeepers manage billing, inventory, customer credit (udhar), and supplier payments efficiently.

---

## Features

### 1. Fast Billing (POS)
- **Quick product search** by name, category, or barcode
- **Quick Add grid** for frequently sold items
- **Multiple payment modes**: Cash, UPI, Card, Udhar (credit)
- **Udhar integration**: Link bills to customer accounts for credit sales
- **Cart management**: Add, remove, adjust quantities, apply discounts
- **Real-time stock validation**: Prevents overselling
- **Bill summary**: Shows subtotal, discount, and final amount
- **Profit tracking**: Automatic profit calculation per bill

### 2. Inventory Management
- **Product catalog**: View all products with stock levels
- **Category filtering**: Filter by categories (Grains, Beverages, Snacks, Spices, etc.)
- **Search functionality**: Find products by name or category
- **Low stock alerts**: Visual indicators for items below threshold
- **Quick stock view**: Stats showing total, low stock, and out of stock counts
- **Add/Edit products**: Name, category, price, cost price, quantity, unit, GST rate, HSN code
- **Delete products**: Soft delete to preserve history
- **Batch inventory**: Track products with expiry dates using FIFO method

### 3. Profit Tracking System
- **Cost price tracking**: Add cost price to each product
- **Automatic profit calculation**: Profit = Selling Price - Cost Price
- **Profit per item**: Track profit on each sale
- **Daily profit**: View today's profit on dashboard
- **Monthly profit**: Track net profit after expenses
- **Profit margin display**: Show profit percentage in product sheet

### 4. Expiry Date Management
- **Batch tracking**: Track inventory by batch with expiry dates
- **FIFO system**: Reduce stock from oldest batch first
- **Expiry alerts**: Products expiring in 2 days highlighted
- **Expired items**: Track and manage expired inventory
- **Batch history**: View batch details for each product

### 5. Smart Reorder System
- **Sales history tracking**: Track daily sales per product
- **Average daily sales**: Calculate based on last 7 days
- **Reorder suggestions**: "Based on sales, reorder X units"
- **Days until stock out**: Predict when stock will deplete
- **Priority ranking**: HIGH/MEDIUM/LOW based on urgency

### 6. Customer Management (Udhar Ledger)
- **Customer directory**: Search and view all customers
- **Outstanding balance tracking**: Total pending udhar amount
- **Transaction history**: View past bills and payments per customer
- **Record payments**: Add payments against outstanding balances
- **Quick actions**: Call or send WhatsApp reminder directly
- **Add new customers**: Name, phone, email, address
- **Balance calculation**: Automatically calculates pending amounts
- **Repeat Order**: Get last order for quick reordering

### 7. Supplier Management (Purchase Ledger)
- **Supplier directory**: Track all vendors/suppliers
- **Payable tracking**: Monitor amounts owed to suppliers
- **Purchase history**: Log purchases from suppliers
- **Payment recording**: Track payments made to suppliers
- **Add new suppliers**: Name, business name, phone, email, address
- **Running balance**: See balance after each transaction

### 8. Dashboard
- **Today's sales**: Total revenue and bills for current day
- **Today's profit**: Daily profit calculation
- **Weekly sales chart**: 7-day sales trend visualization
- **Financial overview**:
  - Monthly revenue
  - Monthly profit (after expenses)
  - Total udhar (customer receivables)
  - Total payable (supplier payables)
- **Low stock alerts**: Products needing restock
- **Expiring soon alerts**: Products expiring within 2 days
- **Cash status**: Day open/close status
- **Recent bills**: Last 5 transactions with profit
- **Top selling products**: Best performers by quantity

### 9. Bill Edit / Return System
- **Edit bills**: Modify bill items before closing
- **Return flow**: Select bill → return items
- **Partial returns**: Return specific items from a bill
- **Stock restoration**: Automatically update stock on return
- **Amount tracking**: Track original, updated, and return amounts
- **Status updates**: COMPLETED → PARTIAL_RETURN → REFUNDED

### 10. Daily Closing System
- **Open day**: Start tracking cash for the day
- **Set opening cash**: Initial cash amount
- **Close day**: End of day cash reconciliation
- **Expected vs Actual**: Detect cash mismatches
- **Variance tracking**: Alert on cash discrepancies
- **Day summary**: Total sales, expenses, payments breakdown

### 11. Cash Management
- **Opening cash**: Track starting cash for the day
- **Closing cash**: End of day cash count
- **Expected cash**: Calculate based on transactions
- **Variance detection**: Alert on mismatches
- **Cash logs**: History of all cash movements
- **Adjustments**: Record cash adjustments with reasons

### 12. Advanced Reports
- **Sales by date**: Daily/weekly/monthly trends
- **Sales by category**: Revenue breakdown by product category
- **Sales by payment mode**: Cash/UPI/Card/Udhar distribution
- **Profit report**: Gross profit, expenses, net profit
- **Top profitable items**: Best margin products
- **Custom date range**: Filter reports by period

### 13. Smart Alerts System
- **Low stock alerts**: Products below threshold
- **Out of stock alerts**: Products with zero stock
- **Expiring soon alerts**: Products expiring within 2 days
- **High udhar alerts**: Customers with high outstanding
- **Pending payments**: Suppliers with pending payables
- **Severity levels**: CRITICAL/HIGH/MEDIUM/LOW
- **Actionable insights**: Direct links to relevant pages

### 14. AI Insights (Lightweight)
- **Best selling products**: Top performers this week
- **Peak hours**: Busiest times of day
- **High udhar customers**: Customers needing follow-up
- **Stock health**: Overview of inventory status
- **Recommendations**: Actionable business suggestions

### 15. Data Export System
- **Export products**: CSV with all product details
- **Export customers**: Customer list with udhar status
- **Export suppliers**: Supplier list with payable status
- **Export bills**: Recent bills with profit data

### 16. Authentication & Security
- **JWT-based authentication**: Secure login system
- **Role-based access**: Admin and Staff roles
- **Session management**: Persistent login with token storage
- **Staff restrictions**: Can create bills but cannot delete data
- **Logout functionality**: Secure session termination

---

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **React Query (TanStack Query)** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Validation
- **Express Rate Limit** - Rate limiting
- **Helmet** - Security headers
- **Morgan** - Logging
- **CORS** - Cross-origin support

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone and Install Frontend Dependencies
```bash
cd GroceryShop
npm install
```

### 2. Setup Backend
```bash
cd backend
npm install
```

### 3. Configure Environment
Create a `.env` file in the `backend` folder:
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/grocery_shop
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@sharmakirana.com
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:5173
```

### 4. Start MongoDB
Ensure MongoDB is running locally or use a cloud connection string.

### 5. Run the Application

**Backend:**
```bash
cd backend
npm run start
# Server runs on http://localhost:4000
# Admin user auto-created on first run
```

**Frontend:**
```bash
npm run dev
# App runs on http://localhost:5173 (or next available port)
```

### Default Login Credentials
- **Email**: admin@sharmakirana.com
- **Password**: admin123

---

## API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/setup` | Create admin user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/low-stock` | Get low stock products |
| GET | `/api/products/reorder-suggestions` | Get reorder suggestions |
| GET | `/api/products/expiring` | Get expiring products |
| GET | `/api/products/dead-stock` | Get dead stock products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| PATCH | `/api/products/:id/stock` | Update stock |
| POST | `/api/products/:id/batch` | Add product batch |
| DELETE | `/api/products/:id` | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all customers |
| GET | `/api/customers/:id` | Get single customer |
| GET | `/api/customers/:id/last-order` | Get last order |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Soft delete customer |

### Suppliers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/suppliers` | List all suppliers |
| GET | `/api/suppliers/:id` | Get single supplier |
| POST | `/api/suppliers` | Create supplier |
| PUT | `/api/suppliers/:id` | Update supplier |
| DELETE | `/api/suppliers/:id` | Soft delete supplier |

### Bills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bills` | List all bills |
| GET | `/api/bills/recent` | Get recent bills |
| GET | `/api/bills/:id` | Get single bill |
| GET | `/api/bills/:id/pdf` | Get bill PDF data |
| POST | `/api/bills` | Create new bill |
| PATCH | `/api/bills/:id/edit` | Edit bill |
| POST | `/api/bills/:id/return` | Process return |
| PATCH | `/api/bills/:id/cancel` | Cancel a bill |

### Purchases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/purchases` | List all purchases |
| GET | `/api/purchases/:id` | Get single purchase |
| POST | `/api/purchases` | Create purchase |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | List all payments |
| POST | `/api/payments/customer` | Record customer payment |
| POST | `/api/payments/supplier` | Record supplier payment |

### Cash Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cash/today` | Get today's cash status |
| GET | `/api/cash/logs` | Get cash logs |
| POST | `/api/cash/open` | Open day |
| POST | `/api/cash/close` | Close day |
| POST | `/api/cash/adjust` | Add cash adjustment |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Get dashboard data |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/sales` | Get sales report |
| GET | `/api/reports/profit` | Get profit report |
| GET | `/api/reports/insights` | Get AI insights |
| GET | `/api/reports/alerts` | Get all alerts |
| GET | `/api/reports/export` | Export data (CSV) |

---

## Data Models

### Product
- name, category, price, costPrice, stock, unit, lowStockThreshold, barcode, hsnCode, gstRate, salesHistory, totalSold, totalRevenue, totalCost

### ProductBatch
- productId, batchNumber, quantity, initialQuantity, costPrice, expiryDate, manufacturingDate, supplierId

### Customer
- name, phone, email, address, totalUdhar, isActive

### Supplier
- name, businessName, phone, email, address, totalPayable, isActive

### Bill
- items[], subtotal, discount, totalAmount, originalAmount, returnAmount, paymentMode, customerId, billStatus, returns[], profit, costAmount

### Purchase
- supplierId, items[], totalAmount, status

### Payment
- type (customer/supplier), referenceId, amount, mode, notes

### DayClose
- date, openingCash, closingCash, expectedCash, actualCash, variance, totalSales, totalBills, cashSales, upiSales, cardSales, udharSales, totalProfit, totalExpenses, isClosed

### CashLog
- type, amount, paymentMode, description, expectedCash, actualCash, variance

### Alert
- type, severity, title, message, referenceId, referenceType, isRead, isDismissed

---

## Project Structure

```
GroceryShop/
├── src/
│   ├── App.jsx              # Main app with routing
│   ├── main.jsx             # Entry point
│   ├── index.css            # Global styles
│   ├── pages/               # Page components
│   │   ├── Billing.jsx
│   │   ├── Inventory.jsx
│   │   ├── Customers.jsx
│   │   ├── Suppliers.jsx
│   │   ├── Dashboard.jsx
│   │   └── Login.jsx
│   ├── components/          # Reusable components
│   │   ├── billing/
│   │   ├── inventory/
│   │   ├── customers/
│   │   ├── suppliers/
│   │   ├── dashboard/
│   │   └── ui/
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API services
│   ├── store/               # Zustand store
│   ├── utils/               # Helper functions
│   └── mockData.js          # Mock data for reference
├── backend/
│   └── src/
│       ├── server.js        # Express app
│       ├── config/          # Configuration
│       ├── models/          # Mongoose models
│       ├── controllers/      # Business logic
│       ├── routes/          # API routes
│       ├── middleware/      # Auth, validation, errors
│       └── utils/           # Utilities
└── README.md
```

---

## Features in Detail

### Warm Bazaar Theme
- **Primary Color**: Forest Green (#1B4332)
- **Accent Color**: Saffron Orange (#F4A261)
- **Dark accents** for sidebar and headers
- **Soft gradients** and shadows
- **Smooth animations** with Framer Motion

### Mobile-First Design
- Bottom navigation bar on mobile
- Sidebar navigation on desktop
- Touch-friendly targets (44px minimum)
- Safe area support for notched devices
- Responsive grid layouts

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

---

## License

MIT License - Feel free to use and modify for your shop!
