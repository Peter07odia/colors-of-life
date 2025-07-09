-- Find existing users in your database
-- Run this in your Supabase SQL editor

SELECT 
    id,
    email,
    full_name,
    username,
    created_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- If you know your email, find your specific user:
-- SELECT id, email, full_name FROM public.profiles WHERE email = 'your-email@example.com'; 

-- Copy the 'id' value from your user record and use it in the test below 