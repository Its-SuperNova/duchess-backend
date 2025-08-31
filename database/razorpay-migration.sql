-- Razorpay Integration Migration
-- Create separate payments table and update orders table
-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
    razorpay_payment_id VARCHAR(255) UNIQUE,
    razorpay_refund_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'captured', 'failed', 'refunded')
    ),
    payment_method VARCHAR(50) DEFAULT 'razorpay',
    receipt VARCHAR(255),
    signature_verified BOOLEAN DEFAULT FALSE,
    webhook_received BOOLEAN DEFAULT FALSE,
    notes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Add missing columns if they don't exist (for existing tables)
DO $$ BEGIN -- Add razorpay_refund_id if it doesn't exist
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'payments'
        AND column_name = 'razorpay_refund_id'
) THEN
ALTER TABLE payments
ADD COLUMN razorpay_refund_id VARCHAR(255);
END IF;
-- Add signature_verified if it doesn't exist
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'payments'
        AND column_name = 'signature_verified'
) THEN
ALTER TABLE payments
ADD COLUMN signature_verified BOOLEAN DEFAULT FALSE;
END IF;
-- Add webhook_received if it doesn't exist
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'payments'
        AND column_name = 'webhook_received'
) THEN
ALTER TABLE payments
ADD COLUMN webhook_received BOOLEAN DEFAULT FALSE;
END IF;
-- Add notes if it doesn't exist
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'payments'
        AND column_name = 'notes'
) THEN
ALTER TABLE payments
ADD COLUMN notes JSONB;
END IF;
END $$;
-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
-- Add comments for documentation
COMMENT ON TABLE payments IS 'Stores Razorpay payment information separately from orders';
COMMENT ON COLUMN payments.razorpay_order_id IS 'Razorpay order ID for payment tracking';
COMMENT ON COLUMN payments.razorpay_payment_id IS 'Razorpay payment ID after successful payment';
COMMENT ON COLUMN payments.razorpay_refund_id IS 'Razorpay refund ID if payment was refunded';
COMMENT ON COLUMN payments.amount IS 'Payment amount in the specified currency';
COMMENT ON COLUMN payments.payment_status IS 'Current status of the payment';
COMMENT ON COLUMN payments.signature_verified IS 'Whether the payment signature was verified';
COMMENT ON COLUMN payments.webhook_received IS 'Whether webhook was received for this payment';
-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_payments_updated_at BEFORE
UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Remove Razorpay fields from orders table (if they exist)
ALTER TABLE orders DROP COLUMN IF EXISTS razorpay_order_id,
    DROP COLUMN IF EXISTS razorpay_payment_id,
    DROP COLUMN IF EXISTS razorpay_refund_id,
    DROP COLUMN IF EXISTS paid_amount,
    DROP COLUMN IF EXISTS receipt;
-- Add a reference to the latest payment in orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS latest_payment_id UUID REFERENCES payments(id);
-- Create index for the payment reference
CREATE INDEX IF NOT EXISTS idx_orders_latest_payment_id ON orders(latest_payment_id);