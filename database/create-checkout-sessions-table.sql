-- Create checkout_sessions table for persistent session storage
CREATE TABLE IF NOT EXISTS checkout_sessions (
    checkout_id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        user_email VARCHAR(255),
        items JSONB NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(10, 2) DEFAULT 0,
        delivery_fee DECIMAL(10, 2) DEFAULT 0,
        total_amount DECIMAL(10, 2) NOT NULL,
        cgst_amount DECIMAL(10, 2) DEFAULT 0,
        sgst_amount DECIMAL(10, 2) DEFAULT 0,
        address_text TEXT,
        selected_address_id UUID REFERENCES addresses(id) ON DELETE
    SET NULL,
        coupon_code VARCHAR(100),
        customization_options JSONB DEFAULT '{}',
        cake_text TEXT,
        message_card_text TEXT,
        contact_info JSONB,
        notes TEXT,
        delivery_timing VARCHAR(50),
        delivery_date DATE,
        delivery_time_slot VARCHAR(50),
        estimated_delivery_time TIMESTAMP WITH TIME ZONE,
        distance INTEGER,
        duration INTEGER,
        delivery_zone VARCHAR(50),
        -- Payment related fields
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK (
            payment_status IN (
                'pending',
                'processing',
                'paid',
                'failed',
                'cancelled'
            )
        ),
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        razorpay_signature TEXT,
        payment_attempts INTEGER DEFAULT 0,
        -- Database order ID
        database_order_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user_email ON checkout_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_payment_status ON checkout_sessions(payment_status);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_expires_at ON checkout_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_razorpay_order_id ON checkout_sessions(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_database_order_id ON checkout_sessions(database_order_id);
-- Create a function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_checkout_sessions() RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
DELETE FROM checkout_sessions
WHERE expires_at < NOW();
GET DIAGNOSTICS deleted_count = ROW_COUNT;
RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
-- Add comments for documentation
COMMENT ON TABLE checkout_sessions IS 'Stores checkout session data for persistent session management';
COMMENT ON COLUMN checkout_sessions.checkout_id IS 'Unique identifier for the checkout session';
COMMENT ON COLUMN checkout_sessions.items IS 'JSON array of cart items';
COMMENT ON COLUMN checkout_sessions.contact_info IS 'JSON object containing contact information';
COMMENT ON COLUMN checkout_sessions.customization_options IS 'JSON object containing product customizations';
COMMENT ON COLUMN checkout_sessions.payment_status IS 'Current payment status of the session';
COMMENT ON COLUMN checkout_sessions.expires_at IS 'Session expiration timestamp';