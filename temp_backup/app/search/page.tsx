'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/Search';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    } else {
      setResults([]);
    }
    
    async function fetchSearchResults() {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [query]);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <SearchBar />
      </div>
      
      <h1 className="text-2xl font-bold mb-4">
        {query ? `Search results for "${query}"` : 'Search'}
      </h1>
      
      {loading ? (
        <div className="flex justify-center">
          <p>Loading results...</p>
        </div>
      ) : (
        <div>
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((item) => (
                <SearchResultCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            query && <p>No results found for "{query}"</p>
          )}
        </div>
      )}
    </div>
  );
}

function SearchResultCard({ item }) {
  return (
    <Link href={`/style-feed/${item.id}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        {item.imageUrl && (
          <div className="aspect-square overflow-hidden">
            <img 
              src={item.imageUrl} 
              alt={item.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-3">
          <h3 className="font-medium">{item.title}</h3>
          {item.description && (
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          )}
        </div>
      </div>
    </Link>
  );
} 