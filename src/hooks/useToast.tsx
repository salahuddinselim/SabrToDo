'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    warning: (message: string) => showToast(message, 'warning'),
    info: (message: string) => showToast(message, 'info'),
  };

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
      <div
        className={cn(
          'fixed z-50 flex flex-col gap-2 pointer-events-none',
          'bottom-5 left-3 right-3',
          'sm:left-auto sm:right-5 sm:w-[380px]'
        )}
        style={{ maxWidth: 'calc(100vw - 24px)' }}
      >
        <AnimatePresence initial={false}>
          {toasts.slice(-5).map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="pointer-events-auto"
              layout
            >
              <ToastItem toast={t} onDismiss={dismissToast} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const icons = {
    success: <CheckCircle className="w-4 h-4 text-accent-green" />,
    error: <AlertCircle className="w-4 h-4 text-accent-red" />,
    info: <Info className="w-4 h-4 text-accent-blue" />,
    warning: <AlertTriangle className="w-4 h-4 text-accent-yellow" />,
  };

  const accentBorders = {
    success: 'border-l-accent-green',
    error: 'border-l-accent-red',
    info: 'border-l-accent-blue',
    warning: 'border-l-accent-yellow',
  };

  return (
    <div
      className={cn(
        'bg-raised border border-white/10 rounded-[14px]',
        'border-l-[3px] shadow-lg shadow-accent-blue/20',
        'flex items-start gap-3',
        'pl-4 pr-3 py-[11px]',
        accentBorders[toast.type]
      )}
    >
      <span className="mt-0.5 shrink-0">{icons[toast.type]}</span>
      <p className="flex-1 text-[13px] text-primary leading-[1.4] min-w-0">
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-ink-dim hover:text-primary transition-colors mt-0.5"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
