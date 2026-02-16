import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { bg: 'bg-emerald-600', icon: <CheckCircle className="w-5 h-5" /> },
    error: { bg: 'bg-red-600', icon: <AlertCircle className="w-5 h-5" /> },
    warning: { bg: 'bg-amber-500', icon: <AlertTriangle className="w-5 h-5" /> },
    info: { bg: 'bg-slate-700', icon: <Info className="w-5 h-5" /> },
  };

  const { bg, icon } = config[type];

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white transition-all duration-300 ${bg} ${isVisible && !isLeaving
          ? 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0'
        }`}
    >
      {icon}
      <span className="font-medium text-sm max-w-xs">{message}</span>
      <button
        onClick={() => { setIsLeaving(true); setTimeout(onClose, 300); }}
        className="ml-1 p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};