# Razorpay Integration Testing Guide

This guide will help you test the Razorpay payment integration thoroughly.

## 1. Prerequisites

Before testing, ensure you have:

- [ ] Razorpay test account set up
- [ ] Environment variables configured
- [ ] Database migration applied
- [ ] Webhook endpoint accessible

## 2. Environment Setup

### 2.1 Test Environment Variables

Add these to your `.env.local`:

```bash
# Test Mode
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_WEBHOOK_SECRET=your_test_webhook_secret
```

### 2.2 Test Cards

Use these test card numbers:

| Card Number         | Type | Expected Result              |
| ------------------- | ---- | ---------------------------- |
| 4111 1111 1111 1111 | Visa | Success                      |
| 4000 0000 0000 0002 | Visa | Failure                      |
| 4000 0000 0000 9995 | Visa | Failure (Insufficient funds) |
| 4000 0000 0000 9987 | Visa | Failure (Card declined)      |

**Test Details:**

- **CVV**: Any 3 digits (e.g., 123)
- **Expiry**: Any future date (e.g., 12/25)
- **Name**: Any name
- **3D Secure**: Use 123456 as OTP

## 3. Testing Steps

### 3.1 Basic Payment Flow Test

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Navigate to the example checkout page:**

   ```
   http://localhost:3000/example-checkout
   ```

3. **Test successful payment:**

   - Enter amount: ₹299.99
   - Add some notes
   - Click "Pay via Razorpay"
   - Use card: 4111 1111 1111 1111
   - Complete payment

4. **Verify success:**
   - Check browser console for success logs
   - Verify order appears in database
   - Check payment status is "paid"

### 3.2 Payment Failure Test

1. **Test payment failure:**
   - Use card: 4000 0000 0000 0002
   - Verify error handling
   - Check order status remains "pending"

### 3.3 Webhook Testing

1. **Set up webhook testing:**

   - Use ngrok or similar to expose local server
   - Configure webhook URL in Razorpay dashboard
   - Set webhook secret

2. **Test webhook events:**
   - Make a test payment
   - Check webhook logs in console
   - Verify order status updates

### 3.4 Integration with Existing Checkout

1. **Test in main checkout flow:**
   - Add items to cart
   - Proceed to checkout
   - Use RazorpayCheckoutButton component
   - Complete payment flow

## 4. API Endpoint Testing

### 4.1 Create Order API

```bash
curl -X POST http://localhost:3000/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "amountInRupees": 299.99,
    "currency": "INR",
    "notes": {
      "test": "true",
      "description": "Test order"
    }
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "order": {
    "id": "order_xxx",
    "amount": 29999,
    "currency": "INR",
    "receipt": "receipt_xxx"
  },
  "localOrderId": "local_order_id",
  "key": "rzp_test_xxx"
}
```

### 4.2 Verify Payment API

```bash
curl -X POST http://localhost:3000/api/razorpay/verify-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "razorpay_payment_id": "pay_xxx",
    "razorpay_order_id": "order_xxx",
    "razorpay_signature": "signature_xxx",
    "localOrderId": "local_order_id"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

### 4.3 Webhook API

```bash
curl -X POST http://localhost:3000/api/razorpay/webhook \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: signature_xxx" \
  -d '{
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_xxx",
          "order_id": "order_xxx",
          "amount": 29999
        }
      }
    }
  }'
```

## 5. Database Verification

### 5.1 Check Order Records

```sql
-- Check orders with payment references
SELECT 
  o.id,
  o.order_number,
  o.payment_status,
  o.total_amount,
  o.latest_payment_id,
  p.razorpay_order_id,
  p.razorpay_payment_id,
  p.amount as paid_amount,
  o.created_at
FROM orders o
LEFT JOIN payments p ON o.latest_payment_id = p.id
WHERE p.razorpay_order_id IS NOT NULL
ORDER BY o.created_at DESC
LIMIT 10;
```

### 5.2 Verify Payment Status Updates

```sql
-- Check payment status distribution
SELECT 
  payment_status,
  COUNT(*) as count
FROM payments 
GROUP BY payment_status;

-- Check orders with payment status
SELECT 
  o.payment_status,
  COUNT(*) as count
FROM orders o
LEFT JOIN payments p ON o.latest_payment_id = p.id
WHERE p.id IS NOT NULL
GROUP BY o.payment_status;
```

## 6. Error Scenarios Testing

### 6.1 Network Failures

- Disconnect internet during payment
- Test timeout scenarios
- Verify error handling

### 6.2 Invalid Signatures

- Test with wrong webhook secret
- Test with malformed signature
- Verify security measures

### 6.3 Duplicate Payments

- Test same order ID multiple times
- Verify idempotency
- Check database consistency

## 7. Performance Testing

### 7.1 Load Testing

- Test multiple concurrent payments
- Monitor API response times
- Check database performance

### 7.2 Memory Usage

- Monitor memory usage during payments
- Check for memory leaks
- Verify cleanup processes

## 8. Security Testing

### 8.1 Signature Verification

- Test with invalid signatures
- Verify HMAC validation
- Check secret key exposure

### 8.2 Authentication

- Test without authentication
- Verify user authorization
- Check order ownership

### 8.3 Input Validation

- Test with invalid amounts
- Test with malformed data
- Verify sanitization

## 9. Monitoring and Logging

### 9.1 Log Verification

Check these logs during testing:

```bash
# Payment creation
"create-order error:"

# Payment verification
"verify-payment error:"

# Webhook processing
"webhook error:"
"Processing webhook event:"
```

### 9.2 Error Tracking

Monitor for:

- Signature mismatches
- Database errors
- Network timeouts
- Invalid amounts

## 10. Production Readiness Checklist

Before going live:

- [ ] All test scenarios pass
- [ ] Error handling verified
- [ ] Security measures tested
- [ ] Performance acceptable
- [ ] Monitoring configured
- [ ] Backup procedures in place
- [ ] Support documentation ready
- [ ] Rollback plan prepared

## 11. Troubleshooting

### Common Issues:

1. **"Failed to load Razorpay SDK"**

   - Check internet connection
   - Verify script URL accessibility
   - Check browser console for errors

2. **"Signature mismatch"**

   - Verify environment variables
   - Check signature calculation
   - Ensure correct secret keys

3. **"Order not found"**

   - Check database connection
   - Verify order creation
   - Check user authentication

4. **"Webhook not receiving events"**
   - Verify webhook URL
   - Check webhook secret
   - Ensure endpoint returns 200

### Debug Commands:

```bash
# Check environment variables
echo $RAZORPAY_KEY_ID
echo $RAZORPAY_KEY_SECRET

# Test database connection
npm run db:test

# Check webhook endpoint
curl -X GET http://localhost:3000/api/razorpay/webhook
```

## 12. Support

For issues:

1. Check browser console for errors
2. Review server logs
3. Verify environment configuration
4. Test with Razorpay's test mode
5. Contact support with error details
