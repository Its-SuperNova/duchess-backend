-- Fix RLS policies for NextAuth integration
-- This script safely removes old policies and creates new ones
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON public.addresses;
-- For NextAuth integration, we need to disable RLS temporarily or use a different approach
-- Option 1: Disable RLS (less secure but works with NextAuth)
ALTER TABLE public.addresses DISABLE ROW LEVEL SECURITY;
-- Option 2: If you want to keep RLS enabled (more secure), uncomment the following:
-- CREATE POLICY "Allow all operations for authenticated users" ON public.addresses
--     FOR ALL USING (true) WITH CHECK (true);
-- Create a function to get user ID from email (for future use)
CREATE OR REPLACE FUNCTION get_user_id_from_email(user_email TEXT) RETURNS UUID AS $$
DECLARE user_uuid UUID;
BEGIN
SELECT id INTO user_uuid
FROM public.users
WHERE email = user_email;
RETURN user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Verify the changes
SELECT schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'addresses';
-- Show RLS status
SELECT schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'addresses';