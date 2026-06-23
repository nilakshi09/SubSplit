import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'teal' | 'gray';
  size?: 'sm' | 'md';
}

const variantStyles: Record<string, string> = {
  default: 'bg-[#F1F5F4] text-[#718096]',
  success: 'bg-green-500/20 text-green-400 border border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
  teal: 'bg-[#4ADE80]/20 text-[#16a34a] border border-[#4ADE80]/50',
  gray: 'bg-[#F7F7F5] text-[#718096]',
};

const sizeStyles: Record<string, string> = {
  sm: 'text-xs px-2 py-0.5 rounded-full',
  md: 'text-sm px-3 py-1 rounded-full',
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-medium ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
}
