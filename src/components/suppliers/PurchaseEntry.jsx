import { formatDate, formatINR } from '../../utils/helpers'

export default function PurchaseEntry({ purchase }) {
  const items = purchase.items || []
  const itemNames = Array.isArray(items) ? items.map(i => i.name).join(', ') : items
  const totalQty = Array.isArray(items) ? items.reduce((sum, i) => sum + (i.quantity || 0), 0) : 0

  return (
    <div className="rounded-[1.4rem] border border-border/70 bg-surface-card px-4 py-3 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">{itemNames}</p>
          <p className="mt-1 text-xs text-text-muted">
            {formatDate(purchase.date)} • {totalQty} units
          </p>
        </div>
        <div className="text-right">
          <p className="rupee text-sm font-bold text-text-primary">{formatINR(purchase.amount)}</p>
        </div>
      </div>
    </div>
  )
}
