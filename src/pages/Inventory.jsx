import { useDeferredValue, useMemo, useState } from 'react'
import { AlertTriangle, Plus, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import ProductCard from '../components/inventory/ProductCard'
import ProductSheet from '../components/inventory/ProductSheet'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonList } from '../components/ui/Skeleton'
import { categories } from '../mockData'
import { stockStatus } from '../utils/helpers'
import { useProducts } from '../hooks/useProducts'
import { useStore } from '../store/useStore'

const MotionButton = motion.button

export default function Inventory() {
  const { products, localProducts, externalProducts, isLoading, addProduct, updateProduct, deleteProduct, isMutating } = useProducts()
  const showToast = useStore((state) => state.showToast)

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const deferredSearch = useDeferredValue(search)

  const stats = useMemo(() => {
    const lowStockCount = localProducts.filter((product) => product.stock <= (product.lowStockThreshold || 10)).length
    const outOfStockCount = localProducts.filter((product) => product.stock <= 0).length
    return {
      total: localProducts.length,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
    }
  }, [localProducts])

  const filteredProducts = useMemo(() => {
    const normalized = deferredSearch.toLowerCase().trim()
    return products.filter((product) => {
      const isExternal = product.source === 'external'
      if (activeCategory === 'Catalog') {
        return isExternal && (!normalized || product.name.toLowerCase().includes(normalized))
      }
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory
      const matchesSearch =
        !normalized ||
        product.name.toLowerCase().includes(normalized) ||
        product.category.toLowerCase().includes(normalized)
      const threshold = product.lowStockThreshold ?? 10
      const matchesLowStock = !lowStockOnly || (isExternal ? false : product.stock <= threshold)
      return matchesCategory && matchesSearch && matchesLowStock
    })
  }, [activeCategory, deferredSearch, lowStockOnly, products])

  const handleSaveProduct = async (payload) => {
    if (editingProduct && editingProduct.source !== 'external') {
      await updateProduct(editingProduct.id, payload)
      showToast('Product updated', 'success')
      return
    }

    await addProduct(payload)
    showToast('Product added', 'success')
  }

  const handleDeleteProduct = async (productId) => {
    await deleteProduct(productId)
    showToast('Product deleted', 'warning')
  }

  return (
    <div className="relative space-y-5">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid gap-3 sm:grid-cols-3"
      >
        <div className="panel-card rounded-[1.8rem] border border-border/60 p-5 text-center shadow-[0_4px_20px_rgba(27,67,50,0.06)]">
          <p className="rupee text-3xl font-bold text-primary">{stats.total}</p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">In inventory</p>
        </div>
        <div className="overflow-hidden rounded-[1.8rem] border border-accent/40 bg-gradient-to-br from-accent/15 to-accent/5 p-5 text-center shadow-[0_4px_20px_rgba(244,162,97,0.1)]">
          <p className="rupee text-3xl font-bold text-accent-warm">{externalProducts.length}</p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-warm">Catalog items</p>
        </div>
        <div className="overflow-hidden rounded-[1.8rem] border border-danger/40 bg-gradient-to-br from-danger/15 to-danger/5 p-5 text-center shadow-[0_4px_20px_rgba(239,68,68,0.1)]">
          <p className="rupee text-3xl font-bold text-danger">{stats.outOfStock}</p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-danger">Out of stock</p>
        </div>
      </motion.section>

      {stats.lowStock ? (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          type="button"
          onClick={() => {
            setLowStockOnly(true)
            setActiveCategory('All')
            setSearch('')
          }}
          className="flex w-full items-center justify-between rounded-[1.8rem] border border-warning/40 bg-gradient-to-r from-warning/15 to-warning/5 px-5 py-4 text-left shadow-[0_4px_20px_rgba(245,158,11,0.1)] transition-all hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)] hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/20 text-warning shadow-[0_2px_12px_rgba(245,158,11,0.2)]">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-base font-semibold text-warning">{stats.lowStock} items running low</p>
              <p className="text-xs text-text-muted">View all low stock items</p>
            </div>
          </div>
          <span className="rounded-xl bg-warning/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-warning">Open</span>
        </motion.button>
      ) : null}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="panel-card rounded-[2rem] border border-border/60 p-5 shadow-[0_4px_24px_rgba(27,67,50,0.08)]"
      >
        <div className="relative">
          <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              if (event.target.value) setLowStockOnly(false)
            }}
            placeholder="Search products..."
            className="w-full rounded-2xl border border-border/80 bg-gradient-to-br from-white to-surface/80 py-4 pl-12 pr-4 text-sm text-text-primary shadow-[0_2px_12px_rgba(27,67,50,0.04)] outline-none transition-all placeholder:text-text-muted/70 focus:border-primary focus:bg-white focus:shadow-[0_4px_20px_rgba(27,67,50,0.1)]"
          />
        </div>

        <div className="mt-4 overflow-x-auto no-scrollbar">
          <div className="flex min-w-max gap-2.5">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setActiveCategory(category)
                  setLowStockOnly(false)
                }}
                className={`min-h-[44px] rounded-full px-4 text-sm font-semibold transition-all ${
                  activeCategory === category && !lowStockOnly
                    ? 'bg-gradient-to-br from-primary to-primary-light text-white shadow-[0_4px_16px_rgba(27,67,50,0.25)]'
                    : 'border border-border/70 bg-gradient-to-br from-white to-surface/80 text-text-muted hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
                }`}
              >
                {category}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setActiveCategory('Catalog')
                setLowStockOnly(false)
                setSearch('')
              }}
              className={`min-h-[44px] rounded-full px-4 text-sm font-semibold transition-all ${
                activeCategory === 'Catalog' && !lowStockOnly
                  ? 'bg-gradient-to-br from-accent to-accent-warm text-white shadow-[0_4px_16px_rgba(244,162,97,0.25)]'
                  : 'border border-accent/40 bg-gradient-to-br from-accent/10 to-accent/5 text-accent-warm hover:shadow-[0_2px_12px_rgba(244,162,97,0.1)]'
              }`}
            >
              Catalog ({externalProducts.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setLowStockOnly((value) => !value)
                setActiveCategory('All')
                setSearch('')
              }}
              className={`min-h-[44px] rounded-full px-4 text-sm font-semibold transition-all ${
                lowStockOnly
                  ? 'bg-gradient-to-br from-warning to-amber-500 text-white shadow-[0_4px_16px_rgba(245,158,11,0.25)]'
                  : 'border border-warning/40 bg-gradient-to-br from-warning/10 to-warning/5 text-warning hover:shadow-[0_2px_12px_rgba(245,158,11,0.1)]'
              }`}
            >
              Low stock only
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {isLoading ? (
            <SkeletonList count={5} />
          ) : filteredProducts.length ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => {
                  setEditingProduct(product)
                  setSheetOpen(true)
                }}
              />
            ))
          ) : (
            <EmptyState
              variant="products"
              title="No inventory items found"
              subtitle="Try another category or add a new product from the green action button."
            />
          )}
        </div>
      </motion.section>

      <MotionButton
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setEditingProduct(null)
          setSheetOpen(true)
        }}
        className="fixed bottom-28 right-5 z-30 flex h-16 w-16 items-center justify-center rounded-[1.8rem] bg-gradient-to-br from-primary to-primary-light text-white shadow-[0_8px_32px_rgba(27,67,50,0.3)] transition-all hover:shadow-[0_12px_40px_rgba(27,67,50,0.35)] xl:bottom-8"
        aria-label="Add product"
      >
        <Plus size={28} />
      </MotionButton>

      <ProductSheet
        key={sheetOpen ? editingProduct?.id ?? 'new-product' : 'product-sheet-closed'}
        isOpen={sheetOpen}
        onClose={() => {
          setSheetOpen(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        isSaving={isMutating}
      />
    </div>
  )
}
