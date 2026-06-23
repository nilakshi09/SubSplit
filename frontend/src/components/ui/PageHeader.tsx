import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  backButton?: {
    label: string;
    onClick: () => void;
  };
}

export function PageHeader({ title, subtitle, action, backButton }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {backButton && (
        <button
          onClick={backButton.onClick}
          className="text-[#718096] hover:text-[#2D3748] mb-4 flex items-center gap-2"
        >
          <span>&larr;</span> {backButton.label}
        </button>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3748]">{title}</h1>
          {subtitle && <p className="text-[#718096] text-sm mt-1">{subtitle}</p>}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              action.variant === 'secondary'
                ? 'bg-[#F7F7F5] border border-[#E2E8F0] text-[#2D3748] hover:bg-[#F1F5F4]'
                : 'bg-[#4ADE80] text-[#2D3748] hover:bg-[#22c55e]'
            }`}
          >
            {action.icon}
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
