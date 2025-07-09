import { supabase } from '../supabase';
import { createClient } from '@supabase/supabase-js';

interface EdgeFunctionError {
  message: string;
  code?: string;
  details?: any;
}

interface AvatarCreationParams {
  imageUri: string;
  userId: string;
}

interface AvatarCreationResult {
  avatarId: string;
  avatarUrl: string;
  backgroundRemovedUrl: string;
  processingTime: number;
  status: 'processing' | 'completed' | 'failed';
}

interface VirtualTryOnParams {
  avatarId: string;
  clothingItems: Array<{
    category: string;
    imageUrl?: string;
    image?: string;
    name: string;
    itemId: string;
    color?: string;
    size?: string;
    brand?: string;
    price?: number;
  }>;
  userId: string;
  generateVideo?: boolean;
  videoLength?: number;
  aspectRatio?: string;
  qualityLevel?: string;
}

interface VirtualTryOnResult {
  tryOnId: string;
  resultImageUrl: string;
  resultVideoUrl?: string;
  processingTime: number;
  status: 'processing' | 'completed' | 'failed';
  // Enhanced progress tracking
  progressPercentage?: number;
  currentStep?: string;
  qualityScore?: number;
  errorMessage?: string;
  metadata?: any;
}

class SupabaseEdgeFunctionService {
  private async callEdgeFunction(functionName: string, data: any): Promise<any> {
    try {
      // Force refresh session to ensure we have valid auth token
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError || !session?.user) {
        console.error('Edge function session refresh error:', sessionError);
        throw new Error('Please sign in to use this feature');
      }

      console.log(`Calling edge function ${functionName} for user:`, session.user.id);
      console.log('Edge function access token exists:', !!session.access_token);

      const { data: result, error } = await supabase.functions.invoke(functionName, {
        body: data,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error(`Edge function ${functionName} error:`, error);
        throw error;
      }

      console.log(`Edge function ${functionName} result:`, result);
      return result;
    } catch (error) {
      console.error(`Failed to call edge function ${functionName}:`, error);
      throw error;
    }
  }

