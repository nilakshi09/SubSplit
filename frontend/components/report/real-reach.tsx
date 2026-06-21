'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatNumber } from '@/lib/format'

interface Props {
  realReach: number
  totalFollowers: number
  fraudScore: number
}

export function RealReach({ realReach, totalFollowers, fraudScore }: Props) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const pct = totalFollowers > 0 ? Math.round((realReach / totalFollowers) * 100) : 0
  
  let colorClass = 'text-green-500'
  let bgClass = 'bg-green-500'
  
  if (fraudScore >= 60) {
    colorClass = 'text-red-500'
    bgClass = 'bg-red-500'
  } else if (fraudScore >= 30) {
    colorClass = 'text-amber-500'
    bgClass = 'bg-amber-500'
  }

  return (
    <div className="flex flex-col justify-between p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md h-full min-h-[220px]">
      <div>
        <h3 className="text-sm text-gray-400 font-medium">Estimated Real Reach</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">{formatNumber(realReach)}</span>
          <span className={`text-sm font-medium ${colorClass}`}>({pct}% authentic)</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          of {formatNumber(totalFollowers)} total followers
        </p>
      </div>

      <div className="mt-6">
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: mounted ? `${pct}%` : 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className={`h-full ${bgClass} rounded-full`}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: mounted ? `${100 - pct}%` : 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="h-full bg-red-500/40 rounded-r-full"
          />
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Based on combined fraud signal analysis
        </p>
      </div>
    </div>
  )
}
