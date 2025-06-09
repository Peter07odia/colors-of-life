-- Colors of Life Database Schema
-- Comprehensive schema for fashion virtual try-on app

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- USER PROFILE TABLES
-- =============================================================================

-- Enhanced user profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    
    -- Personal Information
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say')),
    phone_number TEXT,
    
    -- Fashion Preferences
    style_preferences JSONB DEFAULT '{}',
    favorite_colors JSONB DEFAULT '[]',
    clothing_sizes JSONB DEFAULT '{}', -- {"top": "M", "bottom": "32", "shoe": "9"}
    preferred_brands JSONB DEFAULT '[]',
    
    -- Body Measurements (optional, for better fit recommendations)
    body_measurements JSONB DEFAULT '{}', -- {"height": "170cm", "weight": "65kg", etc}
    
    -- App Settings
    notification_preferences JSONB DEFAULT '{
        "new_items": true,
        "style_recommendations": true,
        "social_interactions": true,
        "marketing": false
    }',
    privacy_settings JSONB DEFAULT '{
        "profile_visibility": "public",
        "try_on_history_visible": false,
        "sharing_enabled": true
    }',
    
    -- Metadata
    onboarding_completed BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- AVATAR MANAGEMENT TABLES (NEW)
-- =============================================================================

-- User avatars table for managing AI-generated avatars
CREATE TABLE public.user_avatars (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    avatar_url TEXT NOT NULL,
    avatar_type TEXT DEFAULT 'custom' CHECK (avatar_type IN ('generic', 'custom', 'ai_generated')),
    is_primary BOOLEAN DEFAULT TRUE,
    processing_status TEXT DEFAULT 'completed' CHECK (processing_status IN ('processing', 'completed', 'failed')),
    original_image_url TEXT,
    background_removed_url TEXT,
    n8n_task_id TEXT, -- For tracking n8n workflow execution
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user avatar lookups
CREATE INDEX idx_user_avatars_user_id ON public.user_avatars(user_id);
CREATE INDEX idx_user_avatars_primary ON public.user_avatars(user_id, is_primary) WHERE is_primary = true;

-- =============================================================================
-- VIRTUAL TRY-ON TABLES (NEW)
-- =============================================================================

-- Virtual try-on results table
CREATE TABLE public.virtual_tryon_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    avatar_id UUID REFERENCES user_avatars(id) ON DELETE SET NULL,
    clothing_item_id TEXT, -- Reference to clothing items (can be external or internal)
    clothing_item_data JSONB, -- Store clothing item details for reference
    
    -- Results from Kling AI
    result_video_url TEXT,
    result_image_url TEXT,
    processing_time_seconds INTEGER,
    kling_task_id TEXT, -- Kling AI task identifier
    n8n_execution_id TEXT, -- n8n execution identifier
    
    -- Status tracking
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    
    -- Analytics
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    is_saved BOOLEAN DEFAULT FALSE,
    shared_publicly BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for virtual try-on results
CREATE INDEX idx_virtual_tryon_user_id ON public.virtual_tryon_results(user_id);
CREATE INDEX idx_virtual_tryon_status ON public.virtual_tryon_results(processing_status);
CREATE INDEX idx_virtual_tryon_created ON public.virtual_tryon_results(created_at DESC);

-- =============================================================================
-- N8N WORKFLOW TRACKING (NEW)
-- =============================================================================

-- Track n8n workflow executions for monitoring and debugging
CREATE TABLE public.n8n_workflow_executions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    workflow_type TEXT NOT NULL CHECK (workflow_type IN ('avatar_creation', 'virtual_tryon')),
    n8n_execution_id TEXT UNIQUE,
    workflow_data JSONB, -- Input data sent to n8n
    execution_status TEXT DEFAULT 'pending' CHECK (execution_status IN ('pending', 'running', 'success', 'error')),
    result_data JSONB, -- Output data from n8n
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for workflow execution tracking
CREATE INDEX idx_n8n_executions_user_id ON public.n8n_workflow_executions(user_id);
CREATE INDEX idx_n8n_executions_type ON public.n8n_workflow_executions(workflow_type);
CREATE INDEX idx_n8n_executions_status ON public.n8n_workflow_executions(execution_status);

-- User preferences and style profile
CREATE TABLE public.user_style_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Style Categories
    style_personality JSONB DEFAULT '[]', -- ["minimalist", "bohemian", "classic", "trendy"]
    occasion_preferences JSONB DEFAULT '{}', -- {"work": ["formal", "business"], "casual": ["relaxed"]}
    color_analysis JSONB DEFAULT '{}', -- {"season": "autumn", "undertone": "warm"}
    
    -- Shopping Behavior
    budget_range JSONB DEFAULT '{}', -- {"min": 50, "max": 200, "currency": "USD"}
    shopping_frequency TEXT CHECK (shopping_frequency IN ('weekly', 'monthly', 'seasonally', 'rarely')),
    favorite_categories JSONB DEFAULT '[]', -- ["dresses", "shoes", "accessories"]
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- FASHION ITEM TABLES
-- =============================================================================

-- Brands table
CREATE TABLE public.brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    website_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES public.categories(id),
    icon_name TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fashion items/products
CREATE TABLE public.fashion_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    brand_id UUID REFERENCES public.brands(id),
    category_id UUID REFERENCES public.categories(id),
    
    -- Basic Information
    name TEXT NOT NULL,
    description TEXT,
    product_code TEXT UNIQUE,
    
    -- Pricing
    price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    discount_percentage INTEGER DEFAULT 0,
    
    -- Product Details
    colors JSONB DEFAULT '[]', -- ["black", "white", "red"]
    sizes JSONB DEFAULT '[]', -- ["XS", "S", "M", "L", "XL"]
    materials JSONB DEFAULT '[]', -- ["cotton", "polyester"]
    care_instructions TEXT,
    
    -- Images and Media
    images JSONB DEFAULT '[]', -- Array of image URLs
    video_url TEXT,
    ar_model_url TEXT, -- For 3D/AR try-on
    
    -- Metadata
    tags JSONB DEFAULT '[]', -- ["summer", "casual", "trending"]
    style_attributes JSONB DEFAULT '{}', -- {"neckline": "v-neck", "sleeve": "short"}
    popularity_score INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- USER INTERACTION TABLES
-- =============================================================================

-- User favorites/wishlist
CREATE TABLE public.user_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.fashion_items(id) ON DELETE CASCADE,
    collection_name TEXT DEFAULT 'default', -- Allow multiple wishlists
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, item_id, collection_name)
);

