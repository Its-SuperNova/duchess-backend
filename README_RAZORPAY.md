# Razorpay Integration for Duchess Pastry

A complete, production-ready Razorpay payment integration for the Duchess Pastry e-commerce platform.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install razorpay
```

### 2. Set Environment Variables

Add to your `.env.local`:

```bash
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Run Database Migration

Execute the SQL in `database/razorpay-migration.sql`

### 4. Test the Integration

```bash
npm run dev
# Navigate to http://localhost:3000/test-razorpay
```

## 📁 File Structure

```
├── app/api/razorpay/
│   ├── create-order/route.ts      # Create Razorpay orders
│   ├── verify-payment/route.ts    # Verify payment signatures
│   └── webhook/route.ts           # Handle webhook events
├── app/api/payments/
│   └── [orderId]/route.ts         # Fetch payment information
├── components/
│   ├── CheckoutRazorpay.tsx       # Standalone checkout component
│   ├── RazorpayCheckoutButton.tsx # Integration-ready button
│   └── ExampleCheckout.tsx        # Example usage
├── app/test-razorpay/
│   └── page.tsx                   # Test page
├── database/
│   └── razorpay-migration.sql     # Database schema updates
├── lib/
│   └── payment-utils.ts           # Payment utility functions
├── docs/
│   ├── RAZORPAY_SETUP.md          # Setup guide
│   └── RAZORPAY_TESTING.md        # Testing guide
└── types/database.d.ts            # Updated type definitions
```

## 🔧 API Endpoints

### 1. Create Order

**POST** `/api/razorpay/create-order`

```json
{
  "amountInRupees": 299.99,
  "currency": "INR",
  "notes": { "description": "Test order" }
}
```

### 2. Verify Payment

**POST** `/api/razorpay/verify-payment`

```json
{
  "razorpay_payment_id": "pay_xxx",
  "razorpay_order_id": "order_xxx",
  "razorpay_signature": "signature_xxx",
  "localOrderId": "local_order_id"
}
```

### 3. Webhook Handler

**POST** `/api/razorpay/webhook`
Handles: `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`, `refund.failed`

### 4. Get Payment Information

**GET** `/api/payments/[orderId]`

```json
{
  "success": true,
  "payments": [
    {
      "id": "payment_id",
      "order_id": "order_id",
      "razorpay_order_id": "order_xxx",
      "razorpay_payment_id": "pay_xxx",
      "amount": 299.99,
      "payment_status": "captured",
      "signature_verified": true,
      "webhook_received": true
    }
  ],
  "count": 1
}
```

## 🎯 Components

### CheckoutRazorpay

Standalone component for simple payment flows:

```tsx
<CheckoutRazorpay
  amountInRupees={299.99}
  onSuccess={(payload) => console.log("Success:", payload)}
  onFailure={(error) => console.error("Failed:", error)}
/>
```

### RazorpayCheckoutButton

Integration-ready button for existing checkout flows:

```tsx
<RazorpayCheckoutButton
  amountInRupees={totalAmount}
  orderData={completeOrderData}
  onSuccess={(orderId) => router.push(`/confirmation/${orderId}`)}
  onFailure={(error) => toast.error("Payment failed")}
>
  Pay ₹{totalAmount}
</RazorpayCheckoutButton>
```

## 🔒 Security Features

- **Server-side signature verification** using HMAC SHA256
- **Webhook signature validation** for all events
- **User authentication** required for all endpoints
- **Order ownership verification** to prevent unauthorized access
- **Environment variable protection** - secrets never exposed to client

## 🗄️ Database Schema

### Payments Table
A separate `payments` table stores all payment information:
- `id` - Unique payment identifier
- `order_id` - Reference to the order
- `razorpay_order_id` - Razorpay order identifier
- `razorpay_payment_id` - Razorpay payment identifier
- `razorpay_refund_id` - Razorpay refund identifier
- `amount` - Payment amount
- `currency` - Payment currency (default: INR)
- `payment_status` - Current status (pending, captured, failed, refunded)
- `payment_method` - Payment method (default: razorpay)
- `receipt` - Razorpay receipt number
- `signature_verified` - Whether payment signature was verified
- `webhook_received` - Whether webhook was received
- `notes` - Additional payment notes (JSONB)
- `created_at` / `updated_at` - Timestamps

### Orders Table Updates
- `latest_payment_id` - Reference to the most recent payment
- Removed direct Razorpay fields (now stored in payments table)

## 🧪 Testing

### Test Cards

- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test Page

Visit `/test-razorpay` for interactive testing with:

- Payment flow testing
- Success/failure scenarios
- Real-time feedback
- API endpoint information

## 🔄 Payment Flow

1. **Client** → Creates order via `/api/razorpay/create-order`
2. **Server** → Creates Razorpay order + saves to database
3. **Client** → Opens Razorpay checkout popup
4. **User** → Completes payment in Razorpay
5. **Client** → Sends payment data to `/api/razorpay/verify-payment`
6. **Server** → Verifies signature + updates order status
7. **Razorpay** → Sends webhook events (backup/async updates)

## 🚨 Error Handling

- **Network failures**: Graceful degradation with user feedback
- **Signature mismatches**: Detailed logging and security alerts
- **Database errors**: Transaction rollback and error reporting
- **Invalid amounts**: Server-side validation and rejection
- **Authentication failures**: Clear unauthorized responses

## 📊 Monitoring

### Logs to Monitor

- `"create-order error:"` - Order creation failures
- `"verify-payment error:"` - Payment verification issues
- `"webhook error:"` - Webhook processing problems
- `"Signature mismatch"` - Security alerts

### Key Metrics

- Payment success rate
- Webhook delivery success
- Average response times
- Error rates by endpoint

## 🚀 Production Checklist

- [ ] Switch to live API keys
- [ ] Configure production webhook URL
- [ ] Set up monitoring and alerting
- [ ] Test complete payment flow
- [ ] Verify webhook signature validation
- [ ] Implement retry mechanisms
- [ ] Set up backup procedures
- [ ] Document support procedures

## 🔧 Configuration

### Razorpay Dashboard Setup

1. **API Keys**: Generate in Settings → API Keys
2. **Webhooks**: Configure in Settings → Webhooks
   - URL: `https://yourdomain.com/api/razorpay/webhook`
   - Events: `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`, `refund.failed`
3. **Webhook Secret**: Copy and add to environment variables

### Environment Variables

```bash
# Development
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=test_secret_xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_WEBHOOK_SECRET=webhook_secret_xxx

# Production
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=live_secret_xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_WEBHOOK_SECRET=prod_webhook_secret_xxx
```

## 🆘 Troubleshooting

### Common Issues

1. **"Failed to load Razorpay SDK"**

   - Check internet connection
   - Verify script URL accessibility

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

### Debug Commands

```bash
# Check environment variables
echo $RAZORPAY_KEY_ID
echo $RAZORPAY_KEY_SECRET

# Test webhook endpoint
curl -X GET http://localhost:3000/api/razorpay/webhook

# Check database
npm run db:migrate
```

## 📚 Documentation

- [Setup Guide](docs/RAZORPAY_SETUP.md) - Complete setup instructions
- [Testing Guide](docs/RAZORPAY_TESTING.md) - Comprehensive testing procedures
- [Razorpay Docs](https://razorpay.com/docs/) - Official Razorpay documentation

## 🤝 Support

For issues:

1. Check browser console for errors
2. Review server logs
3. Verify environment configuration
4. Test with Razorpay's test mode
5. Contact support with error details

---

**Note**: This integration follows Razorpay's best practices and includes comprehensive error handling, security measures, and testing procedures for production use.
