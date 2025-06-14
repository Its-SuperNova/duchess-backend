-- Delete All Categories from Database
-- This script will remove all categories to start fresh
-- First, check if there are any products that would prevent category deletion
SELECT 'Products in Categories' as info,
    c.name as category_name,
    COUNT(p.id) as product_count
FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id,
    c.name
HAVING COUNT(p.id) > 0;
-- Delete all products first (since they reference categories)
DELETE FROM products;
-- Now delete all categories
DELETE FROM categories;
-- Verify deletion
SELECT 'After Deletion - Categories' as info,
    COUNT(*) as remaining_categories
FROM categories;
SELECT 'After Deletion - Products' as info,
    COUNT(*) as remaining_products
FROM products;