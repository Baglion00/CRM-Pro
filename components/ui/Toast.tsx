import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    info: 'bg-slate-700'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-white" />,
    error: <AlertCircle className="w-5 h-5 text-white" />,
    info: <CheckCircle className="w-5 h-5 text-white" />
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white transform transition-all animate-in slide-in-from-bottom-5 fade-in duration-300 ${bgColors[type]}`}>
      {icons[type]}
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors">
        <X size={14} />
      </button>
    </div>
  );
};