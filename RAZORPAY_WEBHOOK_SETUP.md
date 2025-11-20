# Razorpay Webhook Setup Guide

## Do You Need Webhooks?

### Current Setup: Callback URL (Redirect-based)
- ✅ **Currently Using:** `/api/razorpay/callback` 
- ✅ **Works For:** Basic payment success/failure handling
- ⚠️ **Limitations:**
  - Requires user to complete redirect
  - Doesn't handle refunds automatically
  - May miss events if user closes browser
  - No notifications for chargebacks

### Webhooks: Recommended for Production
- ✅ **More Reliable:** Server-to-server notifications
- ✅ **Handles Edge Cases:** Works even if user closes browser
- ✅ **Additional Events:** Refunds, chargebacks, order updates
- ✅ **Better for:** Order status management, automated workflows

## Recommendation

**For Production:** Set up **both**:
1. **Callback URL** (already implemented) - For immediate user redirect
2. **Webhooks** (recommended) - For reliable order status updates

---

## Webhook Setup Instructions

### Step 1: Generate Webhook Secret

Generate a secure random string for webhook signature verification:

```bash
# Generate a random secret (32+ characters recommended)
openssl rand -hex 32
```

Save this secret - you'll need it in Step 3.

### Step 2: Add Webhook Secret to Environment Variables

Add to your `.env.local` (or deployment environment):

```env
RAZORPAY_WEBHOOK_SECRET=your_generated_secret_here
```

### Step 3: Configure Webhook in Razorpay Dashboard

1. **Log in to Razorpay Dashboard**
   - Go to https://dashboard.razorpay.com

2. **Navigate to Webhooks**
   - Go to **Settings** → **Webhooks**
   - Or directly: https://dashboard.razorpay.com/app/webhooks

3. **Add New Webhook**
   - Click **+ Add New Webhook**

4. **Configure Webhook:**
   - **Webhook URL:** `https://mrsbean.in/api/razorpay/webhook`
   - **Secret:** Paste the secret you generated in Step 1
   - **Alert Email:** Your email for webhook failure notifications

5. **Select Active Events:**
   - ✅ `payment.captured` - Payment successfully captured
   - ✅ `payment.failed` - Payment failed
   - ✅ `payment.authorized` - Payment authorized (if using manual capture)
   - ✅ `refund.created` - Refund initiated
   - ✅ `order.paid` - Order payment completed

6. **Create Webhook**
   - Click **Create Webhook**

### Step 4: Test Webhook

Razorpay will send a test webhook after creation. Check your server logs to verify it's received.

---

## Webhook Endpoint Details

**URL:** `https://mrsbean.in/api/razorpay/webhook`

**Method:** `POST`

**Authentication:** Signature verification using `X-Razorpay-Signature` header

**Events Handled:**
- `payment.captured` - Updates transaction and order status
- `payment.failed` - Updates order status to cancelled
- `refund.created` - Updates transaction and order status to refunded
- `payment.authorized` - Logs authorization (for manual capture)
- `order.paid` - Additional confirmation event

---

## How Webhooks Work

1. **Payment Event Occurs** (e.g., payment captured)
2. **Razorpay Sends Webhook** to your endpoint
3. **Your Server Verifies Signature** using webhook secret
4. **Your Server Processes Event** (updates database, sends notifications, etc.)
5. **Your Server Returns 200** to acknowledge receipt

---

## Webhook vs Callback URL

| Feature | Callback URL | Webhooks |
|---------|-------------|----------|
| **When Triggered** | After user completes payment | Immediately when event occurs |
| **User Required** | Yes (user must complete redirect) | No (server-to-server) |
| **Reliability** | Depends on user completing flow | High (automatic) |
| **Events** | Success/Failure only | All payment events |
| **Refunds** | Not notified | Automatically notified |
| **Use Case** | User redirect after payment | Order status updates, automation |

---

## Current Implementation

### Callback URL (Already Implemented)
- **Endpoint:** `/api/razorpay/callback`
- **Purpose:** Immediate user redirect after payment
- **Status:** ✅ Working

### Webhook Handler (New)
- **Endpoint:** `/api/razorpay/webhook`
- **Purpose:** Reliable order status updates
- **Status:** ✅ Implemented, needs configuration

---

## Testing Webhooks

### Test Webhook Locally

Use a tool like ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the ngrok URL in Razorpay Dashboard:
# https://your-ngrok-url.ngrok.io/api/razorpay/webhook
```

### Verify Webhook is Working

1. Make a test payment
2. Check server logs for webhook events
3. Verify database is updated correctly
4. Check Razorpay Dashboard → Webhooks → Recent Events

---

## Troubleshooting

### Webhook Not Receiving Events

1. **Check URL:** Ensure webhook URL is publicly accessible
2. **Check Secret:** Verify `RAZORPAY_WEBHOOK_SECRET` matches dashboard
3. **Check Logs:** Look for webhook events in server logs
4. **Check Dashboard:** Razorpay Dashboard shows webhook delivery status

### Invalid Signature Error

- Ensure `RAZORPAY_WEBHOOK_SECRET` matches the secret in Razorpay Dashboard
- Check that you're using the raw request body for signature verification

### Webhook Events Not Processing

- Check server logs for errors
- Verify database connection
- Ensure event types are selected in Razorpay Dashboard

---

## Security Best Practices

1. ✅ **Always verify webhook signature** (implemented)
2. ✅ **Use HTTPS** for webhook URL (required by Razorpay)
3. ✅ **Keep webhook secret secure** (environment variable)
4. ✅ **Return 200 status** even on errors (prevents retries)
5. ✅ **Log all webhook events** for debugging

---

## Summary

**Do you need webhooks?** 

**For Basic Setup:** No, callback URL is sufficient.

**For Production:** Yes, recommended for:
- Reliable order status updates
- Handling refunds automatically
- Better error recovery
- Automated workflows

**Current Status:**
- ✅ Callback URL: Implemented and working
- ✅ Webhook Handler: Implemented, needs configuration in dashboard
- ⚠️ Action Required: Configure webhook in Razorpay Dashboard

---

## Next Steps

1. Generate webhook secret
2. Add `RAZORPAY_WEBHOOK_SECRET` to environment variables
3. Configure webhook in Razorpay Dashboard
4. Test webhook with a test payment
5. Monitor webhook events in logs

