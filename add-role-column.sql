-- Add role column to users table for role-based access control
-- Run this in your Supabase SQL editor
-- Add role column with default value 'user'
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' NOT NULL;
-- Add constraint to ensure role is one of the allowed values
ALTER TABLE public.users
ADD CONSTRAINT check_role CHECK (role IN ('user', 'admin', 'moderator'));
-- Add comment for documentation
COMMENT ON COLUMN public.users.role IS 'User role for access control (user, admin, moderator)';
-- Create index for better performance on role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
-- Update existing users to have 'user' role (if any exist)
UPDATE public.users
SET role = 'user'
WHERE role IS NULL;
-- Verify the column was added
SELECT column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
    AND table_schema = 'public'
    AND column_name = 'role';
-- Show the constraint
SELECT constraint_name,
    check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'check_role';
-- Verify default role is set correctly
SELECT column_name,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
    AND table_schema = 'public'
    AND column_name = 'role';