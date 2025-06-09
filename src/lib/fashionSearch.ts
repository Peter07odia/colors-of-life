import { Outfit } from './outfitData';

// Interface for search parameters
export interface SearchParams {
  query: string;
  category?: string;
  limit?: number;
}

// Interface for search response
export interface SearchResponse {
  message: string;
  outfits: Outfit[];
  error?: string;
}

/**
 * Search for fashion items using the fashion search API
 * @param params Search parameters
 * @returns Promise with search results
 */
export async function searchFashion(params: SearchParams): Promise<SearchResponse> {
  const { query, category, limit = 10 } = params;
  
  if (!query) {
    return { message: 'Query is required', outfits: [] };
  }
  
  try {
    // Build URL with search parameters
    // For React Native, use environment variable or hardcoded API base URL
    const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.colorsoflife.app';
    const searchUrl = new URL('/api/fashion/search', apiBaseUrl);
    searchUrl.searchParams.append('query', query);
    
    if (category) {
      searchUrl.searchParams.append('category', category);
    }
    
    searchUrl.searchParams.append('limit', limit.toString());
    
    console.log('Sending search request to:', searchUrl.toString());
    
    // Add retry logic (try up to 3 times)
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        // Fetch results from API
        const response = await fetch(searchUrl.toString());
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Search successful, results:', data);
        return data as SearchResponse;
      } catch (error) {
        retries++;
        console.error(`Search attempt ${retries} failed:`, error);
        
        // If we've reached max retries, throw the error
        if (retries >= maxRetries) throw error;
        
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retries)));
      }
    }
    
    // This shouldn't be reached due to the throw in the while loop,
    // but TypeScript needs a return here
    throw new Error('Max retries reached');
  } catch (error) {
    console.error('Error searching for fashion:', error);
    return {
      message: 'Error searching for fashion items',
      error: error instanceof Error ? error.message : String(error),
      outfits: []
    };
  }
}

/**
 * Search for fashion items and merge with local outfits
 * @param params Search parameters
 * @param localOutfits Local outfits to merge with search results
 * @returns Promise with merged search results
 */
export async function searchAndMergeWithLocal(
  params: SearchParams,
  localOutfits: Outfit[]
): Promise<Outfit[]> {
  const searchResults = await searchFashion(params);
  
  if (!searchResults.outfits.length) {
    return localOutfits;
  }
  
  // Merge web results with local outfits, avoiding duplicates by ID
  const localIds = new Set(localOutfits.map(outfit => outfit.id));
  const uniqueWebOutfits = searchResults.outfits.filter(outfit => !localIds.has(outfit.id));
  
  return [...localOutfits, ...uniqueWebOutfits];
} 