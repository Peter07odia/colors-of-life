export interface FashionPost {
  id: string;
  imageUrl: string;
  videoUrl?: string;
  title: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  user: {
    id: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  tags: string[];
  category: 'outfit' | 'style' | 'trend' | 'lookbook' | 'accessories';
}

// Fashion content data inspired by TikTok and fashion platforms
export const fashionPosts: FashionPost[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop',
    title: 'Yellow Tracksuit Vibes ✨',
    description: 'Bringing that sporty chic energy to the streets! This yellow tracksuit is everything 💛 #SportyChic #StreetStyle',
    likes: 12500,
    comments: 234,
    shares: 89,
    user: {
      id: 'user1',
      username: 'stylequeendom',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    tags: ['#SportyChic', '#StreetStyle', '#YellowVibes', '#TrackSuit'],
    category: 'outfit'
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=600&fit=crop',
    title: 'Sunglasses & Summer Vibes',
    description: 'Perfect summer look with these statement sunglasses 🕶️ Who else is ready for sunny days? #SummerStyle',
    likes: 8900,
    comments: 156,
    shares: 67,
    user: {
      id: 'user2',
      username: 'sunnydays_style',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      verified: false
    },
    tags: ['#SummerStyle', '#Sunglasses', '#OOTD', '#SunnyVibes'],
    category: 'accessories'
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1485518882345-15568b007407?w=400&h=600&fit=crop',
    title: 'Mannequin Fashion Inspo',
    description: 'Store window displays are giving me major outfit inspiration! 🛍️ #WindowShopping #FashionInspo',
    likes: 15600,
    comments: 298,
    shares: 112,
    user: {
      id: 'user3',
      username: 'fashion_hunter',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    tags: ['#FashionInspo', '#WindowDisplay', '#Shopping', '#StyleHunt'],
    category: 'trend'
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1574015974293-817f0ebebb74?w=400&h=600&fit=crop',
    title: 'Monochrome Magic ⚫⚪',
    description: 'Black and white never goes out of style! This minimalist look is perfection 🖤🤍',
    likes: 11200,
    comments: 187,
    shares: 94,
    user: {
      id: 'user4',
      username: 'minimal_maven',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    tags: ['#Monochrome', '#MinimalStyle', '#BlackAndWhite', '#Timeless'],
    category: 'style'
  },
  {
    id: '5',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=600&fit=crop',
    title: 'Closet Organization Goals',
    description: 'When your closet looks this good, getting dressed is pure joy! 👗✨ #ClosetGoals #Organization',
    likes: 9800,
    comments: 145,
    shares: 78,
    user: {
      id: 'user5',
      username: 'organized_chic',
      avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
      verified: false
    },
    tags: ['#ClosetGoals', '#Organization', '#WardrobeInspo', '#StyleTips'],
    category: 'lookbook'
  },
  {
    id: '6',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=600&fit=crop',
    title: 'White Top Elegance',
    description: 'Sometimes simple is the most sophisticated choice 🤍 Classic white never fails!',
    likes: 13400,
    comments: 201,
    shares: 105,
    user: {
      id: 'user6',
      username: 'classic_elegance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    tags: ['#ClassicStyle', '#WhiteTop', '#Elegance', '#Sophisticated'],
    category: 'style'
  },
  {
    id: '7',
    imageUrl: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400&h=600&fit=crop',
    title: 'Accessories Flat Lay 📱',
    description: 'The perfect accessories combo: sunglasses, bag, watch & phone! What are your daily essentials?',
    likes: 7600,
    comments: 123,
    shares: 56,
    user: {
      id: 'user7',
      username: 'accessory_addict',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
      verified: false
    },
    tags: ['#Accessories', '#FlatLay', '#Essentials', '#StyleDetails'],
    category: 'accessories'
  },
  {
    id: '8',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=600&fit=crop',
    title: 'Shopping Spree Success! 🛍️',
    description: 'Best shopping day ever! These bags are full of amazing finds 💕 #ShoppingSpree #RetailTherapy',
    likes: 16800,
    comments: 312,
    shares: 134,
    user: {
      id: 'user8',
      username: 'shopping_queen',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    tags: ['#Shopping', '#RetailTherapy', '#NewFinds', '#ShoppingHaul'],
    category: 'trend'
  },
  {
    id: '9',
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=600&fit=crop',
    title: 'Minimalist Wardrobe',
    description: 'Less is more! Building a capsule wardrobe with quality pieces 🌿 #MinimalistFashion #Sustainable',
    likes: 10500,
    comments: 178,
    shares: 89,
    user: {
      id: 'user9',
      username: 'sustainable_style',
      avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    tags: ['#MinimalistFashion', '#Sustainable', '#CapsuleWardrobe', '#QualityOverQuantity'],
    category: 'lookbook'
  },
  {
    id: '10',
    imageUrl: 'https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=400&h=600&fit=crop',
    title: 'Autumn Aesthetic 🍂',
    description: 'Dried flowers and cozy vibes - autumn fashion is here! Who else loves this season? #AutumnVibes',
    likes: 14200,
    comments: 245,
    shares: 118,
    user: {
      id: 'user10',
      username: 'autumn_aesthetic',
      avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop&crop=face',
      verified: false
    },
    tags: ['#AutumnVibes', '#CozyStyle', '#SeasonalFashion', '#Aesthetic'],
    category: 'trend'
  }
];

export const getFashionPosts = (): Promise<FashionPost[]> => {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      resolve(fashionPosts);
    }, 1000);
  });
};

export const getMoreFashionPosts = (page: number): Promise<FashionPost[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate more posts by cycling through existing ones with different IDs
      const morePosts = fashionPosts.map((post, index) => ({
        ...post,
        id: `${page}_${index + 1}`,
        likes: post.likes + Math.floor(Math.random() * 1000),
        comments: post.comments + Math.floor(Math.random() * 50),
        shares: post.shares + Math.floor(Math.random() * 20),
      }));
      resolve(morePosts);
    }, 1000);
  });
}; 