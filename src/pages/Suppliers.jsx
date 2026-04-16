import { useDeferredValue, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import SupplierRow from '../components/suppliers/SupplierRow'
import SupplierSheet from '../components/suppliers/SupplierSheet'
import AddSupplierSheet from '../components/suppliers/AddSupplierSheet'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonList } from '../components/ui/Skeleton'
import { formatINR } from '../utils/helpers'
import { useSuppliers, useSupplier } from '../hooks/useSuppliers'
import { useStore } from '../store/useStore'

const MotionButton = motion.button

export default function Suppliers() {
  const { suppliers, isLoading, addPayment, addPurchase, createSupplier, deleteSupplier, uploadSupplierPhoto, removeSupplierPhoto, isMutating } = useSuppliers()
  const showToast = useStore((state) => state.showToast)

  const [search, setSearch] = useState('')
  const [selectedSupplierId, setSelectedSupplierId] = useState('')
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const deferredSearch = useDeferredValue(search)

  const { data: selectedSupplier, refetch: refetchSelectedSupplier } = useSupplier(selectedSupplierId)

  const totalPayable = useMemo(
    () => suppliers.reduce((sum, supplier) => sum + (supplier.totalPayable || supplier.pending || 0), 0),
    [suppliers],
  )

  const filteredSuppliers = useMemo(() => {
    const normalized = deferredSearch.toLowerCase().trim()
    if (!normalized) return suppliers
    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(normalized) || supplier.phone.includes(normalized),
    )
  }, [suppliers, deferredSearch])

  const selectedSupplierFromList = suppliers.find((supplier) => supplier.id === selectedSupplierId) ?? null
  const supplierData = selectedSupplier || selectedSupplierFromList

  const handleAddSupplier = async (data) => {
    await createSupplier(data)
    showToast('Supplier added successfully', 'success')
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-[2rem] border border-accent-warm/40 bg-gradient-to-br from-accent-warm/20 via-accent-warm/10 to-accent-warm/5 p-6 shadow-[0_4px_24px_rgba(231,111,81,0.15)]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-warm to-rose-600 text-white shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-accent-warm">Total Payable</p>
            <p className="rupee mt-1 text-3xl font-bold text-accent-warm">{formatINR(totalPayable)}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-text-muted">{suppliers.length} suppliers in your ledger</p>
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
            placeholder="Search suppliers..."
            className="w-full rounded-2xl border border-border/80 bg-gradient-to-br from-white to-surface/80 py-4 pl-12 pr-4 text-sm text-text-primary shadow-[0_2px_12px_rgba(27,67,50,0.04)] outline-none transition-all placeholder:text-text-muted/70 focus:border-primary focus:bg-white focus:shadow-[0_4px_20px_rgba(27,67,50,0.1)]"
          />
        </div>

        <div className="mt-5 space-y-3">
          {isLoading ? (
            <SkeletonList count={4} />
          ) : filteredSuppliers.length ? (
            filteredSuppliers.map((supplier) => (
              <SupplierRow key={supplier.id} supplier={supplier} onClick={() => setSelectedSupplierId(supplier.id)} />
            ))
          ) : (
            <EmptyState
              variant="ledger"
              title={search ? "No suppliers found" : "No suppliers yet"}
              subtitle={search ? "Try another supplier name or phone number." : "Add your first supplier using the + button below."}
            />
          )}
        </div>
      </motion.section>

      <MotionButton
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setAddSheetOpen(true)}
        className="fixed bottom-28 right-5 z-30 flex h-16 w-16 items-center justify-center rounded-[1.8rem] bg-gradient-to-br from-accent-warm to-rose-600 text-white shadow-[0_8px_32px_rgba(231,111,81,0.3)] transition-all hover:shadow-[0_12px_40px_rgba(231,111,81,0.35)] xl:bottom-8"
        aria-label="Add supplier"
      >
        <Plus size={28} />
      </MotionButton>

      <SupplierSheet
        key={selectedSupplierId || 'supplier-sheet'}
        isOpen={Boolean(selectedSupplierId)}
        onClose={() => setSelectedSupplierId('')}
        supplier={supplierData}
        isSaving={isMutating}
        onAddPayment={async (supplierId, amount) => {
          await addPayment({ type: 'SUPPLIER', supplierId, amount, paymentMode: 'CASH' })
          showToast(`Payment recorded ${formatINR(amount)}`, 'success')
          refetchSelectedSupplier()
        }}
        onAddPurchase={async (supplierId, payload) => {
          await addPurchase(payload)
          showToast(`Purchase added ${formatINR(payload.totalAmount)}`, 'success')
          refetchSelectedSupplier()
        }}
        onDelete={async (supplierId) => {
          await deleteSupplier(supplierId)
          showToast('Supplier removed', 'success')
        }}
        onUploadPhoto={async (supplierId, file) => {
          await uploadSupplierPhoto({ id: supplierId, file })
          showToast('Photo updated', 'success')
          refetchSelectedSupplier()
        }}
        onRemovePhoto={async (supplierId) => {
          await removeSupplierPhoto(supplierId)
          showToast('Photo removed', 'success')
          refetchSelectedSupplier()
        }}
      />

      <AddSupplierSheet
        isOpen={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onAdd={handleAddSupplier}
        isSaving={isMutating}
      />
    </>
  )
}
