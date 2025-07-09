-- Fix RLS policy for avatar uploads from edge function
-- Allow anyone to upload to avatars bucket (edge function uses anon key)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Avatar uploads are allowed for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Avatar uploads allowed" ON storage.objects;

-- Create new policy that allows uploads to avatars bucket
CREATE POLICY "Allow avatar uploads from edge function" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'avatars');

-- Also allow reading avatars (for public URLs)
CREATE POLICY "Allow avatar downloads" ON storage.objects
FOR SELECT 
USING (bucket_id = 'avatars');

-- Make sure the avatars bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']; 