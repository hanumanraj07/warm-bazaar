import { useState } from 'react'
import Sheet from '../ui/Sheet'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function AddCustomerSheet({ isOpen, onClose, onAdd, isSaving }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  })

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) return
    
    const data = {
      name: form.name.trim(),
      phone: form.phone.trim(),
    }
    
    if (form.email.trim()) data.email = form.email.trim()
    if (form.address.trim()) data.address = form.address.trim()
    
    await onAdd(data)
    
    setForm({ name: '', phone: '', email: '', address: '' })
    onClose()
  }

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Add Customer"
      footer={
        <Button className="w-full" onClick={handleSave} disabled={isSaving || !form.name.trim() || !form.phone.trim()}>
          {isSaving ? 'Adding...' : 'Add Customer'}
        </Button>
      }
    >
      <div className="space-y-4">
        <Input
          label="Customer Name"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="e.g. Ramesh Kumar"
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
          placeholder="e.g. ramesh@email.com"
          type="email"
        />
        <Input
          label="Address (optional)"
          value={form.address}
          onChange={(e) => setField('address', e.target.value)}
          placeholder="e.g. Shop No. 12, Main Market"
        />
      </div>
    </Sheet>
  )
}
