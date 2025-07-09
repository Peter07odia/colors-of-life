import { supabase } from '../supabase';

export interface VirtualTryOnRequest {
  userId: string;
  avatarImageUrl: string;
  garmentImageUrl: string;
  category: 'tops' | 'bottoms' | 'jackets' | 'dresses';
}

export interface VirtualTryOnResponse {
  success: boolean;
  userId: string;
  tryOnImageUrl?: string;
  category?: string;
  executionId?: string;
  processedAt?: string;
  metadata?: {
    originalAvatar: string;
    originalGarment: string;
    category: string;
    processedAt: string;
    processingTime: string;
    provider: string;
    executionId: string;
  };
  error?: {
    type: string;
    message: string;
    executionId: string;
  };
}

export interface VirtualTryOnResult {
  id: string;
  user_id: string;
  avatar_image_url: string;
  garment_image_url: string;
  tryon_result_url: string | null;
  category: string;
  status: 'processing' | 'completed' | 'failed';
  error_message: string | null;
  processing_metadata: any;
  created_at: string;
}

class FashnVirtualTryOnService {
  private readonly n8nWebhookUrl = 'https://your-n8n-instance.com/webhook/virtual-tryon';

  /**
   * Perform virtual try-on using FASHN API through n8n workflow
   */
  async performVirtualTryOn(request: VirtualTryOnRequest): Promise<VirtualTryOnResponse> {
    try {
      console.log('🎯 Starting virtual try-on process...', {
        userId: request.userId,
        category: request.category,
        avatarUrl: request.avatarImageUrl.substring(0, 50) + '...',
        garmentUrl: request.garmentImageUrl.substring(0, 50) + '...'
      });

      // Call n8n webhook with FASHN virtual try-on workflow
      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: request.userId,
          avatarImageUrl: request.avatarImageUrl,
          garmentImageUrl: request.garmentImageUrl,
          category: request.category,
        }),
      });

      if (!response.ok) {
        throw new Error(`Virtual try-on failed: ${response.status} ${response.statusText}`);
      }

      const result: VirtualTryOnResponse = await response.json();

      console.log('✅ Virtual try-on completed:', {
        success: result.success,
        executionId: result.executionId,
        hasImage: !!result.tryOnImageUrl
      });

      return result;
    } catch (error) {
      console.error('❌ Virtual try-on error:', error);
      
      return {
        success: false,
        userId: request.userId,
        error: {
          type: 'network_error',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          executionId: 'unknown'
        }
      };
    }
  }

  /**
   * Get virtual try-on results for a user
   */
  async getUserTryOnResults(userId: string, limit: number = 20): Promise<VirtualTryOnResult[]> {
    try {
      const { data, error } = await supabase
        .from('virtual_tryon_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching try-on results:', error);
      return [];
    }
  }

  /**
   * Get a specific try-on result by ID
   */
  async getTryOnResult(resultId: string): Promise<VirtualTryOnResult | null> {
    try {
      const { data, error } = await supabase
        .from('virtual_tryon_results')
        .select('*')
        .eq('id', resultId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error fetching try-on result:', error);
      return null;
    }
  }

  /**
   * Delete a try-on result
   */
  async deleteTryOnResult(resultId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('virtual_tryon_results')
        .delete()
        .eq('id', resultId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('❌ Error deleting try-on result:', error);
      return false;
    }
  }

  /**
   * Get try-on results by category
   */
  async getTryOnResultsByCategory(
    userId: string, 
    category: string, 
    limit: number = 10
  ): Promise<VirtualTryOnResult[]> {
    try {
      const { data, error } = await supabase
        .from('virtual_tryon_results')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching try-on results by category:', error);
      return [];
    }
  }

  /**
   * Get processing statistics for a user
   */
  async getUserTryOnStats(userId: string): Promise<{
    total: number;
    completed: number;
    failed: number;
    processing: number;
    byCategory: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('virtual_tryon_results')
        .select('status, category')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      const stats = {
        total: data.length,
        completed: 0,
        failed: 0,
        processing: 0,
        byCategory: {} as Record<string, number>
      };

      data.forEach(result => {
        // Count by status
        if (result.status === 'completed') stats.completed++;
        else if (result.status === 'failed') stats.failed++;
        else if (result.status === 'processing') stats.processing++;

        // Count by category
        if (result.category) {
          stats.byCategory[result.category] = (stats.byCategory[result.category] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('❌ Error fetching try-on stats:', error);
      return {
        total: 0,
        completed: 0,
        failed: 0,
        processing: 0,
        byCategory: {}
      };
    }
  }

  /**
   * Validate image URLs before processing
   */
  validateImageUrls(avatarUrl: string, garmentUrl: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if URLs are provided
    if (!avatarUrl || !avatarUrl.trim()) {
      errors.push('Avatar image URL is required');
    }

    if (!garmentUrl || !garmentUrl.trim()) {
      errors.push('Garment image URL is required');
    }

    // Check if URLs are valid
    try {
      new URL(avatarUrl);
    } catch {
      errors.push('Avatar image URL is not valid');
    }

    try {
      new URL(garmentUrl);
    } catch {
      errors.push('Garment image URL is not valid');
    }

    // Check if URLs are accessible image formats
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const avatarHasValidExt = imageExtensions.some(ext => 
      avatarUrl.toLowerCase().includes(ext)
    );
    const garmentHasValidExt = imageExtensions.some(ext => 
      garmentUrl.toLowerCase().includes(ext)
    );

    if (!avatarHasValidExt) {
      errors.push('Avatar image must be JPG, PNG, or WebP format');
    }

    if (!garmentHasValidExt) {
      errors.push('Garment image must be JPG, PNG, or WebP format');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get supported clothing categories
   */
  getSupportedCategories(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'tops',
        label: 'Tops',
        description: 'T-shirts, blouses, sweaters, shirts'
      },
      {
        value: 'bottoms',
        label: 'Bottoms',
        description: 'Pants, jeans, skirts, shorts'
      },
      {
        value: 'jackets',
        label: 'Jackets',
        description: 'Coats, blazers, hoodies, cardigans'
      },
      {
        value: 'dresses',
        label: 'Dresses',
        description: 'Casual, formal, and party dresses'
      }
    ];
  }
}

export const fashnVirtualTryOnService = new FashnVirtualTryOnService(); 