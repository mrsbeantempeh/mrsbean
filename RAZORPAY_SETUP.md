# Razorpay Setup Guide

This document explains how to set up Razorpay payment integration for Mrs Bean.

## Prerequisites

1. Create a Razorpay account at [https://razorpay.com](https://razorpay.com)
2. Get your API keys from [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Razorpay Keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

**Important:**
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Public key (safe to expose in frontend)
- `RAZORPAY_KEY_SECRET` - Secret key (NEVER expose in frontend, only use in API routes)

## Payment Flow

1. User clicks "Buy Now" on products page
2. System creates a Razorpay order via `/api/razorpay/create-order`
3. Razorpay checkout modal opens
4. User completes payment
5. Payment is verified via `/api/razorpay/verify-payment`
6. On success, user is redirected to `/thank-you` page

## Testing

For testing, use Razorpay's test keys:
- Test Key ID: Available in Razorpay Dashboard > Settings > API Keys
- Test Secret Key: Available in Razorpay Dashboard > Settings > API Keys

Test cards are available at: https://razorpay.com/docs/payments/test-payments/

## Production

Before going live:
1. Switch to production keys in Razorpay Dashboard
2. Update `.env.local` with production keys
3. Ensure `RAZORPAY_KEY_SECRET` is set in your production environment
4. Test the complete payment flow end-to-end

## Thank You Page

After successful payment, customers are redirected to `/thank-you` page with:
- Order details
- Payment confirmation
- Delivery information (24 hours in Pune)
- Links to home and order history

