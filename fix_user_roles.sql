-- Fix user roles to include delivery_agent and shop_worker
-- This script works with existing database structure
-- First, let's check what type the role column currently is
SELECT 'Current role column type:' as info;
SELECT column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'users'
    AND column_name = 'role';
-- Check current role values in the users table
SELECT 'Current role values in users table:' as info;
SELECT role,
    COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role;
-- Check if there are any constraints on the role column
SELECT 'Current constraints on role column:' as info;
SELECT c.conname,
    c.contype,
    pg_get_constraintdef(c.oid) as definition
FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid
    AND a.attnum = ANY(c.conkey)
WHERE c.conrelid = 'users'::regclass
    AND a.attname = 'role';
-- Add new roles by updating existing users if needed and adding check constraint
DO $$ BEGIN -- First, let's see what the current role column type is
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
        AND column_name = 'role'
        AND data_type = 'USER-DEFINED'
) THEN -- It's already an enum type, let's check what values it has
RAISE NOTICE 'Role column is already an enum type';
-- Get the enum type name
DECLARE enum_type_name text;
BEGIN
SELECT udt_name INTO enum_type_name
FROM information_schema.columns
WHERE table_name = 'users'
    AND column_name = 'role';
RAISE NOTICE 'Enum type name: %',
enum_type_name;
-- Add new values to the existing enum
IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'delivery_agent'
        AND enumtypid = (
            SELECT oid
            FROM pg_type
            WHERE typname = enum_type_name
        )
) THEN EXECUTE format(
    'ALTER TYPE %I ADD VALUE ''delivery_agent''',
    enum_type_name
);
RAISE NOTICE 'Added delivery_agent to enum';
ELSE RAISE NOTICE 'delivery_agent already exists in enum';
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'shop_worker'
        AND enumtypid = (
            SELECT oid
            FROM pg_type
            WHERE typname = enum_type_name
        )
) THEN EXECUTE format(
    'ALTER TYPE %I ADD VALUE ''shop_worker''',
    enum_type_name
);
RAISE NOTICE 'Added shop_worker to enum';
ELSE RAISE NOTICE 'shop_worker already exists in enum';
END IF;
END;
ELSE -- It's a text/varchar column, add a check constraint
RAISE NOTICE 'Role column is text/varchar, adding check constraint';
-- Drop existing check constraint if it exists
BEGIN
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_role;
EXCEPTION
WHEN OTHERS THEN RAISE NOTICE 'No existing check constraint to drop';
END;
-- Add new check constraint with all roles
ALTER TABLE users
ADD CONSTRAINT check_user_role CHECK (
        role IN ('user', 'admin', 'delivery_agent', 'shop_worker')
    );
RAISE NOTICE 'Added check constraint with all roles';
END IF;
END $$;
-- Verify the final state
SELECT 'Final role column type:' as info;
SELECT column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'users'
    AND column_name = 'role';
-- If it's an enum, show all values
DO $$
DECLARE enum_type_name text;
BEGIN
SELECT udt_name INTO enum_type_name
FROM information_schema.columns
WHERE table_name = 'users'
    AND column_name = 'role';
IF enum_type_name IS NOT NULL THEN RAISE NOTICE 'Final enum values for %:',
enum_type_name;
FOR r IN
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (
        SELECT oid
        FROM pg_type
        WHERE typname = enum_type_name
    )
ORDER BY enumsortorder LOOP RAISE NOTICE '  - %',
    r.enumlabel;
END LOOP;
END IF;
END $$;