# Razorpay Troubleshooting Guide

## Common Issues and Solutions

### 1. "Failed to load Razorpay SDK" Error

This error occurs when the Razorpay JavaScript SDK cannot be loaded from the CDN.

#### Possible Causes:

1. **Content Security Policy (CSP) Blocking**: The browser's CSP is blocking the Razorpay script
2. **Missing Environment Variables**: The Razorpay configuration is not set up
3. **Network Issues**: Internet connection problems or firewall blocking the CDN
4. **CDN Unavailable**: Razorpay's CDN is temporarily down
5. **Browser Issues**: Ad blockers or security extensions blocking the script

#### Solutions:

##### Step 1: Set Up Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Razorpay Configuration (Test Mode)
RAZORPAY_KEY_ID=rzp_test_your_test_key_id_here
RAZORPAY_KEY_SECRET=your_test_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_test_key_id_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

##### Step 2: Get Razorpay API Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up/Login to your account
3. Go to **Settings** → **API Keys**
4. Generate a new key pair
5. Copy the **Key ID** and **Key Secret**
6. Replace the placeholder values in your `.env.local` file

##### Step 3: Restart Development Server

After setting up environment variables:

```bash
npm run dev
```

##### Step 4: Test the Integration

1. Visit `http://localhost:3000/test-razorpay`
2. Try making a test payment
3. Check browser console for detailed error messages

##### Step 5: Fix Content Security Policy (CSP) Issues

If you see a CSP error like "Refused to load the script 'https://checkout.razorpay.com/v1/checkout.js'", the Next.js configuration needs to be updated:

1. **Restart the development server** after making CSP changes:

   ```bash
   npm run dev
   ```

2. **Clear browser cache** and reload the page

3. **Check the CSP configuration** in `next.config.mjs` - it should include:
   ```javascript
   "script-src-elem 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com *.gstatic.com blob: checkout.razorpay.com";
   "frame-src 'self' checkout.razorpay.com";
   "connect-src 'self' https://*.supabase.co https://*.googleapis.com https://*.razorpay.com";
   ```

#### Debugging Steps:

1. **Check Browser Console**: Open Developer Tools (F12) and look for:

   - Network errors when loading `https://checkout.razorpay.com/v1/checkout.js`
   - JavaScript errors in the console
   - Failed network requests

2. **Check Environment Variables**: Verify they are loaded correctly:

   ```javascript
   // In browser console
   console.log(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
   ```

3. **Test Network Connectivity**:

   ```bash
   # Test if Razorpay CDN is accessible
   curl -I https://checkout.razorpay.com/v1/checkout.js
   ```

4. **Check for Ad Blockers**: Disable ad blockers or security extensions temporarily

### 2. "Razorpay configuration is missing" Error

This error occurs when the `NEXT_PUBLIC_RAZORPAY_KEY_ID` environment variable is not set.

#### Solution:

1. Ensure `.env.local` file exists in project root
2. Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set correctly
3. Restart the development server
4. Clear browser cache and reload

### 3. "Failed to create order" Error

This error occurs when the server-side API fails to create a Razorpay order.

#### Possible Causes:

1. **Database Constraint Violations**: Missing required fields in the orders table
2. **Invalid API Keys**: Wrong or expired Razorpay credentials
3. **Database Issues**: Supabase connection problems
4. **Authentication Issues**: User not logged in
5. **Invalid Amount**: Amount is zero or negative

#### Solutions:

1. **Check Database Schema**: Ensure all required fields are provided in the order creation
2. **Verify API Keys**: Check that `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are correct
3. **Check Database**: Ensure Supabase is accessible and tables exist
4. **Verify Authentication**: Make sure user is logged in
5. **Check Amount**: Ensure amount is greater than 0

#### Common Database Errors:

- **`contact_name` constraint violation**: The orders table requires a contact_name field
- **`contact_number` constraint violation**: The orders table requires a contact_number field
- **`delivery_address_text` column not found**: Schema mismatch between TypeScript types and actual database
- **Missing required fields**: Check the database schema for all required fields

#### Schema Mismatch Issues:

If you see errors like "Could not find the 'column_name' column", it means the TypeScript types don't match the actual database schema:

1. **Check actual schema**: Run `npm run check:schema` to see what columns exist
2. **Update API code**: Remove fields that don't exist in the actual database
3. **Update TypeScript types**: Sync the types with the actual database schema

### 4. "Payment verification failed" Error

This error occurs after successful payment when server-side verification fails.

#### Possible Causes:

1. **Signature Mismatch**: Wrong webhook secret or signature calculation
2. **Database Issues**: Unable to update payment status
3. **Network Issues**: Failed to reach verification endpoint

#### Solutions:

1. **Check Webhook Secret**: Verify `RAZORPAY_WEBHOOK_SECRET` is correct
2. **Check Database**: Ensure payments table exists and is accessible
3. **Check Logs**: Look at server logs for detailed error messages

## Testing Checklist

Before reporting issues, verify:

- [ ] Environment variables are set correctly
- [ ] Development server is running (`npm run dev`)
- [ ] User is authenticated (logged in)
- [ ] Database migration has been run
- [ ] Browser console shows no JavaScript errors
- [ ] Network tab shows successful requests to Razorpay CDN
- [ ] Test with Razorpay test cards:
  - Success: `4111 1111 1111 1111`
  - Failure: `4000 0000 0000 0002`

## Getting Help

If you're still experiencing issues:

1. **Check the logs**: Look at browser console and server logs
2. **Verify setup**: Follow the setup guide step by step
3. **Test with minimal setup**: Try with just the basic integration
4. **Contact support**: Provide detailed error messages and steps to reproduce

## Environment Variables Reference

| Variable                      | Description                           | Required | Example                                   |
| ----------------------------- | ------------------------------------- | -------- | ----------------------------------------- |
| `RAZORPAY_KEY_ID`             | Server-side Razorpay Key ID           | Yes      | `rzp_test_1234567890`                     |
| `RAZORPAY_KEY_SECRET`         | Server-side Razorpay Key Secret       | Yes      | `test_secret_1234567890`                  |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client-side Razorpay Key ID           | Yes      | `rzp_test_1234567890`                     |
| `RAZORPAY_WEBHOOK_SECRET`     | Webhook signature verification secret | Yes      | `webhook_secret_1234567890`               |
| `NEXT_PUBLIC_SUPABASE_URL`    | Supabase project URL                  | Yes      | `https://xxx.supabase.co`                 |
| `SUPABASE_SERVICE_ROLE_KEY`   | Supabase service role key             | Yes      | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## Quick Fix Commands

```bash
# Restart development server
npm run dev

# Clear Next.js cache
rm -rf .next
npm run dev

# Check environment variables
node -e "console.log(require('dotenv').config({ path: '.env.local' }))"

# Run database migration
npm run db:migrate
```
