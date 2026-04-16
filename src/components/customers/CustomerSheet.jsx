import { useState } from 'react'
import { MessageCircle, Phone, Trash2, Camera } from 'lucide-react'
import Sheet from '../ui/Sheet'
import Button from '../ui/Button'
import Input from '../ui/Input'
import EmptyState from '../ui/EmptyState'
import PhotoPicker from '../ui/PhotoPicker'
import LedgerEntry from './LedgerEntry'
import { formatINR, getInitials, stringToColor } from '../../utils/helpers'
import { uploadService } from '../../services/services'

export default function CustomerSheet({ isOpen, onClose, customer, onAddPayment, onDelete, onUploadPhoto, onRemovePhoto, isSaving }) {
  const [activeTab, setActiveTab] = useState('transactions')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPhotoPicker, setShowPhotoPicker] = useState(false)

  if (!customer) return null

  const avatarColor = stringToColor(customer.name)
  const photoUrl = customer.photo ? uploadService.getPhotoUrl(customer.photo) : null

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={customer.name}
      footer={
        activeTab === 'payment' ? (
          <Button
            className="w-full"
            onClick={async () => {
              await onAddPayment(customer.id, Number(paymentAmount))
              setPaymentAmount('')
              setActiveTab('transactions')
            }}
            disabled={!paymentAmount || Number(paymentAmount) <= 0 || isSaving}
          >
            {isSaving ? 'Recording...' : 'Record Payment'}
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
              <img src={photoUrl} alt={customer.name} className="h-full w-full object-cover" />
            ) : (
              getInitials(customer.name)
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition hover:opacity-100">
              <Camera size={16} className="text-white" />
            </div>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-text-primary">{customer.name}</p>
            <p className="text-sm text-text-muted">{customer.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Pending</p>
            <p className="rupee text-lg font-bold text-danger">{formatINR(customer.pending)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${customer.phone}`}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 text-sm font-semibold text-primary"
          >
            <Phone size={16} />
            Call
          </a>
          <a
            href={`https://wa.me/91${customer.phone}?text=${encodeURIComponent(
              `Namaste from Sharma Kirana. Your pending amount is ${formatINR(customer.pending)}. Please settle it when convenient. Dhanyavaad.`,
            )}`}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-success/20 bg-success/10 text-sm font-semibold text-success"
          >
            <MessageCircle size={16} />
            Send Reminder
          </a>
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex w-full items-center gap-2 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-semibold text-danger transition hover:bg-danger/10"
          >
            <Trash2 size={16} />
            Remove Customer
          </button>
        )}

        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface p-1">
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`min-h-[44px] rounded-2xl text-sm font-semibold transition ${
              activeTab === 'transactions' ? 'bg-surface-card text-text-primary shadow-card' : 'text-text-muted'
            }`}
          >
            Transactions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payment')}
            className={`min-h-[44px] rounded-2xl text-sm font-semibold transition ${
              activeTab === 'payment' ? 'bg-surface-card text-text-primary shadow-card' : 'text-text-muted'
            }`}
          >
            Add Payment
          </button>
        </div>

        {activeTab === 'transactions' ? (
          customer.transactions && customer.transactions.length ? (
            <div className="space-y-3">
              {customer.transactions.map((transaction) => (
                <LedgerEntry key={transaction.id} transaction={transaction} />
              ))}
            </div>
          ) : (
            <EmptyState
              variant="ledger"
              title="No ledger entries yet"
              subtitle="Bills and payments for this customer will appear here."
            />
          )
        ) : (
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
              The pending amount after this payment will be{' '}
              <span className="rupee font-semibold text-text-primary">
                {formatINR(Math.max(0, customer.pending - (Number(paymentAmount) || 0)))}
              </span>
              .
            </div>
          </div>
        )}
      </div>

      <PhotoPicker
        isOpen={showPhotoPicker}
        onClose={() => setShowPhotoPicker(false)}
        currentPhoto={customer.photo}
        onUpload={(file) => onUploadPhoto(customer.id, file)}
        onRemove={() => onRemovePhoto(customer.id)}
        isUploading={isSaving}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-text-primary">Remove Customer?</h3>
            <p className="mt-2 text-sm text-text-muted">
              {customer.pending > 0
                ? `This customer has ${formatINR(customer.pending)} pending udhar. You cannot remove them until the balance is cleared.`
                : `This will permanently remove "${customer.name}" from your records.`}
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
                disabled={customer.pending > 0 || isSaving}
                onClick={async () => {
                  await onDelete(customer.id)
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
