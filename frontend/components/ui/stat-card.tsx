'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  valueColor?: string
  isLoading?: boolean
  delay?: number
  className?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  valueColor = 'text-white',
  isLoading = false,
  delay = 0,
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={cn(
        'bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 flex flex-col',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        {isLoading ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        )}
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      <div className="mt-auto">
        {isLoading ? (
          <Skeleton className="h-8 w-20 mb-1" />
        ) : (
          <div className={cn('text-3xl font-bold tracking-tight', valueColor)}>
            {value}
          </div>
        )}

        {(subtitle || isLoading) && (
          <div className="mt-2 text-xs text-gray-500">
            {isLoading ? <Skeleton className="h-3 w-32" /> : subtitle}
          </div>
        )}
      </div>
    </motion.div>
  )
}
