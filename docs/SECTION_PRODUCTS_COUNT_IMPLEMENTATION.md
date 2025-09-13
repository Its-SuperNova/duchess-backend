# Section Products Count Implementation

This document describes the implementation of the `current_products_count` column in the `product_sections` table to track how many products are currently in each section.

## Overview

Previously, the system only had a `max_products` field to limit how many products could be added to a section. Now, we've added a `current_products_count` field that automatically tracks the actual number of products currently in each section.

## Database Changes

### New Column

- **Table**: `product_sections`
- **Column**: `current_products_count`
- **Type**: `INTEGER`
- **Default**: `0`
- **Constraints**:
  - `>= 0` (non-negative)
  - `<= max_products` (cannot exceed maximum)

### Automatic Triggers

The system includes PostgreSQL triggers that automatically update the `current_products_count` whenever products are added to or removed from sections:

- **INSERT Trigger**: Updates count when a product is added to a section
- **UPDATE Trigger**: Updates count when a product is moved between sections
- **DELETE Trigger**: Updates count when a product is removed from a section

## Files Modified

### Database Migration

- `database/add-current-products-count-to-sections.sql` - SQL migration to add the column and triggers

### Type Definitions

- `lib/actions/sections.ts` - Updated `ProductSection` interface to include `current_products_count`

### Server Actions

- `lib/actions/sections.ts` - Added functions:
  - `updateSectionProductsCount(sectionId)` - Manually update count for a specific section
  - `updateAllSectionsProductsCount()` - Update count for all sections

### Admin UI Updates

- `app/admin/home-customization/product-management/page.tsx` - Updated to show current/max count
- `app/admin/home-customization/product-management/arrangement/page.tsx` - Updated count display
- `app/admin/home-customization/product-management/sections/[id]/page.tsx` - Updated count display
- `app/admin/home-customization/product-management/sections/page.tsx` - Updated count display

### Initialization Script

- `scripts/initialize-section-products-count.js` - Script to initialize counts for existing sections

## How to Deploy

### 1. Run Database Migration

Execute the SQL migration in your Supabase dashboard or via CLI:

```sql
-- Run the contents of database/add-current-products-count-to-sections.sql
```

### 2. Initialize Existing Data

Run the initialization script to set correct counts for existing sections:

```bash
node scripts/initialize-section-products-count.js
```

### 3. Verify Implementation

- Check that the `current_products_count` column exists in the `product_sections` table
- Verify that triggers are created and working
- Test adding/removing products from sections to ensure counts update automatically

## Usage

### In Admin Interface

The admin interface now displays the current count vs maximum count in several places:

- **Section Selection Dialog**: Shows "3/12" format when selecting sections
- **Section Management**: Displays current product count in section lists
- **Product Arrangement**: Shows current vs max products in arrangement view

### Programmatically

You can access the current count through the `ProductSection` interface:

```typescript
const section: ProductSection = {
  id: "section-id",
  name: "featured",
  title: "Featured Products",
  max_products: 12,
  current_products_count: 5, // Automatically maintained
  // ... other fields
};
```

### Manual Updates

If needed, you can manually update the count for a specific section:

```typescript
import { updateSectionProductsCount } from "@/lib/actions/sections";

// Update count for a specific section
await updateSectionProductsCount("section-id");

// Update counts for all sections
await updateAllSectionsProductsCount();
```

## Benefits

1. **Real-time Tracking**: Always know exactly how many products are in each section
2. **Automatic Updates**: No manual intervention needed - counts update automatically
3. **Data Integrity**: Constraints ensure counts never exceed maximums or go negative
4. **Performance**: Avoids expensive COUNT queries by storing the count directly
5. **Admin UX**: Clear visual indication of section capacity in the admin interface

## Troubleshooting

### Count Not Updating

If the automatic triggers aren't working:

1. Check that triggers exist in the database
2. Manually run `updateAllSectionsProductsCount()` to sync all counts
3. Verify database permissions for trigger execution

### Count Mismatch

If the stored count doesn't match actual products:

1. Run the initialization script to recalculate all counts
2. Check for any direct database modifications that bypassed triggers
3. Verify that all product additions/removals go through the proper functions

### Performance Issues

If you experience performance issues:

1. Ensure proper indexes exist on `section_products` table
2. Consider running count updates in batches for large datasets
3. Monitor trigger execution times in database logs

## Future Enhancements

Potential future improvements:

1. **Audit Logging**: Track when counts change and by whom
2. **Notifications**: Alert when sections reach capacity
3. **Analytics**: Track section usage patterns over time
4. **Bulk Operations**: Optimize for bulk product additions/removals
