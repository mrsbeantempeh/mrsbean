# Razorpay Magic Checkout - Setup Checklist

Use this checklist to ensure Magic Checkout is properly configured.

## ✅ Prerequisites

- [ ] Razorpay account created and verified
- [ ] KYC verification completed
- [ ] Magic Checkout enabled on your Razorpay account (contact support)
- [ ] API keys generated (Test and Live)

## ✅ Environment Variables

- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` set in production environment
- [ ] `RAZORPAY_KEY_SECRET` set in production environment
- [ ] Using correct keys (Test for testing, Live for production)

## ✅ Razorpay Dashboard Configuration

### Magic Checkout Settings
- [ ] Navigated to Magic Checkout → Setup & Settings
- [ ] Selected "Custom E-Commerce Platform"
- [ ] Clicked "Next"

### Shipping Setup
- [ ] Navigated to Shipping Setup
- [ ] Selected "API" as Shipping Service type
- [ ] Entered Shipping Info API URL: `https://mrsbean.in/api/razorpay/shipping-info`
- [ ] Clicked "Save Settings"

### Coupon Settings (Optional)
- [ ] Configured "URL for get promotions" (if using coupons)
- [ ] Configured "URL for apply promotions" (if using coupons)
- [ ] Clicked "Save Settings"

## ✅ API Endpoints Verification

### Shipping Info API
- [ ] Endpoint is publicly accessible: `https://mrsbean.in/api/razorpay/shipping-info`
- [ ] No authentication required
- [ ] Returns correct response format
- [ ] CORS headers enabled
- [ ] Tested with curl command

### Order Creation API
- [ ] Endpoint: `/api/razorpay/create-order`
- [ ] Includes `line_items_total` in request
- [ ] Includes `line_items` array in request
- [ ] All mandatory fields present (sku, variant_id, price, offer_price, tax_amount, quantity, name, description)

### Customer Creation API (Optional)
- [ ] Endpoint: `/api/razorpay/create-customer`
- [ ] Creates or fetches Razorpay customers
- [ ] Returns customer ID for returning customers

## ✅ Frontend Integration

### Magic Checkout Script
- [ ] Script loaded: `https://checkout.razorpay.com/v1/magic-checkout.js`
- [ ] Script loads successfully
- [ ] No console errors

### Checkout Options
- [ ] `one_click_checkout: true` is set
- [ ] `key` is set (Razorpay Key ID)
- [ ] `name` is set ("Mrs Bean")
- [ ] `order_id` is set (from Orders API)
- [ ] `show_coupons: true` is set (if enabled)
- [ ] `prefill` includes customer details (if available)
- [ ] `handler` function is defined for payment success

## ✅ Testing

### Order Creation
- [ ] Order creation API works correctly
- [ ] Returns order ID
- [ ] Includes line_items_total and line_items
- [ ] No 400 errors

### Magic Checkout
- [ ] Magic Checkout modal opens after order creation
- [ ] Address collection form appears
- [ ] Shipping method selection works
- [ ] Payment method selection works
- [ ] Coupon input appears (if enabled)

### Payment Flow
- [ ] Test payment with test card works
- [ ] Payment success handler is called
- [ ] Payment verification works
- [ ] User redirected to thank-you page

## ✅ Error Handling

- [ ] Error messages are user-friendly
- [ ] Console logs show detailed error information
- [ ] Server logs show detailed error information
- [ ] 400 errors show actual error message (not generic)

## ✅ Production Readiness

- [ ] Using Live Mode API keys
- [ ] Environment variables set in production
- [ ] Shipping Info API URL configured in Razorpay Dashboard (Live mode)
- [ ] Tested complete payment flow end-to-end
- [ ] Verified with real payment methods
- [ ] Error handling tested
- [ ] Logging configured

## Common Issues & Solutions

### Issue: "Failed to create payment order"
**Solution:**
- Check environment variables are set
- Verify API keys are correct
- Check browser console for actual error message
- Check server logs for detailed error information

### Issue: "Pincode not serviceable"
**Solution:**
- Verify Shipping Info API URL is configured in Razorpay Dashboard
- Test API endpoint directly with curl
- Check API returns correct response format
- Verify CORS headers are set

### Issue: Magic Checkout shows Standard Checkout
**Solution:**
- Verify `line_items_total` is included in order creation
- Verify `line_items` array is not empty
- Verify `one_click_checkout: true` is set
- Verify Magic Checkout script is loaded (`magic-checkout.js`)

### Issue: Order creation returns 400 error
**Solution:**
- Check product data is being sent correctly
- Verify amount is greater than 0
- Verify all mandatory fields in line_items are present
- Check browser console for actual error message

## Next Steps

1. Complete all checklist items
2. Test complete payment flow
3. Monitor for errors
4. Check server logs regularly
5. Update documentation as needed

