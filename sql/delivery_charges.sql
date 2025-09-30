-- Create delivery_charges table
CREATE TABLE delivery_charges (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('order_value', 'distance')),
    order_value_threshold DECIMAL(10, 2),
    -- For order value based (only one record)
    delivery_type VARCHAR(20) CHECK (delivery_type IN ('free', 'fixed')),
    -- 'free' or 'fixed'
    fixed_price DECIMAL(10, 2),
    -- For fixed price delivery
    start_km DECIMAL(5, 2),
    -- For distance based
    end_km DECIMAL(5, 2),
    -- For distance based
    price DECIMAL(10, 2),
    -- Price for distance based
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Create indexes for better performance
CREATE INDEX idx_delivery_charges_type ON delivery_charges(type);
CREATE INDEX idx_delivery_charges_active ON delivery_charges(is_active);
CREATE INDEX idx_delivery_charges_distance ON delivery_charges(start_km, end_km)
WHERE type = 'distance';
-- Sample data for order value based delivery
INSERT INTO delivery_charges (
        type,
        order_value_threshold,
        delivery_type,
        fixed_price
    )
VALUES ('order_value', 500.00, 'free', NULL);
-- Sample data for distance based delivery
INSERT INTO delivery_charges (type, start_km, end_km, price)
VALUES ('distance', 0.00, 5.00, 80.00),
    ('distance', 5.01, 10.00, 120.00),
    ('distance', 10.01, 15.00, 150.00);
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
-- Trigger to automatically update updated_at
CREATE TRIGGER update_delivery_charges_updated_at BEFORE
UPDATE ON delivery_charges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();