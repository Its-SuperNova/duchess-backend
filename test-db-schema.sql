-- Test script to check cart_items table structure
-- Run this in your Supabase SQL editor to verify the migration
-- Check if the new columns exist
SELECT column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'cart_items'
    AND table_schema = 'public'
ORDER BY ordinal_position;
-- Check the full table structure
\ d cart_items -- Test inserting a sample cart item with new fields
-- (This will help identify any issues)
INSERT INTO cart_items (
        cart_id,
        product_id,
        quantity,
        variant,
        price,
        product_name,
        product_image,
        category,
        add_text_on_cake,
        add_candles,
        add_knife,
        add_message_card,
        cake_text,
        gift_card_text,
        order_type
    )
VALUES (
        '00000000-0000-0000-0000-000000000000',
        -- dummy cart_id
        '123',
        1,
        'Test Variant',
        100.00,
        'Test Product',
        '/test-image.jpg',
        'Test Category',
        true,
        false,
        true,
        false,
        'Happy Birthday!',
        'Best wishes!',
        'weight'
    ) ON CONFLICT DO NOTHING;
-- Check if the insert worked
SELECT *
FROM cart_items
WHERE product_id = '123'
LIMIT 1;
-- Clean up test data
DELETE FROM cart_items
WHERE product_id = '123';