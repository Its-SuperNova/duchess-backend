# Address Management System Setup

This guide explains how to set up and use the address management system for the Duchess Pastries application.

## Features

✅ **Complete CRUD Operations**: Create, Read, Update, Delete addresses  
✅ **Default Address Management**: Set and manage default shipping addresses  
✅ **Database Integration**: Full Supabase integration with proper RLS policies  
✅ **User Authentication**: Secure access to user-specific addresses  
✅ **Modern UI**: Clean, responsive design with loading states  
✅ **Error Handling**: Comprehensive error handling and user feedback

## Database Setup

### 1. Create the Addresses Table

Run the SQL script in your Supabase SQL editor:

```sql
-- Copy and paste the contents of supabase-addresses-schema.sql
```

This will create:

- `addresses` table with proper schema
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates
- Function to ensure only one default address per user

### 2. Verify the Setup

After running the SQL script, verify that:

- The `addresses` table exists in your Supabase dashboard
- RLS policies are active
- Triggers are created

## File Structure

```
app/profile/addresses/
├── page.tsx                    # Main addresses listing page
├── new/
│   └── page.tsx               # Add new address form
└── edit/
    └── [id]/
        └── page.tsx           # Edit existing address form

lib/
├── address-utils.ts           # Address CRUD operations
└── supabase.ts               # Updated with Address types

supabase-addresses-schema.sql  # Database schema
```

## Usage

### For Users

1. **Access Address Management**:

   - Go to Profile page
   - Click "Manage Address" button
   - This takes you to `/profile/addresses`

2. **View Addresses**:

   - See all saved addresses
   - Default address is marked with a "Default" badge
   - Radio buttons to change default address

3. **Add New Address**:

   - Click "Add New Shipping Address" button
   - Fill in the form (Address Name, Street Address, City, State, ZIP Code)
   - Click "Save Address"

4. **Edit Address**:

   - Click the edit icon (pencil) next to any address
   - Modify the address details
   - Click "Update Address"

5. **Delete Address**:

   - Click the delete icon (trash) next to any address
   - Confirm deletion in the popup

6. **Set Default Address**:
   - Click the radio button next to any address
   - The selected address becomes the default

### For Developers

#### Database Operations

```typescript
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/address-utils";

// Get all addresses for a user
const addresses = await getUserAddresses(userId);

// Create a new address
const newAddress = await createAddress(userId, {
  address_name: "Home",
  full_address: "123 Main St",
  city: "New York",
  state: "NY",
  zip_code: "10001",
  is_default: false,
});

// Update an address
const updatedAddress = await updateAddress(addressId, {
  address_name: "Updated Home",
});

// Delete an address
const success = await deleteAddress(addressId);

// Set default address
const success = await setDefaultAddress(userId, addressId);
```

#### TypeScript Types

```typescript
import type { Address } from "@/lib/supabase";

interface Address {
  id: string;
  user_id: string;
  address_name: string;
  full_address: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
```

## Security Features

### Row Level Security (RLS)

The addresses table has RLS policies that ensure:

- Users can only view their own addresses
- Users can only create addresses for themselves
- Users can only update/delete their own addresses
- All operations require authentication

### Data Validation

- Form validation on both client and server side
- Required field validation
- Input sanitization
- Proper error handling and user feedback

## UI/UX Features

### Loading States

- Skeleton loading for address list
- Loading spinners for form submissions
- Disabled form inputs during operations

### Error Handling

- User-friendly error messages
- Network error handling
- Validation error display

### Responsive Design

- Mobile-first design
- Touch-friendly interface
- Consistent with app design system

## Integration Points

### Checkout Process

The address management system integrates with the checkout process:

- Users can select from saved addresses
- Default address is pre-selected
- Quick add address option during checkout

### Profile Management

- Addresses are part of the user profile
- Accessible from the main profile page
- Consistent navigation patterns

## Troubleshooting

### Common Issues

1. **Addresses not loading**:

   - Check if user is authenticated
   - Verify Supabase connection
   - Check browser console for errors

2. **Cannot save address**:

   - Verify all required fields are filled
   - Check network connection
   - Ensure user is logged in

3. **Database errors**:
   - Verify RLS policies are active
   - Check Supabase dashboard for table structure
   - Ensure proper user authentication

### Debug Mode

Enable debug logging by checking browser console for detailed error messages and API responses.

## Future Enhancements

Potential improvements for the address management system:

- [ ] Address validation using external APIs
- [ ] Bulk address import/export
- [ ] Address templates for common locations
- [ ] Integration with mapping services
- [ ] Address history and analytics
- [ ] Multi-language support for international addresses

## Issue: RLS Policy Violation

The error `new row violates row-level security policy for table "addresses"` occurs because the Row Level Security (RLS) policies in Supabase are configured for Supabase Auth, but you're using NextAuth.

## Solution

### Step 1: Run the RLS Fix Script

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `fix-supabase-rls.sql`
4. Run the script

### Step 2: Verify the Fix

After running the script, you should see:

- RLS disabled for the addresses table
- No policies listed for the addresses table
- Address creation should work without errors

### Step 3: Test Address Creation

1. Try creating a new address in your app
2. Check the browser console for any remaining errors
3. Verify the address is saved to the database

## Alternative: Secure RLS with NextAuth

If you want to keep RLS enabled for security, you can:

1. Use the service role key instead of the anon key
2. Create custom policies that work with NextAuth
3. Implement server-side address operations

## Troubleshooting

### If you still get 401 errors:

1. Check your environment variables
2. Verify your Supabase URL and keys
3. Ensure the user exists in the database

### If you get UUID errors:

1. Make sure the user is properly created in the database
2. Verify the user ID is being passed correctly
3. Check the database schema matches the code

## Security Note

Disabling RLS makes the addresses table accessible to all authenticated users. For production, consider implementing proper server-side validation and authorization.
