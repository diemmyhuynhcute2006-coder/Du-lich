import React from 'react';
import { useTravel } from '../../context/TravelContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useTravel();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all transform translate-y-0 opacity-100 ${
            toast.type === 'success'
              ? 'bg-[#1A2238] text-white border-stone-700'
              : toast.type === 'warning'
              ? 'bg-[#B83A2E] text-white border-[#96291F]'
              : 'bg-white text-stone-800 border-stone-200'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-[#B83A2E] shrink-0" />}
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
