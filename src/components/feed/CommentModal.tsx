'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Heart } from 'lucide-react';
import Image from 'next/image';
import { Text } from '../ui/Typography';

// Comment interface
interface Comment {
  id: string;
  userName: string;
  userProfilePic: string;
  text: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  userName: string;
}

export default function CommentModal({ isOpen, onClose, postId, userName }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load mock comments data
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate API fetch with a timeout
      setTimeout(() => {
        const mockComments: Comment[] = [
          {
            id: '1',
            userName: 'fashionista',
            userProfilePic: '/images/avatars/avatar-placeholder.png',
            text: 'Love this look! 😍',
            likes: 24,
            isLiked: false,
            createdAt: '2023-11-15T12:30:00Z'
          },
          {
            id: '2',
            userName: 'style_guide',
            userProfilePic: '/images/avatars/avatar-placeholder.png',
            text: 'Where did you get that jacket?',
            likes: 12,
            isLiked: false,
            createdAt: '2023-11-15T12:45:00Z'
          },
          {
            id: '3',
            userName: userName,
            userProfilePic: '/images/avatars/avatar-placeholder.png',
            text: 'Thanks everyone! The jacket is from Zara',
            likes: 8,
            isLiked: true,
            createdAt: '2023-11-15T13:00:00Z'
          }
        ];
        setComments(mockComments);
        setIsLoading(false);

        // Focus the input field
        if (commentInputRef.current) {
          commentInputRef.current.focus();
        }
      }, 800);
    }
  }, [isOpen, userName]);

  // Handle comment submission
  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    // Create new comment
    const newCommentObj: Comment = {
      id: `comment_${Date.now()}`,
      userName: 'current_user', // In a real app, this would be the logged-in user
      userProfilePic: '/images/avatars/avatar-placeholder.png',
      text: newComment.trim(),
      likes: 0,
      isLiked: false,
      createdAt: new Date().toISOString()
    };
    
    // Add to the top of the comments list
    setComments([newCommentObj, ...comments]);
    setNewComment('');
  };

  // Toggle like on a comment
  const handleLikeComment = (commentId: string) => {
    setComments(
      comments.map(comment => {
        if (comment.id === commentId) {
          const isLiked = !comment.isLiked;
          return {
            ...comment,
            isLiked,
            likes: isLiked ? comment.likes + 1 : comment.likes - 1
          };
        }
        return comment;
      })
    );
  };

  // Format the comment date
  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }
  };

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
        className="bg-white dark:bg-gray-900 rounded-t-xl w-full max-w-md max-h-[85vh] flex flex-col animate-slide-in-top"
      >
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between">
          <Text className="font-bold text-xl">Comments</Text>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-500 border-t-gray-300"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <Text className="text-gray-500">No comments yet. Be the first!</Text>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={comment.userProfilePic}
                        alt={comment.userName}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                      <Text className="font-semibold">@{comment.userName}</Text>
                      <Text className="mt-1">{comment.text}</Text>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500 space-x-3">
                      <span>{formatCommentDate(comment.createdAt)}</span>
                      <button 
                        onClick={() => handleLikeComment(comment.id)}
                        className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                      >
                        <Heart 
                          className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-red-500 text-red-500' : ''}`} 
                        />
                        <span>{comment.likes > 0 ? comment.likes : ''}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Comment input */}
        <div className="p-3 border-t dark:border-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src="/images/avatars/avatar-placeholder.png"
              alt="Your profile"
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3">
            <input
              ref={commentInputRef}
              type="text"
              placeholder="Add a comment..."
              className="bg-transparent flex-1 py-2 text-sm focus:outline-none"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmitComment();
              }}
            />
          </div>
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className={`p-2 rounded-full transition-colors ${
              newComment.trim() 
                ? 'text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800' 
                : 'text-gray-400'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 