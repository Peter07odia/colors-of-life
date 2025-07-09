export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null
          phone_number: string | null
          style_preferences: Json
          favorite_colors: Json
          clothing_sizes: Json
          preferred_brands: Json
          body_measurements: Json
          notification_preferences: Json
          privacy_settings: Json
          onboarding_completed: boolean
          is_premium: boolean
          subscription_tier: 'free' | 'premium' | 'pro'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null
          phone_number?: string | null
          style_preferences?: Json
          favorite_colors?: Json
          clothing_sizes?: Json
          preferred_brands?: Json
          body_measurements?: Json
          notification_preferences?: Json
          privacy_settings?: Json
          onboarding_completed?: boolean
          is_premium?: boolean
          subscription_tier?: 'free' | 'premium' | 'pro'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null
          phone_number?: string | null
          style_preferences?: Json
          favorite_colors?: Json
          clothing_sizes?: Json
          preferred_brands?: Json
          body_measurements?: Json
          notification_preferences?: Json
          privacy_settings?: Json
          onboarding_completed?: boolean
          is_premium?: boolean
          subscription_tier?: 'free' | 'premium' | 'pro'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_avatars: {
        Row: {
          id: string
          user_id: string
          avatar_url: string
          avatar_type: 'generic' | 'custom' | 'ai_generated'
          enhancement_metadata: Json | null
          quality_score: number | null
          is_primary: boolean
          processing_status: 'processing' | 'completed' | 'failed'
          original_image_url: string | null
          background_removed_url: string | null
          n8n_task_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          avatar_url: string
          avatar_type?: 'generic' | 'custom' | 'ai_generated'
          enhancement_metadata?: Json | null
          quality_score?: number | null
          is_primary?: boolean
          processing_status?: 'processing' | 'completed' | 'failed'
          original_image_url?: string | null
          background_removed_url?: string | null
          n8n_task_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          avatar_url?: string
          avatar_type?: 'generic' | 'custom' | 'ai_generated'
          enhancement_metadata?: Json | null
          quality_score?: number | null
          is_primary?: boolean
          processing_status?: 'processing' | 'completed' | 'failed'
          original_image_url?: string | null
          background_removed_url?: string | null
          n8n_task_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_avatars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      virtual_tryon_results: {
        Row: {
          id: string
          user_id: string
          avatar_id: string | null
          clothing_item_id: string | null
          clothing_item_data: Json | null
          result_video_url: string | null
          result_image_url: string | null
          processing_time_seconds: number | null
          kling_task_id: string | null
          n8n_execution_id: string | null
          processing_status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          user_rating: number | null
          is_saved: boolean
          shared_publicly: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          avatar_id?: string | null
          clothing_item_id?: string | null
          clothing_item_data?: Json | null
          result_video_url?: string | null
          result_image_url?: string | null
          processing_time_seconds?: number | null
          kling_task_id?: string | null
          n8n_execution_id?: string | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          user_rating?: number | null
          is_saved?: boolean
          shared_publicly?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          avatar_id?: string | null
          clothing_item_id?: string | null
          clothing_item_data?: Json | null
          result_video_url?: string | null
          result_image_url?: string | null
          processing_time_seconds?: number | null
          kling_task_id?: string | null
          n8n_execution_id?: string | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          user_rating?: number | null
          is_saved?: boolean
          shared_publicly?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "virtual_tryon_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "virtual_tryon_results_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "user_avatars"
            referencedColumns: ["id"]
          }
        ]
      }
      brands: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          description: string | null
          website_url: string | null
          is_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          description?: string | null
          website_url?: string | null
          is_verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          description?: string | null
          website_url?: string | null
          is_verified?: boolean
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          icon_name: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
          icon_name?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
          icon_name?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      user_style_profiles: {
        Row: {
          id: string
          user_id: string
          style_personality: Json
          occasion_preferences: Json
          color_analysis: Json
          budget_range: Json
          shopping_frequency: 'weekly' | 'monthly' | 'seasonally' | 'rarely' | null
          favorite_categories: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          style_personality?: Json
          occasion_preferences?: Json
          color_analysis?: Json
          budget_range?: Json
          shopping_frequency?: 'weekly' | 'monthly' | 'seasonally' | 'rarely' | null
          favorite_categories?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          style_personality?: Json
          occasion_preferences?: Json
          color_analysis?: Json
          budget_range?: Json
          shopping_frequency?: 'weekly' | 'monthly' | 'seasonally' | 'rarely' | null
          favorite_categories?: Json
          created_at?: string
          updated_at?: string
        }
      }
      fashion_items: {
        Row: {
          id: string
          brand_id: string | null
          category_id: string | null
          name: string
          description: string | null
          product_code: string | null
          price: number | null
          original_price: number | null
          currency: string
          discount_percentage: number
          colors: Json
          sizes: Json
          materials: Json
          care_instructions: string | null
          images: Json
          video_url: string | null
          ar_model_url: string | null
          tags: Json
          style_attributes: Json
          popularity_score: number
          is_featured: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id?: string | null
          category_id?: string | null
          name: string
          description?: string | null
          product_code?: string | null
          price?: number | null
          original_price?: number | null
          currency?: string
          discount_percentage?: number
          colors?: Json
          sizes?: Json
          materials?: Json
          care_instructions?: string | null
          images?: Json
          video_url?: string | null
          ar_model_url?: string | null
          tags?: Json
          style_attributes?: Json
          popularity_score?: number
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string | null
          category_id?: string | null
          name?: string
          description?: string | null
          product_code?: string | null
          price?: number | null
          original_price?: number | null
          currency?: string
          discount_percentage?: number
          colors?: Json
          sizes?: Json
          materials?: Json
          care_instructions?: string | null
          images?: Json
          video_url?: string | null
          ar_model_url?: string | null
          tags?: Json
          style_attributes?: Json
          popularity_score?: number
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          item_id: string
          collection_name: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          collection_name?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          collection_name?: string
          notes?: string | null
          created_at?: string
        }
      }
      try_on_sessions: {
        Row: {
          id: string
          user_id: string
          session_type: 'single_item' | 'outfit' | 'mix_match' | null
          items: Json
          user_photo_url: string | null
          result_photo_url: string | null
          pose_type: string
          lighting_preference: string
          background_removed: boolean
          user_rating: number | null
          user_feedback: string | null
          processing_time_ms: number | null
          ai_confidence_score: number | null
          is_public: boolean
          shared_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_type?: 'single_item' | 'outfit' | 'mix_match' | null
          items: Json
          user_photo_url?: string | null
          result_photo_url?: string | null
          pose_type?: string
          lighting_preference?: string
          background_removed?: boolean
          user_rating?: number | null
          user_feedback?: string | null
          processing_time_ms?: number | null
          ai_confidence_score?: number | null
          is_public?: boolean
          shared_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_type?: 'single_item' | 'outfit' | 'mix_match' | null
          items?: Json
          user_photo_url?: string | null
          result_photo_url?: string | null
          pose_type?: string
          lighting_preference?: string
          background_removed?: boolean
          user_rating?: number | null
          user_feedback?: string | null
          processing_time_ms?: number | null
          ai_confidence_score?: number | null
          is_public?: boolean
          shared_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_outfits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          items: Json
          occasion_tags: Json
          season_tags: Json
          mood_tags: Json
          outfit_photo_url: string | null
          user_try_on_photo_url: string | null
          is_public: boolean
          likes_count: number
          shares_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          items: Json
          occasion_tags?: Json
          season_tags?: Json
          mood_tags?: Json
          outfit_photo_url?: string | null
          user_try_on_photo_url?: string | null
          is_public?: boolean
          likes_count?: number
          shares_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          items?: Json
          occasion_tags?: Json
          season_tags?: Json
          mood_tags?: Json
          outfit_photo_url?: string | null
          user_try_on_photo_url?: string | null
          is_public?: boolean
          likes_count?: number
          shares_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      ai_chat_sessions: {
        Row: {
          id: string
          user_id: string
          session_topic: string | null
          user_context: Json
          messages: Json
          recommended_items: Json
          recommended_outfits: Json
          satisfaction_rating: number | null
          session_duration_minutes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_topic?: string | null
          user_context?: Json
          messages?: Json
          recommended_items?: Json
          recommended_outfits?: Json
          satisfaction_rating?: number | null
          session_duration_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_topic?: string | null
          user_context?: Json
          messages?: Json
          recommended_items?: Json
          recommended_outfits?: Json
          satisfaction_rating?: number | null
          session_duration_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_search_history: {
        Row: {
          id: string
          user_id: string
          search_query: string
          search_type: 'text' | 'image' | 'voice' | 'ai_chat' | null
          search_filters: Json
          results_count: number | null
          clicked_items: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          search_query: string
          search_type?: 'text' | 'image' | 'voice' | 'ai_chat' | null
          search_filters?: Json
          results_count?: number | null
          clicked_items?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          search_query?: string
          search_type?: 'text' | 'image' | 'voice' | 'ai_chat' | null
          search_filters?: Json
          results_count?: number | null
          clicked_items?: Json
          created_at?: string
        }
      }
      user_follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      user_posts: {
        Row: {
          id: string
          user_id: string
          post_type: 'outfit' | 'try_on' | 'style_tip' | 'question' | null
          content: string | null
          media_urls: Json
          related_items: Json
          related_outfit_id: string | null
          related_try_on_id: string | null
          tags: Json
          hashtags: Json
          likes_count: number
          comments_count: number
          shares_count: number
          views_count: number
          visibility: 'public' | 'followers' | 'private'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_type?: 'outfit' | 'try_on' | 'style_tip' | 'question' | null
          content?: string | null
          media_urls?: Json
          related_items?: Json
          related_outfit_id?: string | null
          related_try_on_id?: string | null
          tags?: Json
          hashtags?: Json
          likes_count?: number
          comments_count?: number
          shares_count?: number
          views_count?: number
          visibility?: 'public' | 'followers' | 'private'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_type?: 'outfit' | 'try_on' | 'style_tip' | 'question' | null
          content?: string | null
          media_urls?: Json
          related_items?: Json
          related_outfit_id?: string | null
          related_try_on_id?: string | null
          tags?: Json
          hashtags?: Json
          likes_count?: number
          comments_count?: number
          shares_count?: number
          views_count?: number
          visibility?: 'public' | 'followers' | 'private'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type FashionItem = Database['public']['Tables']['fashion_items']['Row']
export type FashionItemInsert = Database['public']['Tables']['fashion_items']['Insert']
export type FashionItemUpdate = Database['public']['Tables']['fashion_items']['Update']

export type TryOnSession = Database['public']['Tables']['try_on_sessions']['Row']
export type TryOnSessionInsert = Database['public']['Tables']['try_on_sessions']['Insert']
export type TryOnSessionUpdate = Database['public']['Tables']['try_on_sessions']['Update']

export type UserOutfit = Database['public']['Tables']['user_outfits']['Row']
export type UserOutfitInsert = Database['public']['Tables']['user_outfits']['Insert']
export type UserOutfitUpdate = Database['public']['Tables']['user_outfits']['Update']

export type UserFavorite = Database['public']['Tables']['user_favorites']['Row']
export type UserFavoriteInsert = Database['public']['Tables']['user_favorites']['Insert']
export type UserFavoriteUpdate = Database['public']['Tables']['user_favorites']['Update']

export type AIChatSession = Database['public']['Tables']['ai_chat_sessions']['Row']
export type AIChatSessionInsert = Database['public']['Tables']['ai_chat_sessions']['Insert']
export type AIChatSessionUpdate = Database['public']['Tables']['ai_chat_sessions']['Update'] 