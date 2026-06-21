import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export function ChartCard({
  title,
  subtitle,
  children,
  isLoading,
  isEmpty,
  emptyMessage = 'Data unavailable',
}: ChartCardProps) {
  return (
    <div className="flex flex-col p-5 min-h-[280px] rounded-xl border border-white/10 bg-white/5">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      
      <div className="flex-1 w-full relative min-h-[240px]">
        {isLoading ? (
          <div className="absolute inset-0 animate-pulse bg-white/5 rounded-lg" />
        ) : isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-gray-500">{emptyMessage}</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
