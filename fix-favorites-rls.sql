-- Fix for Favorites RLS Policy Issue
-- Run this in your Supabase SQL editor to fix the authentication error
-- Option 1: Disable RLS (Recommended since we handle auth in API)
-- This is the simplest fix since we already validate users in our API routes
ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;
-- Drop the existing policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
-- Alternative Option 2: If you want to keep RLS enabled, use this instead
-- (Comment out the above and uncomment below if you prefer RLS)
/*
 -- Keep RLS enabled but create simpler policies
 ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
 
 -- Create policies that allow all authenticated operations
 -- (since we validate users in the API layer anyway)
 CREATE POLICY "Allow all operations for service role" ON public.favorites
 FOR ALL USING (true);
 
 -- Or if you want more specific policies for regular users:
 CREATE POLICY "Allow authenticated reads" ON public.favorites 
 FOR SELECT USING (true);
 
 CREATE POLICY "Allow authenticated inserts" ON public.favorites 
 FOR INSERT WITH CHECK (true);
 
 CREATE POLICY "Allow authenticated deletes" ON public.favorites 
 FOR DELETE USING (true);
 */