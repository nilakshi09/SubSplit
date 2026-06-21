import { cn } from '@/lib/utils'

export type RiskLevel = 'low' | 'medium' | 'high'

interface RiskBadgeProps {
  riskLevel: RiskLevel
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const config = {
  low: {
    label: '✅ Clean',
    classes: 'bg-green-400/10 text-green-400 border-green-400/20',
  },
  medium: {
    label: '⚠️ Review',
    classes: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  },
  high: {
    label: '🚨 Suspicious',
    classes: 'bg-red-400/10 text-red-400 border-red-400/20',
  },
}

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
}

export function RiskBadge({ riskLevel, size = 'md', className }: RiskBadgeProps) {
  const { label, classes } = config[riskLevel] || config.medium

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border whitespace-nowrap',
        sizes[size],
        classes,
        className
      )}
    >
      {label}
    </span>
  )
}
