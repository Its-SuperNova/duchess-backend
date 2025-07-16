# Cart Implementation Guide - Fresh Start

## Overview

This guide outlines the complete implementation of a new cart system with full customization support.

## Step 1: Database Setup

### 1.1 Drop Existing Tables

Run this in your Supabase SQL editor:

```sql
-- Drop existing cart tables
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.carts CASCADE;
```

### 1.2 Create New Tables

Run the `new-cart-schema.sql` file in your Supabase SQL editor. This creates:

- `carts` table with user association
- `cart_items` table with all customization fields
- Proper RLS policies
- Indexes for performance
- Unique constraints to prevent duplicates

## Step 2: API Routes Created

The following API routes have been created:

### `/api/cart` (GET)

- Fetches user's cart items
- Returns transformed data for frontend

### `/api/cart/add` (POST)

- Adds items to cart with full customization support
- Handles duplicate items by updating quantity
- Stores all customization data

### `/api/cart/update` (PUT)

- Updates item quantities
- Removes items when quantity = 0
- Handles customization-specific updates

### `/api/cart/remove` (DELETE)

- Removes specific items from cart
- Handles customization-specific removal

### `/api/cart/sync` (POST)

- Syncs localStorage cart with database
- Merges local and database cart items
- Preserves all customization data

## Step 3: TypeScript Types

New types have been added to `lib/supabase.ts`:

- `Cart` interface for cart metadata
- `CartItem` interface with all customization fields
- Updated `Database` interface with cart types

## Step 4: Frontend Integration

### 4.1 Cart Context

The existing cart context (`context/cart-context.tsx`) already supports:

- Customization fields in CartItem interface
- Database and localStorage sync
- All required cart operations

### 4.2 Cart Sidebar

The cart sidebar (`components/cart-sidebar.tsx`) displays:

- Customization badges with colors
- Custom text fields
- Order type information

### 4.3 Product Pages

Product pages pass customization data:

- `orderType` (weight/piece)
- Customization boolean flags
- Custom text fields

## Step 5: Testing the Implementation

### 5.1 Database Test

Visit `/api/test-db` to verify:

- Table structure is correct
- Insert operations work
- All fields are properly defined

### 5.2 Cart Operations Test

1. **Add to Cart**: Add items with customizations
2. **View Cart**: Check customization display
3. **Update Quantities**: Test quantity changes
4. **Remove Items**: Test item removal
5. **Login/Logout**: Test cart sync

## Step 6: Key Features

### 6.1 Customization Support

- ✅ Text on cake (with custom text)
- ✅ Candles
- ✅ Knife
- ✅ Message card (with custom text)
- ✅ Order type (weight/piece)

### 6.2 Database Storage

- ✅ All customization fields stored
- ✅ Proper data types and constraints
- ✅ Unique constraints prevent duplicates
- ✅ RLS policies for security

### 6.3 Frontend Display

- ✅ Color-coded customization badges
- ✅ Custom text display
- ✅ Responsive design
- ✅ Checkout mode support

### 6.4 Cart Sync

- ✅ localStorage to database sync
- ✅ Preserves all customization data
- ✅ Handles duplicate items correctly

## Step 7: Database Schema Details

### Carts Table

```sql
CREATE TABLE public.carts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Cart Items Table

```sql
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY,
    cart_id UUID REFERENCES carts(id),

    -- Product info
    product_id VARCHAR(255),
    product_name VARCHAR(255),
    product_image TEXT,
    category VARCHAR(255),

    -- Order details
    quantity INTEGER,
    price DECIMAL(10,2),
    variant VARCHAR(255),
    order_type VARCHAR(20),

    -- Customization
    add_text_on_cake BOOLEAN,
    add_candles BOOLEAN,
    add_knife BOOLEAN,
    add_message_card BOOLEAN,
    cake_text TEXT,
    gift_card_text TEXT,

    -- Timestamps
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Step 8: Troubleshooting

### Common Issues

1. **Migration Errors**

   - Ensure old tables are dropped first
   - Check for existing constraints

2. **API Errors**

   - Verify user authentication
   - Check RLS policies
   - Validate data types

3. **Frontend Issues**
   - Clear browser cache
   - Check localStorage
   - Verify API responses

### Debug Commands

```sql
-- Check table structure
\d cart_items

-- View recent cart items
SELECT * FROM cart_items ORDER BY created_at DESC LIMIT 5;

-- Check for errors
SELECT * FROM cart_items WHERE product_id IS NULL;
```

## Step 9: Next Steps

1. **Run the migration** in Supabase SQL editor
2. **Test the API endpoints** with Postman or browser
3. **Test the frontend** by adding items to cart
4. **Verify customization display** in cart sidebar
5. **Test cart sync** with login/logout

## Success Criteria

✅ Cart items store in database with all customization data  
✅ Cart sidebar displays customization information  
✅ Cart sync works between localStorage and database  
✅ All API endpoints return proper responses  
✅ Customization badges show with correct colors  
✅ Custom text displays properly  
✅ Order type (weight/piece) is preserved

The implementation is now complete and ready for testing!
