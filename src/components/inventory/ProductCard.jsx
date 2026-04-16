import { motion } from 'framer-motion'
import { formatINR } from '../../utils/helpers'
import StockBadge from './StockBadge'

const categoryColors = {
  Grains: '#F4A261',
  Oil: '#E76F51',
  Snacks: '#2A9D8F',
  Dairy: '#264653',
  Spices: '#E9C46A',
  Beverages: '#6D597A',
  Cleaning: '#355070',
  'Personal Care': '#B56576',
  Pulses: '#1B4332',
}

export default function ProductCard({ product, onClick }) {
  const dotColor = categoryColors[product.category] || '#6B7280'
  const isExternal = product.source === 'external'

  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="group card-accent flex w-full items-center gap-4 rounded-2xl border border-border/70 bg-gradient-to-br from-white to-surface/80 p-4 text-left shadow-[0_2px_12px_rgba(27,67,50,0.04)] transition-all hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(27,67,50,0.1)]"
      style={{ borderLeftColor: dotColor, borderLeftWidth: 4 }}
    >
      {product.image ? (
        <div className="flex h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
          style={{ backgroundColor: `${dotColor}20` }}
        >
          <span className="h-4 w-4 rounded-full" style={{ backgroundColor: dotColor }} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-primary">{product.name}</p>
        <p className="mt-1 text-xs text-text-muted">
          {product.category} • {product.price > 0 ? `${formatINR(product.price)}/${product.unit}` : 'No price set'}
          {isExternal && <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">Catalog</span>}
        </p>
      </div>
      {isExternal ? (
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">+ Add</span>
      ) : (
        <StockBadge quantity={product.stock} unit={product.unit} lowThreshold={product.lowThreshold} />
      )}
    </motion.button>
  )
}
