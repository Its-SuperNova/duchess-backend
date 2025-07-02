# Favorites Backend Implementation Guide

This guide explains how to set up the database-backed favorites functionality in your Duchess Pastries app.

## Overview

The favorites system has been upgraded from localStorage-only to a hybrid approach:

- **Authenticated users**: Favorites are stored in the database and synced across devices
- **Guest users**: Favorites fall back to localStorage (existing behavior)
- **Error handling**: Automatic fallback to localStorage if API calls fail

## Database Setup

### 1. Create the Favorites Table

Run this SQL in your Supabase SQL editor:

```sql
-- Create Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    product_image TEXT,
    product_category VARCHAR(255),
    product_description TEXT,
    product_rating DECIMAL(3, 2),
    is_veg BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    -- Ensure a user can't favorite the same product twice
    UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own favorites" ON public.favorites
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT id::text FROM public.users WHERE id = favorites.user_id
        )
    );

CREATE POLICY "Users can insert their own favorites" ON public.favorites
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT id::text FROM public.users WHERE id = favorites.user_id
        )
    );

CREATE POLICY "Users can delete their own favorites" ON public.favorites
    FOR DELETE USING (
        auth.uid()::text IN (
            SELECT id::text FROM public.users WHERE id = favorites.user_id
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON public.favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON public.favorites(created_at);
```

## API Endpoints

The following API routes have been created:

### GET `/api/favorites`

Fetches all favorites for the authenticated user.

**Response:**

```json
{
  "success": true,
  "favorites": [
    {
      "id": 123,
      "name": "Red Velvet Cake",
      "price": 499,
      "image": "/images/red-velvet.png",
      "isVeg": true,
      "description": "Delicious red velvet cake",
      "rating": 4.5,
      "category": "Cakes"
    }
  ]
}
```

### POST `/api/favorites/add`

Adds a product to user's favorites.

**Request Body:**

```json
{
  "id": 123,
  "name": "Red Velvet Cake",
  "price": 499,
  "image": "/images/red-velvet.png",
  "isVeg": true,
  "description": "Delicious red velvet cake",
  "rating": 4.5,
  "category": "Cakes"
}
```

### DELETE `/api/favorites/remove`

Removes a product from user's favorites.

**Request Body:**

```json
{
  "productId": 123
}
```

## Frontend Changes

### Updated Context

The `FavoritesProvider` now:

- Uses `useSession` to detect authentication status
- Automatically fetches favorites from API for authenticated users
- Falls back to localStorage for guest users or on API errors
- Provides loading and error states
- Uses optimistic updates for better UX

### New Context Interface

```typescript
interface FavoritesContextType {
  favorites: Product[];
  addToFavorites: (product: Product) => Promise<void>; // Now async
  removeFromFavorites: (productId: number) => Promise<void>; // Now async
  isFavorite: (productId: number) => boolean;
  isLoading: boolean; // New
  error: string | null; // New
}
```

### Component Updates

All components using favorites have been updated to:

- Handle async add/remove functions
- Show loading states where appropriate
- Display error messages
- Implement proper error handling with fallbacks

## Features

### ✅ Implemented Features

1. **Database Storage**: Favorites stored in Supabase with proper RLS policies
2. **User Authentication**: Integration with NextAuth for user identification
3. **API Security**: Proper authentication checks on all endpoints
4. **Error Handling**: Graceful fallbacks to localStorage on API failures
5. **Optimistic Updates**: Immediate UI feedback with error recovery
6. **Guest Support**: localStorage fallback for non-authenticated users
7. **Loading States**: Visual feedback during API operations
8. **Duplicate Prevention**: Database constraints prevent duplicate favorites
9. **Cross-Device Sync**: Favorites sync across devices for authenticated users

### 🔄 Behavioral Changes

#### Before (localStorage only):

- Favorites only stored locally
- No cross-device synchronization
- Lost when clearing browser data
- No user account association

#### After (Hybrid approach):

- **Authenticated users**: Stored in database + localStorage backup
- **Guest users**: localStorage (unchanged behavior)
- **Error scenarios**: Automatic fallback to localStorage
- **Cross-device sync**: Works for authenticated users
- **Performance**: Optimistic updates for instant feedback

## Usage Examples

### Adding to Favorites

```typescript
const { addToFavorites, isLoading, error } = useFavorites();

const handleAddFavorite = async () => {
  try {
    await addToFavorites({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      isVeg: product.isVeg,
      description: product.description,
      rating: product.rating,
      category: product.category,
    });
    // Success feedback
  } catch (error) {
    // Error handling
  }
};
```

### Checking Loading State

```typescript
const { isLoading, error } = useFavorites();

if (isLoading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage message={error} />;
}
```

## Migration Notes

### For Existing Users

- Existing localStorage favorites are preserved
- When users log in, localStorage favorites are used as fallback
- No data loss during the transition

### Database Migration

If you have existing users, you might want to:

1. Create the favorites table
2. Deploy the backend changes
3. Optionally create a migration script to sync localStorage favorites to the database

## Testing

Test the implementation by:

1. **Guest User Flow**:

   - Add favorites without logging in
   - Verify localStorage storage
   - Check that favorites persist on page refresh

2. **Authenticated User Flow**:

   - Log in and add favorites
   - Verify database storage via Supabase dashboard
   - Log out and back in to confirm persistence
   - Test on different devices/browsers

3. **Error Scenarios**:

   - Disable network and test fallback behavior
   - Test with invalid authentication tokens
   - Verify graceful error handling

4. **Migration**:
   - Have localStorage favorites as guest
   - Log in and verify favorites are preserved
   - Test cross-device synchronization

## Troubleshooting

### Common Issues

1. **RLS Policies Not Working**:

   - Ensure user IDs match between auth system and database
   - Check that `auth.uid()` returns the correct user ID
   - Verify policies are enabled

2. **API Authentication Failing**:

   - Check NextAuth session configuration
   - Verify user exists in database with correct email
   - Ensure proper session handling in API routes

3. **LocalStorage Fallback Not Working**:

   - Check browser localStorage permissions
   - Verify error handling in context
   - Ensure isClient checks are working

4. **Favorites Not Syncing**:
   - Check database table exists and is accessible
   - Verify API endpoints are deployed correctly
   - Test authentication flow

This implementation provides a robust, user-friendly favorites system that gracefully handles various scenarios while maintaining backward compatibility.
