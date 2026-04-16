import api, { setAuthToken, getAuthToken } from './api'

const getHeaders = () => {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.data.token) {
      setAuthToken(response.data.data.token)
    }
    return response.data
  },

  logout: () => {
    setAuthToken(null)
  },

  getMe: async () => {
    const response = await api.get('/auth/me', { headers: getHeaders() })
    return response.data
  },

  isAuthenticated: () => {
    return !!getAuthToken()
  },
}

export const productService = {
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params, headers: getHeaders() })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`, { headers: getHeaders() })
    return response.data
  },

  create: async (product) => {
    const response = await api.post('/products', product, { headers: getHeaders() })
    return response.data
  },

  update: async (id, product) => {
    const response = await api.put(`/products/${id}`, product, { headers: getHeaders() })
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`, { headers: getHeaders() })
    return response.data
  },

  updateStock: async (id, stock, type = 'set', batchInfo = null) => {
    const response = await api.patch(`/products/${id}/stock`, { stock, type, batchInfo }, { headers: getHeaders() })
    return response.data
  },

  getLowStock: async () => {
    const response = await api.get('/products/low-stock', { headers: getHeaders() })
    return response.data
  },

  getReorderSuggestions: async () => {
    const response = await api.get('/products/reorder-suggestions', { headers: getHeaders() })
    return response.data
  },

  getExpiring: async (days = 7) => {
    const response = await api.get('/products/expiring', { params: { days }, headers: getHeaders() })
    return response.data
  },

  getDeadStock: async () => {
    const response = await api.get('/products/dead-stock', { headers: getHeaders() })
    return response.data
  },

  addBatch: async (productId, batchData) => {
    const response = await api.post(`/products/${productId}/batch`, batchData, { headers: getHeaders() })
    return response.data
  },
}

export const customerService = {
  getAll: async (params = {}) => {
    const response = await api.get('/customers', { params, headers: getHeaders() })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/customers/${id}`, { headers: getHeaders() })
    return response.data
  },

  create: async (customer) => {
    const response = await api.post('/customers', customer, { headers: getHeaders() })
    return response.data
  },

  update: async (id, customer) => {
    const response = await api.put(`/customers/${id}`, customer, { headers: getHeaders() })
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`, { headers: getHeaders() })
    return response.data
  },

  getLastOrder: async (customerId) => {
    const response = await api.get(`/customers/${customerId}/last-order`, { headers: getHeaders() })
    return response.data
  },
}

export const supplierService = {
  getAll: async (params = {}) => {
    const response = await api.get('/suppliers', { params, headers: getHeaders() })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/suppliers/${id}`, { headers: getHeaders() })
    return response.data
  },

  create: async (supplier) => {
    const response = await api.post('/suppliers', supplier, { headers: getHeaders() })
    return response.data
  },

  update: async (id, supplier) => {
    const response = await api.put(`/suppliers/${id}`, supplier, { headers: getHeaders() })
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/suppliers/${id}`, { headers: getHeaders() })
    return response.data
  },
}

export const billService = {
  getAll: async (params = {}) => {
    const response = await api.get('/bills', { params, headers: getHeaders() })
    return response.data
  },

  getRecent: async (limit = 5) => {
    const response = await api.get('/bills/recent', { params: { limit }, headers: getHeaders() })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/bills/${id}`, { headers: getHeaders() })
    return response.data
  },

  create: async (bill) => {
    const response = await api.post('/bills', bill, { headers: getHeaders() })
    return response.data
  },

  edit: async (id, billData) => {
    const response = await api.patch(`/bills/${id}/edit`, billData, { headers: getHeaders() })
    return response.data
  },

  return: async (id, returnData) => {
    const response = await api.post(`/bills/${id}/return`, returnData, { headers: getHeaders() })
    return response.data
  },

  cancel: async (id) => {
    const response = await api.patch(`/bills/${id}/cancel`, {}, { headers: getHeaders() })
    return response.data
  },

  getPdf: async (id) => {
    const response = await api.get(`/bills/${id}/pdf`, { headers: getHeaders() })
    return response.data
  },
}

export const purchaseService = {
  getAll: async (params = {}) => {
    const response = await api.get('/purchases', { params, headers: getHeaders() })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/purchases/${id}`, { headers: getHeaders() })
    return response.data
  },

  create: async (purchase) => {
    const response = await api.post('/purchases', purchase, { headers: getHeaders() })
    return response.data
  },
}

export const paymentService = {
  getAll: async (params = {}) => {
    const response = await api.get('/payments', { params, headers: getHeaders() })
    return response.data
  },

  recordCustomerPayment: async (payment) => {
    const response = await api.post('/payments/customer', payment, { headers: getHeaders() })
    return response.data
  },

  recordSupplierPayment: async (payment) => {
    const response = await api.post('/payments/supplier', payment, { headers: getHeaders() })
    return response.data
  },
}

export const expenseService = {
  getAll: async (params = {}) => {
    const response = await api.get('/expenses', { params, headers: getHeaders() })
    return response.data
  },

  create: async (expense) => {
    const response = await api.post('/expenses', expense, { headers: getHeaders() })
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`, { headers: getHeaders() })
    return response.data
  },
}

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary', { headers: getHeaders() })
    return response.data
  },
}

export const reportsService = {
  getSales: async (params = {}) => {
    const response = await api.get('/reports/sales', { params, headers: getHeaders() })
    return response.data
  },

  getProfit: async (params = {}) => {
    const response = await api.get('/reports/profit', { params, headers: getHeaders() })
    return response.data
  },

  getInsights: async () => {
    const response = await api.get('/reports/insights', { headers: getHeaders() })
    return response.data
  },

  getAlerts: async () => {
    const response = await api.get('/reports/alerts', { headers: getHeaders() })
    return response.data
  },

  export: async (type = 'products') => {
    const response = await api.get('/reports/export', { params: { type }, headers: getHeaders() })
    return response.data
  },
}

export const cashService = {
  getToday: async () => {
    const response = await api.get('/cash/today', { headers: getHeaders() })
    return response.data
  },

  getLogs: async (params = {}) => {
    const response = await api.get('/cash/logs', { params, headers: getHeaders() })
    return response.data
  },

  open: async (openingCash = 0) => {
    const response = await api.post('/cash/open', { openingCash }, { headers: getHeaders() })
    return response.data
  },

  close: async (actualCash, notes) => {
    const response = await api.post('/cash/close', { actualCash, notes }, { headers: getHeaders() })
    return response.data
  },

  adjust: async (amount, reason) => {
    const response = await api.post('/cash/adjust', { amount, reason }, { headers: getHeaders() })
    return response.data
  },
}

export const uploadService = {
  uploadPhoto: async (type, id, file) => {
    const token = getAuthToken()
    const formData = new FormData()
    formData.append('photo', file)
    const response = await api.post(`/upload/${type}/${id}/photo`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  removePhoto: async (type, id) => {
    const response = await api.delete(`/upload/${type}/${id}/photo`, { headers: getHeaders() })
    return response.data
  },
  getPhotoUrl: (photoName) => {
    if (!photoName) return null
    const base = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    return `${base}/uploads/avatars/${photoName}`
  },
}

export default api
