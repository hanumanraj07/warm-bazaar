import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCustomers } from './useCustomers'
import { useProducts } from './useProducts'
import { billService, productService } from '../services/services'

export function useBilling() {
  const queryClient = useQueryClient()
  const productsQuery = useProducts()
  const customersQuery = useCustomers()

  const billsQuery = useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      const response = await billService.getAll()
      const bills = response.data?.bills || response.data || []
      return bills.map(b => ({ ...b, id: b._id || b.id }))
    },
    initialData: [],
  })

  const recentBillsQuery = useQuery({
    queryKey: ['bills', 'recent'],
    queryFn: async () => {
      const response = await billService.getRecent(5)
      const bills = response.data?.bills || response.data || []
      return bills.map(b => ({ ...b, id: b._id || b.id }))
    },
    initialData: [],
  })

  const saveBillMutation = useMutation({
    mutationFn: async (billData) => {
      const response = await billService.create(billData)
      return response.data
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['customers'] }),
        queryClient.invalidateQueries({ queryKey: ['bills'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]),
  })

  const cancelBillMutation = useMutation({
    mutationFn: async (id) => {
      const response = await billService.cancel(id)
      return response.data
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['customers'] }),
        queryClient.invalidateQueries({ queryKey: ['bills'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]),
  })

  return {
    products: productsQuery.products,
    customers: customersQuery.customers,
    bills: billsQuery.data ?? [],
    recentBills: recentBillsQuery.data ?? [],
    quickAddProducts: (productsQuery.products || []).filter(p => p.stock > 0).slice(0, 10),
    saveBill: saveBillMutation.mutateAsync,
    cancelBill: cancelBillMutation.mutateAsync,
    isSavingBill: saveBillMutation.isPending,
    isLoading:
      productsQuery.isLoading ||
      customersQuery.isLoading ||
      billsQuery.isLoading ||
      recentBillsQuery.isLoading,
  }
}
