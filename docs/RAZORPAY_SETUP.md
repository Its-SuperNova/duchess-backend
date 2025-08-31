# Razorpay Integration Setup Guide

This guide will help you set up Razorpay payment integration for Duchess Pastry.

## 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_test_key_id_here
RAZORPAY_KEY_SECRET=your_test_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_test_key_id_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### For Production:

```bash
# Production Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_your_live_key_id_here
RAZORPAY_KEY_SECRET=your_live_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_live_key_id_here
RAZORPAY_WEBHOOK_SECRET=your_production_webhook_secret_here
```

## 2. Razorpay Dashboard Configuration

### 2.1 Get API Keys

1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** → **API Keys**
3. Generate a new key pair
4. Copy the **Key ID** and **Key Secret**

### 2.2 Configure Webhooks

1. Go to **Settings** → **Webhooks**
2. Click **Add New Webhook**
3. Set the webhook URL: `https://yourdomain.com/api/razorpay/webhook`
4. Select the following events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
   - `refund.processed`
   - `refund.failed`
5. Copy the **Webhook Secret** and add it to your environment variables

## 3. Database Migration

Run the following SQL migration to add Razorpay fields to your orders table:

```sql
-- Add Razorpay payment fields
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_refund_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS receipt VARCHAR(255);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
```

## 4. Testing

### 4.1 Test Mode

- Use test API keys for development
- Test with Razorpay's test cards:
  - **Success**: 4111 1111 1111 1111
  - **Failure**: 4000 0000 0000 0002
  - **CVV**: Any 3 digits
  - **Expiry**: Any future date

### 4.2 Test Webhooks

1. Use Razorpay's webhook testing tool
2. Send test events to your webhook endpoint
3. Check logs for successful processing

## 5. Production Checklist

Before going live:

- [ ] Switch to live API keys
- [ ] Update webhook URL to production domain
- [ ] Test complete payment flow in live mode
- [ ] Verify webhook signature validation
- [ ] Set up monitoring and logging
- [ ] Configure error handling and retries
- [ ] Test refund functionality
- [ ] Set up payment failure notifications

## 6. Security Best Practices

1. **Never expose secrets**: Keep `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` server-side only
2. **Always verify signatures**: Verify both payment and webhook signatures
3. **Use HTTPS**: Ensure all API calls use HTTPS in production
4. **Validate amounts**: Double-check payment amounts on server-side
5. **Handle failures gracefully**: Implement proper error handling and user feedback

## 7. Common Issues & Troubleshooting

### Signature Mismatch

- Ensure you're using the correct secret key
- Verify the signature string format: `order_id|payment_id`
- Check for extra whitespace or encoding issues

### Webhook Not Receiving Events

- Verify webhook URL is accessible
- Check webhook secret configuration
- Ensure webhook endpoint returns 200 status

### Payment Verification Fails

- Verify API keys are correct
- Check if order exists in database
- Ensure user authentication is working

### Amount Mismatch

- Remember to convert rupees to paise (multiply by 100)
- Verify amount consistency between client and server

## 8. Support

For Razorpay-specific issues:

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)

For application-specific issues:

- Check server logs for detailed error messages
- Verify environment variable configuration
- Test with Razorpay's test mode first
