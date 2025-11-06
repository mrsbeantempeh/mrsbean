# Razorpay Magic Checkout - Complete Setup Guide

This guide will help you set up Razorpay Magic Checkout from scratch for Mrs Bean.

## Prerequisites

1. **Razorpay Account**
   - Create account at [https://razorpay.com](https://razorpay.com)
   - Complete KYC verification
   - Get API keys from [Dashboard](https://dashboard.razorpay.com/app/keys)

2. **Enable Magic Checkout**
   - Contact Razorpay support to enable Magic Checkout on your account
   - Magic Checkout must be approved for your account

## Step 1: Environment Variables

Set up environment variables in your deployment platform (Vercel/Netlify):

```env
# Razorpay API Keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx  # Your Razorpay Key ID
RAZORPAY_KEY_SECRET=your_secret_key_here            # Your Razorpay Secret Key
```

**Important:**
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Public key (safe to expose in frontend)
- `RAZORPAY_KEY_SECRET` - Secret key (NEVER expose in frontend, only use in API routes)

## Step 2: Configure Magic Checkout in Razorpay Dashboard

1. **Log in to Razorpay Dashboard**
   - Go to https://dashboard.razorpay.com

2. **Navigate to Magic Checkout**
   - Go to **Magic Checkout** → **Setup & Settings**

3. **Platform Setup**
   - Select **Custom E-Commerce Platform** from the dropdown
   - Click **Next**

4. **Shipping Setup**
   - Go to **Shipping Setup**
   - Select **API** as the Shipping Service type
   - Enter your Shipping Info API URL:
     ```
     https://mrsbean.in/api/razorpay/shipping-info
     ```
   - Click **Save Settings**

5. **Coupon Settings (Optional)**
   - If you want to use coupons, configure:
     - **URL for get promotions**: Your promotions API endpoint
     - **URL for apply promotions**: Your apply promotions API endpoint
   - Click **Save Settings**

## Step 3: Verify API Endpoints

### 3.1 Shipping Info API

**Endpoint:** `https://mrsbean.in/api/razorpay/shipping-info`

**Test the endpoint:**
```bash
curl -X POST https://mrsbean.in/api/razorpay/shipping-info \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "test",
    "razorpay_order_id": "order_test",
    "email": "test@example.com",
    "contact": "+919000000000",
    "addresses": [{
      "id": "0",
      "zipcode": "411001",
      "state_code": "MH",
      "country": "IN"
    }]
  }'
```

**Expected Response:**
```json
{
  "addresses": [{
    "id": "0",
    "zipcode": "411001",
    "state_code": "MH",
    "country": "IN",
    "shipping_methods": [
      {
        "id": "1",
        "description": "Free shipping",
        "name": "Delivery within 5 days",
        "serviceable": true,
        "shipping_fee": 0,
        "cod": true,
        "cod_fee": 0
      },
      {
        "id": "2",
        "description": "Standard Delivery",
        "name": "Delivered on the same day",
        "serviceable": true,
        "shipping_fee": 0,
        "cod": false,
        "cod_fee": 0
      }
    ]
  }]
}
```

### 3.2 Order Creation API

**Endpoint:** `/api/razorpay/create-order`

This API creates Razorpay orders with Magic Checkout parameters:
- ✅ Includes `line_items_total` (required for Magic Checkout)
- ✅ Includes `line_items` array (required for Magic Checkout)
- ✅ All mandatory fields (sku, variant_id, price, offer_price, tax_amount, quantity, name, description)

### 3.3 Customer Creation API (Optional)

**Endpoint:** `/api/razorpay/create-customer`

This API creates or fetches Razorpay customers for returning customers.

## Step 4: Verify Frontend Integration

### 4.1 Magic Checkout Script

The Magic Checkout script is loaded from:
```javascript
https://checkout.razorpay.com/v1/magic-checkout.js
```

### 4.2 Checkout Options

The checkout is configured with:
- ✅ `one_click_checkout: true` (mandatory for Magic Checkout)
- ✅ `key` - Your Razorpay Key ID
- ✅ `name` - Business name ("Mrs Bean")
- ✅ `order_id` - Order ID from Orders API
- ✅ `show_coupons: true` - Show coupon widget
- ✅ `prefill` - Customer details (name, email, contact)
- ✅ `handler` - Payment success handler

## Step 5: Testing

### 5.1 Test Order Creation

1. Go to your products page
2. Click "Buy Now"
3. Check browser console for:
   - "Order creation request:" - Shows request data
   - "Creating Razorpay order:" - Shows order creation details
   - Any errors should show detailed error messages

### 5.2 Test Magic Checkout

1. After order creation, Magic Checkout modal should open
2. You should see:
   - Address collection form
   - Shipping method selection
   - Payment method selection
   - Coupon input (if enabled)

### 5.3 Test Payment

Use Razorpay test cards:
- **Success:** 4111 1111 1111 1111
- **Failure:** 4000 0000 0000 0002
- **CVV:** Any 3 digits
- **Expiry:** Any future date

## Step 6: Troubleshooting

### Issue: "Failed to create payment order"

**Check:**
1. Environment variables are set correctly
2. API keys are valid (test vs live mode)
3. Check browser console for actual error message
4. Check server logs for detailed error information

### Issue: "Pincode not serviceable"

**Check:**
1. Shipping Info API URL is configured in Razorpay Dashboard
2. API endpoint is publicly accessible
3. API returns correct response format
4. CORS headers are set correctly

### Issue: Magic Checkout shows Standard Checkout

**Check:**
1. `line_items_total` is included in order creation
2. `line_items` array is not empty
3. `one_click_checkout: true` is set in checkout options
4. Magic Checkout script is loaded (`magic-checkout.js`)

### Issue: Order creation returns 400 error

**Check:**
1. Product data is being sent correctly
2. Amount is greater than 0
3. All mandatory fields in line_items are present:
   - sku
   - variant_id
   - price
   - offer_price
   - tax_amount
   - quantity
   - name
   - description

## Step 7: Production Checklist

Before going live:

- [ ] Switch to Live Mode API keys
- [ ] Update environment variables with live keys
- [ ] Configure shipping info API URL in Razorpay Dashboard (live mode)
- [ ] Test complete payment flow end-to-end
- [ ] Verify shipping info API is accessible
- [ ] Test with real payment methods
- [ ] Verify order creation works correctly
- [ ] Check error handling and logging

## File Structure

```
MrsBean/
├── lib/
│   └── razorpay.ts                    # Magic Checkout integration
├── app/
│   ├── api/
│   │   └── razorpay/
│   │       ├── create-order/
│   │       │   └── route.ts           # Order creation with line_items
│   │       ├── create-customer/
│   │       │   └── route.ts           # Customer creation
│   │       ├── shipping-info/
│   │       │   └── route.ts           # Shipping serviceability API
│   │       ├── verify-payment/
│   │       │   └── route.ts           # Payment verification
│   │       └── get-order/
│   │           └── route.ts           # Order details
│   └── products/
│       └── page.tsx                    # Product page with Buy Now
```

## Key Components

### 1. Order Creation (`/api/razorpay/create-order`)

**Required for Magic Checkout:**
- `line_items_total` - Total of offer_price for all line items (in paise)
- `line_items` - Array of line items with:
  - `sku` (mandatory)
  - `variant_id` (mandatory)
  - `price` (mandatory, in paise)
  - `offer_price` (mandatory, in paise)
  - `tax_amount` (mandatory, in paise)
  - `quantity` (mandatory)
  - `name` (mandatory)
  - `description` (mandatory)

### 2. Shipping Info API (`/api/razorpay/shipping-info`)

**Required:**
- Publicly accessible
- No authentication required
- Returns shipping serviceability, COD availability, and fees
- CORS headers enabled

### 3. Checkout Integration (`lib/razorpay.ts`)

**Required:**
- Magic Checkout script (`magic-checkout.js`)
- `one_click_checkout: true`
- `order_id` from Orders API
- `key` (Razorpay Key ID)

## Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs for detailed error information
3. Verify all configuration steps are completed
4. Test API endpoints directly using curl
5. Contact Razorpay support if needed

## References

- [Razorpay Magic Checkout Documentation](https://razorpay.com/docs/payments/magic-checkout/web/)
- [Razorpay Orders API](https://razorpay.com/docs/api/orders/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/test-payments/)

