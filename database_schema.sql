-- Database Schema for Duchess Pastries
-- Run this in your new Supabase project's SQL editor
-- Create Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    image TEXT,
    provider VARCHAR(50) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    role VARCHAR(20) DEFAULT 'user' CHECK (
        role IN ('user', 'admin', 'delivery_agent', 'shop_worker')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Create Addresses table
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    address_name VARCHAR(255) NOT NULL,
    full_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    distance INTEGER,
    duration INTEGER,
    alternate_phone VARCHAR(20),
    additional_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Create Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    products_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Create Products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_description TEXT,
    long_description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    is_veg BOOLEAN DEFAULT TRUE,
    has_offer BOOLEAN DEFAULT FALSE,
    offer_percentage INTEGER,
    offer_up_to_price DECIMAL(10, 2),
    banner_image TEXT,
    additional_images JSONB DEFAULT '[]',
    selling_type VARCHAR(20) DEFAULT 'both' CHECK (selling_type IN ('weight', 'piece', 'both')),
    weight_options JSONB DEFAULT '[]',
    piece_options JSONB DEFAULT '[]',
    calories INTEGER,
    net_weight INTEGER,
    protein DECIMAL(5, 2),
    fats DECIMAL(5, 2),
    carbs DECIMAL(5, 2),
    sugars DECIMAL(5, 2),
    fiber DECIMAL(5, 2),
    sodium INTEGER,
    add_text_on_cake BOOLEAN DEFAULT FALSE,
    add_candles BOOLEAN DEFAULT FALSE,
    add_knife BOOLEAN DEFAULT FALSE,
    add_message_card BOOLEAN DEFAULT FALSE,
    delivery_option VARCHAR(20) DEFAULT 'both' CHECK (delivery_option IN ('same-day', 'both')),
    highlights JSONB DEFAULT '[]',
    ingredients JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Create Carts table
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Create Cart Items table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    variant VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT,
    category VARCHAR(255),
    -- Customization fields
    add_text_on_cake BOOLEAN DEFAULT FALSE,
    add_candles BOOLEAN DEFAULT FALSE,
    add_knife BOOLEAN DEFAULT FALSE,
    add_message_card BOOLEAN DEFAULT FALSE,
    cake_text TEXT,
    gift_card_text TEXT,
    -- Order type (weight/piece)
    order_type VARCHAR(20) DEFAULT 'weight' CHECK (order_type IN ('weight', 'piece')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Create Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'confirmed',
            'preparing',
            'ready',
            'delivered',
            'cancelled'
        )
    ),
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'completed', 'failed', 'refunded')
    ),
    delivery_address JSONB NOT NULL,
    delivery_date DATE,
    delivery_time_slot VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Create Order Items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    variant VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT,
    customizations JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Create Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    review_text TEXT,
    images JSONB DEFAULT '[]',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Create Banners table
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Create Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
    maximum_discount_amount DECIMAL(10, 2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
-- Create RLS Policies
-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Only admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Users can view their own carts" ON public.carts;
DROP POLICY IF EXISTS "Users can insert their own carts" ON public.carts;
DROP POLICY IF EXISTS "Users can update their own carts" ON public.carts;
DROP POLICY IF EXISTS "Users can delete their own carts" ON public.carts;
DROP POLICY IF EXISTS "Users can view their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view active banners" ON public.banners;
DROP POLICY IF EXISTS "Only admins can manage banners" ON public.banners;
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Only admins can manage coupons" ON public.coupons;
-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users FOR
SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR
UPDATE USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR
INSERT WITH CHECK (true);
-- Addresses table policies
CREATE POLICY "Users can view their own addresses" ON public.addresses FOR
SELECT USING (true);
CREATE POLICY "Users can insert their own addresses" ON public.addresses FOR
INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own addresses" ON public.addresses FOR
UPDATE USING (true);
CREATE POLICY "Users can delete their own addresses" ON public.addresses FOR DELETE USING (true);
-- Categories table policies (public read)
CREATE POLICY "Anyone can view categories" ON public.categories FOR
SELECT USING (true);
CREATE POLICY "Only admins can manage categories" ON public.categories FOR ALL USING (true);
-- Products table policies (public read)
CREATE POLICY "Anyone can view active products" ON public.products FOR
SELECT USING (is_active = true);
CREATE POLICY "Only admins can manage products" ON public.products FOR ALL USING (true);
-- Carts table policies
CREATE POLICY "Users can view their own carts" ON public.carts FOR
SELECT USING (true);
CREATE POLICY "Users can insert their own carts" ON public.carts FOR
INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own carts" ON public.carts FOR
UPDATE USING (true);
CREATE POLICY "Users can delete their own carts" ON public.carts FOR DELETE USING (true);
-- Cart items table policies
CREATE POLICY "Users can view their own cart items" ON public.cart_items FOR
SELECT USING (true);
CREATE POLICY "Users can insert their own cart items" ON public.cart_items FOR
INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own cart items" ON public.cart_items FOR
UPDATE USING (true);
CREATE POLICY "Users can delete their own cart items" ON public.cart_items FOR DELETE USING (true);
-- Orders table policies
CREATE POLICY "Users can view their own orders" ON public.orders FOR
SELECT USING (true);
CREATE POLICY "Users can insert their own orders" ON public.orders FOR
INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own orders" ON public.orders FOR
UPDATE USING (true);
-- Order items table policies
CREATE POLICY "Users can view their own order items" ON public.order_items FOR
SELECT USING (true);
CREATE POLICY "Users can insert their own order items" ON public.order_items FOR
INSERT WITH CHECK (true);
-- Reviews table policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR
SELECT USING (true);
CREATE POLICY "Users can insert their own reviews" ON public.reviews FOR
INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR
UPDATE USING (true);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (true);
-- Banners table policies (public read)
CREATE POLICY "Anyone can view active banners" ON public.banners FOR
SELECT USING (is_active = true);
CREATE POLICY "Only admins can manage banners" ON public.banners FOR ALL USING (true);
-- Coupons table policies
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR
SELECT USING (is_active = true);
CREATE POLICY "Only admins can manage coupons" ON public.coupons FOR ALL USING (true);
-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create triggers for updating timestamps
CREATE TRIGGER handle_updated_at_users BEFORE
UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_addresses BEFORE
UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_categories BEFORE
UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_products BEFORE
UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_carts BEFORE
UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_cart_items BEFORE
UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_orders BEFORE
UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_reviews BEFORE
UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_banners BEFORE
UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_coupons BEFORE
UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider_id ON public.users(provider_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
-- Insert sample categories (only if they don't exist)
INSERT INTO public.categories (name, description, is_active)
SELECT 'Cakes',
    'Delicious cakes for all occasions',
    true
WHERE NOT EXISTS (
        SELECT 1
        FROM public.categories
        WHERE name = 'Cakes'
    )
UNION ALL
SELECT 'Cookies',
    'Freshly baked cookies',
    true
WHERE NOT EXISTS (
        SELECT 1
        FROM public.categories
        WHERE name = 'Cookies'
    )
UNION ALL
SELECT 'Pastries',
    'Assorted pastries and desserts',
    true
WHERE NOT EXISTS (
        SELECT 1
        FROM public.categories
        WHERE name = 'Pastries'
    )
UNION ALL
SELECT 'Breads',
    'Fresh breads and rolls',
    true
WHERE NOT EXISTS (
        SELECT 1
        FROM public.categories
        WHERE name = 'Breads'
    )
UNION ALL
SELECT 'Cupcakes',
    'Individual cupcakes',
    true
WHERE NOT EXISTS (
        SELECT 1
        FROM public.categories
        WHERE name = 'Cupcakes'
    )
UNION ALL
SELECT 'Sweets',
    'Traditional sweets and candies',
    true
WHERE NOT EXISTS (
        SELECT 1
        FROM public.categories
        WHERE name = 'Sweets'
    );
-- Insert sample banners (only if they don't exist)
INSERT INTO public.banners (title, subtitle, image, is_active, display_order)
SELECT 'Welcome to Duchess Pastries',
    'Fresh baked goods daily',
    '/slider-image-1.png',
    true,
    1
WHERE NOT EXISTS (
        SELECT 1
        FROM public.banners
        WHERE title = 'Welcome to Duchess Pastries'
    )
UNION ALL
SELECT 'Special Offers',
    'Up to 20% off on all cakes',
    '/slider-image-2.png',
    true,
    2
WHERE NOT EXISTS (
        SELECT 1
        FROM public.banners
        WHERE title = 'Special Offers'
    )
UNION ALL
SELECT 'Custom Cakes',
    'Order custom cakes for special occasions',
    '/slider-image-3.png',
    true,
    3
WHERE NOT EXISTS (
        SELECT 1
        FROM public.banners
        WHERE title = 'Custom Cakes'
    );
-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

