import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

interface SearchFilters {
  colors?: string[];
  categories?: string[];
  brands?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  source?: 'web' | 'database' | 'all';
}

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  brand?: string;
  price?: string;
  originalPrice?: string;
  image?: string;
  source: 'web' | 'database';
  relevanceScore?: number;
  discount?: number;
  isVideo?: boolean;
  colors?: string[];
  tags?: string[];
  url?: string;
}

interface SmartSearchResponse {
  success: boolean;
  query: {
    original: string;
    expanded: string;
    colors: string[];
    category: string;
  };
  results: SearchResult[];
  metadata: {
    total: number;
    webResults: number;
    databaseResults: number;
    sources: string[];
    timestamp: string;
  };
  suggestions?: {
    tryBroaderTerms: string[];
    popularSearches: string[];
    searchTips: string[];
  };
}

interface SearchParams {
  query: string;
  userId?: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
}

class SmartSearchService {
  private readonly n8nBaseUrl: string;
  private readonly webhookEndpoint: string;

  constructor() {
    this.n8nBaseUrl = process.env.EXPO_PUBLIC_N8N_BASE_URL || 'https://n8n.colorsoflife.app';
    this.webhookEndpoint = '/webhook/smart-search';
  }

  /**
   * Perform smart search using n8n workflow
   */
  async searchFashion(params: SearchParams): Promise<SmartSearchResponse> {
    try {
      const { query, userId, filters, limit = 20, offset = 0 } = params;

      // Build search payload
      const searchPayload = {
        query: query.trim(),
        userId: userId || 'anonymous',
        filters: {
          colors: filters?.colors || [],
          categories: filters?.categories || [],
          brands: filters?.brands || [],
          priceRange: filters?.priceRange,
          source: filters?.source || 'all',
        },
        limit,
        offset,
        timestamp: new Date().toISOString(),
      };

      logger.info('Starting smart search', { query, userId, filters }, 'smart-search');

      // Call n8n workflow
      const response = await this.callN8nWorkflow(searchPayload);
      
      if (!response.success) {
        throw new Error(response.message || 'Search failed');
      }

      // Log search for analytics
      await this.logSearchQuery(params, response.results.length);

      return response;
    } catch (error) {
      logger.error('Smart search failed', error, 'smart-search');
      
      // Fallback to database-only search
      return this.fallbackDatabaseSearch(params);
    }
  }

  /**
   * Search with color filtering
   */
  async searchWithColors(query: string, colors: string[], userId?: string): Promise<SmartSearchResponse> {
    return this.searchFashion({
      query,
      userId,
      filters: { colors, source: 'all' },
    });
  }

  /**
   * Search similar items by image
   */
  async searchByImage(imageUri: string, userId?: string): Promise<SmartSearchResponse> {
    try {
      const searchPayload = {
        query: 'image_search',
        imageUri,
        userId: userId || 'anonymous',
        searchType: 'image',
        timestamp: new Date().toISOString(),
      };

      logger.info('Starting image search', { imageUri, userId }, 'smart-search');

      const response = await this.callN8nWorkflow(searchPayload);
      
      if (!response.success) {
        throw new Error(response.message || 'Image search failed');
      }

      return response;
    } catch (error) {
      logger.error('Image search failed', error, 'smart-search');
      
      // Return empty results for image search fallback
      return {
        success: false,
        query: {
          original: 'image_search',
          expanded: 'image_search',
          colors: [],
          category: 'general',
        },
        results: [],
        metadata: {
          total: 0,
          webResults: 0,
          databaseResults: 0,
          sources: [],
          timestamp: new Date().toISOString(),
        },
        suggestions: {
          tryBroaderTerms: ['Try searching with text instead'],
          popularSearches: ['dresses', 'shirts', 'shoes', 'accessories'],
          searchTips: ['Make sure the image is clear and well-lit', 'Focus on a single clothing item'],
        },
      };
    }
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      // Get suggestions from recent searches and popular terms
      const suggestions = await this.getPopularSearchTerms(query);
      return suggestions.slice(0, 5);
    } catch (error) {
      logger.error('Failed to get search suggestions', error, 'smart-search');
      return [];
    }
  }

  /**
   * Call n8n workflow
   */
  private async callN8nWorkflow(payload: any): Promise<SmartSearchResponse> {
    const url = `${this.n8nBaseUrl}${this.webhookEndpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fallback to database-only search
   */
  private async fallbackDatabaseSearch(params: SearchParams): Promise<SmartSearchResponse> {
    try {
      const { query, filters, limit = 20, offset = 0 } = params;

      let dbQuery = supabase
        .from('fashion_items')
        .select(`
          id,
          name,
          description,
          price,
          original_price,
          images,
          colors,
          tags,
          brands!inner(name),
          categories!inner(name)
        `)
        .eq('is_active', true)
        .order('popularity_score', { ascending: false });

      // Apply text search
      if (query.trim()) {
        dbQuery = dbQuery.or(
          `name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`
        );
      }

      // Apply color filters
      if (filters?.colors && filters.colors.length > 0) {
        dbQuery = dbQuery.overlaps('colors', filters.colors);
      }

      // Apply pagination
      dbQuery = dbQuery.range(offset, offset + limit - 1);

      const { data, error } = await dbQuery;

      if (error) {
        throw error;
      }

      const results: SearchResult[] = (data || []).map((item) => ({
        id: item.id,
        title: item.name,
        description: item.description || undefined,
        brand: item.brands?.name,
        price: item.price ? `$${item.price}` : undefined,
        originalPrice: item.original_price ? `$${item.original_price}` : undefined,
        image: Array.isArray(item.images) ? item.images[0] : item.images,
        source: 'database' as const,
        colors: item.colors || [],
        tags: item.tags || [],
        discount: item.original_price && item.price 
          ? Math.round(((item.original_price - item.price) / item.original_price) * 100)
          : undefined,
      }));

      return {
        success: true,
        query: {
          original: query,
          expanded: query,
          colors: filters?.colors || [],
          category: 'general',
        },
        results,
        metadata: {
          total: results.length,
          webResults: 0,
          databaseResults: results.length,
          sources: ['database'],
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      logger.error('Database fallback search failed', error, 'smart-search');
      
      return {
        success: false,
        query: {
          original: params.query,
          expanded: params.query,
          colors: [],
          category: 'general',
        },
        results: [],
        metadata: {
          total: 0,
          webResults: 0,
          databaseResults: 0,
          sources: [],
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Log search query for analytics
   */
  private async logSearchQuery(params: SearchParams, resultCount: number) {
    try {
      if (!params.userId || params.userId === 'anonymous') return;

      await supabase.from('user_search_history').insert({
        user_id: params.userId,
        search_query: params.query,
        search_type: 'text',
        search_filters: params.filters || {},
        results_count: resultCount,
      });
    } catch (error) {
      logger.error('Failed to log search query', error, 'smart-search');
    }
  }

  /**
   * Get popular search terms
   */
  private async getPopularSearchTerms(query: string): Promise<string[]> {
    try {
      const { data } = await supabase
        .from('user_search_history')
        .select('search_query')
        .ilike('search_query', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      return data?.map(item => item.search_query) || [];
    } catch (error) {
      logger.error('Failed to get popular search terms', error, 'smart-search');
      return [];
    }
  }
}

export const smartSearchService = new SmartSearchService();
export { SmartSearchService, type SearchResult, type SearchParams, type SmartSearchResponse };