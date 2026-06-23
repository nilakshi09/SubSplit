import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingStyles: Record<string, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className = '', hover = false, onClick, padding = 'md' }: CardProps) {
  const baseStyles = `bg-white rounded-xl border border-[#E2E8F0] ${paddingStyles[padding]}`;
  const hoverStyles = hover ? 'hover:border-[#4ADE80]/50 hover:shadow-lg transition-all cursor-pointer' : '';

  if (hover) {
    return (
      <motion.div
        whileHover={{ scale: 1.005 }}
        onClick={onClick}
        className={`${baseStyles} ${hoverStyles} ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div onClick={onClick} className={`${baseStyles} ${className}`}>
      {children}
    </div>
  );
}
