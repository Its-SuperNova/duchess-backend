-- Create tax_settings table
CREATE TABLE IF NOT EXISTS tax_settings (
    id SERIAL PRIMARY KEY,
    cgst_rate DECIMAL(5, 2) NOT NULL DEFAULT 9.00,
    sgst_rate DECIMAL(5, 2) NOT NULL DEFAULT 9.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Note: Initial tax settings will be created through the admin interface
-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_tax_settings_updated_at BEFORE
UPDATE ON tax_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();