# Cart Customization Test Guide

## Overview

This document outlines how to test the cart customization functionality that stores all product data including customization options and text.

## Database Migration

1. Run the migration script in `fix_rls_policies.sql` in your Supabase SQL editor
2. This adds the following fields to the `cart_items` table:
   - `add_text_on_cake` (BOOLEAN)
   - `add_candles` (BOOLEAN)
   - `add_knife` (BOOLEAN)
   - `add_message_card` (BOOLEAN)
   - `cake_text` (TEXT)
   - `gift_card_text` (TEXT)
   - `order_type` (VARCHAR - 'weight' or 'piece')

## Testing Steps

### 1. Test Product Page Add to Cart

1. Navigate to a product page (e.g., `/products/[product-id]`)
2. Select weight/piece options
3. Enable customization options:
   - Add text on cake (with custom text)
   - Add candles
   - Add knife
   - Add message card (with custom text)
4. Click "Add to Cart"
5. Verify cart sidebar opens and shows:
   - Product details
   - Customization badges (Text on Cake, Candles, Knife, Message Card)
   - Custom text if provided

### 2. Test Cart Sidebar Display

1. Open cart sidebar
2. Verify customization information is displayed:
   - Color-coded badges for each customization
   - Custom text displayed below badges
   - Order type (weight/piece) information

### 3. Test Database Storage

1. Add items to cart with customizations
2. Check Supabase database:
   ```sql
   SELECT * FROM cart_items WHERE cart_id = 'your-cart-id';
   ```
3. Verify all customization fields are stored correctly

### 4. Test Cart Sync (Login/Logout)

1. Add items to cart while not logged in
2. Login to account
3. Verify cart items sync with customization data intact
4. Logout and verify cart persists in localStorage

### 5. Test Checkout Flow

1. Add items with customizations to cart
2. Proceed to checkout
3. Verify customization details are shown in order summary

## Expected Behavior

### Cart Item Structure

```typescript
{
  id: number,
  name: string,
  price: number,
  image: string,
  quantity: number,
  category: string,
  variant: string,
  addTextOnCake: boolean,
  addCandles: boolean,
  addKnife: boolean,
  addMessageCard: boolean,
  cakeText?: string,
  giftCardText?: string,
  orderType: "weight" | "piece"
}
```

### Database Storage

- All customization boolean flags stored as `TRUE/FALSE`
- Text fields stored as `TEXT` (can be NULL)
- Order type stored as `VARCHAR(20)` with constraint
- Default values: all booleans `FALSE`, order_type `'weight'`

### UI Display

- Customization badges with distinct colors
- Text displayed in smaller font below badges
- Responsive design for mobile/desktop
- Checkout mode shows condensed customization info

## Troubleshooting

### Common Issues

1. **Customization not showing**: Check if product has customization options enabled
2. **Database errors**: Verify migration script ran successfully
3. **Cart sync issues**: Check browser localStorage and network requests
4. **UI not updating**: Verify cart context is properly connected

### Debug Commands

```sql
-- Check cart_items table structure
\d cart_items

-- View recent cart items with customizations
SELECT * FROM cart_items ORDER BY created_at DESC LIMIT 5;

-- Check for any NULL values in required fields
SELECT * FROM cart_items WHERE add_text_on_cake IS NULL;
```

## API Endpoints Updated

- `POST /api/cart/add` - Now accepts customization fields
- `GET /api/cart` - Returns customization data
- `POST /api/cart/sync` - Syncs customization data
- `PUT /api/cart/update` - Updates with customization data
- `DELETE /api/cart/remove` - Removes items with customization data
