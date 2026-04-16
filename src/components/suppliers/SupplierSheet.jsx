import { useMemo, useState } from 'react'
import { Phone, Trash2, Camera } from 'lucide-react'
import Sheet from '../ui/Sheet'
import Button from '../ui/Button'
import Input from '../ui/Input'
import EmptyState from '../ui/EmptyState'
import PhotoPicker from '../ui/PhotoPicker'
import PurchaseEntry from './PurchaseEntry'
import { formatDate, formatINR, getInitials, stringToColor } from '../../utils/helpers'
import { uploadService } from '../../services/services'

function buildRunningBalances(supplier) {
  const payments = supplier.payments || []
  const paymentsAsc = [...payments].sort((left, right) => new Date(left.date) - new Date(right.date))
  const startingBalance = supplier.pending + paymentsAsc.reduce((sum, payment) => sum + payment.amount, 0)
  let remaining = startingBalance

  return paymentsAsc
    .map((payment) => {
      remaining -= payment.amount
      return {
        ...payment,
        balanceAfter: remaining,
      }
    })
    .reverse()
}

export default function SupplierSheet({
  isOpen,
  onClose,
  supplier,
  onAddPayment,
  onAddPurchase,
  onDelete,
  onUploadPhoto,
  onRemovePhoto,
  isSaving,
}) {
  const [activeView, setActiveView] = useState('history')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [purchaseForm, setPurchaseForm] = useState({ items: '', qty: '', amount: '' })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPhotoPicker, setShowPhotoPicker] = useState(false)

  const avatarColor = stringToColor(supplier?.name || '')
  const paymentHistory = useMemo(() => (supplier ? buildRunningBalances(supplier) : []), [supplier])
  const photoUrl = supplier?.photo ? uploadService.getPhotoUrl(supplier.photo) : null

  if (!supplier) return null

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={supplier.name}
      footer={
        activeView === 'payment' ? (
          <Button
            className="w-full"
            disabled={!paymentAmount || Number(paymentAmount) <= 0 || isSaving}
            onClick={async () => {
              await onAddPayment(supplier.id, Number(paymentAmount))
              setPaymentAmount('')
              setActiveView('payments')
            }}
          >
            {isSaving ? 'Recording...' : 'Record Payment'}
          </Button>
        ) : activeView === 'purchase' ? (
          <Button
            className="w-full"
            disabled={!purchaseForm.items || !purchaseForm.qty || !purchaseForm.amount || isSaving}
            onClick={async () => {
              const amount = Number(purchaseForm.amount)
              const qty = Number(purchaseForm.qty)
              await onAddPurchase(supplier.id, {
                supplierId: supplier.id,
                items: [{
                  name: purchaseForm.items,
                  quantity: qty,
                  unit: 'pcs',
                  costPrice: qty ? amount / qty : amount,
                  total: amount,
                }],
                totalAmount: amount,
              })
              setPurchaseForm({ items: '', qty: '', amount: '' })
              setActiveView('history')
            }}
          >
            {isSaving ? 'Saving...' : 'Add Purchase'}
          </Button>
        ) : null
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-[1.6rem] border border-border/70 bg-surface p-4">
          <button
            type="button"
            onClick={() => setShowPhotoPicker(true)}
            className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full text-base font-bold text-white transition hover:opacity-80"
            style={{ backgroundColor: photoUrl ? 'transparent' : avatarColor }}
          >
            {photoUrl ? (
              <img src={photoUrl} alt={supplier.name} className="h-full w-full object-cover" />
            ) : (
              getInitials(supplier.name)
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition hover:opacity-100">
              <Camera size={16} className="text-white" />
            </div>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-text-primary">{supplier.name}</p>
            <p className="text-sm text-text-muted">{supplier.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Payable</p>
            <p className="rupee text-lg font-bold text-accent-warm">{formatINR(supplier.pending)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <a
            href={`tel:${supplier.phone}`}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 text-sm font-semibold text-primary"
          >
            <Phone size={16} />
            Call
          </a>
          <button
            type="button"
            onClick={() => setActiveView('purchase')}
            className="min-h-[48px] rounded-2xl border border-accent/20 bg-accent/12 text-sm font-semibold text-accent-warm"
          >
            Add Purchase
          </button>
          <button
            type="button"
            onClick={() => setActiveView('payment')}
            className="min-h-[48px] rounded-2xl border border-success/20 bg-success/12 text-sm font-semibold text-success"
          >
            Record Payment
          </button>
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex w-full items-center gap-2 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-semibold text-danger transition hover:bg-danger/10"
          >
            <Trash2 size={16} />
            Remove Supplier
          </button>
        )}

        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface p-1">
          <button
            type="button"
            onClick={() => setActiveView('history')}
            className={`min-h-[44px] rounded-2xl text-sm font-semibold transition ${
              activeView === 'history' ? 'bg-surface-card text-text-primary shadow-card' : 'text-text-muted'
            }`}
          >
            Purchases
          </button>
          <button
            type="button"
            onClick={() => setActiveView('payments')}
            className={`min-h-[44px] rounded-2xl text-sm font-semibold transition ${
              activeView === 'payments' ? 'bg-surface-card text-text-primary shadow-card' : 'text-text-muted'
            }`}
          >
            Payments
          </button>
        </div>

        {activeView === 'history' ? (
          (supplier.purchases || []).length ? (
            <div className="space-y-3">
              {(supplier.purchases || []).map((purchase) => (
                <PurchaseEntry key={purchase.id} purchase={purchase} />
              ))}
            </div>
          ) : (
            <EmptyState
              variant="ledger"
              title="No purchases yet"
              subtitle="New supplier purchases will appear here with quantity and amount."
            />
          )
        ) : null}

        {activeView === 'payments' ? (
          paymentHistory.length ? (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="rounded-[1.4rem] border border-border/70 bg-surface-card px-4 py-3 shadow-card">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{payment.mode} payment</p>
                      <p className="text-xs text-text-muted">{formatDate(payment.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="rupee text-sm font-bold text-success">-{formatINR(payment.amount)}</p>
                      <p className="rupee text-[11px] text-text-muted">Balance {formatINR(payment.balanceAfter)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              variant="ledger"
              title="No payments recorded"
              subtitle="Payments made to this supplier will appear here with running balance."
            />
          )
        ) : null}

        {activeView === 'payment' ? (
          <div className="space-y-4">
            <Input
              label="Payment amount"
              prefix="₹"
              type="number"
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
              placeholder="0"
              inputClassName="rupee text-lg font-semibold"
            />
            <div className="rounded-[1.4rem] border border-border/70 bg-surface px-4 py-3 text-sm text-text-muted">
              Remaining payable after this payment:{' '}
              <span className="rupee font-semibold text-text-primary">
                {formatINR(Math.max(0, supplier.pending - (Number(paymentAmount) || 0)))}
              </span>
            </div>
          </div>
        ) : null}

        {activeView === 'purchase' ? (
          <div className="space-y-4">
            <Input
              label="Items purchased"
              value={purchaseForm.items}
              onChange={(event) => setPurchaseForm((current) => ({ ...current, items: event.target.value }))}
              placeholder="e.g. Milk, Butter, Paneer"
            />
            <Input
              label="Quantity"
              value={purchaseForm.qty}
              onChange={(event) => setPurchaseForm((current) => ({ ...current, qty: event.target.value }))}
              placeholder="e.g. 72 units"
            />
            <Input
              label="Amount"
              prefix="₹"
              type="number"
              value={purchaseForm.amount}
              onChange={(event) => setPurchaseForm((current) => ({ ...current, amount: event.target.value }))}
              inputClassName="rupee"
            />
          </div>
        ) : null}
      </div>

      <PhotoPicker
        isOpen={showPhotoPicker}
        onClose={() => setShowPhotoPicker(false)}
        currentPhoto={supplier.photo}
        onUpload={(file) => onUploadPhoto(supplier.id, file)}
        onRemove={() => onRemovePhoto(supplier.id)}
        isUploading={isSaving}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-text-primary">Remove Supplier?</h3>
            <p className="mt-2 text-sm text-text-muted">
              {supplier.pending > 0
                ? `This supplier has ${formatINR(supplier.pending)} payable. You cannot remove them until the balance is cleared.`
                : `This will permanently remove "${supplier.name}" from your records.`}
            </p>
            <div className="mt-5 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                disabled={supplier.pending > 0 || isSaving}
                onClick={async () => {
                  await onDelete(supplier.id)
                  setShowDeleteConfirm(false)
                  onClose()
                }}
              >
                {isSaving ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  )
}
