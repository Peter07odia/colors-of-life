-- Fix Avatar Authentication and Storage Issues
-- Run this in Supabase SQL Editor

-- 1. Ensure avatars storage bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Ensure storage policies exist for avatars bucket
DROP POLICY IF EXISTS "Allow avatar uploads from authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar uploads from edge function" ON storage.objects;

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Allow avatar uploads from authenticated users" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR auth.role() = 'service_role')
);

-- Allow public access to view avatars (since bucket is public)
CREATE POLICY "Allow avatar downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Allow service role (edge functions) to manage avatars
CREATE POLICY "Allow service role avatar management" ON storage.objects
FOR ALL USING (bucket_id = 'avatars' AND auth.role() = 'service_role');

-- 3. Verify RLS policies on user_avatars are correct (should already exist from recent migration)
-- Check if policies exist
SELECT policyname FROM pg_policies WHERE tablename = 'user_avatars';

-- 4. Add helpful view for debugging authentication issues
CREATE OR REPLACE VIEW debug_avatar_access AS
SELECT 
    ua.id,
    ua.user_id,
    ua.processing_status,
    ua.is_primary,
    ua.created_at,
    p.email,
    CASE 
        WHEN auth.uid() = ua.user_id::uuid THEN 'ALLOWED'
        WHEN auth.role() = 'service_role' THEN 'SERVICE_ROLE'
        ELSE 'BLOCKED'
    END as access_status
FROM user_avatars ua
LEFT JOIN profiles p ON p.id = ua.user_id
ORDER BY ua.created_at DESC;

-- 5. Clean up any stuck processing records (over 2 hours old)
UPDATE public.user_avatars 
SET processing_status = 'failed', 
    updated_at = NOW()
WHERE processing_status = 'processing' 
  AND created_at < NOW() - INTERVAL '2 hours';

-- 6. Show current policy status for verification
SELECT 
    'user_avatars RLS enabled' as check_type,
    CASE WHEN rowsecurity THEN 'YES' ELSE 'NO' END as status
FROM pg_tables 
WHERE tablename = 'user_avatars'
UNION ALL
SELECT 
    'user_avatars policies count' as check_type,
    COUNT(*)::text as status
FROM pg_policies 
WHERE tablename = 'user_avatars'
UNION ALL
SELECT 
    'avatars bucket exists' as check_type,
    CASE WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN 'YES' ELSE 'NO' END as status;