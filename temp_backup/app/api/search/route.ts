import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }
  
  try {
    // This is where you would implement your actual search logic
    // For example, querying a database or external API
    
    // Mock search results for demonstration
    const results = [
      {
        id: '1',
        title: 'Summer Style',
        description: 'Lightweight and colorful outfit for summer',
        imageUrl: '/images/style1.jpg'
      },
      {
        id: '2',
        title: 'Office Casual',
        description: 'Professional but comfortable look',
        imageUrl: '/images/style2.jpg'
      },
      // Add more mock results
    ].filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.description.toLowerCase().includes(query.toLowerCase())
    );
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
} 