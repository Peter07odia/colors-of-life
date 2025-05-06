'use client';

import React, { useRef, useEffect } from 'react';
import { X, Copy, Twitter, Facebook, Instagram, Link as LinkIcon } from 'lucide-react';
import { Text } from '../ui/Typography';
import Image from 'next/image';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    postId: string;
    mediaUrl: string;
    userName: string;
    description: string;
  };
}

export default function ShareModal({ isOpen, onClose, post }: ShareModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Share options
  const shareOptions = [
    {
      name: 'Copy Link',
      icon: <Copy className="w-5 h-5" />,
      color: 'bg-gray-500',
      onClick: () => {
        // In a real app, you would generate an actual shareable link
        const shareableLink = `https://colorsoflife.app/share/${post.postId}`;
        navigator.clipboard.writeText(shareableLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      color: 'bg-blue-400',
      onClick: () => {
        const text = `Check out @${post.userName}'s style on Colors of Life! ${post.description}`;
        const url = `https://colorsoflife.app/share/${post.postId}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
      },
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      color: 'bg-blue-600',
      onClick: () => {
        const url = `https://colorsoflife.app/share/${post.postId}`;
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      },
    },
    {
      name: 'Instagram',
      icon: <Instagram className="w-5 h-5" />,
      color: 'bg-pink-500',
      onClick: () => {
        // Instagram doesn't support direct sharing via URL
        alert('Instagram sharing requires the app to be installed. Save the image and share it manually.');
      },
    },
    {
      name: 'Direct Message',
      icon: <LinkIcon className="w-5 h-5" />,
      color: 'bg-green-500',
      onClick: () => {
        // In a real app, this would open a list of contacts or a messaging UI
        alert('Direct messaging feature coming soon!');
      },
    }
  ];

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 animate-fade-in">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-t-xl w-full max-w-md flex flex-col animate-slide-in-top"
      >
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between">
          <Text className="font-bold text-xl">Share to</Text>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Post preview */}
        <div className="p-4 flex items-center gap-3 border-b dark:border-gray-800">
          <div className="w-16 h-16 relative rounded-md overflow-hidden flex-shrink-0">
            <Image
              src={post.mediaUrl}
              alt={post.description}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <Text className="font-semibold">@{post.userName}</Text>
            <Text className="text-sm text-gray-500 line-clamp-2">{post.description}</Text>
          </div>
        </div>
        
        {/* Share options */}
        <div className="p-4 grid grid-cols-4 gap-4">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.onClick}
              className="flex flex-col items-center gap-2 press-effect"
            >
              <div className={`${option.color} w-12 h-12 rounded-full flex items-center justify-center text-white`}>
                {option.icon}
              </div>
              <Text className="text-xs">{option.name}</Text>
            </button>
          ))}
        </div>
        
        {/* Copy link feedback */}
        {copied && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/70 text-white rounded-lg animate-fade-in">
            Link copied!
          </div>
        )}
        
        {/* Cancel button */}
        <div className="p-4 border-t dark:border-gray-800">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-medium press-effect"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 