import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/services'

const transformData = (data) => {
  if (!data) return null
  return {
    ...data,
    lowStock: (data.lowStock || []).map(p => ({ ...p, id: p._id || p.id })),
    recentBills: (data.recentBills || []).map(b => ({ ...b, id: b._id || b.id })),
    topSelling: (data.topSelling || []).map(p => ({ ...p, id: p._id || p.id })),
    quickAddProducts: (data.quickAddProducts || []).map(p => ({ ...p, id: p._id || p.id })),
  }
}

export function useDashboard() {
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await dashboardService.getSummary()
      const data = response.data?.data || response.data || {}
      return transformData(data)
    },
    placeholderData: {
      todaySales: 0,
      todayBills: 0,
      monthlyRevenue: 0,
      totalUdhar: 0,
      totalPayable: 0,
      monthlyExpenses: 0,
      weeklyChart: [],
      lowStock: [],
      recentBills: [],
      topSelling: [],
      quickAddProducts: [],
    },
  })

  return {
    ...query,
    dashboard: query.data,
    recentBills: query.data?.recentBills ?? [],
    lowStock: query.data?.lowStock ?? [],
  }
}
