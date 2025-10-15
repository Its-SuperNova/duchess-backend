-- Update coupons table schema to match current form structure
-- This script adds missing fields and updates data types
-- Add new columns for product restrictions and toggle states
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS applicable_products integer [] NULL,
    ADD COLUMN IF NOT EXISTS apply_to_specific boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS restriction_type character varying(20) NULL,
    ADD COLUMN IF NOT EXISTS enable_min_order_amount boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS enable_max_discount_cap boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS enable_usage_limit boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS times_used integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_used_at timestamp with time zone NULL;
-- Update data types for better compatibility
ALTER TABLE public.coupons
ALTER COLUMN applicable_categories TYPE text [] USING applicable_categories::text [],
    ALTER COLUMN usage_limit TYPE integer USING usage_limit::integer,
    ALTER COLUMN max_discount_cap TYPE numeric(10, 2) USING max_discount_cap::numeric(10, 2);
-- Add check constraint for restriction_type
ALTER TABLE public.coupons
ADD CONSTRAINT coupons_restriction_type_check CHECK (
        restriction_type IS NULL
        OR restriction_type IN ('products', 'categories')
    );
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_apply_to_specific ON public.coupons USING btree (apply_to_specific);
CREATE INDEX IF NOT EXISTS idx_coupons_restriction_type ON public.coupons USING btree (restriction_type);
CREATE INDEX IF NOT EXISTS idx_coupons_applicable_categories ON public.coupons USING gin (applicable_categories);
CREATE INDEX IF NOT EXISTS idx_coupons_applicable_products ON public.coupons USING gin (applicable_products);
CREATE INDEX IF NOT EXISTS idx_coupons_times_used ON public.coupons USING btree (times_used);
CREATE INDEX IF NOT EXISTS idx_coupons_last_used_at ON public.coupons USING btree (last_used_at);
-- Add comments for documentation
COMMENT ON COLUMN public.coupons.applicable_products IS 'Array of product IDs this coupon applies to';
COMMENT ON COLUMN public.coupons.apply_to_specific IS 'Whether this coupon applies to specific products/categories only';
COMMENT ON COLUMN public.coupons.restriction_type IS 'Type of restriction: products or categories';
COMMENT ON COLUMN public.coupons.enable_min_order_amount IS 'Whether minimum order amount restriction is enabled';
COMMENT ON COLUMN public.coupons.enable_max_discount_cap IS 'Whether maximum discount cap restriction is enabled';
COMMENT ON COLUMN public.coupons.enable_usage_limit IS 'Whether usage limit restriction is enabled';
COMMENT ON COLUMN public.coupons.times_used IS 'Number of times this coupon has been successfully used in completed orders';
COMMENT ON COLUMN public.coupons.last_used_at IS 'Timestamp of the last successful coupon usage';
-- Update existing records to have default toggle states
UPDATE public.coupons
SET apply_to_specific = CASE
        WHEN applicable_categories IS NOT NULL
        AND array_length(applicable_categories, 1) > 0 THEN true
        ELSE false
    END,
    restriction_type = CASE
        WHEN applicable_categories IS NOT NULL
        AND array_length(applicable_categories, 1) > 0 THEN 'categories'
        ELSE NULL
    END,
    enable_min_order_amount = CASE
        WHEN min_order_amount > 0 THEN true
        ELSE false
    END,
    enable_max_discount_cap = CASE
        WHEN max_discount_cap IS NOT NULL
        AND max_discount_cap > 0 THEN true
        ELSE false
    END,
    enable_usage_limit = CASE
        WHEN usage_limit IS NOT NULL
        AND usage_limit > 0 THEN true
        ELSE false
    END
WHERE apply_to_specific IS NULL;
-- Verify the updated schema
\ d public.coupons;