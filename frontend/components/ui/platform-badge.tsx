import { Camera, Youtube } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlatformBadgeProps {
  platform: 'instagram' | 'youtube'
  size?: 'sm' | 'md'
  className?: string
}

export function PlatformBadge({ platform, size = 'md', className }: PlatformBadgeProps) {
  const isIg = platform === 'instagram'
  
  const bgClass = isIg 
    ? 'bg-gradient-to-r from-pink-500 to-purple-600'
    : 'bg-red-600'
    
  const label = isIg ? 'Instagram' : 'YouTube'
  const Icon = isIg ? Camera : Youtube
  
  const iconSize = size === 'sm' ? 14 : 16
  const textClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full text-white font-medium whitespace-nowrap shadow-sm',
      bgClass,
      textClass,
      className
    )}>
      <Icon size={iconSize} className="shrink-0" />
      {label}
    </span>
  )
}
