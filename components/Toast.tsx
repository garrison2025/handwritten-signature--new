import React, { useEffect } from 'react';
import { Check, Info } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-8 left-1/2 z-[100] flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-full shadow-2xl animate-toast">
      {toast.type === 'success' ? (
        <div className="bg-green-500 rounded-full p-0.5">
            <Check size={14} className="text-white" strokeWidth={3} />
        </div>
      ) : (
        <Info size={18} className="text-blue-400" />
      )}
      <span className="text-sm font-medium tracking-wide">{toast.message}</span>
    </div>
  );
};

export default Toast;