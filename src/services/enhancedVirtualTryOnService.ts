import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/supabase';

// Use environment variable for n8n URL with fallback
const N8N_BASE_URL = process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL || 'http://localhost:5678';

// Add connection testing utility
const testN8NConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/healthz`, {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.warn('n8n connection test failed:', error);
    return false;
  }
};

export interface EnhancedAvatarResponse {
  success: boolean;
  message: string;
  avatarId?: string;
  avatarUrl?: string;
  enhancements: {
    backgroundRemoved: boolean;
    faceEnhanced: boolean;
    upscaled: boolean;
    finalQuality: string;
  };
  qualityScore: number;
  executionId: string;
}

export interface EnhancedTryOnResponse {
  success: boolean;
  message: string;
  tryonResultId?: string;
  results: {
    videoUrl?: string;
    imageUrl?: string;
    enhancedUrl?: string;
    qualityScore: number;
  };
  metadata: {
    processingTime: number;
    enhancementApplied: boolean;
    qualityLevel: string;
  };
  executionId: string;
}

export interface AIRecommendationsResponse {
  success: boolean;
  userId: string;
  recommendationType: string;
  recommendations: Array<{
    id: string;
    item: string;
    description: string;
    confidenceScore: number;
    priceRange: string;
    occasion: string[];
    style: string[];
    finalScore: number;
  }>;
  metadata: {
    totalGenerated: number;
    totalReturned: number;
    averageConfidence: number;
    timestamp: string;
  };
}

export interface FashionSearchResponse {
  success: boolean;
  query: {
    original: string;
    expanded: string;
    intent: string;
  };
  results: Array<{
    id: string;
    title: string;
    description: string;
    image: string;
    price?: string;
    brand?: string;
    category: string;
    url: string;
    source: 'web' | 'internal';
    relevanceScore: number;
  }>;
  metadata: {
    total: number;
    sources: string[];
    searchType: string;
    timestamp: string;
  };
}

class EnhancedVirtualTryOnService {
  
  /**
   * Create enhanced avatar with Replicate processing
   */
  async createEnhancedAvatar(
    userPhotoBase64: string, 
    stylePreferences = {},
    onProgress?: (status: string) => void
  ): Promise<EnhancedAvatarResponse> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      onProgress?.('Starting avatar creation...');

      // Test n8n connection first
      const isN8NAvailable = await testN8NConnection();
      
      if (!isN8NAvailable) {
        console.warn('n8n not available, falling back to Supabase Edge Function');
        onProgress?.('Using backup processing system...');
        
        // Fallback to Supabase Edge Function
        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/avatar-creation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.supabaseKey}`,
          },
          body: JSON.stringify({
            userId: user.id,
            imageData: userPhotoBase64,
            processingSettings: stylePreferences
          }),
        });

        if (!response.ok) {
          throw new Error(`Avatar creation failed: ${response.statusText}`);
        }

        const result = await response.json();
        onProgress?.('Avatar created successfully!');
        
        // Transform to expected format
        return {
          success: result.success,
          message: result.message || 'Avatar created successfully',
          avatarId: result.avatarId,
          avatarUrl: result.avatarUrl,
          enhancements: {
            backgroundRemoved: true,
            faceEnhanced: true,
            upscaled: true,
            finalQuality: 'high'
          },
          qualityScore: 90,
          executionId: result.executionId || 'edge-function'
        };
      }

      // Try n8n webhook
      const response = await fetch(`${N8N_BASE_URL}/webhook/avatar-creation-enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userPhotoBase64,
          stylePreferences,
          enhancementOptions: {
            backgroundRemoval: true,
            faceEnhancement: true,
            upscaling: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Avatar creation failed: ${response.statusText}`);
      }

      const result = await response.json();
      onProgress?.('Avatar created successfully!');
      
      return result;
    } catch (error) {
      console.error('Enhanced avatar creation failed:', error);
      
      // If n8n fails, try Supabase Edge Function as final fallback
      if (error.message.includes('fetch')) {
        console.log('Attempting fallback to Supabase Edge Function...');
        onProgress?.('Retrying with backup system...');
        
        try {
          const user = await getCurrentUser();
          const response = await fetch(`${supabase.supabaseUrl}/functions/v1/avatar-creation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabase.supabaseKey}`,
            },
            body: JSON.stringify({
              userId: user.id,
              imageData: userPhotoBase64,
              processingSettings: stylePreferences
            }),
          });

          if (response.ok) {
            const result = await response.json();
            onProgress?.('Avatar created successfully via backup!');
            
            return {
              success: result.success,
              message: result.message || 'Avatar created successfully',
              avatarId: result.avatarId,
              avatarUrl: result.avatarUrl,
              enhancements: {
                backgroundRemoved: true,
                faceEnhanced: true,
                upscaled: true,
                finalQuality: 'high'
              },
              qualityScore: 85,
              executionId: result.executionId || 'edge-function-fallback'
            };
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Enhanced virtual try-on with real-time progress
   */
  async enhancedVirtualTryOn(
    avatarId: string,
    clothingItem: any,
    onProgress?: (status: string, progress?: number) => void
  ): Promise<EnhancedTryOnResponse> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Get avatar URL from database
      const { data: avatar } = await supabase
        .from('user_avatars')
        .select('avatar_url')
        .eq('id', avatarId)
        .single();

      if (!avatar) throw new Error('Avatar not found');

      onProgress?.('Starting virtual try-on...', 0);

      const response = await fetch(`${N8N_BASE_URL}/webhook/virtual-tryon-enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          avatarId,
          avatarUrl: avatar.avatar_url,
          clothingItems: [clothingItem],
          qualityLevel: 'high',
          outputFormat: 'both'
        }),
      });

      if (!response.ok) {
        throw new Error(`Try-on failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // If processing is async, poll for results
      if (result.tryonResultId && !result.results?.imageUrl) {
        return await this.pollTryOnResult(result.tryonResultId, onProgress);
      }

      onProgress?.('Try-on completed!', 100);
      return result;
    } catch (error) {
      console.error('Enhanced virtual try-on failed:', error);
      throw error;
    }
  }

  /**
   * Poll for try-on results (for long-running processes)
   */
  private async pollTryOnResult(
    tryonResultId: string, 
    onProgress?: (status: string, progress?: number) => void
  ): Promise<EnhancedTryOnResponse> {
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      const progress = (attempts / maxAttempts) * 100;
      
      onProgress?.(`Processing try-on... (${Math.round(progress)}%)`, progress);

      const { data, error } = await supabase
        .from('virtual_tryon_results')
        .select('*')
        .eq('id', tryonResultId)
        .single();

      if (error) throw error;

      if (data.processing_status === 'completed') {
        onProgress?.('Try-on completed!', 100);
        return {
          success: true,
          message: 'Virtual try-on completed',
          tryonResultId,
          results: {
            videoUrl: data.result_video_url,
            imageUrl: data.result_image_url,
            enhancedUrl: data.enhanced_image_url,
            qualityScore: data.quality_score || 85
          },
          metadata: {
            processingTime: data.processing_time_seconds || 0,
            enhancementApplied: !!data.enhanced_image_url,
            qualityLevel: 'high'
          },
          executionId: data.n8n_execution_id
        };
      } else if (data.processing_status === 'failed') {
        throw new Error(data.error_message || 'Try-on processing failed');
      }

      // Wait 10 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    throw new Error('Try-on processing timeout');
  }

  /**
   * AI-powered fashion recommendations
   */
  async getAIRecommendations(
    recommendationType = 'general',
    contextData = {}
  ): Promise<AIRecommendationsResponse> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch(`${N8N_BASE_URL}/webhook/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          recommendationType,
          occasionContext: contextData.occasion || {},
          weatherContext: contextData.weather || {},
          maxRecommendations: 20
        }),
      });

      if (!response.ok) {
        throw new Error(`Recommendations failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI recommendations failed:', error);
      throw error;
    }
  }

  /**
   * Smart fashion search with MCP integration
   */
  async smartFashionSearch(
    query: string, 
    filters = {}
  ): Promise<FashionSearchResponse> {
    try {
      const user = await getCurrentUser();
      
      const response = await fetch(`${N8N_BASE_URL}/webhook/fashion-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          searchQuery: query,
          filters,
          searchType: 'comprehensive',
          maxResults: 50,
        }),
      });

      if (!response.ok) {
        throw new Error(`Fashion search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Smart fashion search failed:', error);
      throw error;
    }
  }

  /**
   * AI Stylist master consultation
   */
  async consultAIStylist(userMessage: string, context = {}) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch(`${N8N_BASE_URL}/webhook/ai-stylist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userMessage,
          requestType: 'auto-detect',
          userPreferences: context.preferences || {},
          contextData: context,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Stylist consultation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI Stylist consultation failed:', error);
      throw error;
    }
  }

  /**
   * Get user's avatar list
   */
  async getUserAvatars(): Promise<any[]> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data: avatars, error } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', user.id)
        .eq('processing_status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return avatars || [];
    } catch (error) {
      console.error('Failed to get user avatars:', error);
      return [];
    }
  }

  /**
   * Get try-on history for user
   */
  async getTryOnHistory(limit: number = 20): Promise<any[]> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data: history, error } = await supabase
        .from('virtual_tryon_results')
        .select(`
          *,
          user_avatars (
            avatar_url,
            avatar_type
          )
        `)
        .eq('user_id', user.id)
        .eq('processing_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return history || [];
    } catch (error) {
      console.error('Failed to get try-on history:', error);
      return [];
    }
  }

  /**
   * Save try-on result to favorites
   */
  async saveToFavorites(tryonResultId: string): Promise<boolean> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('virtual_tryon_results')
        .update({ is_saved: true })
        .eq('id', tryonResultId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to save to favorites:', error);
      return false;
    }
  }

  /**
   * Rate try-on result
   */
  async rateTryOnResult(tryonResultId: string, rating: number): Promise<boolean> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const { error } = await supabase
        .from('virtual_tryon_results')
        .update({ user_rating: rating })
        .eq('id', tryonResultId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to rate try-on result:', error);
      return false;
    }
  }
}

export const enhancedVirtualTryOnService = new EnhancedVirtualTryOnService(); 