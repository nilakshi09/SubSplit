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
          className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
        >
          <span>&larr;</span> {backButton.label}
        </button>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              action.variant === 'secondary'
                ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                : 'bg-teal-500 text-white hover:bg-teal-600'
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
