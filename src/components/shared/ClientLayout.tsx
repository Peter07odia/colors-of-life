'use client';

import React, { useEffect, useState } from 'react';
import { ToastProvider } from '../ui/Toast';
import ErrorBoundary from './ErrorBoundary';
import { logger } from '../../lib/logger';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [mounted, setMounted] = useState(false);
  
  // Only run client-side code after component has mounted
  useEffect(() => {
    // Wait until after hydration to set mounted
    setMounted(true);
    
    // Only log after successful hydration
    try {
      logger.info('Application initialized', {
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }, 'app-init');
    } catch (error) {
      console.error('Error logging app initialization', error);
    }
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        if (typeof window !== 'undefined') {
          logger.error('Root level error caught', { error, errorInfo }, 'root-error-boundary');
        }
      }}
    >
      <ToastProvider>
        <main className="min-h-screen bg-background-main overflow-y-auto" suppressHydrationWarning>
          {children}
        </main>
      </ToastProvider>
    </ErrorBoundary>
  );
} 