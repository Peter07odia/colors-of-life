'use client';

import React, { useState } from 'react';

export default function Search({ onSearch }: { onSearch?: (query: string) => void }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="search-component">
      <form onSubmit={handleSubmit} className="flex w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="flex-grow p-2 border rounded-l-lg focus:outline-none"
        />
        <button 
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-r-lg"
        >
          Search
        </button>
      </form>
    </div>
  );
} 