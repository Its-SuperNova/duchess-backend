# Orders Table Structure & Test Data Guide
## 📋 **Complete Orders Table Schema**
### **Required Fields:**
- `user_id` (string) - Foreign key to users table - `order_number` (string) - Unique order identifier (e.g., "ORD-001") - `status` - Order status enum - `payment_status` - Payment status enum - `item_total` (number) - Total of all items - `delivery_charge` (number) - Delivery fee - `discount_amount` (number) - Discount applied - `cgst` (number) - CGST tax amount - `sgst` (number) - SGST tax amount - `total_amount` (number) - Final total - `contact_name` (string) - Customer name - `contact_number` (string) - Customer phone - `payment_method` - Payment method enum - `delivery_timing` (string) -
When to deliver - `created_at` (timestamp) - Order creation date ### **Enum Values:**
* * status: * * - `pending` - `confirmed` - `preparing` - `ready` - `out_for_delivery` - `delivered` - `cancelled` * * payment_status: * * - `pending` - `paid` ✅ (Use this for analytics to show revenue) - `failed` - `refunded` - `partially_paid` * * payment_method: * * - `online` - `cod` - `card` - `upi` - `wallet` ---
## 🧪 **SQL Test Data for Dashboard Analytics**
### **Test Data for October 2024:**
```sql
-- Test Order 1: October 5, 2024 - ₹500
INSERT INTO orders (
  user_id,
  order_number,
  status,
  payment_status,
  item_total,
  delivery_charge,
  discount_amount,
  cgst,
  sgst,
  total_amount,
  contact_name,
  contact_number,
  payment_method,
  delivery_timing,
  created_at
) VALUES (
  'your-user-id-here',  -- Replace with actual user_id from users table
  'TEST-OCT-001',
  'delivered',
  'paid',
  450.00,
  50.00,
  0.00,
  0.00,
  0.00,
  500.00,
  'Test Customer 1',
  '9876543210',
  'online',
  'immediate',
  '2024-10-05 10:30:00'
);

-- Test Order 2: October 9, 2024 - ₹1,371.60
INSERT INTO orders (
  user_id,
  order_number,
  status,
  payment_status,
  item_total,
  delivery_charge,
  discount_amount,
  cgst,
  sgst,
  total_amount,
  contact_name,
  contact_number,
  payment_method,
  delivery_timing,
  created_at
) VALUES (
  'your-user-id-here',
  'TEST-OCT-002',
  'delivered',
  'paid',
  1250.00,
  121.60,
  0.00,
  0.00,
  0.00,
  1371.60,
  'Test Customer 2',
  '9876543211',
  'online',
  'immediate',
  '2024-10-09 14:15:00'
);

-- Test Order 3: October 10, 2024 - ₹750
INSERT INTO orders (
  user_id,
  order_number,
  status,
  payment_status,
  item_total,
  delivery_charge,
  discount_amount,
  cgst,
  sgst,
  total_amount,
  contact_name,
  contact_number,
  payment_method,
  delivery_timing,
  created_at
) VALUES (
  'your-user-id-here',
  'TEST-OCT-003',
  'delivered',
  'paid',
  700.00,
  50.00,
  0.00,
  0.00,
  0.00,
  750.00,
  'Test Customer 3',
  '9876543212',
  'cod',
  'schedule',
  '2024-10-10 16:45:00'
);

-- Test Order 4: October 12, 2024 - ₹2,000
INSERT INTO orders (
  user_id,
  order_number,
  status,
  payment_status,
  item_total,
  delivery_charge,
  discount_amount,
  cgst,
  sgst,
  total_amount,
  contact_name,
  contact_number,
  payment_method,
  delivery_timing,
  created_at
) VALUES (
  'your-user-id-here',
  'TEST-OCT-004',
  'delivered',
  'paid',
  1850.00,
  150.00,
  0.00,
  0.00,
  0.00,
  2000.00,
  'Test Customer 4',
  '9876543213',
  'upi',
  'immediate',
  '2024-10-12 11:20:00'
);

-- Test Order 5: October 15, 2024 - ₹1,200
INSERT INTO orders (
  user_id,
  order_number,
  status,
  payment_status,
  item_total,
  delivery_charge,
  discount_amount,
  cgst,
  sgst,
  total_amount,
  contact_name,
  contact_number,
  payment_method,
  delivery_timing,
  created_at
) VALUES (
  'your-user-id-here',
  'TEST-OCT-005',
  'preparing',
  'paid',
  1100.00,
  100.00,
  0.00,
  0.00,
  0.00,
  1200.00,
  'Test Customer 5',
  '9876543214',
  'online',
  'schedule',
  '2024-10-15 09:00:00'
);
``` ---
## 📝 **How to Use This Data:**
### **Step 1: Get a Valid User ID**
```sql
-- Find an existing user ID
SELECT id, email FROM users LIMIT 1;
``` ### **Step 2: Replace `your-user-id-here`**
Copy the `id`
from Step 1
    and replace all instances of `your-user-id-here` in the
INSERT statements.### **Step 3: Run the INSERT Statements**
    Execute the SQL statements in your Supabase SQL Editor
    or database client.### **Step 4: Verify Data**
    ```sql
-- Check inserted orders
SELECT 
  order_number,
  total_amount,
  payment_status,
  status,
  created_at
FROM orders
WHERE order_number LIKE 'TEST-OCT-%'
ORDER BY created_at;
``` ---
    ## 📊 **Expected Dashboard Results:**
After inserting this test data
    and selecting "Monthly" filter: ### **Orders Chart:**
    - Oct 5: 1 order - Oct 9: 1 order - Oct 10: 1 order - Oct 12: 1 order - Oct 15: 1 order * * Total: 5 orders * * ### **Revenue Chart:**
    - Oct 5: ₹ 500 - Oct 9: ₹ 1,
    371.60 - Oct 10: ₹ 750 - Oct 12: ₹ 2,
    000 - Oct 15: ₹ 1,
    200 * * Total: ₹ 5,
    821.60 * * ### **Summary Cards:**
    - Total Orders: 5 - Total Revenue: ₹ 5,
    821.60 - Reviews & Feedback: 47 (static) - Total Users: (depends on existing data) ---
    ## 🎯 **Important Notes:**
    1.* * Payment Status = "paid" * *: Only orders with `payment_status = 'paid'` show up in revenue 2.* * Created At Format * *: Use format `YYYY-MM-DD HH:MM:SS` for dates 3.* * Order Number * *: Must be unique across all orders 4.* * Total Amount * *: Should equal `item_total + delivery_charge - discount_amount + cgst + sgst` 5.* * User ID * *: Must exist in the `users` table (foreign key constraint) ---
    ## 🔍 **Optional: Cleanup Test Data**
    ```sql
-- Remove all test orders when done testing
DELETE FROM orders 
WHERE order_number LIKE 'TEST-OCT-%';
```