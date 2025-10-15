-- Add only the missing usage tracking columns to coupons table
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS times_used integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_used_at timestamp with time zone NULL;
-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_coupons_times_used ON public.coupons USING btree (times_used) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_coupons_last_used_at ON public.coupons USING btree (last_used_at) TABLESPACE pg_default;
-- Add comments for documentation
COMMENT ON COLUMN public.coupons.times_used IS 'Number of times this coupon has been successfully used in completed orders';
COMMENT ON COLUMN public.coupons.last_used_at IS 'Timestamp of the last successful coupon usage';