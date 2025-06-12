# Role-Based Access Control Setup

This guide explains how to set up and use role-based access control for the admin panel.

## Overview

The role-based access control system allows you to restrict access to admin pages based on user roles. There are three roles available:

- **user**: Regular users (default)
- **moderator**: Users with limited admin privileges
- **admin**: Full admin access

## Setup Instructions

### Step 1: Add Role Column to Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `add-role-column.sql`
4. Click **Run** to execute the SQL

This will:

- Add a `role` column to the `users` table
- Set default role to 'user' for all users
- Add a constraint to ensure only valid roles are used
- Create an index for better performance

### Step 2: Get Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (starts with `eyJ...`)
4. Add it to your `.env.local` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important**: Keep this key secure and never expose it in client-side code.

### Step 3: Set Up Admin User

After a user has signed in at least once, you can promote them to admin:

```bash
node scripts/setup-admin.js user@example.com
```

Replace `user@example.com` with the email of the user you want to promote.

### Step 4: Test the Setup

1. Start your development server: `npm run dev`
2. Try accessing `/admin` with a regular user account - you should see an "Access Denied" page
3. Sign in with the admin account and try accessing `/admin` - you should see the admin dashboard

## How It Works

### RoleGuard Component

The `RoleGuard` component protects admin routes by:

1. Checking if the user is authenticated
2. Fetching the user's role from the database
3. Comparing the user's role with the required role
4. Showing an access denied page if the user doesn't have permission

### Middleware Protection

The middleware provides an additional layer of protection by:

1. Redirecting unauthenticated users to the login page
2. Allowing only authenticated users to access admin routes
3. Logging admin route access for monitoring

### Database Schema

The `users` table now includes:

```sql
role VARCHAR(20) DEFAULT 'user' NOT NULL
```

With a constraint ensuring only valid roles:

```sql
CHECK (role IN ('user', 'admin', 'moderator'))
```

## Usage Examples

### Protecting Admin Routes

```tsx
import RoleGuard from "@/components/auth/role-guard";

export default function AdminPage() {
  return (
    <RoleGuard requiredRole="admin">
      <div>Admin content here</div>
    </RoleGuard>
  );
}
```

### Protecting Moderator Routes

```tsx
import RoleGuard from "@/components/auth/role-guard";

export default function ModeratorPage() {
  return (
    <RoleGuard requiredRole="moderator">
      <div>Moderator content here</div>
    </RoleGuard>
  );
}
```

### Custom Fallback

```tsx
import RoleGuard from "@/components/auth/role-guard";

export default function AdminPage() {
  return (
    <RoleGuard
      requiredRole="admin"
      fallback={<div>Custom access denied message</div>}
    >
      <div>Admin content here</div>
    </RoleGuard>
  );
}
```

## Utility Functions

### Check User Role

```typescript
import { getUserRole } from "@/lib/auth-utils";

const role = await getUserRole("user@example.com");
// Returns: 'user' | 'admin' | 'moderator' | null
```

### Check Admin Status

```typescript
import { isUserAdmin } from "@/lib/auth-utils";

const isAdmin = await isUserAdmin("user@example.com");
// Returns: boolean
```

### Check Moderator Status

```typescript
import { isUserModerator } from "@/lib/auth-utils";

const isModerator = await isUserModerator("user@example.com");
// Returns: boolean (true for both moderator and admin roles)
```

### Update User Role

```typescript
import { updateUserRole } from "@/lib/auth-utils";

const updatedUser = await updateUserRole("user@example.com", "admin");
// Returns: User object or null
```

## Security Considerations

1. **Service Role Key**: Never expose the service role key in client-side code
2. **Role Validation**: Always validate roles on both client and server side
3. **Database Constraints**: Use database constraints to prevent invalid roles
4. **Logging**: Monitor admin access for security purposes
5. **Session Management**: Ensure proper session handling and logout

## Troubleshooting

### User Not Found Error

If you get a "User not found" error when setting up admin:

1. Make sure the user has signed in at least once
2. Check that the email address is correct
3. Verify the user exists in the `users` table

### Access Denied for Admin User

If an admin user still gets access denied:

1. Check that the role was properly set in the database
2. Verify the user is properly authenticated
3. Check browser console for any errors
4. Ensure the RoleGuard component is working correctly

### Database Connection Issues

If you have database connection issues:

1. Verify your Supabase credentials are correct
2. Check that your Supabase project is active
3. Ensure you're using the correct service role key
4. Check your network connection

## Production Deployment

For production deployment:

1. Set up proper environment variables
2. Use the service role key only in server-side code
3. Implement proper error handling
4. Set up monitoring for admin access
5. Consider implementing audit logs for role changes
6. Use HTTPS for all admin routes
7. Implement rate limiting for admin endpoints
