-- Test and Clean Products Database
-- This script will check current state, delete all products, and verify
-- 1. First, let's see what products we currently have
SELECT 'Current Products' as info,
    COUNT(*) as total_products
FROM products;
SELECT id,
    name,
    category_id,
    is_active,
    created_at
FROM products
ORDER BY created_at DESC
LIMIT 10;
-- 2. Check categories and their product counts
SELECT 'Categories with Product Counts' as info,
    name,
    products_count
FROM categories
ORDER BY products_count DESC;
-- 3. Delete all products
DELETE FROM products;
-- 4. Reset product counts in categories
UPDATE categories
SET products_count = 0;
-- 5. Verify deletion
SELECT 'After Deletion - Products' as info,
    COUNT(*) as remaining_products
FROM products;
SELECT 'After Deletion - Categories' as info,
    name,
    products_count
FROM categories
ORDER BY name;
-- 6. Check if RLS might be blocking operations
SELECT 'RLS Status' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('products', 'categories');