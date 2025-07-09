-- Fix RLS policies for user_avatars table
-- Migration: 20250620120000_fix_user_avatars_rls.sql

-- Enable RLS on user_avatars table
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe operation)
DROP POLICY IF EXISTS "Users can view own avatars" ON public.user_avatars;
DROP POLICY IF EXISTS "Users can insert own avatars" ON public.user_avatars;
DROP POLICY IF EXISTS "Users can update own avatars" ON public.user_avatars;
DROP POLICY IF EXISTS "Users can delete own avatars" ON public.user_avatars;
DROP POLICY IF EXISTS "Service role can manage all avatars" ON public.user_avatars;

-- Allow users to read their own avatars
CREATE POLICY "Users can view own avatars" ON public.user_avatars
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own avatars  
CREATE POLICY "Users can insert own avatars" ON public.user_avatars
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatars" ON public.user_avatars
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatars" ON public.user_avatars
    FOR DELETE USING (auth.uid() = user_id);

-- CRITICAL: Allow service role (for n8n workflows) to manage all avatars
-- This enables n8n workflows to create, read, update avatars on behalf of users
CREATE POLICY "Service role can manage all avatars" ON public.user_avatars
    FOR ALL USING (
        auth.role() = 'service_role'
    )
    WITH CHECK (
        auth.role() = 'service_role'
    );

-- Grant necessary permissions to service role
GRANT ALL ON public.user_avatars TO service_role;
GRANT USAGE ON SCHEMA public TO service_role; 