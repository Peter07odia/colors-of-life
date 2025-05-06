import { NextRequest, NextResponse } from 'next/server';
import { Outfit } from '../../../../lib/outfitData';

// Cache to store search results
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const searchCache = new Map<string, { timestamp: number, results: Outfit[] }>();

// Function to transform search results into the Outfit format
function transformSearchResultsToOutfits(results: any[]): Outfit[] {
  if (!results || !Array.isArray(results) || results.length === 0) {
    return [];
  }

  return results.map((result, index) => {
    // Extract image URL
    let imageUrl = result.image || '';
    
    // Fallback to placeholder if no image found
    if (!imageUrl || imageUrl.startsWith('data:')) {
      imageUrl = '/images/casual/5 female Casual Fashion.png'; // Default placeholder
    }

    // Extract title
    const title = result.title || 'Fashion Style';
    
    // Try to determine category based on content
    const categoryMatches = {
      casual: /casual|everyday|relaxed|comfort/i,
      professional: /professional|business|formal|office|work/i,
      streetwear: /street|urban|hip|trendy/i,
      athleisure: /athleisure|athletic|sport|workout|gym/i,
      bohemian: /boho|bohemian|hippie|free spirit/i,
      vintage: /vintage|retro|classic|old school/i,
      minimalist: /minimalist|minimal|simple|clean/i,
      glamorous: /glamorous|glam|elegant|luxury|evening/i
    };
    
    let category = 'Casual'; // Default category
    for (const [cat, pattern] of Object.entries(categoryMatches)) {
      if (pattern.test(title) || (result.description && pattern.test(result.description))) {
        category = cat.charAt(0).toUpperCase() + cat.slice(1);
        break;
      }
    }
    
    // Try to detect colors from the content
    const colorMatches = /black|white|gray|blue|red|pink|purple|green|yellow|orange|brown|beige|gold|silver/gi;
    const colorMatched = result.description?.match(colorMatches) || [];
    const colors = colorMatched.length > 0 
      ? [...new Set(colorMatched.map((c: string) => c.toLowerCase()))] as string[]
      : ['black', 'white']; // Default colors
    
    // Create outfit object
    return {
      id: Date.now() + index, // Generate unique ID
      image: imageUrl,
      title: title,
      category,
      brand: 'Web Find', // Default brand for web results
      colors,
      patterns: determinePatterns(result.description || ''),
      occasions: determineOccasions(result.description || '', category),
      fit: determineFit(result.description || ''),
      description: result.description || 'Trending fashion style',
      aiScore: 0 // Base score, to be calculated later
    };
  });
}

// Helper functions to extract style information from text
function determinePatterns(text: string): string[] {
  const patternMatches = {
    solid: /solid|plain|block/i,
    striped: /stripe|striped/i,
    floral: /floral|flower/i,
    graphic: /graphic|print|logo/i,
    plaid: /plaid|tartan|check/i,
    checkered: /check|checkered|gingham/i,
    polkaDot: /polka|dot/i,
    embellished: /embellish|sequin|bead/i,
    ethnic: /ethnic|tribal|cultural/i,
    classic: /classic|traditional/i
  };
  
  const patterns = [];
  for (const [pattern, regex] of Object.entries(patternMatches)) {
    if (regex.test(text)) {
      patterns.push(pattern === 'polkaDot' ? 'polka dot' : pattern);
    }
  }
  
  return patterns.length > 0 ? patterns : ['solid']; // Default to solid
}

function determineOccasions(text: string, category: string): string[] {
  const occasionMatches = {
    daily: /daily|everyday|day-to-day|casual/i,
    work: /work|office|professional|business/i,
    casual: /casual|relaxed|weekend/i,
    formal: /formal|elegant|dressy/i,
    party: /party|celebration|festive/i,
    evening: /evening|night|cocktail/i,
    weekend: /weekend|saturday|sunday/i,
    summer: /summer|hot|beach/i,
    winter: /winter|cold|snow/i,
    special: /special|occasion|important/i,
    beach: /beach|resort|vacation/i,
    festival: /festival|concert|outdoor event/i,
    workout: /workout|exercise|gym|fitness/i,
    outdoor: /outdoor|nature|hiking/i,
    meeting: /meeting|conference|presentation/i,
    dinner: /dinner|restaurant|dining/i,
    social: /social|gathering|meet/i
  };
  
  const occasions = [];
  for (const [occasion, regex] of Object.entries(occasionMatches)) {
    if (regex.test(text)) {
      occasions.push(occasion);
    }
  }
  
  // If no occasions found, add some based on category
  if (occasions.length === 0) {
    switch(category.toLowerCase()) {
      case 'casual':
        return ['casual', 'daily', 'weekend'];
      case 'professional':
        return ['work', 'meeting', 'formal'];
      case 'streetwear':
        return ['casual', 'social', 'outdoor'];
      case 'athleisure':
        return ['workout', 'casual', 'active'];
      case 'bohemian':
        return ['casual', 'festival', 'summer'];
      case 'vintage':
        return ['special', 'social', 'casual'];
      case 'minimalist':
        return ['daily', 'work', 'casual'];
      case 'glamorous':
        return ['evening', 'party', 'formal'];
      default:
        return ['casual', 'daily'];
    }
  }
  
  return occasions;
}

