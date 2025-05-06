import '../styles/globals.css';
import React from 'react';
import ClientAppReset from '../components/ClientAppReset';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <ClientAppReset />
      </body>
    </html>
  );
} 