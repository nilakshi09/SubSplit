'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 min-h-[400px]',
        className
      )}
    >
      <div className="bg-white/5 p-4 rounded-xl text-gray-400 mb-6 border border-white/10 shadow-sm">
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-400 max-w-sm mb-8 text-sm leading-relaxed">
        {description}
      </p>

      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-white text-black font-medium hover:bg-gray-100 transition-colors shadow-sm text-sm"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-white text-black font-medium hover:bg-gray-100 transition-colors shadow-sm text-sm"
          >
            {action.label}
          </button>
        )
      )}
    </motion.div>
  )
}
