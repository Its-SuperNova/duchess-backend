-- Add alternate_phone column to addresses table
-- Run this in your Supabase SQL editor
ALTER TABLE public.addresses
ADD COLUMN alternate_phone VARCHAR(20) NOT NULL;
-- Add comment for documentation
COMMENT ON COLUMN public.addresses.alternate_phone IS 'Alternate phone number for delivery contact (required)';
-- Verify the column was added
SELECT column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'addresses'
    AND table_schema = 'public'
    AND column_name = 'alternate_phone';