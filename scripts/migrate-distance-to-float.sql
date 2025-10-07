-- Migration script to change distance column from integer to float
-- Run this in your Supabase SQL editor
-- First, let's see the current data to understand what we're working with
SELECT id,
    distance,
    full_address
FROM addresses
WHERE distance IS NOT NULL
LIMIT 10;
-- Step 1: Add a new temporary column for the float values
ALTER TABLE addresses
ADD COLUMN distance_float DECIMAL(8, 2);
-- Step 2: Convert existing integer values to float
-- The old values were stored as integer * 10, so we divide by 10 to get the actual distance
UPDATE addresses
SET distance_float = ROUND(distance::DECIMAL / 10, 2)
WHERE distance IS NOT NULL;
-- Step 3: Verify the conversion
SELECT id,
    distance,
    distance_float,
    full_address
FROM addresses
WHERE distance IS NOT NULL
LIMIT 10;
-- Step 4: Drop the old integer column
ALTER TABLE addresses DROP COLUMN distance;
-- Step 5: Rename the new column to the original name
ALTER TABLE addresses
    RENAME COLUMN distance_float TO distance;
-- Step 6: Add a comment to document the change
COMMENT ON COLUMN addresses.distance IS 'Distance in kilometers as decimal (e.g., 26.4 for 26.4km)';
-- Step 7: Verify the final result
SELECT id,
    distance,
    full_address
FROM addresses
WHERE distance IS NOT NULL
LIMIT 10;
-- Optional: Create an index on the distance column for better performance
CREATE INDEX IF NOT EXISTS idx_addresses_distance ON addresses(distance)
WHERE distance IS NOT NULL;