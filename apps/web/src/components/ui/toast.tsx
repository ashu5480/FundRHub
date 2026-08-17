'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const toastColors = {
  success: 'text-success-500',
  error: 'text-danger-500',
  info: 'text-primary-500',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, type, message }]);
      if (type !== 'error') {
        setTimeout(() => removeToast(id), 5000);
      }
    },
    [removeToast],
  );

  const success = useCallback((message: string) => showToast('success', message), [showToast]);
  const error = useCallback((message: string) => showToast('error', message), [showToast]);
  const info = useCallback((message: string) => showToast('info', message), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-80" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.type];
          return (
            <div
              key={toast.id}
              className="flex items-start gap-3 bg-white border border-neutral-200 rounded-lg shadow-elevated p-4"
              role={toast.type === 'error' ? 'alert' : 'status'}
            >
              <Icon className={`h-5 w-5 shrink-0 ${toastColors[toast.type]}`} />
              <p className="flex-1 text-sm text-neutral-700">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-neutral-400 hover:text-neutral-600"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}