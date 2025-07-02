-- Favorites Table Schema
-- Add this to your Supabase SQL editor to create the favorites table
-- Create Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    product_image TEXT,
    product_category VARCHAR(255),
    product_description TEXT,
    product_rating DECIMAL(3, 2),
    is_veg BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Ensure a user can't favorite the same product twice
    UNIQUE(user_id, product_id)
);
-- Enable Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
-- Create RLS Policies for Favorites
-- Users can only view their own favorites
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR
SELECT USING (
        auth.uid()::text IN (
            SELECT id::text
            FROM public.users
            WHERE id = favorites.user_id
        )
    );
-- Users can only insert their own favorites
CREATE POLICY "Users can insert their own favorites" ON public.favorites FOR
INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT id::text
            FROM public.users
            WHERE id = favorites.user_id
        )
    );
-- Users can only delete their own favorites
CREATE POLICY "Users can delete their own favorites" ON public.favorites FOR DELETE USING (
    auth.uid()::text IN (
        SELECT id::text
        FROM public.users
        WHERE id = favorites.user_id
    )
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON public.favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON public.favorites(created_at);
-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = TIMEZONE('utc'::text, NOW());
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE OR REPLACE TRIGGER update_favorites_updated_at BEFORE
UPDATE ON public.favorites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();