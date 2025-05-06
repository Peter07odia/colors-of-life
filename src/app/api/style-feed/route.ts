import { NextResponse } from 'next/server';
import { sampleFeedPosts } from '../../../lib/data/feedData';

// Set a max number of pages to simulate a finite feed
const MAX_PAGES = 5;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  // Add a small delay to simulate network latency (longer for later pages to simulate slower network)
  await new Promise(resolve => setTimeout(resolve, 500 + (page > 1 ? 500 : 0)));
  
  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  // Get paginated posts
  const posts = sampleFeedPosts.slice(startIndex, endIndex);
  
  // For demo purposes, if we run out of posts, repeat them with different IDs
  let finalPosts = [...posts];
  
  // Only generate additional posts if we haven't reached the maximum page
  if (posts.length < limit && sampleFeedPosts.length > 0 && page < MAX_PAGES) {
    const neededPosts = limit - posts.length;
    
    // Generate unique IDs for repeated posts to avoid key conflicts
    const additionalPosts = sampleFeedPosts.slice(0, neededPosts).map(post => ({
      ...post,
      postId: `${post.postId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      // Add a prefix to show it's a repeated post (for debugging)
      description: `${page > 2 ? '[More to explore] ' : ''}${post.description}`
    }));
    
    finalPosts = [...posts, ...additionalPosts];
  }
  
  // Determine if there are more posts
  // - If we're at the max page, there are no more posts
  // - Otherwise, there are more posts if we either have a full page or additional posts
  const hasMore = page < MAX_PAGES && (finalPosts.length === limit || (posts.length < limit && sampleFeedPosts.length > 0));
  
  // Return paginated data with enhanced metadata
  return NextResponse.json({
    posts: finalPosts,
    metadata: {
      currentPage: page,
      limit,
      totalPages: MAX_PAGES,
      totalPosts: sampleFeedPosts.length * MAX_PAGES, // Simulate a larger dataset
      hasMore: hasMore,
      remainingPages: Math.max(0, MAX_PAGES - page),
    }
  });
} 