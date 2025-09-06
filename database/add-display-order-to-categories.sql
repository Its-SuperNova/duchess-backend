-- Add display_order column to categories table
-- This allows categories to be ordered as set in the admin panel
-- Add the display_order column
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS display_order INTEGER;
-- Set initial display_order values based on current alphabetical order
-- This ensures existing categories have a proper order
UPDATE categories
SET display_order = subquery.row_number
FROM (
        SELECT id,
            ROW_NUMBER() OVER (
                ORDER BY name ASC
            ) as row_number
        FROM categories
    ) AS subquery
WHERE categories.id = subquery.id;
-- Create an index on display_order for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
-- Add a comment to document the column
COMMENT ON COLUMN categories.display_order IS 'Order in which categories should be displayed on the home page. Lower numbers appear first.';