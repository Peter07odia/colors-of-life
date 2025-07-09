-- Check RLS Policies and Avatar Data
-- Run this in Supabase SQL Editor to debug RLS issues

-- 1. Check if RLS is enabled on user_avatars table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_avatars';

-- 2. Check all current RLS policies on user_avatars table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_avatars'
ORDER BY policyname;

-- 3. Check recent avatar records and their status
SELECT 
    id,
    user_id,
    avatar_type,
    processing_status,
    is_primary,
    created_at,
    updated_at,
    CASE 
        WHEN avatar_url IS NOT NULL THEN 'has_avatar_url'
        ELSE 'no_avatar_url'
    END as avatar_url_status
FROM public.user_avatars 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Check if there are any users in the system
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Check profiles table and RLS policies
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 6. Check storage policies for avatars bucket
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- 7. Check if avatars bucket exists
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'avatars';

-- 8. Test query that would be run by mobile app (simulate authenticated user)
-- Note: This will fail if RLS is blocking it
-- SELECT * FROM public.user_avatars WHERE user_id = 'some-uuid';

-- 9. Check for any failed avatar records
SELECT 
    id,
    user_id,
    processing_status,
    error_message,
    created_at
FROM public.user_avatars 
WHERE processing_status = 'failed'
ORDER BY created_at DESC 
LIMIT 5;

-- 10. Check current service role configuration
SELECT current_user, current_role;