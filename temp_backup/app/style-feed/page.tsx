'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StyleFeedItem from '../../components/StyleFeedItem';

export default function StyleFeed() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/style-feed/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Demo style items
  const styleItems = [
    {
      id: 1,
      title: 'Summer Vibes',
      imageSrc: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=654&q=80',
      likes: 125
    },
    {
      id: 2,
      title: 'Business Casual',
      imageSrc: 'https://images.unsplash.com/photo-1522725132749-c7e5f98afe8e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=654&q=80',
      likes: 89
    },
    {
      id: 3,
      title: 'Weekend Outfit',
      imageSrc: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&q=80',
      likes: 74
    },
    {
      id: 4,
      title: 'Streetwear',
      imageSrc: 'https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=654&q=80',
      likes: 112
    }
  ];

  return (
    <div className="style-feed-container">
      {/* Search Bar */}
      <div className="search-container sticky top-0 z-10 bg-white p-3 shadow-md">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for clothes..."
            className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>
      
      {/* Style Feed Grid */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Trending Styles</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {styleItems.map((item) => (
            <StyleFeedItem
              key={item.id}
              id={item.id}
              title={item.title}
              imageSrc={item.imageSrc}
              likes={item.likes}
              onClick={() => console.log(`Clicked on style ${item.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 