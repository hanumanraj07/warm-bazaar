import { create } from 'zustand'

const clampDiscount = (value, subtotal) => Math.max(0, Math.min(Number(value) || 0, subtotal))

export const useStore = create((set, get) => ({
  cart: [],
  paymentMode: 'Cash',
  selectedCustomerId: '',
  discount: 0,
  toast: null,
  toastTimer: null,

  addToCart: (product) => {
    const { cart } = get()
    const existing = cart.find((item) => item.id === product.id)

    if (existing) {
      if (existing.qty >= product.stock) {
        return false
      }

      set({
        cart: cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        ),
      })
      return true
    }

    set({
      cart: [
        ...cart,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          unit: product.unit,
          price: product.price,
          stock: product.stock,
          qty: 1,
        },
      ],
    })
    return true
  },

  updateQty: (productId, nextQty, maxStock) => {
    if (nextQty <= 0) {
      set({ cart: get().cart.filter((item) => item.id !== productId) })
      return
    }

    const safeQty = Math.max(1, Math.min(nextQty, maxStock ?? nextQty))
    set({
      cart: get().cart.map((item) => (item.id === productId ? { ...item, qty: safeQty } : item)),
    })
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((item) => item.id !== productId) })
  },

  setPaymentMode: (paymentMode) => {
    set((state) => ({
      paymentMode,
      selectedCustomerId: paymentMode === 'Udhar' ? state.selectedCustomerId : '',
    }))
  },

  setSelectedCustomerId: (selectedCustomerId) => set({ selectedCustomerId }),

  setDiscount: (discount) =>
    set(() => ({
      discount: clampDiscount(discount, get().getSubtotal()),
    })),

  getSubtotal: () => get().cart.reduce((sum, item) => sum + item.price * item.qty, 0),
  getItemCount: () => get().cart.reduce((sum, item) => sum + item.qty, 0),
  getTotal: () => {
    const subtotal = get().getSubtotal()
    return Math.max(0, subtotal - clampDiscount(get().discount, subtotal))
  },

  clearBilling: () =>
    set({
      cart: [],
      paymentMode: 'Cash',
      selectedCustomerId: '',
      discount: 0,
    }),

  syncCartStock: (products) => {
    const { cart, discount } = get()
    let changed = false

    const nextCart = cart
      .map((item) => {
        const latest = products.find((product) => product.id === item.id)
        if (!latest || latest.stock <= 0) {
          changed = true
          return null
        }
        const newQty = Math.min(item.qty, latest.stock)
        if (newQty !== item.qty || latest.stock !== item.stock || latest.price !== item.price) {
          changed = true
        }
        return {
          ...item,
          stock: latest.stock,
          qty: newQty,
          price: latest.price,
        }
      })
      .filter(Boolean)

    if (!changed) return

    const nextSubtotal = nextCart.reduce((sum, item) => sum + item.price * item.qty, 0)
    set({
      cart: nextCart,
      discount: clampDiscount(discount, nextSubtotal),
    })
  },

  showToast: (message, type = 'success') => {
    const id = Date.now()
    window.clearTimeout(get().toastTimer)

    const toastTimer = window.setTimeout(() => {
      if (get().toast?.id === id) {
        set({ toast: null, toastTimer: null })
      }
    }, 2600)

    set({ toast: { id, message, type }, toastTimer })
  },

  clearToast: () => {
    window.clearTimeout(get().toastTimer)
    set({ toast: null, toastTimer: null })
  },
}))
