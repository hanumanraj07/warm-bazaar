import { useState } from 'react'
import Sheet from '../ui/Sheet'
import Button from '../ui/Button'
import Input from '../ui/Input'
import ConfirmDialog from '../ui/ConfirmDialog'
import { categories, units } from '../../mockData'

const initialForm = {
  name: '',
  category: 'Grains',
  price: '',
  costPrice: '',
  stock: '',
  unit: 'kg',
  lowThreshold: 10,
  expiryDate: '',
  hsnCode: '',
  gstRate: '0',
  image: '',
}

const getInitialForm = (product) =>
  product
    ? {
        name: product.name,
        category: product.category || 'General',
        price: String(product.price || ''),
        costPrice: String(product.costPrice || ''),
        stock: String(product.stock || 0),
        unit: product.unit || 'pcs',
        lowThreshold: product.lowStockThreshold || product.lowThreshold || 10,
        expiryDate: product.expiryDate || '',
        hsnCode: product.hsnCode || '',
        gstRate: String(product.gstRate || '0'),
        image: product.image || '',
      }
    : initialForm

export default function ProductSheet({ isOpen, onClose, product, onSave, onDelete, isSaving }) {
  const [form, setForm] = useState(() => getInitialForm(product))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isEdit = Boolean(product)
  const isExternal = product?.source === 'external'

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const profit = form.price && form.costPrice ? Number(form.price) - Number(form.costPrice) : null
  const profitMargin = profit !== null && form.price ? ((profit / Number(form.price)) * 100).toFixed(1) : null

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return

    await onSave({
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      costPrice: Number(form.costPrice) || 0,
      stock: Number(form.stock || 0),
      unit: form.unit,
      lowStockThreshold: Number(form.lowThreshold || 0),
      expiryDate: form.expiryDate || undefined,
      hsnCode: form.hsnCode || undefined,
      gstRate: Number(form.gstRate) || 0,
      image: form.image || undefined,
    })

    onClose()
  }

  return (
    <>
      <Sheet
        isOpen={isOpen}
        onClose={onClose}
        title={isExternal ? 'Add product from catalog' : isEdit ? 'Edit product' : 'Add product'}
        footer={
          <div className="flex gap-3">
            {isEdit && !isExternal ? (
              <Button variant="danger" className="flex-1" onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            ) : null}
            <Button className="flex-1" onClick={handleSave} disabled={isSaving || !form.name.trim() || !form.price}>
              {isSaving ? 'Saving...' : isExternal ? 'Add to Inventory' : isEdit ? 'Update Product' : 'Save Product'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {form.image && (
            <div className="flex items-center gap-4 rounded-[1.6rem] border border-border/70 bg-surface p-4">
              <img src={form.image} alt={form.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary">{form.name}</p>
                <p className="text-xs text-text-muted">Product image from catalog</p>
              </div>
            </div>
          )}

          <Input
            label="Product Name"
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
            placeholder="e.g. Toor Dal Premium"
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-muted">Category</label>
            <select
              value={form.category}
              onChange={(event) => setField('category', event.target.value)}
              className="w-full min-h-[52px] rounded-2xl border border-border bg-surface-card px-4 text-sm text-text-primary shadow-card outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              {categories.filter((category) => category !== 'All').map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Selling Price"
              prefix={'\u20B9'}
              value={form.price}
              onChange={(event) => setField('price', event.target.value)}
              type="number"
              inputClassName="rupee"
            />
            <Input
              label="Cost Price"
              prefix={'\u20B9'}
              value={form.costPrice}
              onChange={(event) => setField('costPrice', event.target.value)}
              type="number"
              inputClassName="rupee"
            />
          </div>

          {profit !== null && (
            <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-center">
              <span className="text-sm font-medium text-success">
                Profit: ₹{profit.toFixed(2)} {profitMargin !== null && `(${profitMargin}%)`}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity"
              value={form.stock}
              onChange={(event) => setField('stock', event.target.value)}
              type="number"
              inputClassName="rupee"
            />
            <Input
              label="HSN Code (optional)"
              value={form.hsnCode}
              onChange={(event) => setField('hsnCode', event.target.value)}
              placeholder="1234"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-muted">Unit</label>
            <div className="grid grid-cols-4 gap-2">
              {units.map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setField('unit', unit)}
                  className={`min-h-[44px] rounded-xl text-sm font-semibold transition ${
                    form.unit === unit
                      ? 'bg-primary text-white'
                      : 'border border-border bg-surface-card text-text-muted hover:bg-surface'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Low Stock Alert"
              value={form.lowThreshold}
              onChange={(event) => setField('lowThreshold', event.target.value)}
              type="number"
              inputClassName="rupee"
            />
            <Input
              label="GST Rate (%)"
              value={form.gstRate}
              onChange={(event) => setField('gstRate', event.target.value)}
              type="number"
              placeholder="0"
            />
          </div>

          <Input
            label="Expiry Date (optional)"
            value={form.expiryDate}
            onChange={(event) => setField('expiryDate', event.target.value)}
            type="date"
          />
        </div>
      </Sheet>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await onDelete(product.id)
          setConfirmDelete(false)
          onClose()
        }}
        title="Delete this product?"
        message="This removes the product from inventory tracking. Existing bill history will stay untouched."
      />
    </>
  )
}
