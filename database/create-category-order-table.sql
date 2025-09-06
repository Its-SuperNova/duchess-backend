-- Create a table to store category order settings
-- This allows the admin panel to save category order without modifying the categories table
CREATE TABLE IF NOT EXISTS category_order_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(50) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Insert default category order
INSERT INTO category_order_settings (setting_key, setting_value)
VALUES (
        'category_order',
        '["Cakes", "Chocolates", "Cookies", "Cheese Cakes", "Muffins & Cupcakes", "Brownies & Brookies"]'
    ) ON CONFLICT (setting_key) DO NOTHING;
-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_category_order_settings_key ON category_order_settings(setting_key);
-- Add a comment to document the table
COMMENT ON TABLE category_order_settings IS 'Stores various admin settings including category display order';
COMMENT ON COLUMN category_order_settings.setting_key IS 'Unique key for the setting (e.g., category_order)';
COMMENT ON COLUMN category_order_settings.setting_value IS 'JSON value for the setting';

