import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/supabase';

// Types for virtual try-on service
export interface AvatarCreationRequest {
  userPhotoBase64: string;
  avatarType?: 'custom' | 'generic';
}

export interface AvatarCreationResponse {
  success: boolean;
  message: string;
  avatarId?: string;
  avatarUrl?: string;
  executionId?: string;
  error?: string;
}

export interface ClothingItem {
  id: string;
  image: string;
  name: string;
  category: string;
  categoryType?: 'tops' | 'bottoms' | 'outerwear' | 'dresses' | 'footwear' | 'accessories';
  priority?: number; // For ordering when multiple items are tried on
}

export interface VirtualTryOnRequest {
  avatarId: string;
  clothingItems: ClothingItem[];
  clothingItemData?: any;
  tryOnMode?: 'single' | 'outfit'; // single item or complete outfit
}

export interface VirtualTryOnResponse {
  success: boolean;
  message: string;
  tryonResultId?: string;
  executionId?: string;
  n8nExecutionId?: string;
  estimatedWaitTime?: string;
  error?: string;
}

export interface TryOnResult {
  id: string;
  user_id: string;
  avatar_id?: string;
  clothing_item_id?: string;
  clothing_item_data?: any;
  result_video_url?: string;
  result_image_url?: string;
  processing_time_seconds?: number;
  kling_task_id?: string;
  n8n_execution_id?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  user_rating?: number;
  is_saved?: boolean;
  shared_publicly?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAvatar {
  id: string;
  user_id: string;
  avatar_url: string;
  avatar_type: 'generic' | 'custom' | 'ai_generated';
  is_primary: boolean;
  processing_status: 'processing' | 'completed' | 'failed';
  created_at: string;
}

class VirtualTryOnService {
  
  /**
   * Create a user avatar - DEPRECATED: Use supabaseEdgeFunctionService.createAvatar instead
   * This method is kept for backward compatibility but should not be used
   */
  async createAvatar(request: AvatarCreationRequest): Promise<AvatarCreationResponse> {
    console.warn('⚠️ virtualTryOnService.createAvatar is deprecated. Use supabaseEdgeFunctionService.createAvatar instead');
    
    return {
      success: false,
      message: 'This method is deprecated. Use supabaseEdgeFunctionService.createAvatar instead',
      error: 'Method deprecated'
    };
  }

  /**
   * Categorize clothing items by type
   */
  private categorizeClothingItems(items: ClothingItem[]): {
    tops: ClothingItem[];
    bottoms: ClothingItem[];
    outerwear: ClothingItem[];
    dresses: ClothingItem[];
    footwear: ClothingItem[];
    accessories: ClothingItem[];
  } {
    const categorized = {
      tops: [] as ClothingItem[],
      bottoms: [] as ClothingItem[],
      outerwear: [] as ClothingItem[],
      dresses: [] as ClothingItem[],
      footwear: [] as ClothingItem[],
      accessories: [] as ClothingItem[]
    };

    items.forEach(item => {
      const categoryType = item.categoryType || this.inferCategoryType(item.category);
      if (categorized[categoryType]) {
        categorized[categoryType].push(item);
      }
    });

    return categorized;
  }

  /**
   * Infer category type from category name
   */
  private inferCategoryType(category: string): 'tops' | 'bottoms' | 'outerwear' | 'dresses' | 'footwear' | 'accessories' {
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('top') || categoryLower.includes('shirt') || categoryLower.includes('blouse')) {
      return 'tops';
    } else if (categoryLower.includes('bottom') || categoryLower.includes('pant') || categoryLower.includes('jean') || 
               categoryLower.includes('short') || categoryLower.includes('trouser')) {
      return 'bottoms';
    } else if (categoryLower.includes('outerwear') || categoryLower.includes('jacket') || categoryLower.includes('coat')) {
      return 'outerwear';
    } else if (categoryLower.includes('dress') || categoryLower.includes('gown')) {
      return 'dresses';
    } else if (categoryLower.includes('shoe') || categoryLower.includes('footwear') || categoryLower.includes('sneaker')) {
      return 'footwear';
    } else {
      return 'accessories';
    }
  }

