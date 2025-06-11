# Supabase Setup Guide

This guide will help you set up Supabase to store authenticated user data from Google OAuth.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A Supabase project created

## Step 1: Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 2: Update Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add the following variables:

```env
# Existing Google OAuth variables
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Add these new Supabase variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Create Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql` into the editor
4. Click **Run** to execute the SQL

This will create:

- A `users` table with proper schema
- Indexes for better performance
- Row Level Security (RLS) policies
- Automatic timestamp updates

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to your login page
3. Sign in with Google
4. Check the browser console for success/error messages
5. Verify in Supabase dashboard that user data is stored in the `users` table

## Database Schema

The `users` table has the following structure:

| Column        | Type      | Description                      |
| ------------- | --------- | -------------------------------- |
| `id`          | UUID      | Primary key, auto-generated      |
| `email`       | TEXT      | User's email (unique)            |
| `name`        | TEXT      | User's display name              |
| `image`       | TEXT      | Profile image URL (optional)     |
| `provider`    | TEXT      | OAuth provider (e.g., "google")  |
| `provider_id` | TEXT      | Provider's unique user ID        |
| `created_at`  | TIMESTAMP | When the record was created      |
| `updated_at`  | TIMESTAMP | When the record was last updated |

## Features

✅ **Automatic User Storage**: User data is automatically stored when they sign in with Google

✅ **Duplicate Prevention**: Uses email as unique key to prevent duplicate records

✅ **Upsert Logic**: Updates existing user data on repeated logins

✅ **Type Safety**: Full TypeScript support with proper interfaces

✅ **Error Handling**: Comprehensive error handling and logging

✅ **Security**: Row Level Security enabled for data protection

## Troubleshooting

### User data not being stored

- Check browser console for error messages
- Verify Supabase credentials are correct
- Ensure the `users` table exists in your Supabase project

### TypeScript errors

- Make sure all environment variables are properly set
- Check that the Supabase client is properly configured

### Database connection issues

- Verify your Supabase project is active
- Check that your IP is not blocked by Supabase
- Ensure you're using the correct project URL and API key
