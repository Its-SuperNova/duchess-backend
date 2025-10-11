# 🚀 Quick Start Guide - Test Data Setup

## Step 1: Get Your User ID

```sql
SELECT id, email FROM users LIMIT 1;
```

Copy the `id` value.

## Step 2: Replace in SQL File

Open `simple-test-orders.sql` (simplified version with only required fields) and replace all instances of:

- `YOUR_USER_ID_HERE` with your actual user ID

**Note**: If you got a column error, use `simple-test-orders.sql` instead of `complete-test-orders.sql`

## Step 3: Execute SQL

Run the SQL file in Supabase SQL Editor or your database client.

## Step 4: Verify

```sql
SELECT
  order_number,
  total_amount,
  DATE(created_at) as date
FROM orders
WHERE order_number LIKE 'TEST-2024-10-%'
ORDER BY created_at;
```

## 📊 Test Data Overview

### 8 Complete Test Orders for October 2024:

| Date   | Order #          | Amount    | Status    | Payment |
| ------ | ---------------- | --------- | --------- | ------- |
| Oct 5  | TEST-2024-10-001 | ₹500      | Delivered | Paid    |
| Oct 7  | TEST-2024-10-002 | ₹850      | Delivered | Paid    |
| Oct 9  | TEST-2024-10-003 | ₹1,371.60 | Delivered | Paid    |
| Oct 10 | TEST-2024-10-004 | ₹750      | Delivered | Paid    |
| Oct 12 | TEST-2024-10-005 | ₹2,000    | Delivered | Paid    |
| Oct 14 | TEST-2024-10-006 | ₹1,100    | Delivered | Paid    |
| Oct 15 | TEST-2024-10-007 | ₹1,200    | Preparing | Paid    |
| Oct 16 | TEST-2024-10-008 | ₹650      | Delivered | Paid    |

**Total Orders**: 8
**Total Revenue**: ₹8,421.60
**Average Order**: ₹1,052.70

## 🎯 Expected Dashboard Results

### With "Monthly" Filter Selected:

**Orders Chart**: Will show 8 data points across different dates
**Revenue Chart**: Will show ₹8,421.60 total with daily breakdown
**Summary Cards**:

- Total Orders: 8
- Total Revenue: ₹8,421.60

## 🧹 Cleanup After Testing

```sql
DELETE FROM orders WHERE order_number LIKE 'TEST-2024-10-%';
```

## ✅ All Fields Included

- Contact information
- Delivery addresses
- Payment details
- Special requests (knife, candle, card text)
- Timestamps
- Ratings and feedback
- Delivery zones
- And more!
