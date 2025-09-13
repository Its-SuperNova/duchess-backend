-- Create product_sections table
CREATE TABLE IF NOT EXISTS product_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    max_products INTEGER DEFAULT 12,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create section_products junction table
CREATE TABLE IF NOT EXISTS section_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES product_sections(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(section_id, product_id)
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_sections_display_order ON product_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_product_sections_active ON product_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_section_products_section_id ON section_products(section_id);
CREATE INDEX IF NOT EXISTS idx_section_products_product_id ON section_products(product_id);
CREATE INDEX IF NOT EXISTS idx_section_products_display_order ON section_products(section_id, display_order);
-- Insert default sections
INSERT INTO product_sections (
        name,
        title,
        description,
        display_order,
        max_products
    )
VALUES (
        'featured',
        'Featured Products',
        'Our handpicked selection of premium products',
        1,
        8
    ),
    (
        'popular',
        'Popular Products',
        'Customer favorites and bestsellers',
        2,
        12
    ),
    (
        'new-arrivals',
        'New Arrivals',
        'Fresh products just added to our collection',
        3,
        6
    ),
    (
        'trending',
        'Trending Now',
        'Products that are currently trending',
        4,
        8
    ) ON CONFLICT DO NOTHING;