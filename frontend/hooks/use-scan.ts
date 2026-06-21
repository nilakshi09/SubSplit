import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Scan } from '@/types/scan'

export function useScan(scanId: string | null) {
  return useQuery({
    queryKey: ['scan', scanId],
    queryFn: () => api.get<Scan>(`/api/scans/${scanId}`),
    enabled: !!scanId,
    // Poll every 2s while scan is still processing
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return 2000
      if (data.status === 'completed' || data.status === 'failed') return false
      return 2000
    },
    // Keep previous data visible while polling
    placeholderData: (prev) => prev,
  })
}