  private async uploadImageToSupabase(imageUri: string, fileName: string): Promise<string> {
    try {
      // Force refresh session to ensure we have valid auth token
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError || !session?.user) {
        console.error('Session refresh error:', sessionError);
        throw new Error('Please sign in to use this feature');
      }

      console.log('Starting upload for user:', session.user.id);
      console.log('Image URI:', imageUri);
      console.log('File name:', fileName);
      console.log('Session access token exists:', !!session.access_token);

      // For React Native, we need to handle file uploads differently
      // Create FormData for the upload
      const formData = new FormData();
      
      // In React Native, we can append the file directly using the URI
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: fileName,
      } as any);

      // Use user ID in path for RLS policy compliance
      const filePath = `${session.user.id}/avatars/${fileName}`;
      console.log('Upload path:', filePath);
      
      // Create a new supabase client instance with explicit auth token
      const authenticatedSupabase = createClient(
        process.env.EXPO_PUBLIC_SUPABASE_URL!,
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            }
          }
        }
      );

      // For React Native, we need to read the file as ArrayBuffer first
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('File size:', arrayBuffer.byteLength, 'bytes');

      // Detect content type from file extension or default to jpeg
      const contentType = imageUri.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg';
      
      const { data, error } = await authenticatedSupabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: contentType,
          upsert: true, // Allow overwriting existing files
          metadata: {
            userId: session.user.id,
            uploadedAt: new Date().toISOString()
          }
        });

      if (error) {
        console.error('Storage upload error details:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('Upload successful:', data);

      // Get public URL (avatars bucket is public, so this will be a real public URL)
      const { data: { publicUrl } } = authenticatedSupabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      console.log('Generated public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Supabase upload error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          throw new Error('Storage bucket not found. Please contact support.');
        } else if (error.message.includes('permission') || error.message.includes('authorization')) {
          throw new Error('Permission denied. Please sign in and try again.');
        } else if (error.message.includes('size')) {
          throw new Error('Image file is too large. Please use a smaller image.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Create avatar by calling Supabase Edge Function with authentication
   */
  async createAvatar(params: AvatarCreationParams): Promise<AvatarCreationResult> {
    try {
      const startTime = Date.now();

      console.log('🚀 Creating avatar via Supabase Edge Function');

      // Get current session for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication failed. Please sign in again.');
      }

      // Convert image to base64 for upload
      console.log('📸 Converting image to base64...');
      const response = await fetch(params.imageUri);
      const blob = await response.blob();
      
      // Convert blob to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      console.log('✅ Image converted to base64 (length:', base64Data.length, ')');

      // Payload for edge function
      const edgeFunctionPayload = {
        userId: params.userId,
        imageData: base64Data, // Send as base64 data
        processingSettings: {
          backgroundRemoval: true,
          qualityEnhancement: true,
          resolution: '1024x1024'
        }
      };

      console.log('📤 Calling Edge Function with authentication');

      // Prepare headers with authentication if available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if we have a session
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        console.log('🔐 Using authenticated request');
      } else {
        console.log('⚠️ No session available, making unauthenticated request');
      }

      // Call edge function
      const response2 = await fetch('https://jiwiclemrwjojoewmcnc.supabase.co/functions/v1/avatar-creation', {
        method: 'POST',
        headers,
        body: JSON.stringify(edgeFunctionPayload)
      });

      console.log('📊 Edge Function Response Status:', response2.status);

      if (!response2.ok) {
        const errorText = await response2.text();
        console.error('❌ Edge Function Error:', errorText);
        throw new Error(`Edge function failed: ${response2.status} ${response2.statusText}`);
      }

      const result = await response2.json();
      console.log('✅ Edge Function Success:', result);

      const processingTime = Date.now() - startTime;

      return {
        avatarId: result.avatarId,
        avatarUrl: result.originalImageUrl,
        backgroundRemovedUrl: '',
        processingTime,
        status: 'processing'
      };

    } catch (error) {
      console.error('❌ Avatar creation failed:', error);
      throw error;
    }
  }

  /**
   * Create avatar by calling N8N workflow with URL (DEPRECATED - use createAvatar instead)
   */
  async createAvatarWithUrl(params: AvatarCreationParams): Promise<AvatarCreationResult> {
    console.warn('⚠️ createAvatarWithUrl is deprecated. Use createAvatar() which calls Supabase Edge Function.');
    
    // Fallback to the correct method
    return this.createAvatar(params);
  }

  /**
   * Perform virtual try-on using Supabase Edge Function that triggers n8n workflow
   * Uses same pattern as avatar creation for reliability
   */
  async performVirtualTryOn(params: VirtualTryOnParams): Promise<VirtualTryOnResult> {
    try {
      const startTime = Date.now();
      
      console.log('🎬 Starting virtual try-on with avatar creation pattern');

      // Get current session for authentication (same as avatar creation)
      // Allow both authenticated and anonymous users
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.warn('Session error (will continue as anonymous):', sessionError);
        // Don't throw error - continue as anonymous user
      }

      // Validate clothing items
      if (!params.clothingItems || params.clothingItems.length === 0) {
        throw new Error('No clothing items selected for try-on');
      }

      // Prepare payload similar to avatar creation
      const edgeFunctionPayload = {
        userId: params.userId,
        avatarId: params.avatarId,
        clothingItems: params.clothingItems.map(item => ({
          itemId: item.itemId || `item_${Date.now()}`,
          category: item.category || 'unknown',
          name: item.name || 'Clothing Item',
          imageUrl: item.imageUrl || item.image,
          brand: item.brand,
          price: item.price
        })),
        processingSettings: {
          generateVideo: params.generateVideo !== false,
          videoLength: params.videoLength || 5,
          aspectRatio: params.aspectRatio || '9:16',
          qualityLevel: params.qualityLevel || 'high'
        }
      };

      console.log('📤 Calling Virtual Try-On Edge Function with authentication');

      // Prepare headers with authentication (same as avatar creation)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
      };

      // Add authorization header if we have a session
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        console.log('🔐 Using authenticated request');
      } else {
        console.log('👤 No session available, using anonymous mode');
        // For anonymous users, use anon key as authorization too
        headers['Authorization'] = `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!}`;
      }

      // Call edge function directly (same pattern as avatar creation)
      const response = await fetch('https://jiwiclemrwjojoewmcnc.supabase.co/functions/v1/virtual-tryon', {
        method: 'POST',
        headers,
        body: JSON.stringify(edgeFunctionPayload)
      });

      console.log('📊 Edge Function Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Edge Function Error:', errorText);
        throw new Error(`Edge function failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      const processingTime = (Date.now() - startTime) / 1000;

      console.log('✅ Virtual try-on started successfully:', result);

      return {
        tryOnId: result.tryOnId,
        resultImageUrl: '', // Will be set by n8n workflow
        resultVideoUrl: '', // Will be set by n8n workflow
        processingTime,
        status: 'processing'
      };
    } catch (error) {
      console.error('❌ Virtual try-on failed:', error);
      throw new Error(`Failed to start virtual try-on: ${error.message}`);
    }
  }

  /**
   * Check avatar processing status
   */
  async checkAvatarStatus(avatarId: string): Promise<AvatarCreationResult | null> {
    try {
      // Handle mock avatars (created in mock mode)
      if (avatarId.startsWith('avatar_')) {
        console.log('Mock avatar status check - returning completed');
        return {
          avatarId,
          avatarUrl: '', // Would be set from storage
          backgroundRemovedUrl: '',
          processingTime: 0,
          status: 'completed'
        };
      }

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        return null;
      }
      
      if (!session?.user) {
        console.error('No authenticated session for avatar status check');
        return null;
      }

      console.log(`🔍 Checking avatar status: ${avatarId} for user: ${session.user.id}`);

      // FIXED: Use the authenticated client with proper headers
      const authenticatedSupabase = supabase;
      
      // Query with explicit user context for RLS
      const { data: avatar, error } = await authenticatedSupabase
        .from('user_avatars')
        .select('id, processing_status, avatar_url, original_image_url, background_removed_url, created_at, updated_at')
        .eq('id', avatarId)
        .eq('user_id', session.user.id)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle not found gracefully

      if (error) {
        console.error('Avatar status check error:', error);
        return null;
      }

      if (!avatar) {
        console.log('No avatar found for ID:', avatarId);
        return null;
      }

      console.log(`✅ Avatar found: ${avatar.processing_status} (${avatar.id})`);

      return {
        avatarId: avatar.id,
        avatarUrl: avatar.avatar_url || avatar.original_image_url || '',
        backgroundRemovedUrl: avatar.background_removed_url || '',
        processingTime: 0,
        status: avatar.processing_status as 'processing' | 'completed' | 'failed'
      };
    } catch (error) {
      console.error('Failed to check avatar status:', error);
      return null;
    }
  }

  /**
   * Check try-on processing status with detailed progress tracking
   */
  async checkTryOnStatus(tryOnId: string): Promise<VirtualTryOnResult | null> {
    try {
      // Get current user to satisfy RLS policies
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user for try-on status check');
        return null;
      }

      console.log(`🔍 Checking try-on status: ${tryOnId} for user: ${user.id}`);

      const { data: tryOn, error } = await supabase
        .from('virtual_tryon_results')
        .select('*')
        .eq('id', tryOnId)
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle() for graceful handling

      if (error) {
        console.error('Try-on status check error:', error);
        return null;
      }

      if (!tryOn) {
        console.log('No try-on result found for ID:', tryOnId);
        return null;
      }

      // Calculate progress percentage based on processing metadata
      let progressPercentage = 0;
      let currentStep = 'initializing';
      
      if (tryOn.processing_metadata?.steps) {
        const steps = tryOn.processing_metadata.steps;
        
        if (steps.avatar_validation === 'completed') progressPercentage = 25;
        if (steps.fal_tryon_processing === 'completed') progressPercentage = 60;
        if (steps.video_generation === 'completed') progressPercentage = 85;
        if (steps.database_save === 'completed') progressPercentage = 100;
        
        // Determine current step
        if (steps.database_save === 'completed') currentStep = 'completed';
        else if (steps.video_generation === 'processing') currentStep = 'generating_video';
        else if (steps.fal_tryon_processing === 'processing') currentStep = 'processing_image';
        else if (steps.avatar_validation === 'completed') currentStep = 'processing_image';
        else currentStep = 'validating_avatar';
      } else {
        // Fallback progress calculation
        if (tryOn.processing_status === 'processing') progressPercentage = 50;
        else if (tryOn.processing_status === 'completed') progressPercentage = 100;
        else if (tryOn.processing_status === 'failed') progressPercentage = 0;
      }

      console.log(`📊 Try-on progress: ${progressPercentage}% (${currentStep})`);

      return {
        tryOnId: tryOn.id,
        resultImageUrl: tryOn.result_image_url || '',
        resultVideoUrl: tryOn.result_video_url || '',
        processingTime: tryOn.processing_time_seconds || 0,
        status: tryOn.processing_status as 'processing' | 'completed' | 'failed',
        // Enhanced progress tracking
        progressPercentage,
        currentStep,
        qualityScore: tryOn.quality_score,
        errorMessage: tryOn.error_message,
        metadata: tryOn.processing_metadata
      };
    } catch (error) {
      console.error('Failed to check try-on status:', error);
      return null;
    }
  }

  /**
   * Get user's avatars from Supabase
   */
  async getUserAvatars(userId: string): Promise<any[]> {
    try {
      const { data: avatars, error } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', userId)
        .eq('processing_status', 'completed')  // Only show completed avatars
        .order('created_at', { ascending: false })
        .limit(4);  // Limit to last 4 created

      if (error) {
        throw error;
      }

      return avatars || [];
    } catch (error) {
      console.error('Failed to get user avatars:', error);
      return [];
    }
  }

  /**
   * Get user's try-on results from Supabase
   */
  async getUserTryOnResults(userId: string): Promise<any[]> {
    try {
      const { data: results, error } = await supabase
        .from('virtual_tryon_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return results || [];
    } catch (error) {
      console.error('Failed to get try-on results:', error);
      return [];
    }
  }

  /**
   * Set primary avatar for user
   */
  async setPrimaryAvatar(userId: string, avatarId: string): Promise<boolean> {
    try {
      // Reset all avatars to non-primary
      await supabase
        .from('user_avatars')
        .update({ is_primary: false })
        .eq('user_id', userId);

      // Set selected avatar as primary
      const { error } = await supabase
        .from('user_avatars')
        .update({ is_primary: true })
        .eq('id', avatarId)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Failed to set primary avatar:', error);
      return false;
    }
  }

  /**
   * Delete avatar and its files
   */
  async deleteAvatar(userId: string, avatarId: string): Promise<boolean> {
    try {
      // Get avatar details first
      const { data: avatar, error: getError } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('id', avatarId)
        .eq('user_id', userId)
        .single();

      if (getError || !avatar) {
        return false;
      }

      // Delete avatar record
      const { error: deleteError } = await supabase
        .from('user_avatars')
        .delete()
        .eq('id', avatarId)
        .eq('user_id', userId);

      return !deleteError;
    } catch (error) {
      console.error('Failed to delete avatar:', error);
      return false;
    }
  }

  /**
   * Poll for processing completion (useful for UI updates)
   */
  async pollProcessingStatus(
    type: 'avatar' | 'tryon',
    id: string,
    onUpdate: (status: any) => void,
    maxAttempts: number = 60 // Increased to 2 minutes for N8N workflow
  ): Promise<void> {
    // Handle mock avatars - no need to poll, they're already complete
    if (type === 'avatar' && id.startsWith('avatar_')) {
      console.log('Mock avatar detected - skipping polling');
      const mockResult = {
        avatarId: id,
        avatarUrl: '',
        backgroundRemovedUrl: '',
        processingTime: 0,
        status: 'completed'
      };
      onUpdate(mockResult);
      return;
    }

    let attempts = 0;
    const poll = async () => {
      attempts++;
      console.log(`🔄 Polling attempt ${attempts}/${maxAttempts} for ${type} ${id}`);
      
      const status = type === 'avatar' 
        ? await this.checkAvatarStatus(id)
        : await this.checkTryOnStatus(id);

      console.log(`📊 Poll result:`, status);

      if (status) {
        onUpdate(status);
        
        if (status.status === 'completed' || status.status === 'failed') {
          console.log(`✅ Polling complete. Final status: ${status.status}`);
          return;
        }
      }

      if (attempts >= maxAttempts) {
        console.log(`⏰ Polling timeout after ${maxAttempts} attempts`);
        onUpdate({
          avatarId: id,
          status: 'timeout',
          message: 'Processing timed out. Please check your N8N workflow.'
        });
        return;
      }

      // Poll every 3 seconds to give N8N workflow time to complete
      setTimeout(poll, 3000);
    };

    poll();
  }

  /**
   * Subscribe to real-time updates for processing status
   */
  subscribeToAvatarUpdates(avatarId: string, onUpdate: (payload: any) => void) {
    return supabase
      .channel(`avatar-${avatarId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_avatars',
          filter: `id=eq.${avatarId}`,
        },
        onUpdate
      )
      .subscribe();
  }

  /**
   * Subscribe to real-time updates for try-on processing
   */
  subscribeToTryOnUpdates(tryOnId: string, onUpdate: (payload: any) => void) {
    return supabase
      .channel(`tryon-${tryOnId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'virtual_tryon_results',
          filter: `id=eq.${tryOnId}`,
        },
        onUpdate
      )
      .subscribe();
  }
}

export const supabaseEdgeFunctionService = new SupabaseEdgeFunctionService();
export type { AvatarCreationParams, AvatarCreationResult, VirtualTryOnParams, VirtualTryOnResult }; 