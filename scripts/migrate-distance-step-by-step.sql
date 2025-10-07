-- Step-by-step migration to change distance from integer to float
-- Run each step separately in Supabase SQL editor
-- STEP 1: Check current data
SELECT id,
    distance,
    full_address,
    CASE
        WHEN distance IS NOT NULL THEN ROUND(distance::DECIMAL / 10, 2)
        ELSE NULL
    END as converted_distance
FROM addresses
WHERE distance IS NOT NULL
ORDER BY distance DESC
LIMIT 20;
-- STEP 2: Add new float column
ALTER TABLE addresses
ADD COLUMN distance_new DECIMAL(8, 2);
-- STEP 3: Convert existing data (integer * 10 → actual distance)
UPDATE addresses
SET distance_new = ROUND(distance::DECIMAL / 10, 2)
WHERE distance IS NOT NULL;
-- STEP 4: Verify conversion
SELECT id,
    distance as old_distance,
    distance_new as new_distance,
    full_address
FROM addresses
WHERE distance IS NOT NULL
ORDER BY distance DESC
LIMIT 10;
-- STEP 5: Drop old column
ALTER TABLE addresses DROP COLUMN distance;
-- STEP 6: Rename new column
ALTER TABLE addresses
    RENAME COLUMN distance_new TO distance;
-- STEP 7: Add comment and index
COMMENT ON COLUMN addresses.distance IS 'Distance in kilometers as decimal (e.g., 26.4 for 26.4km)';
CREATE INDEX IF NOT EXISTS idx_addresses_distance ON addresses(distance)
WHERE distance IS NOT NULL;
-- STEP 8: Final verification
SELECT id,
    distance,
    full_address
FROM addresses
WHERE distance IS NOT NULL
ORDER BY distance DESC
LIMIT 10;
