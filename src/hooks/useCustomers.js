import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { customerService, paymentService, uploadService } from '../services/services'

export function useCustomers() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await customerService.getAll()
      const customers = response.data?.data?.customers || response.data?.customers || []
      return customers.map(c => ({ ...c, id: c._id || c.id, pending: c.totalUdhar || 0 }))
    },
    placeholderData: [],
  })

  const invalidateRelated = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['customers'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['billing'] }),
    ])

  const addMutation = useMutation({
    mutationFn: async (payment) => {
      const response = await paymentService.recordCustomerPayment(payment)
      return response.data
    },
    onSuccess: invalidateRelated,
  })

  const createMutation = useMutation({
    mutationFn: async (customer) => {
      const response = await customerService.create(customer)
      return response.data
    },
    onSuccess: invalidateRelated,
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const response = await customerService.update(id, updates)
      return response.data
    },
    onSuccess: invalidateRelated,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await customerService.delete(id)
      return response.data
    },
    onSuccess: invalidateRelated,
  })

  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ id, file }) => {
      const response = await uploadService.uploadPhoto('customer', id, file)
      return response.data
    },
    onSuccess: invalidateRelated,
  })

  const removePhotoMutation = useMutation({
    mutationFn: async (id) => {
      const response = await uploadService.removePhoto('customer', id)
      return response.data
    },
    onSuccess: invalidateRelated,
  })

  return {
    ...query,
    customers: Array.isArray(query.data) ? query.data : [],
    addPayment: addMutation.mutateAsync,
    createCustomer: createMutation.mutateAsync,
    updateCustomer: (id, updates) => updateMutation.mutateAsync({ id, updates }),
    deleteCustomer: deleteMutation.mutateAsync,
    uploadCustomerPhoto: uploadPhotoMutation.mutateAsync,
    removeCustomerPhoto: removePhotoMutation.mutateAsync,
    isMutating: addMutation.isPending || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || uploadPhotoMutation.isPending || removePhotoMutation.isPending,
  }
}

export function useCustomer(id) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await customerService.getById(id)
      const data = response.data?.data || response.data || {}
      const customer = data.customer
      if (!customer) return null
      return {
        ...customer,
        id: customer._id || customer.id,
        pending: customer.totalUdhar || 0,
        transactions: data.transactions || [],
      }
    },
    enabled: !!id,
  })
}
