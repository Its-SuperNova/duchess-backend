-- Simple script to replace moderator with delivery_agent and shop_worker
-- First, update any users with 'moderator' role to 'user' role
UPDATE users
SET role = 'user'
WHERE role = 'moderator';
-- Add a check constraint to ensure only valid roles are used
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_role;
ALTER TABLE users
ADD CONSTRAINT check_user_role CHECK (
        role IN ('user', 'admin', 'delivery_agent', 'shop_worker')
    );
-- Verify the changes
SELECT 'Available roles:' as info;
SELECT role,
    COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role;