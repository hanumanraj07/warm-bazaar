import { useState } from 'react'
import Sheet from '../ui/Sheet'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function AddSupplierSheet({ isOpen, onClose, onAdd, isSaving }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    businessName: '',
  })

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) return
    
    const data = {
      name: form.name.trim(),
      phone: form.phone.trim(),
    }
    
    if (form.businessName.trim()) data.businessName = form.businessName.trim()
    if (form.email.trim()) data.email = form.email.trim()
    if (form.address.trim()) data.address = form.address.trim()
    
    await onAdd(data)
    
    setForm({ name: '', phone: '', email: '', address: '', businessName: '' })
    onClose()
  }

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Add Supplier"
      footer={
        <Button className="w-full" onClick={handleSave} disabled={isSaving || !form.name.trim() || !form.phone.trim()}>
          {isSaving ? 'Adding...' : 'Add Supplier'}
        </Button>
      }
    >
      <div className="space-y-4">
        <Input
          label="Supplier Name"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="e.g. Milk Singh"
        />
        <Input
          label="Business Name (optional)"
          value={form.businessName}
          onChange={(e) => setField('businessName', e.target.value)}
          placeholder="e.g. Sharma Dairy Products"
        />
        <Input
          label="Phone Number"
          value={form.phone}
          onChange={(e) => setField('phone', e.target.value)}
          placeholder="e.g. 9876543210"
          type="tel"
        />
        <Input
          label="Email (optional)"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          placeholder="e.g. milksingh@email.com"
          type="email"
        />
        <Input
          label="Address (optional)"
          value={form.address}
          onChange={(e) => setField('address', e.target.value)}
          placeholder="e.g. Wholesale Market, Sector 15"
        />
      </div>
    </Sheet>
  )
}
