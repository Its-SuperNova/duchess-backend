# New Cart Behavior Test Guide

## Overview

This guide outlines how to test the new cart behavior where each "add to cart" action creates a new entry, and quantity updates from the cart sidebar only modify existing entries.

## Prerequisites

1. Run the database migration: `update-cart-schema.sql`
2. Ensure all API routes are updated
3. Verify cart context is updated

## Database Migration Required

```sql
-- Run this in your Supabase SQL editor first
-- Add unique_item_id field to cart_items table
ALTER TABLE public.cart_items
ADD COLUMN IF NOT EXISTS unique_item_id VARCHAR(255);

-- Remove the unique constraint that prevents duplicate items
DROP INDEX IF EXISTS idx_cart_items_unique;

-- Create index on unique_item_id for performance
CREATE INDEX IF NOT EXISTS idx_cart_items_unique_item_id ON public.cart_items(unique_item_id);

-- Create index on cart_id and unique_item_id combination
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_unique ON public.cart_items(cart_id, unique_item_id);

-- Update existing cart items to have unique_item_id (for existing data)
UPDATE public.cart_items
SET unique_item_id = CONCAT(id::text, '-', EXTRACT(epoch FROM created_at)::text)
WHERE unique_item_id IS NULL;
```

## Test Scenarios

### Scenario 1: Basic Add to Cart Behavior

**Test Steps:**

1. Navigate to a product page
2. Select weight/piece options and customizations
3. Click "Add to Cart"
4. **Expected:** New entry appears in cart sidebar
5. Go back to the same product
6. Select the SAME weight/piece and customizations
7. Click "Add to Cart" again
8. **Expected:** A second entry appears in cart sidebar (not quantity update)

**Verification:**

- Check database: `SELECT * FROM cart_items ORDER BY created_at DESC;`
- Should see two separate records with different `unique_item_id`

### Scenario 2: Different Customizations

**Test Steps:**

1. Add a cake with "Happy Birthday" text
2. Add the same cake with "Congratulations" text
3. **Expected:** Two separate entries in cart
4. **Expected:** Each shows different customization text

### Scenario 3: Quantity Updates from Cart Sidebar

**Test Steps:**

1. Add a product to cart (creates entry with quantity 1)
2. In cart sidebar, click + button to increase quantity
3. **Expected:** Same entry quantity increases to 2
4. **Expected:** Only one entry remains in cart
5. Click - button to decrease quantity
6. **Expected:** Quantity decreases to 1
7. Click - button again
8. **Expected:** Entry is removed from cart

### Scenario 4: Mixed Product Types

**Test Steps:**

1. Add "Chocolate Cake 1kg" with text "Happy Birthday"
2. Add "Chocolate Cake 2kg" (different weight)
3. Add "Chocolate Cake 1kg" with text "Congratulations" (same weight, different text)
4. **Expected:** Three separate entries in cart sidebar

### Scenario 5: Database Persistence

**Test Steps:**

1. Add multiple products with various customizations
2. Refresh the page
3. **Expected:** All entries persist with correct customizations
4. Login/logout (if testing with authentication)
5. **Expected:** Cart maintains all separate entries

## API Endpoint Testing

### Test POST /api/cart/add

```bash
curl -X POST http://localhost:3000/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "name": "Chocolate Cake",
    "price": 500,
    "quantity": 1,
    "variant": "1kg",
    "addTextOnCake": true,
    "cakeText": "Happy Birthday",
    "uniqueId": "test-unique-id-1"
  }'
```

### Test PUT /api/cart/update

```bash
curl -X PUT http://localhost:3000/api/cart/update \
  -H "Content-Type: application/json" \
  -d '{
    "uniqueItemId": "test-unique-id-1",
    "quantity": 3
  }'
```

### Test DELETE /api/cart/remove

```bash
curl -X DELETE http://localhost:3000/api/cart/remove \
  -H "Content-Type: application/json" \
  -d '{
    "uniqueItemId": "test-unique-id-1"
  }'
```

## Expected Database Structure

After adding items, your `cart_items` table should look like:

```sql
| id | cart_id | product_id | quantity | variant | unique_item_id | add_text_on_cake | cake_text |
|----|---------|------------|----------|---------|----------------|------------------|-----------|
| 1  | uuid-1  | "123"      | 1        | "1kg"   | "1234567-0.123"| true            | "Happy Birthday" |
| 2  | uuid-1  | "123"      | 1        | "1kg"   | "1234568-0.456"| true            | "Congratulations" |
| 3  | uuid-1  | "123"      | 2        | "2kg"   | "1234569-0.789"| false           | null |
```

## Key Differences from Old Behavior

### Old Behavior (Before Changes)

- Same product + variant + order_type = update quantity
- One record per product variant combination
- Customizations would overwrite previous ones

### New Behavior (After Changes)

- Every "add to cart" = new database record
- Multiple entries for same product allowed
- Each entry has unique customizations
- Quantity updates only happen from cart sidebar

## Troubleshooting

### Common Issues

1. **Linter Errors:** Ensure cart sidebar uses new function signatures
2. **Database Errors:** Run the migration script first
3. **Old Entries:** Clear cart and test with fresh entries
4. **API Errors:** Check that uniqueItemId is being passed correctly

### Debug Commands

```sql
-- Check current cart structure
SELECT
  product_name,
  variant,
  quantity,
  unique_item_id,
  add_text_on_cake,
  cake_text,
  created_at
FROM cart_items
ORDER BY created_at DESC;

-- Count entries per product
SELECT
  product_id,
  variant,
  COUNT(*) as entry_count
FROM cart_items
GROUP BY product_id, variant;
```

## Success Criteria

✅ Each "add to cart" creates new database record  
✅ Same product with different customizations = separate entries  
✅ Cart sidebar quantity buttons update existing entries  
✅ Quantity decrease to 0 removes the entry  
✅ Multiple entries of same product display correctly  
✅ All customizations persist correctly  
✅ Database uses unique_item_id for operations  
✅ No duplicate key constraint errors

## Implementation Status

- ✅ Database schema updated
- ✅ Cart add API always creates new entries
- ✅ Cart update API uses unique_item_id
- ✅ Cart remove API uses unique_item_id
- ✅ Cart context updated for new signatures
- ✅ Cart sidebar updated for new behavior
- ✅ Cart sync preserves all entries

The new behavior is now fully implemented and ready for testing!
