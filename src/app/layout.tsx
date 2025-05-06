import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import ClientLayout from '../components/shared/ClientLayout';

export const metadata: Metadata = {
  title: 'Colors of Life',
  description: 'AI-Powered Fashion and Style Platform',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Colors of Life',
  },
  themeColor: '#FFFFFF',
};

// Move viewport and themeColor to viewport export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

// This helps with hydration errors by forcing the client to ignore the 
// server rendered HTML and rerender from scratch
export const unstable_skipClientCache = true;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden">
        <div id="toast-container" />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
} 