  /**
   * Validate outfit combination for try-on
   */
  private validateOutfitCombination(items: ClothingItem[]): { valid: boolean; message?: string } {
    const categorized = this.categorizeClothingItems(items);
    
    // Check for conflicting combinations
    if (categorized.dresses.length > 0 && (categorized.tops.length > 0 || categorized.bottoms.length > 0)) {
      return {
        valid: false,
        message: 'Cannot combine dresses with separate tops or bottoms'
      };
    }

    // Check for excessive items in same category
    if (categorized.tops.length > 2) {
      return {
        valid: false,
        message: 'Too many top items selected (maximum 2: base + outerwear)'
      };
    }

    if (categorized.bottoms.length > 1) {
      return {
        valid: false,
        message: 'Multiple bottom items selected (only one allowed)'
      };
    }

    return { valid: true };
  }

  /**
   * Prepare clothing items for try-on with proper ordering
   */
  private prepareClothingItemsForTryOn(items: ClothingItem[]): ClothingItem[] {
    const categorized = this.categorizeClothingItems(items);
    const orderedItems: ClothingItem[] = [];

    // Order: bottoms/dresses first, then tops, then outerwear, then accessories, then footwear
    orderedItems.push(...categorized.dresses);
    orderedItems.push(...categorized.bottoms);
    orderedItems.push(...categorized.tops.filter(item => !item.category.toLowerCase().includes('jacket')));
    orderedItems.push(...categorized.outerwear);
    orderedItems.push(...categorized.tops.filter(item => item.category.toLowerCase().includes('jacket')));
    orderedItems.push(...categorized.accessories);
    orderedItems.push(...categorized.footwear);

    // Assign priority based on order
    return orderedItems.map((item, index) => ({
      ...item,
      priority: index + 1
    }));
  }

  /**
   * Start virtual try-on process using Kling AI
   */
  async startVirtualTryOn(request: VirtualTryOnRequest): Promise<VirtualTryOnResponse> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate clothing combination if multiple items
      if (request.clothingItems.length > 1) {
        const validation = this.validateOutfitCombination(request.clothingItems);
        if (!validation.valid) {
          return {
            success: false,
            message: validation.message || 'Invalid clothing combination',
            error: 'INVALID_COMBINATION'
          };
        }
      }

      // Prepare items with proper ordering
      const preparedItems = this.prepareClothingItemsForTryOn(request.clothingItems);
      
      // Enhanced request with category information
      const enhancedRequest = {
        ...request,
        clothingItems: preparedItems,
        tryOnMode: request.tryOnMode || (preparedItems.length > 1 ? 'outfit' : 'single'),
        metadata: {
          hasBottoms: preparedItems.some(item => this.inferCategoryType(item.category) === 'bottoms'),
          hasTops: preparedItems.some(item => this.inferCategoryType(item.category) === 'tops'),
          hasOuterwear: preparedItems.some(item => this.inferCategoryType(item.category) === 'outerwear'),
          totalItems: preparedItems.length
        }
      };

      console.log('Starting virtual try-on with enhanced request:', {
        avatarId: enhancedRequest.avatarId,
        itemCount: enhancedRequest.clothingItems.length,
        tryOnMode: enhancedRequest.tryOnMode,
        metadata: enhancedRequest.metadata
      });

