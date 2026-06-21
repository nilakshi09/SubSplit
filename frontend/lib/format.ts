import { formatDistanceToNow, format } from 'date-fns'

// Format large numbers: 412000 → "412K", 1200000 → "1.2M"
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString()
}

// Format as percentage: 0.432 → "43.2%"
export function formatPercent(n: number, decimals = 1): string {
  return `${(n * 100).toFixed(decimals)}%`
}

// Format engagement rate: 2.1 → "2.1%"
export function formatER(n: number): string {
  return `${n.toFixed(1)}%`
}

// Relative time: "2 hours ago", "3 days ago"
export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

// Full date: "June 10, 2026"
export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'MMMM d, yyyy')
}

// Short date: "Jun 10"
export function formatDateShort(dateStr: string): string {
  return format(new Date(dateStr), 'MMM d')
}

// Risk level to display label
export function riskLabel(level: string): string {
  const map: Record<string, string> = {
    low: 'Clean',
    medium: 'Review',
    high: 'Suspicious',
  }
  return map[level] ?? level
}

// Score to color class
export function scoreColor(score: number): string {
  if (score < 30) return 'text-green-400'
  if (score < 60) return 'text-amber-400'
  return 'text-red-400'
}

// Score to background color class
export function scoreBg(score: number): string {
  if (score < 30) return 'bg-green-400/10 border-green-400/20'
  if (score < 60) return 'bg-amber-400/10 border-amber-400/20'
  return 'bg-red-400/10 border-red-400/20'
}

// Risk level to color class
export function riskColor(level: string): string {
  const map: Record<string, string> = {
    low: 'text-green-400',
    medium: 'text-amber-400',
    high: 'text-red-400',
  }
  return map[level] ?? 'text-gray-400'
}

// Confidence level to label
export function confidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return 'High confidence'
  if (confidence >= 0.5) return 'Medium confidence'
  return 'Low confidence'
}

// Confidence level to color
export function confidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-400'
  if (confidence >= 0.5) return 'text-amber-400'
  return 'text-red-400'
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Format follower tier for display
export function formatTier(tier: string): string {
  const map: Record<string, string> = {
    nano: 'Nano (1K–10K)',
    micro: 'Micro (10K–50K)',
    mid: 'Mid (50K–200K)',
    macro: 'Macro (200K–1M)',
    mega: 'Mega (1M+)',
  }
  return map[tier] ?? tier
}
