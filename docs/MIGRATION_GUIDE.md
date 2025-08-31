# Razorpay Migration Guide

This guide will help you run the database migration for the Razorpay integration.

## Option 1: Automated Migration (Recommended)

If you have the Supabase service role key configured:

```bash
npm run db:migrate
```

## Option 2: Manual Migration

If the automated migration doesn't work, follow these steps:

### 1. Open Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**

### 2. Run the Migration

1. Copy the contents of `database/razorpay-migration.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the migration

### 3. Verify the Migration

Run this query to verify the payments table was created:

```sql
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;
```

You should see all the required columns:

- `id` (UUID)
- `order_id` (UUID)
- `razorpay_order_id` (VARCHAR)
- `razorpay_payment_id` (VARCHAR)
- `razorpay_refund_id` (VARCHAR)
- `amount` (DECIMAL)
- `currency` (VARCHAR)
- `payment_status` (VARCHAR)
- `payment_method` (VARCHAR)
- `receipt` (VARCHAR)
- `signature_verified` (BOOLEAN)
- `webhook_received` (BOOLEAN)
- `notes` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 4. Check Orders Table

Verify the orders table was updated:

```sql
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name = 'latest_payment_id';
```

## Troubleshooting

### Error: "column does not exist"

If you get an error about a column not existing, it means the migration was partially run. The updated migration script will handle this automatically by adding missing columns.

### Error: "table already exists"

This is normal if the table was created in a previous migration attempt. The script will add any missing columns.

### Error: "permission denied"

Make sure you're using the service role key, not the anon key. The service role key has the necessary permissions to create tables and modify schema.

## Environment Variables Required

Make sure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## After Migration

Once the migration is complete:

1. Restart your development server: `npm run dev`
2. Test the integration: `npm run test:razorpay`
3. Visit `http://localhost:3000/test-razorpay` to test payments

## Rollback (if needed)

If you need to rollback the migration:

```sql
-- Drop the payments table
DROP TABLE IF EXISTS payments CASCADE;

-- Remove the latest_payment_id column from orders
ALTER TABLE orders DROP COLUMN IF EXISTS latest_payment_id;

-- Add back the old Razorpay columns to orders (if needed)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_refund_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS receipt VARCHAR(255);
```

**Note**: This will delete all payment data. Only use this if you're sure you want to rollback.