      const { data, error } = await supabase.functions.invoke('virtual-tryon', {
        body: enhancedRequest
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Virtual try-on failed:', error);
      return {
        success: false,
        message: 'Failed to start virtual try-on',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user's avatars
   */
  async getUserAvatars(): Promise<UserAvatar[]> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get user avatars:', error);
      return [];
    }
  }

  /**
   * Get user's primary avatar
   */
  async getPrimaryAvatar(): Promise<UserAvatar | null> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Failed to get primary avatar:', error);
      return null;
    }
  }

  /**
   * Set an avatar as primary
   */
  async setPrimaryAvatar(avatarId: string): Promise<boolean> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First, unset all other avatars as primary
      await supabase
        .from('user_avatars')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      // Then set the selected avatar as primary
      const { error } = await supabase
        .from('user_avatars')
        .update({ is_primary: true })
        .eq('id', avatarId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Failed to set primary avatar:', error);
      return false;
    }
  }

  /**
   * Get virtual try-on results for user
   */
  async getTryOnResults(): Promise<TryOnResult[]> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('virtual_tryon_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get try-on results:', error);
      return [];
    }
  }

  /**
   * Get a specific try-on result
   */
  async getTryOnResult(tryonResultId: string): Promise<TryOnResult | null> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('virtual_tryon_results')
        .select('*')
        .eq('id', tryonResultId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Failed to get try-on result:', error);
      return null;
    }
  }

  /**
   * Poll for try-on result completion
   */
  async pollTryOnResult(tryonResultId: string, maxAttempts: number = 30): Promise<TryOnResult | null> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const result = await this.getTryOnResult(tryonResultId);
      
      if (result) {
        if (result.processing_status === 'completed' || result.processing_status === 'failed') {
          return result;
        }
      }
      
      // Wait 3 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 3000));
      attempts++;
    }
    
    return null; // Timeout
  }

  /**
   * Delete a try-on result
   */
  async deleteTryOnResult(tryonResultId: string): Promise<boolean> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('virtual_tryon_results')
        .delete()
        .eq('id', tryonResultId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete try-on result:', error);
      return false;
    }
  }

  /**
   * Save a try-on result to user's saved items
   */
  async saveTryOnResult(tryonResultId: string): Promise<boolean> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('virtual_tryon_results')
        .update({ is_saved: true })
        .eq('id', tryonResultId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Failed to save try-on result:', error);
      return false;
    }
  }

  /**
   * Rate a try-on result
   */
  async rateTryOnResult(tryonResultId: string, rating: number): Promise<boolean> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const { error } = await supabase
        .from('virtual_tryon_results')
        .update({ user_rating: rating })
        .eq('id', tryonResultId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Failed to rate try-on result:', error);
      return false;
    }
  }

  /**
   * Suggest outfit combinations from available wardrobe items
   */
  async suggestOutfitCombinations(wardrobeItems: ClothingItem[]): Promise<ClothingItem[][]> {
    try {
      const categorized = this.categorizeClothingItems(wardrobeItems);
      const outfitSuggestions: ClothingItem[][] = [];

      // Suggest basic combinations
      // 1. Top + Bottom combinations
      categorized.tops.forEach(top => {
        categorized.bottoms.forEach(bottom => {
          const combination = [top, bottom];
          if (this.validateOutfitCombination(combination).valid) {
            outfitSuggestions.push(combination);
          }
        });
      });

      // 2. Dress as standalone
      categorized.dresses.forEach(dress => {
        outfitSuggestions.push([dress]);
      });

      // 3. Top + Bottom + Outerwear combinations
      categorized.tops.forEach(top => {
        categorized.bottoms.forEach(bottom => {
          categorized.outerwear.forEach(outerwear => {
            const combination = [top, bottom, outerwear];
            if (this.validateOutfitCombination(combination).valid) {
              outfitSuggestions.push(combination);
            }
          });
        });
      });

      // Limit to top 10 suggestions to avoid overwhelming the user
      return outfitSuggestions.slice(0, 10);
    } catch (error) {
      console.error('Failed to suggest outfit combinations:', error);
      return [];
    }
  }

  /**
   * Helper method to check if an item is suitable for bottoms try-on
   */
  isBottomItem(item: ClothingItem): boolean {
    const categoryType = item.categoryType || this.inferCategoryType(item.category);
    return categoryType === 'bottoms' || categoryType === 'dresses';
  }

  /**
   * Helper method to check if an item is suitable for tops try-on
   */
  isTopItem(item: ClothingItem): boolean {
    const categoryType = item.categoryType || this.inferCategoryType(item.category);
    return categoryType === 'tops' || categoryType === 'outerwear';
  }
}

export const virtualTryOnService = new VirtualTryOnService();
export default virtualTryOnService; 