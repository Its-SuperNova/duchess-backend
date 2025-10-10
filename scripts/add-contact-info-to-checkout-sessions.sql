-- Add contact_info column to checkout_sessions table
-- This column will store the receiver's contact information as JSON
-- Check if the column already exists before adding it
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'checkout_sessions'
        AND column_name = 'contact_info'
) THEN
ALTER TABLE public.checkout_sessions
ADD COLUMN contact_info JSONB;
-- Add a comment to document the column
COMMENT ON COLUMN public.checkout_sessions.contact_info IS 'Receiver contact information stored as JSON: {name: string, phone: string, alternatePhone?: string}';
RAISE NOTICE 'contact_info column added to checkout_sessions table';
ELSE RAISE NOTICE 'contact_info column already exists in checkout_sessions table';
END IF;
END $$;