function determineFit(text: string): string {
  const fitMatches = {
    fitted: /fitted|slim|tight|body-con/i,
    relaxed: /relaxed|comfortable|easy/i,
    oversized: /oversized|baggy|loose/i,
    tailored: /tailored|structured|sharp/i,
    flowing: /flowing|flowy|drape/i,
    structured: /structured|architectural|rigid/i,
    classic: /classic|traditional|standard/i,
    loose: /loose|roomy|spacious/i
  };
  
  for (const [fit, regex] of Object.entries(fitMatches)) {
    if (regex.test(text)) {
      return fit;
    }
  }
  
  return 'relaxed'; // Default fit
}

// Function to get cached results
function getCachedResults(query: string): Outfit[] | null {
  const cachedData = searchCache.get(query);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.results;
  }
  return null;
}

// Function to cache results
function cacheResults(query: string, results: Outfit[]): void {
  searchCache.set(query, {
    timestamp: Date.now(),
    results
  });
}

// Mock fashion data for search results
const mockFashionData = [
  {
    title: 'Casual Summer Outfit',
    image: '/images/casual/5 female Casual Fashion.png',
    description: 'Light blue denim jeans with white t-shirt perfect for summer weekends.'
  },
  {
    title: 'Professional Business Attire',
    image: '/images/Professional/7 Female Professional.png',
    description: 'Black formal blazer with matching pants for business meetings and office work.'
  },
  {
    title: 'Street Style Urban Look',
    image: '/images/streetwear/3 female Streetwear.png',
    description: 'Trendy oversized hoodie with black cargo pants and sneakers for a modern urban vibe.'
  },
  {
    title: 'Athletic Performance Wear',
    image: '/images/athleisure/2 female athletic wear.png',
    description: 'Purple and black fitted workout outfit perfect for gym sessions and active lifestyle.'
  },
  {
    title: 'Bohemian Festival Style',
    image: '/images/bohemian/9 Female Bohemian.png',
    description: 'Flowing cream and brown maxi dress with ethnic patterns ideal for summer festivals.'
  },
  {
    title: 'Vintage Classic Look',
    image: '/images/vintage/13 female Vintage Style Portrait.png',
    description: 'Retro-inspired burgundy dress with classic silhouette for special occasions.'
  },
  {
    title: 'Minimalist Everyday Essentials',
    image: '/images/Minimalist/14 female Minimalist Fashion Style.png',
    description: 'Clean lines with beige and white structured pieces for a timeless minimal look.'
  },
  {
    title: 'Glamorous Evening Ensemble',
    image: '/images/Glamorous/12 female Glamorous Style.png',
    description: 'Elegant gold and black outfit with embellishments perfect for evening parties.'
  }
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || '';
  const category = searchParams.get('category') || '';
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  
  console.log('Fashion search API received request:', {
    query,
    category,
    limit,
    url: request.url
  });
  
  if (!query) {
    console.log('API error: Query parameter is required');
    return NextResponse.json({ message: 'Query parameter is required', outfits: [] }, { status: 400 });
  }
  
  // Check cache first
  const cachedResults = getCachedResults(`${query}_${category}_${limit}`);
  if (cachedResults) {
    console.log('Returning cached results:', cachedResults.length);
    return NextResponse.json({ message: 'Results from cache', outfits: cachedResults });
  }
  
  try {
    // Filter mock data based on query
    const filteredResults = mockFashionData.filter(item => {
      const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase()) || 
                         item.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = !category || 
                            item.title.toLowerCase().includes(category.toLowerCase()) || 
                            item.description.toLowerCase().includes(category.toLowerCase());
      
      return matchesQuery && matchesCategory;
    }).slice(0, limit);
    
    console.log('Filtered mock results:', filteredResults.length);
    
    // Transform the results to match our Outfit interface
    const outfits = transformSearchResultsToOutfits(filteredResults);
    
    // Cache the results
    cacheResults(`${query}_${category}_${limit}`, outfits);
    
    console.log('Returning fresh results:', outfits.length);
    return NextResponse.json({ message: 'Search results', outfits }, { status: 200 });
  } catch (error) {
    console.error('Fashion search API error:', error);
    return NextResponse.json(
      { message: 'Error searching for fashion items', error: String(error), outfits: [] },
      { status: 500 }
    );
  }
} 