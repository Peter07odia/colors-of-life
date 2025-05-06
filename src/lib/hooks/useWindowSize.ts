'use client';

import { useState, useEffect } from 'react';

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  const handleResize = () => {
    // Update window size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Update CSS variable for viewport height
    // This is especially important for mobile browsers where viewport height can change
    // when the address bar shows/hides
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  };

  useEffect(() => {
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
} 