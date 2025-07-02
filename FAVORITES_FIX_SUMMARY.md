# Favorites 500 Error Fix Summary

## Issue Identified

The 500 Internal Server Error was caused by a **Row Level Security (RLS) policy violation** in the favorites table.

### Root Cause

- **Error Code**: `42501` (PostgreSQL insufficient_privilege)
- **Message**: `"new row violates row-level security policy for table "favorites"`
- **Reason**: The RLS policies were written for Supabase Auth (`auth.uid()`) but we're using NextAuth for authentication

## Problem Details

The original RLS policies used `auth.uid()` which only works with Supabase's built-in authentication:

```sql
-- This doesn't work with NextAuth
CREATE POLICY "Users can insert their own favorites" ON public.favorites
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT id::text FROM public.users WHERE id = favorites.user_id
        )
    );
```

Since we use NextAuth (not Supabase Auth), `auth.uid()` returns null, blocking all database operations.

## Solution Applied

**Updated all API routes to use the admin client (`supabaseAdmin`)** instead of the regular client:

### Before:

```typescript
import { supabase } from "@/lib/supabase";
// Uses anonymous key - subject to RLS
```

### After:

```typescript
import { supabaseAdmin } from "@/lib/supabase/admin";
// Uses service role key - bypasses RLS
```

## Changes Made

### 1. Updated API Routes

- ✅ `app/api/favorites/route.ts` (GET)
- ✅ `app/api/favorites/add/route.ts` (POST)
- ✅ `app/api/favorites/remove/route.ts` (DELETE)

### 2. Added TypeScript Support

- ✅ Added `Favorite` interface to `lib/supabase.ts`
- ✅ Added `favorites` table to `Database` interface

### 3. Created RLS Fix Options

- ✅ Created `fix-favorites-rls.sql` with two approaches:
  - **Option 1**: Disable RLS (recommended since we handle auth in API)
  - **Option 2**: Keep RLS with simplified policies

## Why This Works

### Service Role Key vs Anonymous Key

- **Anonymous Key**: Subject to RLS policies, requires `auth.uid()` to work
- **Service Role Key**: Bypasses RLS, full database access with proper API-level authentication

### Security

Security is maintained because:

1. **API-level authentication**: All routes check `session?.user?.email`
2. **User validation**: Routes verify user exists in database
3. **User-specific operations**: All queries filter by authenticated user's ID
4. **Input validation**: Required fields are validated

## Quick Fix (Run in Supabase SQL Editor)

If you want to disable RLS completely (recommended):

```sql
-- Disable RLS and remove policies
ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
```

## Result

✅ **Favorites now work properly**
✅ **500 errors resolved**
✅ **Authentication maintained at API level**
✅ **TypeScript support added**
✅ **No breaking changes to frontend**

The favorites system should now work seamlessly for authenticated users with proper error handling and fallbacks for guest users.
