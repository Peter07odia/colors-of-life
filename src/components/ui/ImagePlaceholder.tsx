import React from 'react';

interface ImagePlaceholderProps {
  type: 'feed' | 'avatar' | 'product';
  className?: string;
}

export function ImagePlaceholder({ type, className = '' }: ImagePlaceholderProps) {
  const getPlaceholderContent = () => {
    switch (type) {
      case 'feed':
        return (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="text-gray-600 text-center">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Image not found</p>
            </div>
          </div>
        );
      case 'avatar':
        return (
          <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-1/2 h-1/2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'product':
        return (
          <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center">
            <svg className="w-1/2 h-1/2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${className} overflow-hidden`}>
      {getPlaceholderContent()}
    </div>
  );
} 