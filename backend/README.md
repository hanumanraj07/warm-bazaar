# Grocery Shop Management API

A production-grade REST API backend for a grocery shop management system (POS + Inventory + Ledger).

## Features

- **Authentication**: JWT-based single shop owner authentication
- **Products**: Full CRUD with stock management and low-stock alerts
- **Customers**: Udhar (credit) ledger management
- **Suppliers**: Payables ledger management
- **Billing**: Create bills with automatic stock reduction
- **Purchases**: Track supplier purchases with inventory updates
- **Payments**: Record customer/supplier payments
- **Expenses**: Track shop expenses by category
- **Dashboard**: Real-time summary with sales analytics

## Tech Stack

- **Runtime**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Create a `.env` file (see `.env.example` for reference):

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/grocery_shop
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@sharmakirana.com
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:5173
```

### Run the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### Seed Database

```bash
npm run seed
```

This creates:
- 20 sample products
- 5 customers
- 3 suppliers
- Admin user: `admin@sharmakirana.com` / `admin123`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/me` | Get current user |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/low-stock` | Get low stock products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| PATCH | `/api/products/:id/stock` | Update stock only |
| DELETE | `/api/products/:id` | Delete product |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all customers |
| GET | `/api/customers/:id` | Get single customer |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

### Suppliers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/suppliers` | List all suppliers |
| GET | `/api/suppliers/:id` | Get single supplier |
| POST | `/api/suppliers` | Create supplier |
| PUT | `/api/suppliers/:id` | Update supplier |
| DELETE | `/api/suppliers/:id` | Delete supplier |

### Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bills` | List all bills |
| GET | `/api/bills/recent` | Get recent bills |
| GET | `/api/bills/:id` | Get single bill |
| POST | `/api/bills` | Create bill |
| PATCH | `/api/bills/:id/cancel` | Cancel bill |

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

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List all expenses |
| POST | `/api/expenses` | Create expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Get dashboard data |

## Example API Responses

### Login Response

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f...",
      "name": "Admin",
      "email": "admin@sharmakirana.com",
      "role": "ADMIN"
    }
  }
}
```

### Dashboard Summary

```json
{
  "success": true,
  "data": {
    "todaySales": 4280,
    "todayBills": 23,
    "monthlyRevenue": 85600,
    "monthlyBills": 456,
    "totalUdhar": 18450,
    "totalPayable": 34200,
    "monthlyExpenses": 12500,
    "lowStock": [
      {
        "_id": "64f...",
        "name": "Fortune Sunflower Oil",
        "stock": 8,
        "lowStockThreshold": 10,
        "unit": "ltr"
      }
    ],
    "weeklyChart": [
      { "day": "Mon", "amount": 3200, "count": 15 },
      { "day": "Tue", "amount": 4500, "count": 22 }
    ]
  }
}
```

### Create Bill

```json
{
  "success": true,
  "message": "Bill created successfully",
  "data": {
    "bill": {
      "_id": "64f...",
      "billNumber": "BILL1234",
      "items": [...],
      "totalAmount": 1240,
      "paymentMode": "CASH",
      "createdAt": "2026-03-23T10:30:00Z"
    },
    "lowStockProducts": []
  }
}
```

## Business Logic

1. **Billing**: Automatically reduces product stock, increases customer udhar for UDHAR payments
2. **Purchases**: Automatically increases product stock, updates supplier payable
3. **Payments**: Atomically updates customer/supplier balances
4. **Stock Safety**: Prevents overselling with insufficient stock checks

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── index.js       # Environment config
│   │   └── db.js          # MongoDB connection
│   ├── models/
│   │   ├── Product.js
│   │   ├── Customer.js
│   │   ├── Supplier.js
│   │   ├── Bill.js
│   │   ├── Purchase.js
│   │   ├── Payment.js
│   │   ├── Expense.js
│   │   └── User.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── customerController.js
│   │   ├── supplierController.js
│   │   ├── billController.js
│   │   ├── purchaseController.js
│   │   ├── paymentController.js
│   │   ├── expenseController.js
│   │   └── dashboardController.js
│   ├── routes/
│   │   ├── index.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── utils/
│   │   └── seed.js
│   └── server.js
├── .env
├── package.json
└── README.md
```

## License

MIT
