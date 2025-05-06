import React, { useState } from 'react';
import { Outfit, styleOptions } from '../lib/outfitData';
import { searchFashion } from '../lib/fashionSearch';
import { Search, X, Loader } from 'lucide-react';
import Image from 'next/image';

interface FashionSearchProps {
  onSelectOutfit: (outfit: Outfit) => void;
  isOpen: boolean;
  onClose: () => void;
}

const FashionSearch: React.FC<FashionSearchProps> = ({ onSelectOutfit, isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Outfit[]>([]);
  const [error, setError] = useState('');

  // Handle search query input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSearchCategory(category === searchCategory ? '' : category);
  };

  // Clear search results
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError('');
  };

  // Perform search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      console.log('Starting search with query:', searchQuery, 'category:', searchCategory);
      
      const results = await searchFashion({
        query: searchQuery,
        category: searchCategory,
        limit: 15
      });

      console.log('Search results:', results);

      if (results.error) {
        setError(results.error);
        console.error('Search returned error:', results.error);
      } else {
        setSearchResults(results.outfits);
        console.log('Outfits found:', results.outfits.length);
        if (results.outfits.length === 0) {
          setError('No results found. Try a different search term.');
        }
      }
    } catch (error) {
      console.error('Search exception:', error);
      setError('Error searching for fashion items');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Select an outfit
  const handleSelectOutfit = (outfit: Outfit) => {
    onSelectOutfit(outfit);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Search Fashion Styles</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for styles, outfits, trends..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
            {searchQuery && (
              <button 
                className="absolute inset-y-0 right-12 flex items-center pr-3"
                onClick={clearSearch}
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <button 
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              <div className={`rounded-full p-1 ${searchQuery.trim() ? 'bg-primary-main text-white' : 'bg-gray-300 text-gray-100'}`}>
                {isSearching ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </div>
            </button>
          </div>

          {/* Category filters */}
          <div className="flex space-x-2 overflow-x-auto hide-scrollbar py-2">
            {styleOptions.categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-1 rounded-full whitespace-nowrap ${
                  searchCategory === category 
                    ? 'bg-primary-main text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search results */}
        <div className="flex-1 overflow-y-auto p-4">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader className="h-8 w-8 text-primary-main animate-spin mb-4" />
              <p className="text-gray-500">Searching for styles...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-500">{error}</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {searchResults.map((outfit) => (
                <div 
                  key={outfit.id} 
                  className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => handleSelectOutfit(outfit)}
                >
                  <div className="aspect-[2/3] relative bg-gray-100">
                    <Image 
                      src={outfit.image} 
                      alt={outfit.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/avatar-placeholder.png";
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-1">{outfit.title}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {outfit.category}
                      </span>
                      {outfit.colors.slice(0, 2).map((color) => (
                        <span 
                          key={color} 
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-500">No results found. Try a different search term.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <Search className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">Search for fashion styles to find inspiration</p>
              <p className="text-gray-400 text-sm">Example: "summer casual", "formal evening", "streetwear trend"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between">
          <p className="text-sm text-gray-500">
            {searchResults.length > 0 ? `${searchResults.length} results found` : ''}
          </p>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FashionSearch; 