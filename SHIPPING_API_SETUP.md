# Shipping Info API Setup for Magic Checkout

## Problem
Magic Checkout is stuck at "Checking serviceability" because the shipping info API endpoint is not configured in your Razorpay Dashboard.

## Solution

### Step 1: Deploy Your Shipping API Endpoint

The shipping info API endpoint has been created at:
```
https://your-domain.com/api/razorpay/shipping-info
```

**Important:** This endpoint must be:
- ✅ Publicly accessible (no authentication required)
- ✅ Hosted on your server
- ✅ Accessible via POST request

### Step 2: Configure in Razorpay Dashboard

1. **Log in to Razorpay Dashboard**
   - Go to https://dashboard.razorpay.com

2. **Navigate to Magic Checkout Settings**
   - Go to **Magic Checkout** → **Setup & Settings** → **Shipping Setup**

3. **Configure Shipping Service**
   - Select **API** as the Shipping Service type from the dropdown

4. **Enter Shipping Info URL**
   - Enter your shipping info API URL:
     ```
     https://your-domain.com/api/razorpay/shipping-info
     ```
   - Replace `your-domain.com` with your actual domain

5. **Save Settings**
   - Click **Save Settings**

### Step 3: Test the Endpoint

Test your shipping info API endpoint:

```bash
curl -X POST https://your-domain.com/api/razorpay/shipping-info \
  -H "Content-Type: application/json" \
  -d '{
    "addresses": [
      {
        "city": "Pune",
        "state": "Maharashtra",
        "zipcode": "411001"
      }
    ]
  }'
```

Expected response:
```json
{
  "addresses": [
    {
      "id": "addr_123",
      "shipping": {
        "serviceable": true,
        "fee": 0,
        "estimated_delivery_time": 24
      },
      "cod": {
        "serviceable": true,
        "fee": 0
      }
    }
  ]
}
```

### Step 4: Verify Magic Checkout

After configuring the shipping info API:
1. Try making a purchase again
2. Magic Checkout should no longer get stuck at "Checking serviceability"
3. It should proceed to address collection and payment

## Current Implementation

The shipping info API (`/api/razorpay/shipping-info`) currently:
- ✅ Returns serviceable for addresses in Pune/Maharashtra
- ✅ Returns free shipping (fee: 0)
- ✅ Returns 24-hour delivery time
- ✅ Supports COD with no COD fee
- ✅ Has error handling to prevent checkout from getting stuck

## Customization

You can customize the shipping logic in `/app/api/razorpay/shipping-info/route.ts`:
- Add more delivery areas
- Set different shipping fees
- Configure COD availability by area
- Add delivery time estimates based on location

## Troubleshooting

If Magic Checkout is still stuck:
1. Verify the API endpoint is publicly accessible
2. Check that the URL is correctly configured in Razorpay Dashboard
3. Test the API endpoint directly using curl or Postman
4. Check browser console for any errors
5. Verify your domain is accessible (not blocked by firewall)

## Next Steps

1. Deploy your application (if not already deployed)
2. Configure the shipping info URL in Razorpay Dashboard
3. Test Magic Checkout again

