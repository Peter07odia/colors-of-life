-- Fix RLS Policies for user_avatars table ONLY
-- This will allow the mobile app to see completed avatars

-- Enable RLS on user_avatars table
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own avatars" ON public.user_avatars;
DROP POLICY IF EXISTS "Users can insert own avatars" ON public.user_avatars;
DROP POLICY IF EXISTS "Users can update own avatars" ON public.user_avatars;
DROP POLICY IF EXISTS "Service role can update avatars" ON public.user_avatars;

-- Allow authenticated users to view their own avatars
CREATE POLICY "Users can view own avatars" ON public.user_avatars
    FOR SELECT USING (auth.uid() = user_id::uuid);

-- Allow authenticated users to insert their own avatars  
CREATE POLICY "Users can insert own avatars" ON public.user_avatars
    FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update own avatars" ON public.user_avatars
    FOR UPDATE USING (auth.uid() = user_id::uuid);

-- Allow service role (N8N, Edge Functions) to update any avatars
CREATE POLICY "Service role can update avatars" ON public.user_avatars
    FOR ALL USING (true);