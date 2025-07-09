-- Fix Avatar Authentication and Storage Issues
-- This addresses the "No API key found" errors and missing storage bucket

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
DROP POLICY IF EXISTS "Allow service role avatar management" ON storage.objects;

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

-- 3. Clean up any stuck processing records (over 2 hours old)
UPDATE public.user_avatars 
SET processing_status = 'failed', 
    updated_at = NOW()
WHERE processing_status = 'processing' 
  AND created_at < NOW() - INTERVAL '2 hours';