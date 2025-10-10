-- Create checkout_sessions table if it doesn't exist
-- This table stores temporary checkout session data
CREATE TABLE IF NOT EXISTS public.checkout_sessions (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    checkout_id VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID,
    user_email VARCHAR(255),
    items JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    cgst_amount DECIMAL(10, 2) DEFAULT 0,
    sgst_amount DECIMAL(10, 2) DEFAULT 0,
    address_text TEXT,
    selected_address_id UUID,
    coupon_code VARCHAR(100),
    customization_options JSONB,
    cake_text TEXT,
    message_card_text TEXT,
    contact_info JSONB,
    notes TEXT,
    delivery_timing VARCHAR(50) DEFAULT 'same_day',
    delivery_date DATE,
    delivery_time_slot VARCHAR(100),
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    distance DECIMAL(8, 2),
    duration INTEGER,
    delivery_zone VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_attempts INTEGER DEFAULT 0,
    database_order_id UUID,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT checkout_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT checkout_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT checkout_sessions_selected_address_id_fkey FOREIGN KEY (selected_address_id) REFERENCES addresses(id) ON DELETE
    SET NULL,
        CONSTRAINT checkout_sessions_database_order_id_fkey FOREIGN KEY (database_order_id) REFERENCES orders(id) ON DELETE
    SET NULL,
        CONSTRAINT checkout_sessions_payment_status_check CHECK (
            payment_status IN (
                'pending',
                'processing',
                'paid',
                'failed',
                'cancelled'
            )
        )
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_checkout_id ON public.checkout_sessions USING btree (checkout_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user_id ON public.checkout_sessions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_expires_at ON public.checkout_sessions USING btree (expires_at);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_payment_status ON public.checkout_sessions USING btree (payment_status);
-- Add comments to document the table and key columns
COMMENT ON TABLE public.checkout_sessions IS 'Temporary checkout session data stored for 30 minutes';
COMMENT ON COLUMN public.checkout_sessions.contact_info IS 'Receiver contact information stored as JSON: {name: string, phone: string, alternatePhone?: string}';
COMMENT ON COLUMN public.checkout_sessions.items IS 'Cart items stored as JSON array';
COMMENT ON COLUMN public.checkout_sessions.customization_options IS 'Product customization options stored as JSON';
-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_checkout_sessions_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_update_checkout_sessions_updated_at BEFORE
UPDATE ON public.checkout_sessions FOR EACH ROW EXECUTE FUNCTION update_checkout_sessions_updated_at();

