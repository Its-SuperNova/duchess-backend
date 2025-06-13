-- Test script to check if role updates work
-- Check current roles
SELECT 'Current roles in users table:' as info;
SELECT role,
    COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role;
-- Try to update a user to delivery_agent (replace 'test@example.com' with a real email)
-- UPDATE users SET role = 'delivery_agent' WHERE email = 'test@example.com';
-- Check if the update worked
-- SELECT email, role FROM users WHERE email = 'test@example.com';