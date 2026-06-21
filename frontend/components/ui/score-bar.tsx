'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ScoreBarProps {
  score: number
  showLabel?: boolean
  animate?: boolean
  className?: string
}

export function ScoreBar({ score, showLabel = true, animate = true, className }: ScoreBarProps) {
  const clampedScore = Math.min(100, Math.max(0, score))
  
  let colorClass = 'bg-green-500'
  if (clampedScore >= 30) colorClass = 'bg-amber-500'
  if (clampedScore >= 60) colorClass = 'bg-red-500'

  return (
    <div className={cn('flex items-center gap-3 w-full', className)}>
      <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden relative">
        <motion.div
          initial={animate ? { width: 0 } : { width: `${clampedScore}%` }}
          animate={{ width: `${clampedScore}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn('h-full rounded-full', colorClass)}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-white tabular-nums w-6 text-right">
          {Math.round(clampedScore)}
        </span>
      )}
    </div>
  )
}
