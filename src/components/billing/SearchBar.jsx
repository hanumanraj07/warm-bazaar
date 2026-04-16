import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Badge from '../ui/Badge'
import { formatINR, stockStatus } from '../../utils/helpers'
import { useStore } from '../../store/useStore'

export default function SearchBar({ products }) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  const addToCart = useStore((state) => state.addToCart)
  const showToast = useStore((state) => state.showToast)
  const deferredQuery = useDeferredValue(query)

  const results = useMemo(() => {
    if (!deferredQuery.trim()) return []
    const normalized = deferredQuery.toLowerCase().trim()
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(normalized) ||
          product.category.toLowerCase().includes(normalized) ||
          product.barcode?.includes(normalized),
      )
      .slice(0, 6)
  }, [deferredQuery, products])

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const handleSelect = (product) => {
    if (product.stock <= 0) {
      showToast(`${product.name} is out of stock`, 'error')
      return
    }

    const added = addToCart(product)
    if (!added) {
      showToast(`Only ${product.stock} ${product.unit} available for ${product.name}`, 'warning')
      return
    }

    showToast(`${product.name} added to bill`, 'success')
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
          <Search size={20} className="text-text-muted" />
        </div>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search product or scan barcode..."
          className="w-full rounded-2xl border border-border/80 bg-gradient-to-br from-white to-surface/80 py-4 pl-12 pr-14 text-base font-medium text-text-primary shadow-[0_4px_16px_rgba(27,67,50,0.06)] outline-none transition-all placeholder:text-text-muted/70 focus:border-primary focus:bg-white focus:shadow-[0_4px_24px_rgba(27,67,50,0.12)]"
        />
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => showToast('Barcode scanner support can be connected next', 'warning')}
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-white shadow-[0_4px_12px_rgba(27,67,50,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(27,67,50,0.3)]"
          aria-label="Open barcode scanner"
        >
          <Camera size={18} />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && query.trim() ? (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-[calc(100%+0.75rem)] z-20 overflow-hidden rounded-[1.8rem] border border-border/80 bg-gradient-to-b from-white to-surface/95 shadow-[0_8px_40px_rgba(27,67,50,0.15)]"
          >
            {results.length ? (
              results.map((product, index) => {
                const status = stockStatus(product.stock, product.lowThreshold)
                return (
                  <motion.button
                    key={product.id}
                    type="button"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelect(product)}
                    className="flex w-full items-center justify-between gap-3 border-b border-border/60 px-5 py-4 text-left transition-all hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent last:border-b-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-primary">{product.name}</p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {product.category} • {formatINR(product.price)}/{product.unit}
                      </p>
                    </div>
                    <Badge color={status.level === 'ok' ? 'success' : status.color}>
                      {product.stock} {product.unit}
                    </Badge>
                  </motion.button>
                )
              })
            ) : (
              <div className="px-5 py-6 text-sm text-text-muted">No products matched "{query}".</div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
