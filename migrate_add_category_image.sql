-- Migration: Add image column to categories table
-- Execute this if you have an existing categories table without the image field
-- Add image column to categories table
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS image TEXT;
-- Add comment to document the column
COMMENT ON COLUMN categories.image IS 'Category image URL or path - supports both local uploads and external URLs';
-- Update the trigger function to handle updated_at for the new column
-- (This ensures updated_at gets updated when image is changed)
-- Optional: Update some existing categories with sample images
-- (Uncomment these lines if you want to add some sample images)
-- UPDATE categories SET image = '/images/categories/cake.png' WHERE name = 'Cakes';
-- UPDATE categories SET image = '/images/categories/cupcake.png' WHERE name = 'Cupcakes';
-- UPDATE categories SET image = '/images/categories/cookies.png' WHERE name = 'Cookies';
-- UPDATE categories SET image = '/images/categories/bread.png' WHERE name = 'Breads';
-- UPDATE categories SET image = '/images/categories/croissant.png' WHERE name = 'Pastries';
-- UPDATE categories SET image = '/images/categories/pink-donut.png' WHERE name = 'Donuts';
-- UPDATE categories SET image = '/images/categories/brownie.png' WHERE name = 'Brownies';
-- UPDATE categories SET image = '/images/categories/tart.png' WHERE name = 'Tarts';
-- UPDATE categories SET image = '/images/categories/macaron.png' WHERE name = 'Macarons';
-- UPDATE categories SET image = '/images/categories/croissant.png' WHERE name = 'Croissants';
-- UPDATE categories SET image = '/images/categories/pie.png' WHERE name = 'Pies';
-- UPDATE categories SET image = '/images/categories/muffin.png' WHERE name = 'Muffins';
-- UPDATE categories SET image = '/images/categories/sweets-bowl.png' WHERE name = 'Sweets';
-- UPDATE categories SET image = '/images/categories/chocolate-bar.png' WHERE name = 'Chocolates';