'use client';

import dynamic from 'next/dynamic';

// Dynamically import the AppReset component with no SSR to avoid hydration issues
const AppReset = dynamic(() => import('./AppReset'), { ssr: false });

export default function ClientAppReset() {
  return <AppReset />;
} 