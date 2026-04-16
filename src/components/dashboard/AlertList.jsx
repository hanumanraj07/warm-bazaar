import { motion } from 'framer-motion'
import { formatINR } from '../../utils/helpers'

export default function AlertList({ products }) {
  return (
    <div className="space-y-3">
      {products.map((product, index) => {
        const percentage = Math.max((product.stock / Math.max(product.lowThreshold, 1)) * 100, 10)
        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group overflow-hidden rounded-2xl border border-danger/30 bg-gradient-to-br from-white to-danger/[0.03] px-4 py-3.5 shadow-[0_2px_12px_rgba(239,68,68,0.06)] transition-all hover:shadow-[0_4px_16px_rgba(239,68,68,0.1)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary transition-colors group-hover:text-danger">{product.name}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {product.stock} {product.unit} left • {formatINR(product.price)}
                </p>
              </div>
              <span className="rounded-xl bg-danger/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-danger">Low</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-danger/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentage, 100)}%` }}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-danger to-rose-500 shadow-[0_1px_4px_rgba(239,68,68,0.4)]"
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
