import { NextRequest, NextResponse } from 'next/server';
import { getUserPreferences } from '@/utils/userPreferences'; // You'll need to create this utility

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || '';
  const category = searchParams.get('category') || '';
  const limit = parseInt(searchParams.get('limit') || '15');
  
  console.log('Fashion search API received request:', {
    query,
    category,
    limit,
    url: request.url
  });
  
  try {
    // In a real implementation, you would fetch from a database
    // For now, we'll use mock data
    let results = getMockClothingItems();
    
    // Filter by search query
    if (query) {
      results = results.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.colors.some(color => color.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    // Filter by category if provided
    if (category) {
      results = results.filter(item => item.category === category);
    }
    
    // Get user preferences (in a real app, this would be from a database or auth session)
    const userPreferences = await getUserPreferences();
    
    // Sort results by relevance to user preferences
    results = sortByUserPreferences(results, userPreferences);
    
    // Limit results
    results = results.slice(0, limit);
    
    console.log(`Filtered mock results: ${results.length}`);
    console.log(`Returning fresh results: ${results.length}`);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

function getMockClothingItems() {
  return [
    {
      id: '1',
      title: 'Black Casual T-Shirt',
      description: 'Comfortable cotton t-shirt for everyday wear',
      category: 'tops',
      colors: ['black'],
      imageUrl: '/images/black-tshirt.jpg',
      price: 19.99
    },
    {
      id: '2',
      title: 'Blue Denim Jeans',
      description: 'Classic slim fit jeans',
      category: 'bottoms',
      colors: ['blue'],
      imageUrl: '/images/blue-jeans.jpg',
      price: 49.99
    },
    // Add more items...
  ];
}

function sortByUserPreferences(items, preferences) {
  return items.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    
    // Increase score for matching preferred categories
    if (preferences.categories.includes(a.category)) scoreA += 3;
    if (preferences.categories.includes(b.category)) scoreB += 3;
    
    // Increase score for matching preferred colors
    a.colors.forEach(color => {
      if (preferences.colors.includes(color)) scoreA += 2;
    });
    
    b.colors.forEach(color => {
      if (preferences.colors.includes(color)) scoreB += 2;
    });
    
    // Higher score items come first
    return scoreB - scoreA;
  });
} 