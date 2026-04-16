import { BookOpen, CreditCard, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import { formatINR } from '../../utils/helpers'
import { useStore } from '../../store/useStore'

const paymentModes = [
  { id: 'Cash', label: 'Cash', icon: Wallet },
  { id: 'UPI', label: 'UPI', icon: CreditCard },
  { id: 'Udhar', label: 'Udhar', icon: BookOpen },
]

export default function BillSummary({ customers, onSave, isSaving }) {
  const paymentMode = useStore((state) => state.paymentMode)
  const selectedCustomerId = useStore((state) => state.selectedCustomerId)
  const discount = useStore((state) => state.discount)
  const setDiscount = useStore((state) => state.setDiscount)
  const setPaymentMode = useStore((state) => state.setPaymentMode)
  const setSelectedCustomerId = useStore((state) => state.setSelectedCustomerId)
  const cart = useStore((state) => state.cart)
  const getSubtotal = useStore((state) => state.getSubtotal)
  const getTotal = useStore((state) => state.getTotal)

  const [customerSearch, setCustomerSearch] = useState('')
  const subtotal = getSubtotal()
  const total = getTotal()

  const filteredCustomers = useMemo(() => {
    const normalized = customerSearch.toLowerCase().trim()
    if (!normalized) return customers
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(normalized) || customer.phone.includes(normalized),
    )
  }, [customerSearch, customers])

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? null

  return (
    <div className="rounded-[2rem] border border-border/60 bg-gradient-to-b from-white to-surface/80 p-5 shadow-[0_-4px_24px_rgba(27,67,50,0.08)]">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Subtotal</span>
          <span className="rupee text-base font-semibold text-text-primary">{formatINR(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <label htmlFor="discount" className="font-medium text-text-muted">
            Discount
          </label>
          <div className="flex items-center rounded-2xl border border-border/80 bg-gradient-to-br from-surface to-border/20 px-3 py-1">
            <span className="text-sm text-text-muted">₹</span>
            <input
              id="discount"
              type="number"
              min="0"
              value={discount || ''}
              onChange={(event) => setDiscount(event.target.value)}
              placeholder="0"
              className="rupee h-11 w-20 border-none bg-transparent text-right text-base font-semibold text-text-primary outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <span className="text-base font-semibold text-text-primary">Total</span>
          <span className="rupee text-2xl font-bold text-primary">{formatINR(total)}</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        {paymentModes.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPaymentMode(id)}
            className={`flex min-h-[52px] items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-all ${
              paymentMode === id
                ? 'bg-gradient-to-br from-primary to-primary-light text-white shadow-[0_4px_16px_rgba(27,67,50,0.25)]'
                : 'bg-gradient-to-br from-white to-surface text-text-muted hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-border/60'
            }`}
          >
            <Icon size={18} />
            {label}
          </motion.button>
        ))}
      </div>

      {paymentMode === 'Udhar' ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 rounded-[1.8rem] border border-accent/40 bg-gradient-to-br from-accent/10 to-accent/5 p-4"
        >
          <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.22em] text-accent-warm">
            Customer for Udhar
          </label>
          <input
            value={customerSearch}
            onChange={(event) => setCustomerSearch(event.target.value)}
            placeholder="Search customer by name or phone"
            className="w-full rounded-2xl border border-border/80 bg-gradient-to-br from-white to-surface/80 px-4 py-3.5 text-sm text-text-primary outline-none transition placeholder:text-text-muted/70 focus:border-primary focus:shadow-[0_4px_16px_rgba(27,67,50,0.1)]"
          />
          <div className="mt-3 max-h-44 space-y-2 overflow-y-auto no-scrollbar">
            {filteredCustomers.map((customer) => (
              <motion.button
                key={customer.id}
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedCustomerId(customer.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${
                  selectedCustomerId === customer.id
                    ? 'border-primary bg-gradient-to-r from-primary/10 to-transparent shadow-[0_2px_12px_rgba(27,67,50,0.1)]'
                    : 'border-border/70 bg-white hover:bg-surface/80'
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-text-primary">{customer.name}</p>
                  <p className="text-xs text-text-muted">{customer.phone}</p>
                </div>
                <span className="rupee text-sm font-bold text-danger">{formatINR(customer.pending)}</span>
              </motion.button>
            ))}
          </div>
          {selectedCustomer ? (
            <p className="mt-3 text-sm text-text-muted">
              Selected: <span className="font-semibold text-primary">{selectedCustomer.name}</span>
            </p>
          ) : null}
        </motion.div>
      ) : null}

      <div className="mt-5">
        <Button
          size="lg"
          className="w-full"
          onClick={onSave}
          disabled={!cart.length || isSaving || (paymentMode === 'Udhar' && !selectedCustomerId)}
        >
          {isSaving ? 'Saving bill...' : `Save Bill ${formatINR(total)}`}
        </Button>
      </div>
    </div>
  )
}
