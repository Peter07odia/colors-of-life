'use client';

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Add to search history
    const newHistory = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    // TODO: Implement actual search functionality
    console.log('Searching for:', searchQuery);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200">
        <div className="flex items-center px-4 py-2 gap-3">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search styles, brands, influencers"
                className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 focus:outline-none"
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>
        </div>
      </div>

      {/* Search Content */}
      <div className="pt-16 px-4">
        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Recent Searches</h2>
              <button
                onClick={clearHistory}
                className="text-sm text-gray-500"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-2">
              {searchHistory.map((query, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-gray-700">{query}</span>
                  <SearchIcon className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Searches */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Popular Searches</h2>
          <div className="grid grid-cols-2 gap-3">
            {['Streetwear', 'Luxury', 'Sustainable', 'Vintage', 'Minimalist', 'Y2K'].map((category) => (
              <Link
                href={`/search?q=${category.toLowerCase()}`}
                key={category}
                className="bg-gray-100 rounded-lg p-3 text-center"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 