import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { ScanFilters, PaginatedScans } from '@/types/scan'

export function useScans(filters: ScanFilters = {}) {
  return useQuery({
    queryKey: ['scans', filters],
    queryFn: () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value))
        }
      })
      return api.get<PaginatedScans>(`/api/scans?${params.toString()}`)
    },
    staleTime: 1000 * 30, // 30 seconds
  })
}
