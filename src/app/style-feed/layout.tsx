'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface StyleFeedLayoutProps {
  children: React.ReactNode;
}

export default function StyleFeedLayout({
  children,
}: StyleFeedLayoutProps) {
  const pathname = usePathname();
  
  return (
    <main className="min-h-screen bg-white flex justify-center">
      {/* Main content area - centered with aspect ratio */}
      <div className="relative w-full max-w-[calc(100vh*0.6666)] h-screen bg-black">
        {children}
      </div>
    </main>
  );
} 