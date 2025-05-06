'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import StyleFeedItem from '../../../components/StyleFeedItem';

// Mock search results for demo purposes
const mockResults = [
  {
    id: 'sr1',
    title: 'Summer Collection',
    imageSrc: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80',
    likes: 42
  },
  {
    id: 'sr2',
    title: 'Autumn Essentials',
    imageSrc: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80',
    likes: 28
  },
  {
    id: 'sr3',
    title: 'Winter Outfits',
    imageSrc: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80',
    likes: 35
  }
];

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    async function fetchSearchResults() {
      setLoading(true);
      try {
        // For demo purposes, use mock data instead of actual API call
        // Filter mock results based on query
        const filteredResults = mockResults.filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase())
        );
        
        // Simulate network delay
        setTimeout(() => {
          setResults(filteredResults);
          setLoading(false);
        }, 800);
        
        // Uncomment for real API implementation
        // const response = await fetch(`/api/fashion/search?query=${encodeURIComponent(query)}&limit=15`);
        // if (response.ok) {
        //   const data = await response.json();
        //   setResults(data);
        // }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setLoading(false);
      }
    }

    if (query) {
      fetchSearchResults();
    } else {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="search-results-page">
      <div className="header sticky top-0 z-10 bg-white p-4 shadow-md">
        <Link href="/style-feed" className="text-blue-500 mb-2 block">
          ← Back to Feed
        </Link>
        <h1 className="text-xl font-bold">
          Search results for "{query}"
        </h1>
      </div>

      {loading ? (
        <div className="loading-container flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="results-container">
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {results.map((item) => (
                <StyleFeedItem 
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  imageSrc={item.imageSrc}
                  likes={item.likes}
                />
              ))}
            </div>
          ) : (
            <div className="no-results p-8 text-center">
              <p className="text-gray-600">No results found for "{query}"</p>
              <p className="mt-2">Try a different search term or browse our featured items.</p>
              <Link href="/style-feed" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg">
                Browse Featured Items
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 