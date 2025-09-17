# Payment Flow Deployment Runbook

## 🚀 Deployment Guide for Bulletproof Razorpay Integration

### Pre-Deployment Checklist

#### 1. Environment Variables

Ensure these are set in production:

```env
RAZORPAY_KEY_ID=your_live_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_live_key_id
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

#### 2. Razorpay Dashboard Configuration

- [ ] Webhook URL configured: `https://yourdomain.com/api/payment/webhook`
- [ ] Webhook events enabled: `payment.captured`, `payment.failed`
- [ ] Test with live keys in staging environment

#### 3. Database Schema

Ensure these tables exist:

- [ ] `checkout_sessions` table with `razorpay_order_id` column
- [ ] `orders` table with proper payment status tracking
- [ ] Proper indexes on `checkout_id` and `razorpay_order_id`

### Deployment Steps

#### Phase 1: Deploy New Components (Zero Downtime)

1. **Deploy new files:**

   ```bash
   # New components
   components/razorpay-checkout-v2.tsx
   lib/payment-monitor.ts
   __tests__/payment-flow.test.ts

   # Updated files
   app/api/payment/status/route.ts
   app/checkouts/[checkoutId]/page.tsx
   ```

2. **Verify deployment:**
   - [ ] All files deployed successfully
   - [ ] No build errors
   - [ ] Tests pass

#### Phase 2: Feature Flag Activation

1. **Enable new payment flow for testing:**

   ```typescript
   // In checkout page, temporarily enable V2 for testing
   const USE_V2_PAYMENT = process.env.NODE_ENV === "production" ? false : true;
   ```

2. **Test with small user group:**
   - [ ] Test with internal team
   - [ ] Monitor payment success rates
   - [ ] Check logs for any errors

#### Phase 3: Full Rollout

1. **Enable for all users:**

   ```typescript
   const USE_V2_PAYMENT = true;
   ```

2. **Monitor key metrics:**
   - [ ] Payment success rate
   - [ ] Mobile UPI payment success rate
   - [ ] Error rates
   - [ ] User complaints

### Monitoring & Alerts

#### Key Metrics to Monitor

1. **Payment Success Rate**

   - Target: >95%
   - Alert if drops below 90%

2. **Mobile UPI Success Rate**

   - Target: >90%
   - Alert if drops below 85%

3. **Payment Flow Duration**

   - Target: <30 seconds average
   - Alert if exceeds 60 seconds

4. **Error Rates**
   - Target: <5%
   - Alert if exceeds 10%

#### Log Monitoring

Monitor these log patterns:

```bash
# Success patterns
grep "✅.*Payment confirmed" logs/
grep "🎉.*Payment verified" logs/

# Error patterns
grep "❌.*Payment failed" logs/
grep "⏰.*Polling timeout" logs/
```

### Rollback Plan

#### Immediate Rollback (if critical issues)

1. **Revert to V1 component:**

   ```typescript
   // In app/checkouts/[checkoutId]/page.tsx
   import RazorpayCheckout from "@/components/razorpay-checkout"; // V1
   // import RazorpayCheckoutV2 from "@/components/razorpay-checkout-v2"; // V2

   // Use V1 component
   <RazorpayCheckout ... />
   ```

2. **Redeploy immediately:**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

#### Gradual Rollback (if minor issues)

1. **Enable feature flag for rollback:**

   ```typescript
   const USE_V2_PAYMENT = false; // Rollback to V1
   ```

2. **Monitor for 24 hours before full revert**

### Testing Checklist

#### Manual Testing

- [ ] **Desktop Payment Flow**

  - [ ] Credit card payment
  - [ ] Net banking
  - [ ] UPI (if available)

- [ ] **Mobile Payment Flow**

  - [ ] Credit card payment
  - [ ] UPI payment (Google Pay)
  - [ ] UPI payment (PhonePe)
  - [ ] UPI payment (Paytm)

- [ ] **Edge Cases**
  - [ ] Network interruption during payment
  - [ ] Browser refresh during payment
  - [ ] Multiple payment attempts
  - [ ] Payment timeout scenarios

#### Automated Testing

```bash
# Run payment flow tests
npm test __tests__/payment-flow.test.ts

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### Performance Monitoring

#### Before Deployment

- [ ] Baseline metrics recorded
- [ ] Performance benchmarks established

#### After Deployment

- [ ] Compare metrics with baseline
- [ ] Monitor for performance regressions
- [ ] Check memory usage and CPU utilization

### Support Documentation

#### For Customer Support

1. **Common Issues & Solutions:**

   - Payment stuck in "Processing" state
   - "Something went wrong" error on mobile
   - Payment completed but order not created

2. **Debugging Tools:**
   - Payment flow summary API
   - Log analysis tools
   - Razorpay dashboard access

#### For Developers

1. **Debug Commands:**

   ```bash
   # Check payment status
   curl "https://yourdomain.com/api/payment/status?orderId=ORDER_ID&checkoutId=CHECKOUT_ID"

   # View payment flow logs
   grep "checkout_123" logs/payment.log
   ```

2. **Troubleshooting Guide:**
   - Payment verification failures
   - Webhook processing issues
   - Database synchronization problems

### Success Criteria

#### Week 1

- [ ] Payment success rate maintained or improved
- [ ] No increase in support tickets
- [ ] Mobile UPI payments working smoothly

#### Week 2

- [ ] 20% reduction in "Something went wrong" errors
- [ ] Improved mobile payment conversion rate
- [ ] Positive user feedback

#### Month 1

- [ ] 50% reduction in payment-related support tickets
- [ ] Improved overall payment success rate
- [ ] Stable performance metrics

### Emergency Contacts

#### Technical Issues

- **Lead Developer:** [Contact Info]
- **DevOps Team:** [Contact Info]
- **Database Admin:** [Contact Info]

#### Business Issues

- **Product Manager:** [Contact Info]
- **Customer Support Lead:** [Contact Info]

### Post-Deployment Tasks

#### Week 1

- [ ] Daily monitoring of key metrics
- [ ] User feedback collection
- [ ] Performance optimization if needed

#### Week 2

- [ ] Analysis of payment flow data
- [ ] Identification of improvement opportunities
- [ ] Documentation updates

#### Month 1

- [ ] Comprehensive performance review
- [ ] User experience analysis
- [ ] Future enhancement planning
