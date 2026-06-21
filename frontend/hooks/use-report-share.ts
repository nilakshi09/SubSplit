import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { ShareReportResponse } from '@/types/scan'

export function useReportShare(scanId: string) {
  return useMutation({
    mutationFn: (expiresInDays: number) =>
      api.post<ShareReportResponse>(`/api/reports/${scanId}/share`, { expiresInDays }),
  })
}
