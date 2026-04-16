import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productService } from '../services/services'

export function useProducts() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await productService.getAll()
      const data = response.data?.data || response.data || {}
      const products = data.products || []
      const external = data.externalProducts || []

      const localProducts = products.map(p => ({ ...p, id: p._id || p.id, source: 'local' }))
      const extProducts = external
        .filter(ep => !products.some(lp => lp.name.toLowerCase() === ep.name.toLowerCase()))
        .map((p, i) => ({
          ...p,
          id: `ext-${i}`,
          price: 0,
          stock: 0,
          unit: 'pcs',
          lowStockThreshold: 10,
          source: 'external',
        }))

      return { local: localProducts, external: extProducts }
    },
    staleTime: 0,
  })

  const invalidateRelated = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['products'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['billing'] }),
    ])

  const addMutation = useMutation({
    mutationFn: async (product) => {
      console.log('Sending product:', product)
      const response = await productService.create(product)
      console.log('Response:', response)
      return response.data
    },
    onSuccess: invalidateRelated,
  })

  const updateMutation = useMutation({
    mutationFn: async ({ productId, updates }) => {
      const response = await productService.update(productId, updates)
      return response.data
    },
    onSuccess: invalidateRelated,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await productService.delete(id)
      return response.data
    },
    onSuccess: invalidateRelated,
  })

  const allProducts = query.data ? [...query.data.local, ...query.data.external] : []

  return {
    ...query,
    products: allProducts,
    localProducts: query.data?.local || [],
    externalProducts: query.data?.external || [],
    addProduct: addMutation.mutateAsync,
    updateProduct: (productId, updates) => updateMutation.mutateAsync({ productId, updates }),
    deleteProduct: deleteMutation.mutateAsync,
    isMutating: addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  }
}