-- Virtual try-on sessions
CREATE TABLE public.try_on_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Session Details
    session_type TEXT CHECK (session_type IN ('single_item', 'outfit', 'mix_match')),
    items JSONB NOT NULL, -- Array of item IDs and configurations
    
    -- User Photos
    user_photo_url TEXT, -- Original user photo
    result_photo_url TEXT, -- AI-generated result
    
    -- Try-on Configuration
    pose_type TEXT DEFAULT 'front', -- front, side, full-body
    lighting_preference TEXT DEFAULT 'natural',
    background_removed BOOLEAN DEFAULT TRUE,
    
    -- Feedback and Results
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    processing_time_ms INTEGER,
    ai_confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Sharing and Privacy
    is_public BOOLEAN DEFAULT FALSE,
    shared_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User outfits (saved combinations)
CREATE TABLE public.user_outfits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Outfit Details
    name TEXT NOT NULL,
    description TEXT,
    items JSONB NOT NULL, -- Array of {item_id, color, size, position}
    
    -- Outfit Metadata
    occasion_tags JSONB DEFAULT '[]', -- ["work", "date", "casual"]
    season_tags JSONB DEFAULT '[]', -- ["spring", "summer"]
    mood_tags JSONB DEFAULT '[]', -- ["confident", "playful", "elegant"]
    
    -- Photos
    outfit_photo_url TEXT, -- Combined outfit photo
    user_try_on_photo_url TEXT, -- User wearing the outfit
    
    -- Social Features
    is_public BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- AI AND RECOMMENDATION TABLES
