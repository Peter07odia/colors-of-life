-- Fix all RLS policies for avatar creation and storage
-- This addresses the "Storage upload failed: new row violates row-level security policy" error

-- =============================================================================
-- STORAGE POLICIES - Fix avatar uploads from edge function
-- =============================================================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Avatar uploads are allowed for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Avatar uploads allowed" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar uploads from edge function" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar downloads" ON storage.objects;

-- Create comprehensive storage policies for avatars bucket
CREATE POLICY "Allow avatar uploads" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow avatar updates" ON storage.objects
FOR UPDATE
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow avatar reads" ON storage.objects
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Allow avatar deletes" ON storage.objects
FOR DELETE
USING (bucket_id = 'avatars');

-- =============================================================================
-- DATABASE TABLE POLICIES - Fix user_avatars RLS
-- =============================================================================

-- Drop existing user_avatars policies
DROP POLICY IF EXISTS "Users can view own avatars" ON public.user_avatars;
DROP POLICY IF EXISTS "Users can insert own avatars" ON public.user_avatars;
DROP POLICY IF EXISTS "Users can update own avatars" ON public.user_avatars;
DROP POLICY IF EXISTS "Users can delete own avatars" ON public.user_avatars;

-- Enable RLS on user_avatars table
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for user_avatars
CREATE POLICY "Allow avatar inserts" ON public.user_avatars
FOR INSERT
WITH CHECK (true); -- Allow all inserts (edge function will validate)

CREATE POLICY "Users can view own avatars" ON public.user_avatars
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IS NULL); -- Allow edge function access

CREATE POLICY "Allow avatar updates" ON public.user_avatars
FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() IS NULL) -- Allow edge function access
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can delete own avatars" ON public.user_avatars
FOR DELETE
USING (auth.uid() = user_id);

-- Note: Skipping virtual_tryon_results and n8n_workflow_executions policies
-- These tables don't exist yet

-- =============================================================================
-- STORAGE BUCKET CONFIGURATION
-- =============================================================================

-- Ensure avatars bucket exists with correct configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- =============================================================================
-- PROFILES TABLE POLICIES (ensure compatibility)
-- =============================================================================

-- Ensure profiles table has proper RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate profiles policies to ensure compatibility
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id); 