-- Remove phone column from address table
-- This will permanently delete the alternate_phone column and all its data
ALTER TABLE addresses DROP COLUMN IF EXISTS alternate_phone;
-- Optional: If you want to see the table structure after the change
-- DESCRIBE addresses;