import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '../../lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  fallbackAlt?: string;
  onLoadingComplete?: () => void;
  className?: string;
  containerClassName?: string;
}

/**
 * Optimized image component with error handling and lazy loading
 * Uses Next.js Image with additional fallback support
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = '/images/user-avatar.svg',
  fallbackAlt = 'Image not available',
  onLoadingComplete,
  className,
  containerClassName,
  priority = false,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string | any>(src);
  const [imgAlt, setImgAlt] = useState<string>(alt);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Handle image error
  const handleError = () => {
    setImgSrc(fallbackSrc);
    setImgAlt(fallbackAlt);
    setError(true);
    console.warn(`Failed to load image: ${src}`);
  };

  // Handle image load completion
  const handleLoadingComplete = () => {
    setIsLoaded(true);
    onLoadingComplete?.();
  };

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      <Image 
        src={imgSrc}
        alt={imgAlt}
        className={cn(
          'transition-opacity duration-300',
          !isLoaded && !priority ? 'opacity-0' : 'opacity-100',
          error ? 'bg-gray-100' : '',
          className
        )}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        onError={handleError}
        onLoadingComplete={handleLoadingComplete}
        {...props}
      />
      
      {!isLoaded && !priority && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
    </div>
  );
};

export default OptimizedImage; 