import { Minus, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { formatINR } from '../../utils/helpers'

export default function CartItem({ item }) {
  const updateQty = useStore((state) => state.updateQty)
  const removeFromCart = useStore((state) => state.removeFromCart)
  const showToast = useStore((state) => state.showToast)

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 flex items-center justify-end rounded-2xl bg-gradient-to-r from-danger to-rose-600 px-6 text-white shadow-lg">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Trash2 size={18} />
          Remove
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.08}
        onDragEnd={(_, info) => {
          if (info.offset.x < -110) {
            removeFromCart(item.id)
            showToast(`${item.name} removed from bill`, 'warning')
          }
        }}
        className="relative flex items-center gap-3 rounded-2xl border border-border/70 bg-gradient-to-br from-white to-surface/80 p-4 shadow-[0_2px_12px_rgba(27,67,50,0.06)]"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary">{item.name}</p>
          <p className="mt-0.5 text-xs text-text-muted">
            {formatINR(item.price)} per {item.unit}
          </p>
        </div>

        <div className="flex items-center rounded-2xl bg-gradient-to-br from-surface to-border/30 p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]">
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => updateQty(item.id, item.qty - 1, item.stock)}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-text-primary transition-all hover:bg-danger/10"
            aria-label={`Decrease quantity for ${item.name}`}
          >
            {item.qty === 1 ? <Trash2 size={15} className="text-danger" /> : <Minus size={16} />}
          </motion.button>
          <span className="rupee w-12 text-center text-base font-bold">{item.qty}</span>
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => updateQty(item.id, item.qty + 1, item.stock)}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-text-primary transition-all hover:bg-primary/10"
            aria-label={`Increase quantity for ${item.name}`}
          >
            <Plus size={16} />
          </motion.button>
        </div>

        <div className="w-22 text-right">
          <p className="rupee text-base font-bold text-primary">{formatINR(item.qty * item.price)}</p>
        </div>
      </motion.div>
    </div>
  )
}
