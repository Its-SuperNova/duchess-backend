-- Add discount-related fields to order_items table
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS original_price numeric(10, 2) NULL,
    ADD COLUMN IF NOT EXISTS discount_amount numeric(10, 2) NULL,
    ADD COLUMN IF NOT EXISTS coupon_applied varchar(50) NULL;
-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_order_items_original_price ON public.order_items USING btree (original_price) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_order_items_discount_amount ON public.order_items USING btree (discount_amount) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_order_items_coupon_applied ON public.order_items USING btree (coupon_applied) TABLESPACE pg_default;
-- Add comments for documentation
COMMENT ON COLUMN public.order_items.original_price IS 'Original price of the item before any discount was applied';
COMMENT ON COLUMN public.order_items.discount_amount IS 'Discount amount applied to this specific item';
COMMENT ON COLUMN public.order_items.coupon_applied IS 'Coupon code that was applied to this item';


