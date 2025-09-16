# Razorpay Payment Gateway Integration

This document explains the Razorpay payment gateway integration implemented in the Duchess Pastries project.

## Overview

The integration replaces the dummy payment gateway with a real Razorpay payment flow that includes:

- Order creation
- Payment verification
- Webhook handling
- Success/failure flow management

## Environment Variables

Make sure you have the following environment variables set in your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

## API Endpoints

### 1. Create Razorpay Order

- **Route**: `POST /api/payment/order`
- **Input**: `{ amount, currency = "INR", checkoutId }`
- **Output**: Razorpay order object with `id`, `amount`, `currency`

### 2. Verify Payment

- **Route**: `POST /api/payment/verify`
- **Input**: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, checkoutId }`
- **Output**: `{ success: true, orderId }` or `{ success: false }`

### 3. Webhook Handler

- **Route**: `POST /api/payment/webhook`
- **Purpose**: Handles Razorpay webhook events for payment status updates

## Payment Flow

1. **User clicks "Pay"** on checkout page
2. **Order Creation**: Frontend calls `/api/payment/order` with amount and checkoutId
3. **Razorpay Checkout**: Opens Razorpay payment modal with order details
4. **Payment Processing**: User completes payment on Razorpay
5. **Payment Verification**: Frontend calls `/api/payment/verify` with payment details
6. **Order Creation**: If verification succeeds, order is created in database
7. **Success Flow**: User is redirected to confirmation page

## Security Features

- **Amount Validation**: Server validates amount against checkout session
- **Signature Verification**: All payments are verified using HMAC signatures
- **Webhook Validation**: Webhook requests are validated using signature
- **Idempotency**: Prevents duplicate order creation
- **Session Management**: Checkout sessions are properly managed and expired

## Components

### RazorpayCheckout Component

- **File**: `components/razorpay-checkout.tsx`
- **Purpose**: Handles Razorpay script loading and payment initialization
- **Props**: `amount`, `currency`, `checkoutId`, `userDetails`, `onSuccess`, `onFailure`, `onClose`

## Database Integration

The integration works with the existing checkout session system:

- Checkout sessions store Razorpay order IDs and payment status
- Orders are created in the database after successful payment verification
- Payment status is tracked throughout the flow

## Error Handling

- **Network Errors**: Graceful handling of API failures
- **Payment Failures**: User-friendly error messages
- **Validation Errors**: Proper error responses for invalid data
- **Timeout Handling**: Automatic cleanup of failed payments

## Testing

To test the integration:

1. **Development Mode**: Use Razorpay test keys
2. **Test Cards**: Use Razorpay's test card numbers
3. **Webhook Testing**: Use ngrok or similar tools for local webhook testing

## Production Deployment

Before going live:

1. **Switch to Live Keys**: Update environment variables with live Razorpay keys
2. **Webhook URL**: Configure webhook URL in Razorpay dashboard
3. **SSL Certificate**: Ensure your domain has valid SSL certificate
4. **Error Monitoring**: Set up proper error monitoring and logging

## Troubleshooting

### Common Issues

1. **"Payment service configuration error"**

   - Check if all Razorpay environment variables are set

2. **"Invalid payment signature"**

   - Verify RAZORPAY_KEY_SECRET is correct
   - Check if payment data is being tampered with

3. **"Checkout session not found"**

   - Session may have expired (30 minutes)
   - Check if checkoutId is valid

4. **Webhook not working**
   - Verify webhook URL is accessible
   - Check RAZORPAY_WEBHOOK_SECRET is correct
   - Ensure webhook events are enabled in Razorpay dashboard

## Support

For issues related to:

- **Razorpay Integration**: Check Razorpay documentation
- **Application Logic**: Review the implementation in the API routes
- **Database Issues**: Check checkout session and order creation logic
