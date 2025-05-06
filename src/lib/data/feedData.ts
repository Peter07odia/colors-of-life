export interface FeedPost {
  postId: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
  thumbnailUrl?: string;
  userName: string;
  userProfilePic: string;
  isVerified?: boolean;
  brandName: string;
  brandLogo: string;
  description: string;
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isSaved?: boolean;
  createdAt: string;
  musicInfo?: string;
  productTag?: {
    name: string;
    price?: string;
    image?: string;
    id?: string;
  };
}

// Sample data for the Style Feed with 9:16 aspect ratio images
export const sampleFeedPosts: FeedPost[] = [
  {
    postId: 'style_1',
    mediaUrl: '/images/feed/style1.jpg',
    mediaType: 'image',
    thumbnailUrl: '/images/feed/style1.jpg',
    userName: 'styleinfluencer',
    userProfilePic: '/images/avatars/style1.jpg',
    isVerified: true,
    brandName: 'Zara',
    brandLogo: '/images/brands/zara.png',
    description: "Street style elevation at its finest 🔥 This Zara set is everything! #StyleTips #FashionWeek #StreetStyle",
    hashtags: ['StyleTips', 'FashionWeek', 'StreetStyle'],
    likeCount: 15243,
    commentCount: 342,
    shareCount: 89,
    isLiked: false,
    isSaved: false,
    createdAt: new Date().toISOString(),
    musicInfo: 'Runway Beats - Fashion Mix',
    productTag: {
      name: 'Oversized Blazer Set',
      price: '129.90',
      image: '/images/products/product1.jpg',
      id: 'ZARA-2024-001'
    }
  },
  {
    postId: 'style_2',
    mediaUrl: '/images/feed/style2.jpg',
    mediaType: 'image',
    thumbnailUrl: '/images/feed/style2.jpg',
    userName: 'luxuryfashion',
    userProfilePic: '/images/avatars/style2.jpg',
    isVerified: true,
    brandName: 'Prada',
    brandLogo: '/images/brands/prada.png',
    description: "The perfect blend of elegance and edge ✨ #LuxuryFashion #PradaStyle",
    hashtags: ['LuxuryFashion', 'PradaStyle'],
    likeCount: 28567,
    commentCount: 892,
    shareCount: 245,
    isLiked: false,
    isSaved: false,
    createdAt: new Date().toISOString(),
    musicInfo: 'Luxury Life - Designer Mix',
    productTag: {
      name: 'Leather Mini Bag',
      price: '2,900.00',
      image: '/images/products/product2.jpg',
      id: 'PRADA-2024-002'
    }
  },
  {
    postId: 'style_3',
    mediaUrl: '/images/feed/style3.jpg',
    mediaType: 'image',
    thumbnailUrl: '/images/feed/style3.jpg',
    userName: 'streetstyle',
    userProfilePic: '/images/avatars/style3.jpg',
    isVerified: true,
    brandName: 'Nike',
    brandLogo: '/images/brands/nike.png',
    description: "Serving looks in these new Nike drops 🔥 #Streetwear #SneakerGame",
    hashtags: ['Streetwear', 'SneakerGame'],
    likeCount: 12789,
    commentCount: 456,
    shareCount: 123,
    isLiked: false,
    isSaved: false,
    createdAt: new Date().toISOString(),
    musicInfo: 'Street Beats - Urban Mix',
    productTag: {
      name: 'Tech Fleece Set',
      price: '180.00',
      image: '/images/products/product3.jpg',
      id: 'NIKE-2024-003'
    }
  },
  {
    postId: 'style_4',
    mediaUrl: '/images/feed/style4.jpg',
    mediaType: 'image',
    thumbnailUrl: '/images/feed/style4.jpg',
    userName: 'minimalista',
    userProfilePic: '/images/avatars/style4.jpg',
    isVerified: true,
    brandName: 'COS',
    brandLogo: '/images/brands/cos.png',
    description: "Minimalism is the ultimate sophistication ✨ #MinimalistStyle #CleanAesthetic",
    hashtags: ['MinimalistStyle', 'CleanAesthetic'],
    likeCount: 9876,
    commentCount: 234,
    shareCount: 67,
    isLiked: false,
    isSaved: false,
    createdAt: new Date().toISOString(),
    musicInfo: 'Minimal Vibes - Aesthetic Mix',
    productTag: {
      name: 'Oversized White Shirt',
      price: '89.00',
      image: '/images/products/product4.jpg',
      id: 'COS-2024-004'
    }
  },
  {
    postId: 'style_5',
    mediaUrl: '/images/feed/style5.jpg',
    mediaType: 'image',
    thumbnailUrl: '/images/feed/style5.jpg',
    userName: 'vintagelover',
    userProfilePic: '/images/avatars/style5.jpg',
    isVerified: true,
    brandName: 'Reformation',
    brandLogo: '/images/brands/reformation.png',
    description: "Vintage-inspired pieces for the modern wardrobe 🌟 #VintageFashion #Sustainable",
    hashtags: ['VintageFashion', 'Sustainable'],
    likeCount: 18234,
    commentCount: 567,
    shareCount: 145,
    isLiked: false,
    isSaved: false,
    createdAt: new Date().toISOString(),
    musicInfo: 'Retro Vibes - Vintage Mix',
    productTag: {
      name: 'Floral Maxi Dress',
      price: '248.00',
      image: '/images/products/product5.jpg',
      id: 'REF-2024-005'
    }
  },
  {
    postId: 'style_6',
    mediaUrl: '/images/feed/style6.jpg',
    mediaType: 'image',
    thumbnailUrl: '/images/feed/style6.jpg',
    userName: 'athleisure',
    userProfilePic: '/images/avatars/style6.jpg',
    isVerified: true,
    brandName: 'Lululemon',
    brandLogo: '/images/brands/lululemon.png',
    description: "Comfort meets style in this workout fit 💪 #Athleisure #WorkoutStyle",
    hashtags: ['Athleisure', 'WorkoutStyle'],
    likeCount: 21456,
    commentCount: 678,
    shareCount: 234,
    isLiked: false,
    isSaved: false,
    createdAt: new Date().toISOString(),
    musicInfo: 'Workout Mix - High Energy',
    productTag: {
      name: 'Define Jacket',
      price: '118.00',
      image: '/images/products/product6.jpg',
      id: 'LULU-2024-006'
    }
  }
];

// Helper functions
export const getFeedPosts = (page: number = 1, limit: number = 6): FeedPost[] => {
  const start = (page - 1) * limit;
  const end = start + limit;
  return sampleFeedPosts.slice(start, end);
};

export const toggleLike = (postId: string): void => {
  const post = sampleFeedPosts.find(p => p.postId === postId);
  if (post) {
    post.isLiked = !post.isLiked;
    post.likeCount += post.isLiked ? 1 : -1;
  }
};

export const toggleSave = (postId: string): void => {
  const post = sampleFeedPosts.find(p => p.postId === postId);
  if (post) {
    post.isSaved = !post.isSaved;
  }
};

export const addComment = (postId: string): void => {
  const post = sampleFeedPosts.find(p => p.postId === postId);
  if (post) {
    post.commentCount += 1;
  }
};

export const incrementShare = (postId: string): void => {
  const post = sampleFeedPosts.find(p => p.postId === postId);
  if (post) {
    post.shareCount += 1;
  }
};

// Function to add item to wardrobe
export const addToWardrobe = async (productId: string): Promise<boolean> => {
  // In a real app, this would make an API call to add the item to the user's wardrobe
  console.log(`Adding product ${productId} to wardrobe`);
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 500);
  });
}; 