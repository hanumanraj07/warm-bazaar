import { useDeferredValue, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import CustomerRow from '../components/customers/CustomerRow'
import CustomerSheet from '../components/customers/CustomerSheet'
import AddCustomerSheet from '../components/customers/AddCustomerSheet'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonList } from '../components/ui/Skeleton'
import { formatINR } from '../utils/helpers'
import { useCustomers, useCustomer } from '../hooks/useCustomers'
import { useStore } from '../store/useStore'

const MotionButton = motion.button

export default function Customers() {
  const { customers, isLoading, addPayment, createCustomer, deleteCustomer, uploadCustomerPhoto, removeCustomerPhoto, isMutating } = useCustomers()
  const showToast = useStore((state) => state.showToast)

  const [search, setSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const deferredSearch = useDeferredValue(search)

  const { data: selectedCustomer, refetch: refetchSelectedCustomer } = useCustomer(selectedCustomerId)

  const totals = useMemo(
    () => ({
      pending: customers.reduce((sum, customer) => sum + (customer.totalUdhar || customer.pending || 0), 0),
      count: customers.filter((customer) => (customer.totalUdhar || customer.pending || 0) > 0).length,
    }),
    [customers],
  )

  const filteredCustomers = useMemo(() => {
    const normalized = deferredSearch.toLowerCase().trim()
    if (!normalized) return customers
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(normalized) || customer.phone.includes(normalized),
    )
  }, [customers, deferredSearch])

  const selectedCustomerFromList = customers.find((customer) => customer.id === selectedCustomerId) ?? null
  const customerData = selectedCustomer || selectedCustomerFromList

  const handleAddCustomer = async (data) => {
    await createCustomer(data)
    showToast('Customer added successfully', 'success')
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-[2rem] border border-accent/40 bg-gradient-to-br from-accent/20 via-accent/10 to-accent/5 p-6 shadow-[0_4px_24px_rgba(244,162,97,0.15)]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-warm text-white shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-accent-warm">Total Pending Udhar</p>
            <p className="rupee mt-1 text-3xl font-bold text-accent-warm">{formatINR(totals.pending)}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-text-muted">{totals.count} customers have outstanding balance</p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="panel-card mt-5 rounded-[2rem] border border-border/60 p-5 shadow-[0_4px_24px_rgba(27,67,50,0.08)]"
      >
        <div className="relative">
          <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customers..."
            className="w-full rounded-2xl border border-border/80 bg-gradient-to-br from-white to-surface/80 py-4 pl-12 pr-4 text-sm text-text-primary shadow-[0_2px_12px_rgba(27,67,50,0.04)] outline-none transition-all placeholder:text-text-muted/70 focus:border-primary focus:bg-white focus:shadow-[0_4px_20px_rgba(27,67,50,0.1)]"
          />
        </div>

        <div className="mt-5 space-y-3">
          {isLoading ? (
            <SkeletonList count={5} />
          ) : filteredCustomers.length ? (
            filteredCustomers.map((customer) => (
              <CustomerRow key={customer.id} customer={customer} onClick={() => setSelectedCustomerId(customer.id)} />
            ))
          ) : (
            <EmptyState
              variant="ledger"
              title={search ? "No customers found" : "No customers yet"}
              subtitle={search ? "Try a different name or phone number." : "Add your first customer using the + button below."}
            />
          )}
        </div>
      </motion.section>

      <MotionButton
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setAddSheetOpen(true)}
        className="fixed bottom-28 right-5 z-30 flex h-16 w-16 items-center justify-center rounded-[1.8rem] bg-gradient-to-br from-accent to-accent-warm text-white shadow-[0_8px_32px_rgba(244,162,97,0.3)] transition-all hover:shadow-[0_12px_40px_rgba(244,162,97,0.35)] xl:bottom-8"
        aria-label="Add customer"
      >
        <Plus size={28} />
      </MotionButton>

      <CustomerSheet
        key={selectedCustomerId || 'customer-sheet'}
        isOpen={Boolean(selectedCustomerId)}
        onClose={() => setSelectedCustomerId('')}
        customer={customerData}
        isSaving={isMutating}
        onAddPayment={async (customerId, amount) => {
          await addPayment({ type: 'CUSTOMER', customerId, amount, paymentMode: 'CASH' })
          showToast(`Payment recorded ${formatINR(amount)}`, 'success')
          refetchSelectedCustomer()
        }}
        onDelete={async (customerId) => {
          await deleteCustomer(customerId)
          showToast('Customer removed', 'success')
        }}
        onUploadPhoto={async (customerId, file) => {
          await uploadCustomerPhoto({ id: customerId, file })
          showToast('Photo updated', 'success')
          refetchSelectedCustomer()
        }}
        onRemovePhoto={async (customerId) => {
          await removeCustomerPhoto(customerId)
          showToast('Photo removed', 'success')
          refetchSelectedCustomer()
        }}
      />

      <AddCustomerSheet
        isOpen={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onAdd={handleAddCustomer}
        isSaving={isMutating}
      />
    </>
  )
}
