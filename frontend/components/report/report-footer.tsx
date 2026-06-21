import React from 'react'
import { timeAgo } from '@/lib/format'
import type { Scan } from '@/types/scan'

interface Props {
  scan: Scan
}

export function ReportFooter({ scan }: Props) {
  let qualityBadge = null
  if (scan.dataQuality === 'full') {
    qualityBadge = <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Full data</span>
  } else if (scan.dataQuality === 'partial') {
    qualityBadge = <span className="flex items-center gap-1.5 text-amber-500/80"><span className="w-2 h-2 rounded-full bg-amber-500" /> Partial data — some signals have reduced confidence</span>
  } else if (scan.dataQuality === 'limited') {
    qualityBadge = <span className="flex items-center gap-1.5 text-red-500/80"><span className="w-2 h-2 rounded-full bg-red-500" /> Limited data — treat results with caution</span>
  }

  return (
    <div className="mt-12 py-8 border-t border-white/5 flex flex-col items-center justify-center gap-2 text-xs text-gray-500">
      <p>Scan completed {timeAgo(scan.createdAt)}</p>
      
      {scan.cached && scan.expiresAt && (
        <p>⚡ Cached result · expires {timeAgo(scan.expiresAt)}</p>
      )}
      
      {qualityBadge && (
        <div className="flex items-center mt-1">
          {qualityBadge}
        </div>
      )}
      
      <p className="mt-4">Powered by Spotbot · spotbot.io</p>
    </div>
  )
}
