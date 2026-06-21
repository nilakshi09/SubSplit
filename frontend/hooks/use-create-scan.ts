import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { CreateScanResponse } from '@/types/scan'

interface CreateScanInput {
  platform: 'instagram'
  handle: string
}

export function useCreateScan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateScanInput) =>
      api.post<CreateScanResponse>('/api/scans', data),
    onSuccess: () => {
      // Invalidate scan list and stats so they refresh
      queryClient.invalidateQueries({ queryKey: ['scans'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
