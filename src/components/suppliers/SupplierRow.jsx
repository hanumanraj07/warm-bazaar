import { motion } from 'framer-motion'
import { formatDate, formatINR, getInitials, stringToColor } from '../../utils/helpers'
import { uploadService } from '../../services/services'

export default function SupplierRow({ supplier, onClick }) {
  const color = stringToColor(supplier.name)
  const hasPending = supplier.pending > 0
  const photoUrl = supplier.photo ? uploadService.getPhotoUrl(supplier.photo) : null

  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="group card-accent flex w-full items-center gap-4 rounded-2xl border border-border/70 bg-gradient-to-br from-white to-surface/80 p-4 text-left shadow-[0_2px_12px_rgba(27,67,50,0.04)] transition-all hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(27,67,50,0.1)]"
      style={{ borderLeftColor: hasPending ? '#E76F51' : '#10B981', borderLeftWidth: 4 }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-sm font-bold text-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
        style={{ backgroundColor: photoUrl ? 'transparent' : color }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt={supplier.name} className="h-full w-full object-cover" />
        ) : (
          getInitials(supplier.name)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-primary">{supplier.name}</p>
        <p className="mt-0.5 text-xs text-text-muted">Last purchase: {formatDate(supplier.lastPurchase)}</p>
      </div>
      <span className={`rupee text-sm font-bold ${hasPending ? 'text-accent-warm' : 'text-success'}`}>
        {hasPending ? formatINR(supplier.pending) : 'Settled'}
      </span>
    </motion.button>
  )
}
