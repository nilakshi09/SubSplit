import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from './Skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  trend?: { value: number; label: string };
  color?: 'default' | 'teal' | 'green' | 'orange';
  isLoading?: boolean;
}

const colorStyles: Record<string, { bg: string; text: string }> = {
  default: { bg: 'bg-white/10', text: 'text-gray-400' },
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-400' },
  green: { bg: 'bg-green-500/10', text: 'text-green-400' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
};

export function StatCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  color = 'default',
  isLoading = false,
}: StatCardProps) {
  const colors = colorStyles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
          <span className={colors.text}>{icon}</span>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-8 w-24 rounded" />
      ) : (
        <p className="text-white text-2xl font-bold mt-1">{value}</p>
      )}

      {subtitle && !isLoading && (
        <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
      )}

      {trend && !isLoading && (
        <div className="flex items-center gap-1 mt-2">
          <span className={trend.value >= 0 ? 'text-green-400 text-xs' : 'text-red-400 text-xs'}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-gray-500 text-xs">{trend.label}</span>
        </div>
      )}
    </motion.div>
  );
}
