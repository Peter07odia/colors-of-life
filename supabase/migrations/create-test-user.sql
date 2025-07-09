-- Create test user for avatar workflow testing
-- Run this in your Supabase SQL editor

INSERT INTO public.profiles (
    id,
    email,
    full_name,
    username,
    onboarding_completed,
    created_at,
    updated_at
) VALUES (
    '1ef22e3d-e2f3-4378-98e9-f3b8a4b8c59f', -- Use the UUID from your test
    'test-user@example.com',
    'Test User for Avatar Workflow',
    'test_avatar_user',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING; -- Don't error if user already exists

-- Verify the user was created
SELECT id, email, full_name FROM public.profiles WHERE id = '1ef22e3d-e2f3-4378-98e9-f3b8a4b8c59f'; 