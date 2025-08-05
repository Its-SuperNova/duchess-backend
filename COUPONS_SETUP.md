# Coupons Management Setup

This document explains how to set up and use the coupons management functionality in the Duchess Pastries admin panel.

## Database Setup

### 1. Create the Coupons Table

Run the following SQL in your Supabase SQL editor:

```sql
-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('flat', 'percentage')),
    value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    max_discount_cap DECIMAL(10, 2),
    usage_limit INTEGER,
    usage_per_user INTEGER NOT NULL DEFAULT 1,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    applicable_categories TEXT [],
    is_active BOOLEAN NOT NULL DEFAULT true,
    total_redemptions INTEGER NOT NULL DEFAULT 0,
    total_revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON coupons(valid_until);

-- Enable Row Level Security (RLS)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations" ON coupons
FOR ALL
USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## API Endpoints

### GET /api/coupons

Fetch all coupons ordered by creation date.

**Response:**

```json
[
  {
    "id": "uuid",
    "code": "SUMMER20",
    "type": "percentage",
    "value": 20.0,
    "min_order_amount": 100.0,
    "max_discount_cap": 50.0,
    "usage_limit": 100,
    "usage_per_user": 1,
    "valid_from": "2024-01-01T00:00:00Z",
    "valid_until": "2024-12-31T23:59:59Z",
    "applicable_categories": ["1", "2"],
    "is_active": true,
    "total_redemptions": 25,
    "total_revenue": 1250.0,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST /api/coupons

Create a new coupon.

**Request Body:**

```json
{
  "code": "SUMMER20",
  "type": "percentage",
  "value": 20,
  "minOrderAmount": 100,
  "maxDiscountCap": 50,
  "usageLimit": 100,
  "usagePerUser": 1,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "applicableCategories": ["1", "2"],
  "isActive": true
}
```

### GET /api/coupons/[id]

Fetch a specific coupon by ID.

### PUT /api/coupons/[id]

Update an existing coupon.

**Request Body:** Same as POST

### DELETE /api/coupons/[id]

Delete a coupon.

## Admin Panel Features

The admin panel provides a comprehensive interface for managing coupons:

- **All Coupons Tab**: View all existing coupons in a table format with search and filter functionality
- **Create Coupon Page**: Dedicated page for creating new coupons with all necessary fields (`/admin/coupons/create`)
- **Edit Coupon Page**: Dedicated page for editing existing coupons (`/admin/coupons/edit/[id]`)
- **Analytics Tab**: Overview of coupon performance and statistics
- **Delete**: Action available for each coupon in the table

## Usage Examples

### Creating a Coupon

1. Navigate to `/admin/coupons`
2. Click "Add Coupon" button
3. Fill in the form fields:
   - **Coupon Code**: Unique identifier (e.g., "SUMMER20")
   - **Discount Type**: Percentage or Flat Amount
   - **Discount Value**: The discount amount
   - **Minimum Order Amount**: Minimum cart value required
   - **Maximum Discount Cap**: For percentage discounts (optional)
   - **Usage Limits**: Total and per-user limits
   - **Valid Period**: Start and end dates
   - **Applicable Categories**: Product categories (optional)
   - **Status**: Active/Inactive
4. Click "Create Coupon"

### Editing a Coupon

1. Navigate to `/admin/coupons`
2. Click the "Edit" action for the desired coupon
3. Modify the fields as needed
4. Click "Update Coupon"

### Deleting a Coupon

1. Navigate to `/admin/coupons`
2. Click the "Delete" action for the desired coupon
3. Confirm the deletion

## Frontend Integration

The coupons system is integrated with the admin panel using:

- **React Hook Form**: For form management and validation
- **Zod**: For schema validation
- **Shadcn UI**: For consistent UI components
- **Date-fns**: For date formatting and manipulation
- **Sonner**: For toast notifications

## Security Considerations

- **Row Level Security (RLS)**: Enabled on the coupons table
- **Admin Client**: Uses service role key for admin operations
- **Input Validation**: All inputs are validated using Zod schemas
- **Duplicate Prevention**: Coupon codes must be unique

## Error Handling

The system includes comprehensive error handling:

- **Validation Errors**: Form-level validation with user-friendly messages
- **API Errors**: Proper HTTP status codes and error messages
- **Database Errors**: Graceful handling of database constraints
- **Network Errors**: Retry mechanisms and fallback options

## Testing

Use the provided test script to verify functionality:

```bash
node scripts/test-coupons.js
```

This script tests:

- Creating coupons
- Fetching coupons
- Updating coupons
- Deleting coupons
- Duplicate code prevention

## Maintenance

### Regular Tasks

- Monitor coupon usage and performance
- Clean up expired coupons
- Review and update applicable categories
- Backup coupon data regularly

### Performance Optimization

- Indexes are created on frequently queried columns
- Pagination for large coupon lists
- Efficient date range queries

## Troubleshooting

### Common Issues

1. **"Missing required fields" error**

   - Ensure all required fields are filled
   - Check date format (ISO string)
   - Verify field names match the API expectations

2. **"Coupon code already exists" error**

   - Use a unique coupon code
   - Check for case sensitivity

3. **RLS policy violations**

   - Ensure admin client is being used
   - Check RLS policies are properly configured

4. **Date validation errors**
   - Ensure valid_from is before valid_until
   - Use proper date format

### Debug Steps

1. Check browser console for errors
2. Verify API endpoint responses
3. Check database logs
4. Validate form data before submission

## Future Enhancements

Potential improvements for the coupons system:

- **Bulk Operations**: Import/export coupons
- **Advanced Analytics**: Detailed performance metrics
- **Automated Expiration**: Automatic deactivation of expired coupons
- **Coupon Templates**: Predefined coupon configurations
- **Integration**: Connect with email marketing and social media
- **A/B Testing**: Test different coupon strategies
- **Customer Segmentation**: Target specific customer groups
