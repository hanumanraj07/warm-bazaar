import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supplierService, paymentService, purchaseService, uploadService } from '../services/services'

export function useSuppliers() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await supplierService.getAll()
      const suppliers = response.data?.data?.suppliers || response.data?.suppliers || []
      return suppliers.map(s => ({ ...s, id: s._id || s.id, pending: s.totalPayable || 0 }))
    },
    placeholderData: [],
  })

  const invalidateRelated = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    ])

  const paymentMutation = useMutation({
    mutationFn: async (payment) => {
      const response = await paymentService.recordSupplierPayment(payment)
      return response.data
    },
    onSuccess: invalidateRelated,
  })

  const purchaseMutation = useMutation({
    mutationFn: async (purchase) => {
      const response = await purchaseService.create(purchase)
      return response.data
    },
    onSuccess: invalidateRelated,
  })

  const createMutation = useMutation({
    mutationFn: async (supplier) => {
      const response = await supplierService.create(supplier)
      return response.data
    },
    onSuccess: invalidateRelated,
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const response = await supplierService.update(id, updates)
      return response.data
    },
    onSuccess: invalidateRelated,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await supplierService.delete(id)
      return response.data
    },
    onSuccess: invalidateRelated,
  })

  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ id, file }) => {
      const response = await uploadService.uploadPhoto('supplier', id, file)
      return response.data
    },
    onSuccess: invalidateRelated,
  })

  const removePhotoMutation = useMutation({
    mutationFn: async (id) => {
      const response = await uploadService.removePhoto('supplier', id)
      return response.data
    },
    onSuccess: invalidateRelated,
  })

  return {
    ...query,
    suppliers: Array.isArray(query.data) ? query.data : [],
    addPayment: paymentMutation.mutateAsync,
    addPurchase: purchaseMutation.mutateAsync,
    createSupplier: createMutation.mutateAsync,
    updateSupplier: (id, updates) => updateMutation.mutateAsync({ id, updates }),
    deleteSupplier: deleteMutation.mutateAsync,
    uploadSupplierPhoto: uploadPhotoMutation.mutateAsync,
    removeSupplierPhoto: removePhotoMutation.mutateAsync,
    isMutating: paymentMutation.isPending || purchaseMutation.isPending || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || uploadPhotoMutation.isPending || removePhotoMutation.isPending,
  }
}

export function useSupplier(id) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      const response = await supplierService.getById(id)
      const data = response.data?.data || response.data || {}
      const supplier = data.supplier
      if (!supplier) return null
      return {
        ...supplier,
        id: supplier._id || supplier.id,
        pending: supplier.totalPayable || 0,
        payments: (data.transactions || []).filter(t => t.type === 'PAYMENT'),
        purchases: (data.transactions || []).filter(t => t.type === 'PURCHASE'),
      }
    },
    enabled: !!id,
  })
}
