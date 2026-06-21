import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { DashboardStats } from '@/types/scan'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get<DashboardStats>('/api/users/me/stats'),
    staleTime: 1000 * 60, // 1 minute
  })
}
