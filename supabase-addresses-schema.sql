-- Create addresses table for user shipping addresses
-- Run this in your Supabase SQL editor
-- Create addresses table
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    address_name VARCHAR(100) NOT NULL,
    full_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON public.addresses(is_default);
-- Enable Row Level Security
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
-- Create RLS policies
DROP POLICY IF EXISTS "Users can view own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON public.addresses;
-- Policy for viewing addresses
CREATE POLICY "Users can view own addresses" ON public.addresses FOR
SELECT USING (auth.uid() = user_id);
-- Policy for inserting addresses
CREATE POLICY "Users can insert own addresses" ON public.addresses FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Policy for updating addresses
CREATE POLICY "Users can update own addresses" ON public.addresses FOR
UPDATE USING (auth.uid() = user_id);
-- Policy for deleting addresses
CREATE POLICY "Users can delete own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);
-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_addresses_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
-- Create trigger for addresses table
DROP TRIGGER IF EXISTS update_addresses_updated_at ON public.addresses;
CREATE TRIGGER update_addresses_updated_at BEFORE
UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION update_addresses_updated_at();
-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address() RETURNS TRIGGER AS $$ BEGIN -- If the new record is being set as default, unset all other defaults for this user
    IF NEW.is_default = true THEN
UPDATE public.addresses
SET is_default = false
WHERE user_id = NEW.user_id
    AND id != NEW.id;
END IF;
RETURN NEW;
END;
$$ language 'plpgsql';
-- Create trigger to ensure single default address
DROP TRIGGER IF EXISTS ensure_single_default_address_trigger ON public.addresses;
CREATE TRIGGER ensure_single_default_address_trigger BEFORE
INSERT
    OR
UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION ensure_single_default_address();
-- Add comments for documentation
COMMENT ON TABLE public.addresses IS 'User shipping addresses';
COMMENT ON COLUMN public.addresses.user_id IS 'Reference to the user who owns this address';
COMMENT ON COLUMN public.addresses.address_name IS 'User-friendly name for the address (e.g., Home, Office)';
COMMENT ON COLUMN public.addresses.full_address IS 'Complete street address';
COMMENT ON COLUMN public.addresses.city IS 'City name';
COMMENT ON COLUMN public.addresses.state IS 'State or province name';
COMMENT ON COLUMN public.addresses.zip_code IS 'ZIP or postal code';
COMMENT ON COLUMN public.addresses.is_default IS 'Whether this is the default shipping address';
-- Verify the table was created
SELECT column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'addresses'
    AND table_schema = 'public'
ORDER BY ordinal_position;