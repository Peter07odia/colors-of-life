// Outfit data model with extended style attributes for preference matching
export interface Outfit {
  id: number;
  image: string;
  title: string;
  category: string;
  brand: string;
  colors: string[];
  patterns: string[];
  occasions: string[];
  fit: string;
  description: string;
  price?: string;
  aiScore?: number;
}

// Enhanced outfit data with style attributes
export const outfitsData: Outfit[] = [
  {
    id: 1,
    image: '/images/casual/5 female Casual Fashion.png',
    title: 'Casual Weekend Outfit',
    category: 'Casual',
    brand: 'Everyday Basics',
    colors: ['blue', 'white', 'beige'],
    patterns: ['solid'],
    occasions: ['weekend', 'casual', 'daily'],
    fit: 'relaxed',
    description: 'Comfortable and stylish outfit perfect for weekend activities.'
  },
  {
    id: 2,
    image: '/images/Professional/7 Female Professional.png',
    title: 'Business Professional Attire',
    category: 'Professional',
    brand: 'Office Elegance',
    colors: ['black', 'white', 'gray'],
    patterns: ['solid'],
    occasions: ['work', 'meeting', 'formal'],
    fit: 'tailored',
    description: 'Polished professional look suitable for business environments.'
  },
  {
    id: 3,
    image: '/images/streetwear/3 female Streetwear.png',
    title: 'Urban Street Style',
    category: 'Streetwear',
    brand: 'Urban Trend',
    colors: ['black', 'gray', 'red'],
    patterns: ['graphic'],
    occasions: ['casual', 'social', 'outdoor'],
    fit: 'oversized',
    description: 'Bold streetwear look with modern urban aesthetic.'
  },
  {
    id: 4,
    image: '/images/athleisure/2 female athletic wear.png',
    title: 'Active Athleisure Set',
    category: 'Athleisure',
    brand: 'Active Life',
    colors: ['purple', 'black'],
    patterns: ['solid'],
    occasions: ['workout', 'casual', 'active'],
    fit: 'fitted',
    description: 'Comfortable athletic wear perfect for workouts or casual outings.'
  },
  {
    id: 5,
    image: '/images/bohemian/9 Female Bohemian.png',
    title: 'Bohemian Summer Dress',
    category: 'Bohemian',
    brand: 'Free Spirit',
    colors: ['cream', 'brown', 'orange'],
    patterns: ['floral', 'ethnic'],
    occasions: ['summer', 'beach', 'festival'],
    fit: 'flowing',
    description: 'Free-spirited bohemian style with ethnic-inspired details.'
  },
  {
    id: 6,
    image: '/images/vintage/13 female Vintage Style Portrait.png',
    title: 'Vintage-Inspired Ensemble',
    category: 'Vintage',
    brand: 'Retro Classics',
    colors: ['burgundy', 'brown', 'cream'],
    patterns: ['classic'],
    occasions: ['special', 'dinner', 'social'],
    fit: 'classic',
    description: 'Timeless vintage-inspired look with retro elements.'
  },
  {
    id: 7,
    image: '/images/Minimalist/14 female Minimalist Fashion Style.png',
    title: 'Minimalist Essentials',
    category: 'Minimalist',
    brand: 'Pure Essentials',
    colors: ['white', 'beige', 'black'],
    patterns: ['solid'],
    occasions: ['daily', 'work', 'casual'],
    fit: 'structured',
    description: 'Clean minimalist style focusing on quality essentials.'
  },
  {
    id: 8,
    image: '/images/Glamorous/12 female Glamorous Style.png',
    title: 'Evening Glamour Look',
    category: 'Glamorous',
    brand: 'Luxe Collection',
    colors: ['gold', 'black', 'red'],
    patterns: ['embellished'],
    occasions: ['evening', 'party', 'formal'],
    fit: 'fitted',
    description: 'Glamorous evening attire for special occasions and events.'
  }
];

// Style options for preference selection
export const styleOptions = {
  categories: [
    'Casual', 'Professional', 'Streetwear', 'Athleisure', 
    'Bohemian', 'Vintage', 'Minimalist', 'Glamorous'
  ],
  colors: [
    'black', 'white', 'gray', 'blue', 'red', 'pink', 'purple', 
    'green', 'yellow', 'orange', 'brown', 'beige', 'gold', 'silver'
  ],
  patterns: [
    'solid', 'striped', 'floral', 'graphic', 'plaid', 'checkered', 
    'polka dot', 'embellished', 'ethnic', 'classic'
  ],
  occasions: [
    'daily', 'work', 'casual', 'formal', 'party', 'evening', 'weekend',
    'summer', 'winter', 'special', 'beach', 'festival', 'workout', 'outdoor',
    'meeting', 'dinner', 'social'
  ],
  brands: [
    'Everyday Basics', 'Office Elegance', 'Urban Trend', 'Active Life',
    'Free Spirit', 'Retro Classics', 'Pure Essentials', 'Luxe Collection'
  ],
  fit: [
    'fitted', 'relaxed', 'oversized', 'tailored', 'flowing', 
    'structured', 'classic', 'loose'
  ]
}; 