'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({
  id,
  title,
  message,
  type = 'info',
  duration = 5000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(true);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!duration) return;
    
    const timer = setTimeout(() => {
      setRemoving(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (removing) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose(id);
      }, 300); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [removing, onClose, id]);

  if (!visible) return null;

  const iconMap = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  };

  const bgMap = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 max-w-md w-full mx-auto z-50 px-4 pointer-events-none sm:px-6 md:px-0',
        'animate-in slide-in-from-bottom-10 duration-300',
        removing && 'animate-out slide-out-to-bottom-10 duration-300'
      )}
    >
      <div 
        className={cn(
          'p-4 rounded-lg shadow-md border pointer-events-auto flex items-start',
          bgMap[type]
        )}
      >
        <div className="shrink-0">{iconMap[type]}</div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium text-gray-900">{title}</h3>}
          <div className="text-sm text-gray-700 mt-1">{message}</div>
        </div>
        <button
          onClick={() => setRemoving(true)}
          className="ml-4 shrink-0 rounded-md p-1.5 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="sr-only">Close</span>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ToastContainer component to manage multiple toasts
interface ToastContainerProps {
  toasts: ToastProps[];
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Don't render anything during SSR
  if (!isBrowser) return null;

  // Wait until we're in the browser to access the DOM
  const container = typeof document !== 'undefined' 
    ? document.getElementById('toast-container') || document.body
    : null;

  if (!container) return null;

  return createPortal(
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </>,
    container
  );
}

// Toast Context for global access
import { createContext, useContext, ReactNode } from 'react';

interface ToastContextType {
  showToast: (props: Omit<ToastProps, 'id' | 'onClose'>) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Set mounted to true once the component has mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (props: Omit<ToastProps, 'id' | 'onClose'>): string => {
    // Use a timestamp-based ID to ensure consistency between SSR and client
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prev) => [...prev, { ...props, id, onClose: removeToast }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Only render the ToastContainer on the client after mounting */}
      {mounted && <ToastContainer toasts={toasts} removeToast={removeToast} />}
    </ToastContext.Provider>
  );
} 