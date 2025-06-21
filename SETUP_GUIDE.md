# Duchess Pastries - Setup Guide

## Issues After Changing Supabase Organization

After changing your Supabase organization and project, you're experiencing:

1. **RLS Policy Infinite Recursion** - Preventing user authentication
2. **Cart API 404 Errors** - Due to missing user data
3. **User Data Not Stored** - Authentication flow broken

## Step-by-Step Fix

### 1. **Setup New Supabase Project**

1. **Go to your new Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Run the complete database schema**:
   - Copy the contents of `database_schema.sql` file
   - Paste it into the SQL Editor
   - Click "Run" to create all tables, policies, and functions

### 2. **Configure Environment Variables**

1. **Copy the environment template**:

   ```bash
   cp env.template .env.local
   ```

2. **Fill in your actual values in `.env.local`**:

   ```env
   # Get these from your new Supabase project settings
   NEXT_PUBLIC_SUPABASE_URL=https://your-new-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key

   # Generate a new secret
   NEXTAUTH_SECRET=your-new-nextauth-secret

   # Your existing Google OAuth credentials
   AUTH_GOOGLE_ID=your-google-client-id
   AUTH_GOOGLE_SECRET=your-google-client-secret

   NEXTAUTH_URL=http://localhost:3000
   ```

### 3. **Get Your Supabase Credentials**

1. **Go to your Supabase project dashboard**
2. **Navigate to Settings > API**
3. **Copy the following**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 4. **Generate NextAuth Secret**

```bash
openssl rand -base64 32
```

Use this output as your `NEXTAUTH_SECRET`

### 5. **Verify Database Schema**

After running the SQL schema, verify these tables exist:

- `users`
- `addresses`
- `categories`
- `products`
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `reviews`
- `banners`
- `coupons`

### 6. **Test the Setup**

1. **Start your development server**:

   ```bash
   npm run dev
   ```

2. **Test the health endpoint**:

   ```bash
   curl http://localhost:3000/api/health
   ```

3. **Try Google authentication**:
   - Go to `/login`
   - Click "Continue with Google"
   - Check if user is created in the `users` table

### 7. **Verify RLS Policies**

The schema includes proper RLS policies that avoid infinite recursion:

- **Users table**: Uses `true` for authentication-based access
- **Addresses**: Users can only access their own addresses
- **Carts**: Users can only access their own carts
- **Public tables**: Categories, products, banners (read-only for public)

### 8. **Google OAuth Configuration**

Make sure your Google OAuth app is configured correctly:

1. **Go to Google Cloud Console**
2. **Navigate to APIs & Services > Credentials**
3. **Edit your OAuth 2.0 Client ID**
4. **Add these authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-production-domain.com/api/auth/callback/google`

## Common Issues and Solutions

### Issue 1: "infinite recursion detected in policy"

**Solution**: The new schema has correct RLS policies that avoid recursion.

### Issue 2: "User not found" errors

**Solution**: The authentication flow will now properly create users in the database.

### Issue 3: Cart API 404 errors

**Solution**: Once users are properly created, the cart API will work correctly.

### Issue 4: Environment variables not working

**Solution**: Ensure `.env.local` is in your project root and restart your dev server.

## Testing Checklist

- [ ] Database schema created successfully
- [ ] Environment variables configured
- [ ] Health endpoint returns "healthy"
- [ ] Google authentication works
- [ ] User is created in database after authentication
- [ ] Cart API works after authentication
- [ ] No RLS policy errors in console

## Troubleshooting

### If you still get RLS errors:

1. Check if the schema was applied correctly
2. Verify your service role key is correct
3. Make sure RLS policies are enabled on tables

### If authentication still fails:

1. Check Google OAuth configuration
2. Verify NextAuth secret is set
3. Check network requests in browser dev tools

### If cart API still returns 404:

1. Verify user exists in database
2. Check if the cart API routes are deployed
3. Restart your development server

## Support

If you continue to have issues, please:

1. Check the console logs for specific error messages
2. Verify each step was completed correctly
3. Test with a fresh browser session (clear cookies)

The new setup with proper RLS policies should resolve all the issues you were experiencing.
