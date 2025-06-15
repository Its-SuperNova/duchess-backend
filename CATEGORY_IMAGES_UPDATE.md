# Category Images Feature Update

## Overview

Added image support to categories in the admin panel. Categories can now have images uploaded either from local files or via URL links.

## Changes Made

### 1. Database Schema Updates

- **File**: `database_schema.sql`
- **Change**: Added `image TEXT` column to the `categories` table
- **Migration**: Run `migrate_add_category_image.sql` to update existing databases

### 2. TypeScript Interface Updates

- **File**: `lib/supabase.ts`
- **Change**: Added `image: string | null` to the `Category` interface

### 3. New Component Created

- **File**: `app/admin/categories/components/category-image-upload.tsx`
- **Features**:
  - Upload images from local device (PNG, JPG, GIF, max 2MB)
  - Add images via URL
  - Image preview with aspect ratio 4:3
  - Remove/replace existing images
  - Recommended size: 400x300px

### 4. Admin Categories Page Updates

- **File**: `app/admin/categories/page.tsx`
- **Features**:
  - Image upload in both Add and Edit category dialogs
  - Display category images in table and card views
  - Fallback to icon when no image is available
  - Auto-resize dialogs to accommodate image upload component

## How to Use

### Adding a Category with Image

1. Go to Admin → Categories
2. Click "Add New Category"
3. Fill in category name and description
4. Upload an image by:
   - **Local Upload**: Click "Upload from Device" and select a file
   - **URL**: Click "Add URL" and paste an image URL
5. Click "Create Category"

### Editing Category Images

1. Click the edit (pencil) icon on any category
2. The current image (if any) will be displayed
3. Upload a new image or add via URL
4. Click "Update Category"

### Image Display

- **Table View**: 40x40px thumbnail next to category name
- **Card View**: 48x48px thumbnail in category card
- **Fallback**: Tag icon when no image is available

## Technical Details

### Image Handling

- Images are stored as base64 data URLs for local uploads
- External URLs are stored directly
- File size limit: 2MB
- Supported formats: PNG, JPG, GIF
- Recommended dimensions: 400x300px (4:3 aspect ratio)

### Database Structure

```sql
-- Categories table with image support
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image TEXT, -- New field for category images
    is_active BOOLEAN DEFAULT true,
    products_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Component API

```typescript
interface CategoryImageUploadProps {
  categoryImage: string | null;
  setCategoryImage: (image: string | null) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
```

## Migration Instructions

### For Existing Databases

1. Run the migration script:

   ```sql
   -- Execute migrate_add_category_image.sql
   ALTER TABLE categories ADD COLUMN IF NOT EXISTS image TEXT;
   ```

2. Optionally add sample images to existing categories by uncommenting and running the UPDATE statements in the migration file.

### For New Installations

The updated `database_schema.sql` already includes the image column, so no migration is needed.

## Sample Category Images

The `public/images/categories/` directory contains sample images that can be used:

- `cake.png`
- `cupcake.png`
- `cookies.png`
- `bread.png`
- `croissant.png`
- `pink-donut.png`
- `brownie.png`
- `tart.png`
- `macaron.png`
- `pie.png`
- `muffin.png`
- `sweets-bowl.png`
- `chocolate-bar.png`

## Benefits

1. **Visual Appeal**: Categories now have visual representation
2. **Better UX**: Easier category identification for admins and customers
3. **Flexibility**: Support for both local uploads and external URLs
4. **Responsive**: Images adapt to both table and card views
5. **Graceful Fallback**: Default icon when no image is available

## Future Enhancements

- Image optimization and resizing
- Multiple image sizes for different contexts
- Image CDN integration
- Bulk image upload for categories
- Image gallery for category selection
