-- Create banners table for storing hero slider banners
CREATE TABLE IF NOT EXISTS banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL DEFAULT 'hero',
    device_type VARCHAR(20) NOT NULL CHECK (device_type IN ('desktop', 'mobile')),
    image_url TEXT NOT NULL,
    public_id VARCHAR(255),
    -- Cloudinary public ID for future management
    is_clickable BOOLEAN DEFAULT false,
    redirect_url TEXT,
    -- URL to redirect when banner is clicked
    position INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_banners_type_device ON banners(type, device_type);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);
-- Add constraint to ensure unique position per type and device
CREATE UNIQUE INDEX IF NOT EXISTS idx_banners_unique_position ON banners(type, device_type, position)
WHERE is_active = true;
-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_banners_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_banners_updated_at BEFORE
UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION update_banners_updated_at();
-- Insert some sample data (optional - remove if not needed)
-- INSERT INTO banners (type, device_type, image_url, position, is_active) VALUES
-- ('hero', 'desktop', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/desktop-banner-1.jpg', 1, true),
-- ('hero', 'mobile', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/mobile-banner-1.jpg', 1, true);