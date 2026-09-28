import React from 'react';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-stone-300 rounded-2xl bg-white/50 my-6">
      {icon && (
        <div className="text-4xl mb-3 select-none flex items-center justify-center">
          {typeof icon === 'string' ? <span>{icon}</span> : icon}
        </div>
      )}
      <h3 className="font-editorial text-lg font-bold text-stone-900">{title}</h3>
      <p className="mt-1 text-sm text-stone-600 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B83A2E] hover:bg-[#96291F] text-white text-sm font-medium shadow-xs transition-all hover:shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
