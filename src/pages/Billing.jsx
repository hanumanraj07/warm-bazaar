import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SearchBar from '../components/billing/SearchBar'
import QuickAdd from '../components/billing/QuickAdd'
import CartItem from '../components/billing/CartItem'
import BillSummary from '../components/billing/BillSummary'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeleton'
import { formatINR } from '../utils/helpers'
import { useBilling } from '../hooks/useBilling'
import { useStore } from '../store/useStore'

export default function Billing() {
  const { products, customers, quickAddProducts, saveBill, isSavingBill, isLoading } = useBilling()
  const cart = useStore((state) => state.cart)
  const getItemCount = useStore((state) => state.getItemCount)
  const clearBilling = useStore((state) => state.clearBilling)
  const syncCartStock = useStore((state) => state.syncCartStock)
  const paymentMode = useStore((state) => state.paymentMode)
  const selectedCustomerId = useStore((state) => state.selectedCustomerId)
  const discount = useStore((state) => state.discount)
  const showToast = useStore((state) => state.showToast)

  useEffect(() => {
    if (products.length) {
      syncCartStock(products)
    }
  }, [products, syncCartStock])

  const handleSaveBill = async () => {
    if (!cart.length) {
      showToast('Search or quick add items before saving', 'warning')
      return
    }

    if (paymentMode === 'Udhar' && !selectedCustomerId) {
      showToast('Select a customer before saving Udhar', 'warning')
      return
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
    const totalAmount = Math.max(0, subtotal - discount)
    const apiPaymentMode = paymentMode === 'Udhar' ? 'UDHAR' : paymentMode.toUpperCase()

    const items = cart.map((item) => ({
      productId: item.id,
      name: item.name,
      quantity: Math.round(item.qty),
      price: item.price,
      total: item.price * item.qty,
    }))

    const response = await saveBill({
      items,
      subtotal,
      discount: Number(discount) || 0,
      totalAmount,
      paymentMode: apiPaymentMode,
      ...(selectedCustomerId ? { customerId: selectedCustomerId } : {}),
    })

    clearBilling()
    const savedBill = response.data?.bill || response.bill
    showToast(`Bill saved ${formatINR(savedBill?.totalAmount || totalAmount)}`, 'success')
    if (response.data?.lowStockProducts?.length) {
      showToast(`${response.data.lowStockProducts.length} items are now running low`, 'warning')
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="panel-card rounded-[2rem] border border-border/60 p-5 shadow-[0_4px_24px_rgba(27,67,50,0.08)]"
      >
        <SearchBar products={products} />
        <div className="mt-5">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} className="p-3" />
              ))}
            </div>
          ) : (
            <QuickAdd products={quickAddProducts} />
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-5 rounded-[1.8rem] border border-dashed border-border/80 bg-gradient-to-br from-accent/5 to-transparent p-5"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-warm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Counter tip</p>
              <p className="mt-1 text-sm leading-6 text-text-muted">
                Search by name or barcode, then keep adding from the quick grid while the customer is still at the counter.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="panel-card rounded-[2rem] border border-border/60 p-5 shadow-[0_4px_24px_rgba(27,67,50,0.08)]"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-primary/60">Current Bill</p>
            <h2 className="mt-1.5 text-xl font-bold text-text-primary">Cart summary</h2>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 px-4 py-2.5 text-right shadow-[0_2px_12px_rgba(27,67,50,0.08)]">
            <p className="rupee text-base font-bold text-primary">{getItemCount()}</p>
            <p className="text-[10px] font-medium text-text-muted">units</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : cart.length ? (
          <>
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {cart.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </AnimatePresence>
            </div>
            <div className="mt-5">
              <BillSummary customers={customers} onSave={handleSaveBill} isSaving={isSavingBill} />
            </div>
          </>
        ) : (
          <EmptyState
            variant="cart"
            title="Billing cart is empty"
            subtitle="Search above to add items or tap from Quick Add to start a new bill."
          />
        )}
      </motion.section>
    </div>
  )
}
