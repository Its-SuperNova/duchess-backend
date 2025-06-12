-- Add missing profile columns to users table
-- Run this in your Supabase SQL editor

-- Add phone_number column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Add date_of_birth column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add gender column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20);

-- Add comments for documentation
COMMENT ON COLUMN public.users.phone_number IS 'User phone number';
COMMENT ON COLUMN public.users.date_of_birth IS 'User date of birth';
COMMENT ON COLUMN public.users.gender IS 'User gender (Male, Female, Other, Prefer not to say)';

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position; 