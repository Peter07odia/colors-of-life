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

export interface VirtualTryOnRequest {
  avatarId: string;
  clothingItems: Array<{
    id: string;
    image: string;
    name: string;
    category: string;
  }>;
  clothingItemData?: any;
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
  avatar_id: string;
  clothing_item_id: string;
  clothing_item_data: any;
  result_video_url?: string;
  result_image_url?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
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
   * Create a user avatar using OpenAI background removal
   */
  async createAvatar(request: AvatarCreationRequest): Promise<AvatarCreationResponse> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('avatar-creation', {
        body: request
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Avatar creation failed:', error);
      return {
        success: false,
        message: 'Failed to create avatar',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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

      const { data, error } = await supabase.functions.invoke('virtual-tryon', {
        body: request
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
}

export const virtualTryOnService = new VirtualTryOnService();
export default virtualTryOnService; 