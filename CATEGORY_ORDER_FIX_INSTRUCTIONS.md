# Category Order Fix - Setup Instructions

## Problem Identified

The category reordering in the admin panel was not saving or persisting because:

1. **Missing Database Table**: The `category_order_settings` table didn't exist in the database
2. **Aggressive Cache Headers**: The `/api/categories` endpoint was caching responses for 10 minutes, preventing fresh data from being fetched
3. **No Cache Invalidation**: When order was updated, the API cache wasn't being cleared

## Solution Implemented

### 1. Created Database Table

Created `scripts/create-category-order-settings-table.sql` with:

- Table structure to store category order settings
- Automatic `updated_at` trigger
- Default category order
- Proper indexes for performance

### 2. Fixed Cache Headers

- Reduced cache time from 10 minutes to 1 minute
- Reduced stale-while-revalidate from 2 hours to 5 minutes
- This ensures category order changes appear faster

### 3. Added Revalidation

- Added revalidation of `/api/categories` route when order is updated
- Clears cache immediately after save

### 4. Enhanced Logging

- Added detailed console logs to track the save process
- Makes debugging easier if issues occur

## Setup Steps

### Step 1: Create the Database Table

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Open the file `scripts/create-category-order-settings-table.sql`
4. Copy the entire SQL content
5. Paste it into the Supabase SQL Editor
6. Click **Run** to execute

**Verification**: After running, go to **Table Editor** in Supabase and confirm that the `category_order_settings` table now exists.

### Step 2: Test the Category Reordering

1. **Start your development server**:

   ```bash
   npm run dev
   ```

2. **Navigate to Admin Panel**:
   - Go to: `http://localhost:3000/admin/category-management`
3. **Test Drag and Drop**:

   - Drag a category card to a new position
   - The order badge (e.g., #1, #2, #3) should update immediately
   - Notice the "Save Changes" button becomes active (blue)

4. **Save the Changes**:

   - Click the **"Save Changes"** button
   - Wait for the success confirmation
   - Check your browser console - you should see logs like:
     ```
     📦 Received category order update request: {...}
     🔄 Starting category order update: {...}
     📋 Fetched categories from database: [...]
     📝 Ordered category names to save: [...]
     💾 Successfully saved to database: [...]
     🔄 Revalidated paths
     ✅ Category order updated successfully
     ```

5. **Verify Persistence**:

   - Refresh the page (F5 or Ctrl+R)
   - The category order should remain the same as you saved
   - The categories should **NOT** return to their old positions

6. **Test Homepage Display**:
   - Navigate to the homepage: `http://localhost:3000/`
   - The category cards in the hero section should display in the order you just saved
   - Wait 1 minute and refresh to ensure the cache updates
   - The order should still match what you saved in the admin panel

### Step 3: Verify Database Entry

1. Go back to **Supabase Dashboard** > **Table Editor**
2. Open the `category_order_settings` table
3. You should see one row with:
   - `setting_key`: `category_order`
   - `setting_value`: JSON array with category names in your custom order
   - `updated_at`: Recent timestamp

## Troubleshooting

### Issue: "Failed to update category order"

**Solution**: Check that the `category_order_settings` table was created successfully in Supabase.

### Issue: Order saves but doesn't appear on homepage

**Possible causes**:

1. **Browser cache**: Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. **Cache not expired yet**: Wait 1 minute for the API cache to expire, then refresh
3. **Revalidation failed**: Check server logs for any revalidation errors

### Issue: Categories return to old position after refresh

**Solution**:

1. Check browser console for error messages
2. Verify the `category_order_settings` table has the correct data
3. Check server logs for database errors

## Technical Details

### How It Works

1. **Frontend (Admin Panel)**:

   - Uses Framer Motion's `Reorder` component for drag-and-drop
   - Tracks local state changes and marks as "has changes"
   - Sends PUT request to `/api/categories/order` with new order

2. **API Route** (`/api/categories/order`):

   - Receives array of `{id, order}` objects
   - Calls `updateCategoryOrder()` action

3. **Server Action** (`lib/actions/categories.ts`):

   - Fetches all categories from database
   - Maps category IDs to names
   - Creates ordered array of category names
   - Upserts into `category_order_settings` table
   - Revalidates all relevant paths

4. **Fetching** (`getCategories()` action):

   - Fetches categories from database
   - Reads custom order from `category_order_settings`
   - Sorts categories according to saved order
   - Returns sorted array

5. **Caching**:
   - API endpoint caches for 1 minute
   - Stale data served for up to 5 minutes while revalidating
   - Cache cleared on order update

## Files Modified

1. `scripts/create-category-order-settings-table.sql` - **NEW** - Database table creation
2. `app/api/categories/order/route.ts` - Added logging
3. `app/api/categories/route.ts` - Reduced cache time
4. `lib/actions/categories.ts` - Added logging and API route revalidation

## Notes

- The category order is stored as an array of **category names**, not IDs
- If a category is renamed, you may need to manually update the order settings
- Only active categories are displayed on the homepage
- Categories not in the saved order will appear alphabetically at the end

## Success Criteria

✅ Category drag-and-drop works in admin panel
✅ Save button activates when order changes
✅ Order persists after page refresh
✅ Homepage displays categories in correct order
✅ Database has correct order stored
✅ Console logs show successful save operation
