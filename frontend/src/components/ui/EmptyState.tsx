import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-4 text-[#718096]">{icon}</div>
      <h3 className="text-lg font-semibold text-[#2D3748] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#718096] mb-6 max-w-sm">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-[#4ADE80] text-white rounded-lg text-sm font-medium hover:bg-[#22c55e] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
