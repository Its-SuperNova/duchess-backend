-- New Cart Database Schema
-- Run this in your Supabase SQL editor after dropping the old tables
-- Create Carts table
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Create Cart Items table with all customization fields
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE,
    -- Product information
    product_id VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT,
    category VARCHAR(255),
    -- Order details
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    variant VARCHAR(255) NOT NULL,
    order_type VARCHAR(20) DEFAULT 'weight' CHECK (order_type IN ('weight', 'piece')),
    -- Customization options
    add_text_on_cake BOOLEAN DEFAULT FALSE,
    add_candles BOOLEAN DEFAULT FALSE,
    add_knife BOOLEAN DEFAULT FALSE,
    add_message_card BOOLEAN DEFAULT FALSE,
    -- Custom text fields
    cake_text TEXT,
    gift_card_text TEXT,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Enable Row Level Security
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
-- Create RLS Policies for Carts
CREATE POLICY "Users can view their own carts" ON public.carts FOR
SELECT USING (true);
CREATE POLICY "Users can insert their own carts" ON public.carts FOR
INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own carts" ON public.carts FOR
UPDATE USING (true);
CREATE POLICY "Users can delete their own carts" ON public.carts FOR DELETE USING (true);
-- Create RLS Policies for Cart Items
CREATE POLICY "Users can view their own cart items" ON public.cart_items FOR
SELECT USING (true);
CREATE POLICY "Users can insert their own cart items" ON public.cart_items FOR
INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own cart items" ON public.cart_items FOR
UPDATE USING (true);
CREATE POLICY "Users can delete their own cart items" ON public.cart_items FOR DELETE USING (true);
-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_carts BEFORE
UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_cart_items BEFORE
UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
-- Add unique constraint to prevent duplicate items in cart
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_unique ON public.cart_items(cart_id, product_id, variant, order_type);