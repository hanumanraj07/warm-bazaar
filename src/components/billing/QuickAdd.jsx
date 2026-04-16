import { Clock3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatINR } from '../../utils/helpers'
import { useStore } from '../../store/useStore'

export default function QuickAdd({ products }) {
  const addToCart = useStore((state) => state.addToCart)
  const showToast = useStore((state) => state.showToast)

  const handleAdd = (product) => {
    const added = addToCart(product)
    if (!added) {
      showToast(`Only ${product.stock} ${product.unit} left for ${product.name}`, 'warning')
      return
    }
    showToast(`${product.name} added`, 'success')
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-[0_2px_8px_rgba(27,67,50,0.1)]">
          <Clock3 size={18} />
        </div>
        <div>
          <p className="text-base font-semibold text-text-primary">Quick Add</p>
          <p className="text-xs text-text-muted">Most-used items for the counter rush.</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {products.map((product, index) => (
          <motion.button
            key={product.id}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAdd(product)}
            className="group flex min-h-[95px] flex-col justify-between rounded-2xl border border-border/70 bg-gradient-to-br from-white to-surface/80 p-3.5 text-left shadow-[0_2px_12px_rgba(27,67,50,0.06)] transition-all hover:border-primary/40 hover:shadow-[0_8px_24px_rgba(27,67,50,0.12)]"
          >
            <span className="line-clamp-2 text-[12px] font-semibold leading-4 text-text-primary transition-colors group-hover:text-primary">
              {product.name}
            </span>
            <span className="rupee mt-2 text-[11px] font-medium text-text-muted">{formatINR(product.price)}</span>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
