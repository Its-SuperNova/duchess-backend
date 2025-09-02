# Mobile UPI Flow Optimization

## Problem Statement

When users click "Proceed to Payment" on mobile devices and choose Google Pay (or any UPI app), Razorpay redirects them from the browser to the GPay app. After completing the payment and returning to the browser, Razorpay gateway reloads itself and asks to pay again, resulting in poor UX.

## Root Cause

The issue occurs because:

1. **External App Navigation**: When users navigate to external UPI apps, Razorpay loses context
2. **Reload on Return**: Razorpay reloads the payment screen instead of recognizing completed payments
3. **Missing Payment Status Check**: No mechanism to verify if payment was completed in external app
4. **Mobile-Specific Issues**: Mobile browsers handle app switching differently than desktop

## Solution Implemented

### 1. Enhanced Razorpay Configuration

```typescript
// Mobile UPI optimization
config: {
  display: {
    blocks: {
      banks: {
        name: "Pay using UPI",
        instruments: [{ method: "upi" }]
      }
    },
    sequence: ["block.banks"],
    preferences: { show_default_blocks: false }
  }
},

// Prevent reload after external app navigation
retry: { enabled: false },
remember_customer: false,

// Mobile-specific settings
modal: {
  escape: false,        // Prevent accidental dismissal
  handleback: false,    // Prevent back button from closing modal
},

notes: {
  mobile_flow: "true",
  prevent_reload: "true"
}
```

### 2. Enhanced Event Handling

```typescript
// Handle external app navigation (UPI apps)
rzp.on("payment.razorpay_wallet_selected", function (resp: any) {
  console.log("External UPI app selected:", resp);
  // Don't close modal, let user complete payment in external app
});

// Handle when user returns from external app
rzp.on("payment.razorpay_wallet_dismissed", function (resp: any) {
  console.log("User returned from external UPI app:", resp);
  // Start polling to check payment status
  pollPaymentStatus(order.id, rzp);
});

// Handle modal close events
rzp.on("modal.close", function () {
  console.log("Razorpay modal closed");
  onClose?.();
});
```

### 3. Payment Status Polling

When users return from external UPI apps, the system automatically polls the payment status:

```typescript
const pollPaymentStatus = async (orderId: string, rzpInstance: any) => {
  let attempts = 0;
  const maxAttempts = 20; // Poll for 20 seconds

  const poll = async () => {
    attempts++;

    const response = await fetch("/api/razorpay/check-payment-status", {
      method: "POST",
      body: JSON.stringify({ razorpay_order_id: orderId }),
    });

    const data = await response.json();

    if (data.status === "success") {
      // Payment completed - close modal and trigger success
      rzpInstance.close();
      onSuccess?.(successData);
      return;
    }

    // Continue polling or stop after max attempts
  };

  // Poll every second
  const interval = setInterval(poll, 1000);
};
```

### 4. New API Endpoint

**`/api/razorpay/check-payment-status`**

Checks payment status when users return from external apps:

```typescript
export async function POST(request: NextRequest) {
  const { razorpay_order_id } = await request.json();

  // Check payment status in database
  const { data: paymentRecord } = await supabase
    .from("payments")
    .select("payment_status, order_id")
    .eq("razorpay_order_id", razorpay_order_id)
    .single();

  // Return appropriate status
  if (paymentRecord.payment_status === "captured") {
    return { status: "success", orderId: paymentRecord.order_id };
  } else if (paymentRecord.payment_status === "authorized") {
    return { status: "authorized", orderId: paymentRecord.order_id };
  }
  // ... other statuses
}
```

### 5. Enhanced Webhook Handling

Added support for `payment.authorized` event to track payment states:

```typescript
case "payment.authorized":
  await handlePaymentAuthorized(event.payload);
  break;

case "payment.captured":
  await handlePaymentCaptured(event.payload);
  break;
```

## Flow Diagram

```
User clicks "Proceed to Payment"
         ↓
Razorpay opens with UPI optimization
         ↓
User selects Google Pay/UPI app
         ↓
User navigates to external app
         ↓
Payment completed in external app
         ↓
User returns to browser
         ↓
Razorpay detects return (no reload)
         ↓
System starts payment status polling
         ↓
Payment status confirmed via webhook
         ↓
Success flow triggered automatically
         ↓
Order confirmation animation shown
         ↓
Redirect to confirmation page
```

## Key Benefits

1. **No More Reloads**: Razorpay stays in same state after external app navigation
2. **Automatic Detection**: System automatically detects completed payments
3. **Seamless UX**: Users don't see payment screen again
4. **Mobile Optimized**: Specifically designed for mobile UPI flows
5. **Fallback Handling**: Graceful handling of edge cases

## Testing

### Test Scenarios

1. **Normal UPI Flow**: Payment completes in Razorpay popup
2. **External App Flow**: Payment completes in Google Pay/PhonePe
3. **Interrupted Flow**: User cancels payment in external app
4. **Network Issues**: Poor connectivity during payment
5. **App Switching**: Multiple app switches during payment

### Expected Behavior

- ✅ No Razorpay reload after external app return
- ✅ Automatic payment status detection
- ✅ Seamless success flow transition
- ✅ Proper error handling for failed payments
- ✅ Consistent behavior across different UPI apps

## Configuration

### Environment Variables

Ensure these are set:

```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Database Schema

Ensure `payments` table has:

- `razorpay_order_id` (for payment lookup)
- `payment_status` (authorized, captured, failed)
- `webhook_received` (to track webhook processing)

## Troubleshooting

### Common Issues

1. **Polling Not Starting**: Check console for "Starting payment status polling" message
2. **Payment Status Unclear**: Check webhook logs and database records
3. **Modal Not Closing**: Verify `rzpInstance.close()` is called
4. **Success Not Triggered**: Check `onSuccess` callback implementation

### Debug Logs

Enable detailed logging to track the flow:

```typescript
console.log("External UPI app selected:", resp);
console.log("Starting payment status polling...");
console.log("Payment status response:", data);
```

## Future Enhancements

1. **Real-time Updates**: WebSocket-based payment status updates
2. **Smart Polling**: Adaptive polling intervals based on payment method
3. **Offline Support**: Handle network disconnections gracefully
4. **Analytics**: Track mobile UPI flow success rates
5. **A/B Testing**: Test different UPI app handling strategies
