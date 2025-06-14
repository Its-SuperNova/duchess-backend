-- Delete All Products from Database
-- This script will remove all products to start fresh
-- Delete all products
DELETE FROM products;
-- Reset the products_count in categories to 0
UPDATE categories
SET products_count = 0;
-- Verify deletion
SELECT 'Products deleted' as status,
    COUNT(*) as remaining_products
FROM products;
SELECT 'Categories reset' as status,
    name,
    products_count
FROM categories
ORDER BY name;