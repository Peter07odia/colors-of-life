import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Heart, Share, MessageCircle, 
  Music, Plus, ChevronUp
} from 'lucide-react';
import { Text } from '../ui/Typography';
import { ImagePlaceholder } from '../ui/ImagePlaceholder';
import { FeedPost, sampleFeedPosts } from '../../lib/data/feedData';
import useWindowSize from '../../lib/hooks/useWindowSize';
import CommentModal from './CommentModal';
import ShareModal from './ShareModal';
import { debounce } from 'lodash';

interface StyleFeedVerticalProps {
  className?: string;
}

export function StyleFeedVertical({ className = '' }: StyleFeedVerticalProps) {
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToWardrobe, setAddedToWardrobe] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('for-you');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(true);
  const [showHeartAnimation, setShowHeartAnimation] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // New state variables for modals
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [activePost, setActivePost] = useState<FeedPost | null>(null);
  
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Enhanced state variables for infinite scrolling
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingError, setIsFetchingError] = useState(false);
  
  // Set mounted state after hydration is complete
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Load initial feed data
  useEffect(() => {
    loadFeedPosts(1);
    
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  // Hide swipe indicator after a few seconds
  useEffect(() => {
    if (showSwipeIndicator) {
      const timer = setTimeout(() => {
        setShowSwipeIndicator(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeIndicator]);
  
  // Modified to use direct data instead of API
  const loadFeedPosts = async (pageToLoad: number) => {
    if (pageToLoad === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    setIsFetchingError(false);
    
    try {
      // Instead of fetching from API, use the sample data directly
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const postsPerPage = 5;
      const startIndex = (pageToLoad - 1) * postsPerPage;
      const endIndex = startIndex + postsPerPage;
      
      // Make a copy of posts to modify paths
      const postsWithFixedPaths = sampleFeedPosts.slice(startIndex, endIndex).map(post => ({
        ...post,
        // Add fallback images
        mediaUrl: post.mediaUrl || '/images/placeholder.jpg',
        thumbnailUrl: post.thumbnailUrl || '/images/placeholder-thumb.jpg',
        userProfilePic: post.userProfilePic || '/images/avatar-placeholder.jpg',
        productTag: post.productTag ? {
          ...post.productTag,
          image: post.productTag.image || '/images/product-placeholder.jpg'
        } : undefined
      }));
      
      const data = {
        posts: postsWithFixedPaths,
        metadata: {
          hasMore: endIndex < sampleFeedPosts.length
        }
      };
      
      if (pageToLoad === 1) {
        setFeedPosts(data.posts);
      } else {
        // Avoid duplicate posts by checking IDs
        const existingIds = new Set(feedPosts.map(post => post.postId));
        const newPosts = data.posts.filter(post => !existingIds.has(post.postId));
        setFeedPosts(prev => [...prev, ...newPosts]);
      }
      
      // Update pagination state
      setPage(pageToLoad);
      setHasMore(data.metadata.hasMore);
    } catch (error) {
      console.error('Error loading posts:', error);
      setIsFetchingError(true);
    } finally {
      if (pageToLoad === 1) {
        setLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };
  
  // Load more posts when reaching the end
  const loadMorePosts = () => {
    if (!isLoadingMore && hasMore && !isFetchingError) {
      loadFeedPosts(page + 1);
    }
  };
  
  // Track scrolling for infinite scroll and to update current video index
  useEffect(() => {
    const handleScroll = debounce(() => {
      if (feedContainerRef.current) {
        const scrollPosition = feedContainerRef.current.scrollTop;
        const viewportHeight = window.innerHeight;
        const scrollHeight = feedContainerRef.current.scrollHeight;
        const index = Math.round(scrollPosition / viewportHeight);
        
        if (index !== currentIndex) {
          setCurrentIndex(index);
          setShowSwipeIndicator(false);
        }
        
        const distanceToBottom = scrollHeight - (scrollPosition + viewportHeight);
        if (distanceToBottom < viewportHeight && !isLoadingMore && hasMore) {
          loadMorePosts();
        }
      }
    }, 200);  // Debounce by 200ms
    
    const container = feedContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentIndex, isLoadingMore, hasMore, page]);
  
  // Handle like button click
  const handleLike = (postId: string) => {
    setFeedPosts(prev => 
      prev.map(post => {
        if (post.postId === postId) {
          return { 
            ...post, 
            isLiked: !post.isLiked,
            likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
          };
        }
        return post;
      })
    );
  };
  
  // Handle double tap to like
  const handleDoubleTap = (postId: string) => {
    if (tapTimerRef.current) {
      // Double tap detected
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
      
      // Show heart animation
      setShowHeartAnimation(postId);
      setTimeout(() => setShowHeartAnimation(null), 1000);
      
      // Like the post if not already liked
      setFeedPosts(prev => 
        prev.map(post => {
          if (post.postId === postId && !post.isLiked) {
            return { 
              ...post, 
              isLiked: true,
              likeCount: post.likeCount + 1
            };
          }
          return post;
        })
      );
    } else {
      // First tap, wait for second
      tapTimerRef.current = setTimeout(() => {
        tapTimerRef.current = null;
      }, 300);
    }
  };
  
  // Handle add to wardrobe
  const handleAddToWardrobe = (post: FeedPost) => {
    setAddedToWardrobe(post.postId);
    setTimeout(() => setAddedToWardrobe(null), 2000);
  };
  
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // In a real app, you would fetch different data based on the tab
  };
  
  // Use seed values for counts instead of Math.random() during server-side rendering
  const getSeedValue = (index: number, base: number, multiplier: number = 1): number => {
    // During SSR or before mounting, use deterministic values
    if (!mounted) {
      return Math.floor(base * multiplier);
    }
    // After mounting, we can use random values safely
    return Math.floor(Math.random() * base * multiplier);
  };
  
  // Handle comments click
  const handleCommentsClick = (post: FeedPost) => {
    setActivePost(post);
    setCommentModalOpen(true);
  };
  
  // Handle share click
  const handleShareClick = (post: FeedPost) => {
    setActivePost(post);
    setShareModalOpen(true);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-gray-700"></div>
          <div className="h-4 w-24 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Top navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-sm max-w-md mx-auto">
        <div className="flex justify-center items-center pt-3 pb-1 px-4">
          <div className="flex space-x-20">
            <button 
              className={`px-4 py-1 relative ${activeTab === 'following' ? 'text-white font-bold' : 'text-gray-400'}`}
              onClick={() => handleTabChange('following')}
            >
              Following
              {activeTab === 'following' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-white rounded-full"></div>
              )}
            </button>
            <button 
              className={`px-4 py-1 relative ${activeTab === 'for-you' ? 'text-white font-bold' : 'text-gray-400'}`}
              onClick={() => handleTabChange('for-you')}
            >
              For You
              {activeTab === 'for-you' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-white rounded-full"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Swipe up indicator */}
      {showSwipeIndicator && currentIndex === 0 && (
        <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center">
          <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2">
            <ChevronUp className="w-5 h-5 text-white animate-swipe-up" />
            <Text className="text-white text-xs">Swipe up for next item</Text>
          </div>
        </div>
      )}

      {/* Added to Wardrobe notification */}
      {addedToWardrobe && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/70 text-white rounded-lg z-50 flex items-center animate-slide-in-top">
          <div className="mr-2">👕</div>
          <Text className="text-sm">Added to Wardrobe</Text>
        </div>
      )}

      {/* Comment Modal */}
      {activePost && (
        <CommentModal 
          isOpen={commentModalOpen} 
          onClose={() => setCommentModalOpen(false)} 
          postId={activePost.postId}
          userName={activePost.userName}
        />
      )}
      
      {/* Share Modal */}
      {activePost && (
        <ShareModal 
          isOpen={shareModalOpen} 
          onClose={() => setShareModalOpen(false)} 
          post={activePost}
        />
      )}

      {/* Main feed */}
      <div 
        ref={feedContainerRef}
        className="w-full h-screen overflow-y-auto overflow-x-hidden hide-scrollbar scroll-smooth"
        style={{
          scrollSnapType: 'y mandatory', 
          scrollBehavior: 'smooth',
          height: '100vh',
          paddingTop: '48px'
        }}
      >
        {feedPosts.map((post, index) => (
          <div 
            key={`${post.postId}_${index}`}
            className="w-full h-screen relative"
            style={{
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always'
            }}
          >
            {/* Post image/video background */}
            <div 
              className="absolute inset-0 bg-black"
              onClick={() => handleDoubleTap(post.postId)}
            >
              {/* Use regular img tag instead of Next.js Image for vertical images */}
              <div className="relative w-full h-full min-h-screen bg-black flex items-center justify-center">
                <div className="absolute inset-0">
                  <ImagePlaceholder type="feed" className="w-full h-full" />
                </div>
                <img 
                  src={post.mediaUrl}
                  alt={post.description}
                  className="relative z-10 max-h-full max-w-full object-cover"
                  loading="lazy"
                  onLoad={(e) => {
                    const target = e.currentTarget;
                    target.style.opacity = '1';
                  }}
                  style={{ opacity: '0', transition: 'opacity 0.3s ease-in-out' }}
                  onError={(e) => {
                    console.error(`Error loading image: ${post.mediaUrl}`);
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              {/* Gradient overlay for better readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50"></div>
              
              {/* Double tap heart animation */}
              {showHeartAnimation === post.postId && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="w-24 h-24 text-white fill-white animate-scale-heart" />
                </div>
              )}
            </div>
            
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 flex px-2 py-1 z-30">
              <div className="w-full flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden"
                  >
                    {currentIndex % 3 === i && (
                      <div className="h-full bg-white w-full animate-progress"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Video counter */}
            <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full z-30">
              <span className="text-white text-xs font-medium">
                {index + 1}/{Math.min(feedPosts.length, 3)}
              </span>
            </div>
            
            {/* Right sidebar buttons */}
            <div className="absolute right-3 bottom-24 flex flex-col gap-6 items-center z-20">
              {/* Profile */}
              <div className="relative w-11 h-11">
                <div className="absolute inset-0">
                  <ImagePlaceholder type="avatar" className="w-full h-full" />
                </div>
                <img
                  src={post.userProfilePic}
                  alt={post.userName}
                  className="relative z-10 w-full h-full rounded-full border-2 border-white object-cover"
                  loading="lazy"
                  onLoad={(e) => {
                    const target = e.currentTarget;
                    target.style.opacity = '1';
                  }}
                  style={{ opacity: '0', transition: 'opacity 0.3s ease-in-out' }}
                  onError={(e) => {
                    console.error(`Error loading profile image: ${post.userProfilePic}`);
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <button className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary-main rounded-full p-1 z-20">
                  <Plus className="w-3 h-3 text-white" />
                </button>
              </div>
              
              {/* Like button */}
              <button 
                onClick={() => handleLike(post.postId)}
                className="flex flex-col items-center press-effect"
                aria-label="Like"
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <Heart 
                    className={`w-7 h-7 ${post.isLiked ? 'fill-red-500 text-red-500 animate-scale-heart' : 'text-white'}`} 
                  />
                </div>
                <span className="text-white text-xs font-medium mt-1">
                  {post.likeCount.toLocaleString()}
                </span>
              </button>
              
              {/* Comments */}
              <button 
                className="flex flex-col items-center press-effect" 
                aria-label="Comments"
                onClick={() => handleCommentsClick(post)}
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <span className="text-white text-xs font-medium mt-1">
                  {getSeedValue(index, 200)}
                </span>
              </button>
              
              {/* Save to wardrobe */}
              <button 
                onClick={() => handleAddToWardrobe(post)}
                className="flex flex-col items-center group press-effect"
                aria-label="Save to wardrobe"
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-7 h-7 text-white group-hover:scale-110 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4"></path>
                    <path d="M19 5L19 12"></path>
                    <path d="M22 8L19 5L16 8"></path>
                  </svg>
                </div>
                <span className="text-white text-xs font-medium mt-1">
                  {getSeedValue(index, 100, 1000).toLocaleString()}K
                </span>
              </button>
              
              {/* Share */}
              <button 
                className="flex flex-col items-center press-effect"
                aria-label="Share"
                onClick={() => handleShareClick(post)}
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <Share className="w-7 h-7 text-white" />
                </div>
                <span className="text-white text-xs font-medium mt-1">
                  {getSeedValue(index, 15, 1000).toLocaleString()}K
                </span>
              </button>
            </div>
            
            {/* Bottom Content */}
            <div className="absolute bottom-4 left-4 right-16">
              {/* Username and Brand */}
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-white font-semibold">@{post.userName}</span>
                <span className="text-white opacity-70">·</span>
                <span className="text-white">{post.brandName}</span>
              </div>

              {/* Description */}
              <p className="text-white text-sm mb-2">{post.description}</p>

              {/* Music Info */}
              {post.musicInfo && (
                <div className="flex items-center space-x-2 mb-2">
                  <Music className="w-4 h-4 text-white" />
                  <span className="text-white text-sm">{post.musicInfo}</span>
                </div>
              )}

              {/* Extract and display hashtags from description */}
              <div className="flex flex-wrap gap-2">
                {post.description
                  .split(' ')
                  .filter(word => word.startsWith('#'))
                  .map((tag, i) => (
                    <span key={i} className="text-white text-sm">{tag}</span>
                  ))}
              </div>
            </div>
            
            {/* Product tag */}
            {post.productTag && (
              <div className="absolute bottom-32 left-4 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg z-10 flex items-center gap-2 max-w-[70%]">
                <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                  <img 
                    src={post.productTag.image || post.mediaUrl} 
                    alt={post.productTag.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
                <div className="overflow-hidden">
                  <Text className="text-white text-xs font-medium truncate">
                    {post.productTag.name}
                  </Text>
                  <Text className="text-white/80 text-xs truncate">
                    ${post.productTag.price || '39.99'}
                  </Text>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoadingMore && (
          <div className="h-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
        
        {/* Error state with retry button */}
        {isFetchingError && (
          <div className="h-24 flex flex-col items-center justify-center">
            <Text className="text-white mb-2">Failed to load more posts</Text>
            <button 
              onClick={() => loadFeedPosts(page + 1)}
              className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}
        
        {/* End of feed message */}
        {!hasMore && feedPosts.length > 0 && (
          <div className="h-24 flex items-center justify-center">
            <Text className="text-white text-sm opacity-70">You're all caught up!</Text>
          </div>
        )}
      </div>
    </div>
  );
} 