-- Database optimization for admin products page
-- This script adds indexes to improve query performance
-- Index on products table for common admin queries
CREATE INDEX IF NOT EXISTS idx_products_admin_query ON products (
    is_active,
    selling_type,
    created_at DESC
);
-- Index for search functionality
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin (to_tsvector('english', name));
-- Index for short_description search
CREATE INDEX IF NOT EXISTS idx_products_description_search ON products USING gin (
    to_tsvector('english', short_description)
);
-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id);
-- Composite index for pagination with filters
CREATE INDEX IF NOT EXISTS idx_products_admin_pagination ON products (
    is_active,
    selling_type,
    category_id,
    created_at DESC
);
-- Index for categories table
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories (name);
-- Index for categories active status
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories (is_active);
-- Add a computed column for stock status (optional - for future optimization)
-- This would require a database function to calculate stock status
-- For now, we'll handle this in the application layer
-- Analyze tables to update statistics
ANALYZE products;
ANALYZE categories;
-- Optional: Create a materialized view for frequently accessed admin data
-- This could be refreshed periodically for even better performance
-- CREATE MATERIALIZED VIEW admin_products_summary AS
-- SELECT 
--     p.id,
--     p.name,
--     p.banner_image,
--     p.is_active,
--     p.selling_type,
--     p.weight_options,
--     p.piece_options,
--     c.name as category_name,
--     p.created_at
-- FROM products p
-- LEFT JOIN categories c ON p.category_id = c.id
-- WHERE c.is_active = true;
-- CREATE INDEX IF NOT EXISTS idx_admin_products_summary_created_at ON admin_products_summary (created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_admin_products_summary_category ON admin_products_summary (category_name);
-- CREATE INDEX IF NOT EXISTS idx_admin_products_summary_selling_type ON admin_products_summary (selling_type);