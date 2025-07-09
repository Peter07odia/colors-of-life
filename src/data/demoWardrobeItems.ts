// Demo wardrobe items from virtual try-on assets
// These are loaded directly from assets and shown immediately in the wardrobe

export interface DemoWardrobeItem {
  id: string;
  name: string;
  description?: string;
  category: 'tops' | 'bottoms' | 'outerwear' | 'dresses' | 'footwear' | 'accessories';
  brand: string;
  price: number;
  currency?: string;
  colors?: string[];
  sizes?: string[];
  materials?: string[];
  image: string; // Primary image URL
  images: string[]; // All image URLs
  tags?: string[];
  style_attributes?: Record<string, any>;
  product_code?: string;
  is_featured?: boolean;
  is_demo: true; // Flag to identify demo items
  is_active: boolean;
  created_at: string;
}

export const demoWardrobeItems: DemoWardrobeItem[] = [
  {
    id: 'demo-white-tshirt',
    name: 'Classic White T-Shirt',
    description: 'Clean, minimalist white t-shirt perfect for any occasion. Comfortable fit with premium cotton blend.',
    category: 'tops',
    brand: 'Classic Basics',
    price: 29.99,
    currency: 'USD',
    colors: ['white'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    materials: ['cotton', 'polyester'],
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop'],
    tags: ['basic', 'casual', 'essential', 'white', 'versatile'],
    style_attributes: {
      neckline: 'crew',
      sleeve: 'short',
      fit: 'regular'
    },
    product_code: 'DEMO-WT-001',
    is_featured: true,
    is_demo: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-black-pants',
    name: 'Black Tailored Pants',
    description: 'Sleek black pants with a tailored fit. Perfect for both casual and semi-formal occasions.',
    category: 'bottoms',
    brand: 'Classic Basics',
    price: 79.99,
    currency: 'USD',
    colors: ['black'],
    sizes: ['28', '30', '32', '34', '36', '38'],
    materials: ['cotton', 'polyester', 'spandex'],
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=400&fit=crop'],
    tags: ['black', 'tailored', 'versatile', 'pants', 'formal'],
    style_attributes: {
      fit: 'tailored',
      waist: 'mid-rise',
      length: 'full'
    },
    product_code: 'DEMO-BP-001',
    is_featured: true,
    is_demo: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-denim-jacket',
    name: 'Blue Denim Jacket with Graphics',
    description: 'Vintage-inspired denim jacket featuring bold graphic designs and patches. Statement piece for any outfit.',
    category: 'outerwear',
    brand: 'Ed Hardy Style',
    price: 149.99,
    currency: 'USD',
    colors: ['blue', 'denim'],
    sizes: ['S', 'M', 'L', 'XL'],
    materials: ['denim', 'cotton'],
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=400&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=400&fit=crop'
    ],
    tags: ['denim', 'jacket', 'graphic', 'vintage', 'statement', 'blue'],
    style_attributes: {
      style: 'vintage',
      closure: 'button',
      collar: 'spread',
      graphics: 'front-back'
    },
    product_code: 'DEMO-DJ-001',
    is_featured: true,
    is_demo: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-denim-shorts',
    name: 'Graphic Denim Shorts',
    description: 'Bold denim shorts with striking skull and character graphics. Perfect for making a statement.',
    category: 'bottoms',
    brand: 'Ed Hardy Style',
    price: 89.99,
    currency: 'USD',
    colors: ['blue', 'denim'],
    sizes: ['28', '30', '32', '34', '36'],
    materials: ['denim', 'cotton'],
    image: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=300&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=300&h=400&fit=crop',
      'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=300&h=400&fit=crop'
    ],
    tags: ['denim', 'shorts', 'graphic', 'skull', 'statement', 'blue', 'summer'],
    style_attributes: {
      style: 'graphic',
      length: 'knee',
      graphics: 'skull-character',
      fit: 'regular'
    },
    product_code: 'DEMO-DS-001',
    is_featured: true,
    is_demo: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-ed-hardy-jacket',
    name: 'Ed Hardy Graphic Denim Jacket',
    description: 'Authentic Ed Hardy style denim jacket featuring iconic skull and flame graphics on the back with "East 4th St" branding.',
    category: 'outerwear',
    brand: 'Ed Hardy',
    price: 199.99,
    currency: 'USD',
    colors: ['blue', 'denim'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    materials: ['denim', 'cotton'],
    image: 'https://jiwiclemrwjojoewmcnc.supabase.co/storage/v1/object/public/fashion-items/demo/ed-hardy-jacket-front.png',
    images: [
      'https://jiwiclemrwjojoewmcnc.supabase.co/storage/v1/object/public/fashion-items/demo/ed-hardy-jacket-front.png',
      'https://jiwiclemrwjojoewmcnc.supabase.co/storage/v1/object/public/fashion-items/demo/ed-hardy-jacket-back.png'
    ],
    tags: ['ed-hardy', 'denim', 'jacket', 'skull', 'graphic', 'streetwear', 'vintage'],
    style_attributes: {
      style: 'streetwear',
      closure: 'button',
      collar: 'classic',
      graphics: 'skull-flame',
      design: 'front-back-graphics'
    },
    product_code: 'DEMO-EH-JACKET-001',
    is_featured: true,
    is_demo: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-ed-hardy-shorts',
    name: 'Ed Hardy Character Denim Shorts',
    description: 'Ed Hardy style denim shorts with vintage cartoon character and gothic text graphics. Unique streetwear statement piece.',
    category: 'bottoms',
    brand: 'Ed Hardy',
    price: 129.99,
    currency: 'USD',
    colors: ['blue', 'denim'],
    sizes: ['28', '30', '32', '34', '36', '38'],
    materials: ['denim', 'cotton'],
    image: 'https://jiwiclemrwjojoewmcnc.supabase.co/storage/v1/object/public/fashion-items/demo/ed-hardy-shorts-front.png',
    images: [
      'https://jiwiclemrwjojoewmcnc.supabase.co/storage/v1/object/public/fashion-items/demo/ed-hardy-shorts-front.png',
      'https://jiwiclemrwjojoewmcnc.supabase.co/storage/v1/object/public/fashion-items/demo/ed-hardy-shorts-side.png'
    ],
    tags: ['ed-hardy', 'denim', 'shorts', 'character', 'gothic', 'streetwear', 'vintage'],
    style_attributes: {
      style: 'streetwear',
      length: 'above-knee',
      graphics: 'character-text',
      fit: 'regular',
      design: 'gothic-cartoon'
    },
    product_code: 'DEMO-EH-SHORTS-001',
    is_featured: true,
    is_demo: true,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// Demo categories derived from the items
export const demoCategories = [
  { id: 'tops', name: 'tops', label: 'Tops', icon_name: 'shirt' },
  { id: 'bottoms', name: 'bottoms', label: 'Bottoms', icon_name: 'square' },
  { id: 'outerwear', name: 'outerwear', label: 'Outerwear', icon_name: 'jacket' },
  { id: 'dresses', name: 'dresses', label: 'Dresses', icon_name: 'dress' },
  { id: 'footwear', name: 'footwear', label: 'Footwear', icon_name: 'shoe' },
  { id: 'accessories', name: 'accessories', label: 'Accessories', icon_name: 'accessory' }
];

export default demoWardrobeItems;