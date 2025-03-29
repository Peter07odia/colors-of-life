import React from 'react';
import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Colors of Life',
  description: 'AI-Powered Fashion and Style Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-background-main">
          {children}
        </main>
      </body>
    </html>
  );
} 