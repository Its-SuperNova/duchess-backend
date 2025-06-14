-- Database Schema for Duchess Pastries Admin System
-- Categories and Products Tables
-- Enable UUID extension for better ID management
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    products_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    short_description TEXT,
    long_description TEXT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    is_veg BOOLEAN DEFAULT true,
    has_offer BOOLEAN DEFAULT false,
    offer_percentage INTEGER CHECK (
        offer_percentage >= 0
        AND offer_percentage <= 99
    ),
    offer_up_to_price DECIMAL(10, 2) DEFAULT 0,
    -- Images
    banner_image TEXT,
    additional_images TEXT [] DEFAULT '{}',
    -- Selling options
    selling_type VARCHAR(20) NOT NULL CHECK (selling_type IN ('weight', 'piece', 'both')),
    weight_options JSONB DEFAULT '[]',
    piece_options JSONB DEFAULT '[]',
    -- Nutrition information
    calories INTEGER,
    net_weight INTEGER,
    -- in grams
    protein DECIMAL(5, 2),
    -- in grams
    fats DECIMAL(5, 2),
    -- in grams
    carbs DECIMAL(5, 2),
    -- in grams
    sugars DECIMAL(5, 2),
    -- in grams
    fiber DECIMAL(5, 2),
    -- in grams
    sodium INTEGER,
    -- in mg
    -- Customization options
    add_text_on_cake BOOLEAN DEFAULT false,
    add_candles BOOLEAN DEFAULT false,
    add_knife BOOLEAN DEFAULT false,
    add_message_card BOOLEAN DEFAULT false,
    -- Delivery options
    delivery_option VARCHAR(20) DEFAULT 'both' CHECK (delivery_option IN ('same-day', 'both')),
    -- Tags and features
    highlights TEXT [] DEFAULT '{}',
    ingredients TEXT [] DEFAULT '{}',
    -- Status and timestamps
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Indexes for better performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_selling_type ON products(selling_type);
CREATE INDEX idx_products_has_offer ON products(has_offer);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_name ON categories(name);
-- Function to update products_count in categories
CREATE OR REPLACE FUNCTION update_category_products_count() RETURNS TRIGGER AS $$ BEGIN IF TG_OP = 'INSERT' THEN
UPDATE categories
SET products_count = products_count + 1,
    updated_at = NOW()
WHERE id = NEW.category_id;
RETURN NEW;
ELSIF TG_OP = 'DELETE' THEN
UPDATE categories
SET products_count = products_count - 1,
    updated_at = NOW()
WHERE id = OLD.category_id;
RETURN OLD;
ELSIF TG_OP = 'UPDATE' THEN -- If category changed, update both old and new category counts
IF OLD.category_id != NEW.category_id THEN
UPDATE categories
SET products_count = products_count - 1,
    updated_at = NOW()
WHERE id = OLD.category_id;
UPDATE categories
SET products_count = products_count + 1,
    updated_at = NOW()
WHERE id = NEW.category_id;
END IF;
RETURN NEW;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;
-- Triggers to automatically update products_count
CREATE TRIGGER trigger_update_category_products_count_insert
AFTER
INSERT ON products FOR EACH ROW EXECUTE FUNCTION update_category_products_count();
CREATE TRIGGER trigger_update_category_products_count_delete
AFTER DELETE ON products FOR EACH ROW EXECUTE FUNCTION update_category_products_count();
CREATE TRIGGER trigger_update_category_products_count_update
AFTER
UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_category_products_count();
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Triggers to automatically update updated_at
CREATE TRIGGER trigger_update_categories_updated_at BEFORE
UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_products_updated_at BEFORE
UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Insert default categories
INSERT INTO categories (name, description, is_active)
VALUES ('Cakes', 'Delicious cakes and pastries', true),
    ('Cupcakes', 'Colorful small cakes', true),
    ('Cookies', 'Crunchy and soft cookies', true),
    ('Breads', 'Freshly baked bread and rolls', true),
    ('Pastries', 'Flaky and delicate pastries', true),
    ('Donuts', 'Sweet and fluffy donuts', true),
    ('Brownies', 'Rich chocolate treats', true),
    ('Tarts', 'Delicate fruit tarts', true),
    ('Macarons', 'Colorful French macarons', true),
    ('Croissants', 'Buttery French croissants', true),
    ('Pies', 'Traditional pies and tarts', true),
    ('Muffins', 'Moist and flavorful muffins', true),
    ('Sweets', 'Traditional Indian sweets', true),
    ('Chocolates', 'Premium chocolate treats', true);
-- Row Level Security (RLS) policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON categories FOR
SELECT USING (true);
CREATE POLICY "Categories are manageable by admins" ON categories FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM users
        WHERE users.id = auth.uid()
            AND users.role = 'admin'
    )
);
-- Products policies
CREATE POLICY "Products are viewable by everyone" ON products FOR
SELECT USING (is_active = true);
CREATE POLICY "Products are manageable by admins" ON products FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM users
        WHERE users.id = auth.uid()
            AND users.role = 'admin'
    )
);
-- Grant permissions
GRANT ALL ON categories TO authenticated;
GRANT ALL ON products TO authenticated;