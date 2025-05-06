import { create } from 'zustand';
import { Outfit } from '../outfitData';
import { apiGet } from '../api-utils';
import { logger } from '../logger';

export interface OutfitSearchParams {
  query?: string;
  category?: string;
  limit?: number;
}

interface OutfitCache {
  [key: string]: {
    data: Outfit[];
    timestamp: number;
  };
}

export interface DataState {
  // Search results
  searchResults: Outfit[];
  searchLoading: boolean;
  searchError: string | null;
  
  // Recommended outfits
  recommendations: Outfit[];
  recommendationsLoading: boolean;
  recommendationsError: string | null;
  
  // Cache system
  cache: OutfitCache;
  
  // Actions
  searchOutfits: (params: OutfitSearchParams) => Promise<Outfit[]>;
  getRecommendations: () => Promise<Outfit[]>;
  clearSearchResults: () => void;
  clearCache: () => void;
}

// Cache time to live in milliseconds (30 minutes)
const CACHE_TTL = 30 * 60 * 1000;

// Helper to create cache key
const getCacheKey = (params: OutfitSearchParams): string => {
  return Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
};

export const useDataStore = create<DataState>((set, get) => ({
  // Search results
  searchResults: [],
  searchLoading: false,
  searchError: null,
  
  // Recommended outfits
  recommendations: [],
  recommendationsLoading: false,
  recommendationsError: null,
  
  // Cache system
  cache: {},
  
  // Search for outfits
  searchOutfits: async (params: OutfitSearchParams): Promise<Outfit[]> => {
    const cacheKey = getCacheKey(params);
    const cachedData = get().cache[cacheKey];
    
    // Check if we have fresh cached data
    if (
      cachedData && 
      Date.now() - cachedData.timestamp < CACHE_TTL &&
      cachedData.data.length > 0
    ) {
      set({ searchResults: cachedData.data });
      logger.info('Using cached search results', { params, cacheKey }, 'data-store');
      return cachedData.data;
    }
    
    // Otherwise fetch from API
    set({ searchLoading: true, searchError: null });
    
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      if (params.query) queryParams.set('query', params.query);
      if (params.category) queryParams.set('category', params.category);
      if (params.limit) queryParams.set('limit', params.limit.toString());
      
      // Fetch data
      const response = await apiGet<{ outfits: Outfit[] }>(
        `/api/fashion/search?${queryParams.toString()}`
      );
      
      // Update state and cache
      set((state) => ({
        searchResults: response.outfits,
        searchLoading: false,
        cache: {
          ...state.cache,
          [cacheKey]: {
            data: response.outfits,
            timestamp: Date.now(),
          },
        },
      }));
      
      logger.info('Fetch search results success', { count: response.outfits.length, params }, 'data-store');
      return response.outfits;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ searchLoading: false, searchError: errorMessage });
      logger.error('Fetch search results failed', error, 'data-store');
      return [];
    }
  },
  
  // Get personalized recommendations
  getRecommendations: async (): Promise<Outfit[]> => {
    set({ recommendationsLoading: true, recommendationsError: null });
    
    try {
      // Fetch recommendations from API
      const response = await apiGet<{ outfits: Outfit[] }>(
        '/api/fashion/recommendations'
      );
      
      set({ recommendations: response.outfits, recommendationsLoading: false });
      logger.info('Fetch recommendations success', { count: response.outfits.length }, 'data-store');
      return response.outfits;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ recommendationsLoading: false, recommendationsError: errorMessage });
      logger.error('Fetch recommendations failed', error, 'data-store');
      return [];
    }
  },
  
  // Clear search results
  clearSearchResults: () => set({ searchResults: [], searchError: null }),
  
  // Clear cache
  clearCache: () => set({ cache: {} }),
})); 