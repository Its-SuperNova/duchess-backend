-- Create category_order_settings table to store custom category ordering
-- This table allows admins to customize the display order of categories
CREATE TABLE IF NOT EXISTS public.category_order_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_category_order_settings_key ON public.category_order_settings(setting_key);
-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_category_order_settings_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_category_order_settings_timestamp ON public.category_order_settings;
CREATE TRIGGER update_category_order_settings_timestamp BEFORE
UPDATE ON public.category_order_settings FOR EACH ROW EXECUTE FUNCTION update_category_order_settings_updated_at();
-- Insert default category order
INSERT INTO public.category_order_settings (setting_key, setting_value)
VALUES (
        'category_order',
        '["Cakes", "Chocolates", "Cookies", "Cheese Cakes", "Muffins & Cupcakes", "Brownies & Brookies"]'::jsonb
    ) ON CONFLICT (setting_key) DO NOTHING;
-- Add comment for documentation
COMMENT ON TABLE public.category_order_settings IS 'Stores custom ordering configuration for categories displayed on the homepage';
COMMENT ON COLUMN public.category_order_settings.setting_key IS 'Unique identifier for the setting (e.g., category_order)';
COMMENT ON COLUMN public.category_order_settings.setting_value IS 'JSON array of category names in display order';