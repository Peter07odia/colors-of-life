import { supabase } from '../lib/supabase';
import { DEFAULT_MODELS, DefaultModel } from '../constants/defaultModels';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

interface DefaultModelAvatar {
  id: string;
  user_id: string;
  avatar_url: string;
  avatar_type: 'generic';
  is_primary: boolean;
  processing_status: 'completed';
  original_image_url: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    bodyType: string;
    name: string;
    description: string;
    isDefaultModel: boolean;
  };
}

class DefaultModelService {
  private uploadedModels: Map<string, string> = new Map();

  /**
   * Upload a default model image to Supabase storage
   */
  private async uploadDefaultModelToStorage(model: DefaultModel): Promise<string> {
    try {
      // Check if already uploaded
      if (this.uploadedModels.has(model.id)) {
        return this.uploadedModels.get(model.id)!;
      }

      // Load the asset
      const asset = Asset.fromModule(model.localPath);
      await asset.downloadAsync();
      
      if (!asset.localUri) {
        throw new Error(`Failed to load asset for ${model.name}`);
      }

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to ArrayBuffer for upload
      const binaryString = atob(base64);
      const arrayBuffer = new ArrayBuffer(binaryString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }

      // Upload to Supabase storage
      const fileName = `default-models/${model.id}.png`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (error) {
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      // Cache the URL
      this.uploadedModels.set(model.id, publicUrl);
      
      console.log(`✅ Uploaded default model ${model.name} to: ${publicUrl}`);
      return publicUrl;

    } catch (error) {
      console.error(`❌ Failed to upload default model ${model.name}:`, error);
      throw error;
    }
  }

  /**
   * Create default model avatar records for a user
   */
  async createDefaultModelsForUser(userId: string): Promise<DefaultModelAvatar[]> {
    try {
      console.log(`🎯 Creating default models for user: ${userId}`);
      
      // Check if user already has default models
      const { data: existingModels } = await supabase
        .from('user_avatars')
        .select('id, avatar_url, metadata')
        .eq('user_id', userId)
        .eq('avatar_type', 'generic');

      // Filter out models that already exist
      const existingModelIds = existingModels?.map(m => 
        m.metadata?.isDefaultModel ? m.id : null
      ).filter(Boolean) || [];

      const modelsToCreate = DEFAULT_MODELS.filter(model => 
        !existingModelIds.includes(model.id)
      );

      if (modelsToCreate.length === 0) {
        console.log('✅ User already has all default models');
        return existingModels as DefaultModelAvatar[];
      }

      // Upload models to storage and create database records
      const createdModels: DefaultModelAvatar[] = [];

      for (const model of modelsToCreate) {
        try {
          // Upload to storage
          const avatarUrl = await this.uploadDefaultModelToStorage(model);

          // Create database record
          const { data: avatarRecord, error } = await supabase
            .from('user_avatars')
            .insert({
              id: model.id,
              user_id: userId,
              avatar_url: avatarUrl,
              avatar_type: 'generic',
              is_primary: false, // Default models are not primary by default
              processing_status: 'completed',
              original_image_url: avatarUrl,
              metadata: {
                bodyType: model.bodyType,
                name: model.name,
                description: model.description,
                isDefaultModel: true
              }
            })
            .select()
            .single();

          if (error) {
            console.error(`❌ Failed to create database record for ${model.name}:`, error);
            continue;
          }

          createdModels.push(avatarRecord as DefaultModelAvatar);
          console.log(`✅ Created default model: ${model.name}`);

        } catch (error) {
          console.error(`❌ Failed to create default model ${model.name}:`, error);
          // Continue with other models
        }
      }

      console.log(`✅ Successfully created ${createdModels.length} default models for user`);
      return [...(existingModels as DefaultModelAvatar[]), ...createdModels];

    } catch (error) {
      console.error('❌ Failed to create default models:', error);
      throw error;
    }
  }

  /**
   * Get default models for a user (create them if they don't exist)
   */
  async getDefaultModelsForUser(userId: string): Promise<DefaultModelAvatar[]> {
    try {
      // First try to get existing default models
      const { data: existingModels, error } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', userId)
        .eq('avatar_type', 'generic')
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch default models: ${error.message}`);
      }

      // If user has some default models, return them
      const defaultModels = existingModels?.filter(model => 
        model.metadata?.isDefaultModel
      ) || [];

      if (defaultModels.length === DEFAULT_MODELS.length) {
        return defaultModels as DefaultModelAvatar[];
      }

      // Create missing default models
      return await this.createDefaultModelsForUser(userId);

    } catch (error) {
      console.error('❌ Failed to get default models:', error);
      throw error;
    }
  }

  /**
   * Set a default model as the user's primary avatar
   */
  async setDefaultModelAsPrimary(userId: string, modelId: string): Promise<void> {
    try {
      // First, unset all current primary avatars
      await supabase
        .from('user_avatars')
        .update({ is_primary: false })
        .eq('user_id', userId);

      // Set the selected default model as primary
      const { error } = await supabase
        .from('user_avatars')
        .update({ is_primary: true })
        .eq('id', modelId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to set primary avatar: ${error.message}`);
      }

      console.log(`✅ Set default model ${modelId} as primary for user ${userId}`);

    } catch (error) {
      console.error('❌ Failed to set default model as primary:', error);
      throw error;
    }
  }

  /**
   * Get recommended default model for user based on their preferences
   */
  async getRecommendedDefaultModel(userId: string): Promise<DefaultModelAvatar | null> {
    try {
      // Get user profile to check preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('style_preferences, clothing_sizes, body_measurements')
        .eq('id', userId)
        .single();

      if (!profile) {
        return null;
      }

      // Extract preferences
      const bodyMeasurements = profile.body_measurements as any;
      const clothingSizes = profile.clothing_sizes as any;
      
      const userPreferences = {
        bodyType: bodyMeasurements?.bodyType || bodyMeasurements?.build,
        clothingSize: clothingSizes?.top || clothingSizes?.dress,
        height: bodyMeasurements?.height
      };

      // Get recommended model
      const { getRecommendedModel } = await import('../constants/defaultModels');
      const recommendedModel = getRecommendedModel(userPreferences);

      // Get the corresponding avatar record
      const { data: avatarRecord } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', userId)
        .eq('id', recommendedModel.id)
        .single();

      return avatarRecord as DefaultModelAvatar || null;

    } catch (error) {
      console.error('❌ Failed to get recommended default model:', error);
      return null;
    }
  }
}

export const defaultModelService = new DefaultModelService(); 