-- =============================================================================

-- AI chat sessions with stylist
CREATE TABLE public.ai_chat_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Session Context
    session_topic TEXT, -- "outfit for wedding", "summer vacation clothes"
    user_context JSONB DEFAULT '{}', -- User's current situation/needs
    
    -- Chat Messages
    messages JSONB DEFAULT '[]', -- Array of {role, content, timestamp}
    
    -- Recommendations Generated
    recommended_items JSONB DEFAULT '[]', -- Array of item IDs
    recommended_outfits JSONB DEFAULT '[]', -- Array of outfit combinations
    
    -- Session Metadata
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    session_duration_minutes INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User search history
CREATE TABLE public.user_search_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    search_query TEXT NOT NULL,
    search_type TEXT CHECK (search_type IN ('text', 'image', 'voice', 'ai_chat')),
    search_filters JSONB DEFAULT '{}', -- Applied filters
    results_count INTEGER,
    clicked_items JSONB DEFAULT '[]', -- Which items user clicked
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- SOCIAL FEATURES TABLES
-- =============================================================================

-- User follows
CREATE TABLE public.user_follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Posts/shares (outfits, try-ons)
CREATE TABLE public.user_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Post Content
    post_type TEXT CHECK (post_type IN ('outfit', 'try_on', 'style_tip', 'question')),
    content TEXT,
    media_urls JSONB DEFAULT '[]', -- Array of image/video URLs
    
    -- Related Data
    related_items JSONB DEFAULT '[]', -- Fashion items featured
    related_outfit_id UUID REFERENCES public.user_outfits(id),
    related_try_on_id UUID REFERENCES public.try_on_sessions(id),
    
    -- Tags and Categories
    tags JSONB DEFAULT '[]',
    hashtags JSONB DEFAULT '[]',
    
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    
    -- Visibility
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES AND CONSTRAINTS
-- =============================================================================

-- Performance indexes
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_fashion_items_brand ON public.fashion_items(brand_id);
CREATE INDEX idx_fashion_items_category ON public.fashion_items(category_id);
CREATE INDEX idx_fashion_items_featured ON public.fashion_items(is_featured) WHERE is_featured = true;
CREATE INDEX idx_user_favorites_user ON public.user_favorites(user_id);
CREATE INDEX idx_try_on_sessions_user ON public.try_on_sessions(user_id);
CREATE INDEX idx_try_on_sessions_public ON public.try_on_sessions(is_public) WHERE is_public = true;

-- Search indexes for fashion items
CREATE INDEX idx_fashion_items_search ON public.fashion_items USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_style_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.try_on_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_posts ENABLE ROW LEVEL SECURITY;

-- Profiles - Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Try-on sessions - Users can see their own + public ones
CREATE POLICY "Users can view own try-on sessions" ON public.try_on_sessions
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own try-on sessions" ON public.try_on_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own try-on sessions" ON public.try_on_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- User favorites - Users can only see/manage their own
CREATE POLICY "Users can manage own favorites" ON public.user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- Similar policies for other user-specific tables...
CREATE POLICY "Users can manage own style profiles" ON public.user_style_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own outfits" ON public.user_outfits
    FOR ALL USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can manage own chat sessions" ON public.ai_chat_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Public read access for fashion items, brands, categories
CREATE POLICY "Anyone can view fashion items" ON public.fashion_items
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view brands" ON public.brands
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (is_active = true);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_fashion_items_updated_at
    BEFORE UPDATE ON public.fashion_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add more update triggers as needed... 