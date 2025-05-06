'use client';

import React from 'react';
import Image from 'next/image';

interface StyleFeedItemProps {
  id: string | number;
  title: string;
  imageSrc: string;
  likes?: number;
  onClick?: () => void;
}

export default function StyleFeedItem({ id, title, imageSrc, likes = 0, onClick }: StyleFeedItemProps) {
  return (
    <div className="style-feed-item rounded-lg overflow-hidden shadow-sm" onClick={onClick}>
      <div className="relative aspect-[2/3]">
        <Image 
          src={imageSrc} 
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
          onError={(e) => {
            // Fallback to a placeholder on error
            const target = e.target as HTMLImageElement;
            target.src = "https://via.placeholder.com/300x450?text=Image+Not+Found";
          }}
        />
      </div>
      <div className="p-2">
        <h3 className="font-medium text-sm">{title}</h3>
        {likes > 0 && (
          <div className="flex items-center mt-1">
            <span className="text-red-500 mr-1">♥</span>
            <span className="text-gray-500 text-xs">{likes}</span>
          </div>
        )}
      </div>
    </div>
  );
} 