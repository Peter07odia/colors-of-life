'use client';

import React, { useEffect } from 'react';
import { StyleFeedVertical } from '../../components/feed/StyleFeedVertical';
import useWindowSize from '../../lib/hooks/useWindowSize';
import Head from 'next/head';

export default function StyleFeedPage() {
  const { height } = useWindowSize();
  
  // For mobile viewport handling
  useEffect(() => {
    // Set viewport height to actual viewport height
    const setVh = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    
    // Set the initial value
    setVh();
    
    // Update on resize (important for mobile browsers where the toolbar can appear/disappear)
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);
    
    // Force update after a slight delay to ensure all content is properly loaded
    const timer = setTimeout(() => {
      setVh();
      window.dispatchEvent(new Event('resize'));
    }, 500);
    
    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
      clearTimeout(timer);
    };
  }, []);
  
  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <StyleFeedVertical />
    </div>
  );
} 