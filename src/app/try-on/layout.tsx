import React from 'react';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Virtual Try-On | Colors of Life',
  description: 'Virtually try on outfits using AI technology',
};

export const viewport: Viewport = {
  themeColor: '#3B82F6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function TryOnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 