# Shipping Info API - Complete Documentation

## API URL

**Production:**
```
https://mrsbean.in/api/razorpay/shipping-info
```

**Localhost (Testing):**
```
http://localhost:3000/api/razorpay/shipping-info
```

## Configuration in Razorpay Dashboard

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Magic Checkout** → **Setup & Settings** → **Shipping Setup**
3. Select **API** as Shipping Service type
4. Enter URL: `https://mrsbean.in/api/razorpay/shipping-info`
5. Click **Save Settings**

---

## API Specification

### Endpoint Details

- **Method:** `POST`
- **Content-Type:** `application/json`
- **Authentication:** None (publicly accessible)
- **CORS:** Enabled

### Request Format (from Razorpay)

```json
{
  "order_id": "receipt_1762455824330_qty_1",
  "razorpay_order_id": "order_RcYyNrP5xOOIrH",
  "email": "customer@example.com",
  "contact": "+919000000000",
  "addresses": [
    {
      "id": "0",
      "zipcode": "411052",
      "state_code": "MH",
      "country": "IN"
    }
  ]
}
```

**Request Fields:**
- `order_id` (string): Your internal order ID
- `razorpay_order_id` (string): Razorpay order ID
- `email` (string, optional): Customer email
- `contact` (string, optional): Customer phone number
- `addresses` (array): Array of address objects
  - `id` (string or number): Address identifier
  - `zipcode` (string): 6-digit pincode
  - `state_code` (string, optional): State code (e.g., "MH")
  - `country` (string): Country code ("IN" or "in")

### Response Format (to Razorpay)

```json
{
  "addresses": [
    {
      "id": "0",
      "zipcode": "411052",
      "country": "in",
      "shipping_methods": [
        {
          "id": "1",
          "name": "24-Hour Delivery",
          "description": "Fresh delivery within 24 hours in Pune",
          "serviceable": true,
          "shipping_fee": 0,
          "cod": true,
          "cod_fee": 0
        }
      ]
    }
  ]
}
```

**Response Fields:**
- `addresses` (array): Array of address responses
  - `id` (string): Address identifier (must match request)
  - `zipcode` (string): Pincode
  - `country` (string): Country code (lowercase)
  - `shipping_methods` (array): Available shipping methods
    - `id` (string): Shipping method identifier
    - `name` (string): Shipping method name
    - `description` (string): Shipping method description
    - `serviceable` (boolean): Whether address is serviceable
    - `shipping_fee` (number): Shipping fee in paise (0 = free)
    - `cod` (boolean): Whether COD is available
    - `cod_fee` (number): COD fee in paise (0 = no charge)

---

## Serviceability Rules

### Pune Pincodes (Serviceable)
- **Range:** 411001 to 411999
- **Serviceable:** `true`
- **COD Available:** `true`
- **Shipping Fee:** 0 (Free)
- **COD Fee:** 0 (No charges)

### Non-Pune Pincodes (Not Serviceable)
- **Serviceable:** `false`
- **COD Available:** `false`
- **Shipping Fee:** 0
- **COD Fee:** 0

---

## Line Items Structure

Line items are included in the **Order Creation API** (`/api/razorpay/create-order`), not in the shipping info API. Here's the structure:

### Order Creation with Line Items

**Endpoint:** `/api/razorpay/create-order`

**Request:**
```json
{
  "amount": 12500,
  "currency": "INR",
  "receipt": "receipt_xxx",
  "line_items_total": 12500,
  "line_items": [
    {
      "sku": "SKU-CLASSIC-TEMPEH",
      "variant_id": "VARIANT-001",
      "price": 12500,
      "offer_price": 12500,
      "tax_amount": 0,
      "quantity": 1,
      "name": "Classic Tempeh",
      "description": "Pure, unflavored tempeh perfect for any recipe",
      "weight": 200,
      "dimensions": {
        "length": "10",
        "width": "10",
        "height": "5"
      },
      "image_url": "https://images.pexels.com/photos/6822603/pexels-photo-6822603.jpeg",
      "product_url": "https://mrsbean.in/products"
    }
  ]
}
```

**Line Item Fields:**
- `sku` (string, required): Unique product SKU
- `variant_id` (string, required): Unique variant ID
- `price` (number, required): Original price in paise
- `offer_price` (number, required): Final price after discount in paise
- `tax_amount` (number, required): Tax amount in paise
- `quantity` (number, required): Number of units
- `name` (string, required): Product name
- `description` (string, required): Product description
- `weight` (number, optional): Weight in grams
- `dimensions` (object, optional): Product dimensions
  - `length` (string): Length in cm
  - `width` (string): Width in cm
  - `height` (string): Height in cm
- `image_url` (string, optional): Product image URL
- `product_url` (string, optional): Product page URL

**Critical Requirements:**
- `amount` MUST equal `line_items_total`
- All prices must be integers (in paise)
- `line_items` array cannot be empty

---

## Testing

### Test Pune Pincode (Serviceable)
```bash
curl -X POST https://mrsbean.in/api/razorpay/shipping-info \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "test_order",
    "razorpay_order_id": "order_test",
    "addresses": [
      {
        "id": "0",
        "zipcode": "411052",
        "country": "IN"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "addresses": [
    {
      "id": "0",
      "zipcode": "411052",
      "country": "in",
      "shipping_methods": [
        {
          "id": "1",
          "name": "24-Hour Delivery",
          "description": "Fresh delivery within 24 hours in Pune",
          "serviceable": true,
          "shipping_fee": 0,
          "cod": true,
          "cod_fee": 0
        }
      ]
    }
  ]
}
```

### Test Non-Pune Pincode (Not Serviceable)
```bash
curl -X POST https://mrsbean.in/api/razorpay/shipping-info \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "test_order",
    "razorpay_order_id": "order_test",
    "addresses": [
      {
        "id": "0",
        "zipcode": "400001",
        "country": "IN"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "addresses": [
    {
      "id": "0",
      "zipcode": "400001",
      "country": "in",
      "shipping_methods": [
        {
          "id": "1",
          "name": "Not Serviceable",
          "description": "Currently we only deliver in Pune. Please check back soon!",
          "serviceable": false,
          "shipping_fee": 0,
          "cod": false,
          "cod_fee": 0
        }
      ]
    }
  ]
}
```

---

## Implementation Details

### File Location
`/app/api/razorpay/shipping-info/route.ts`

### Key Functions
- `isPunePincode()`: Validates if pincode is in Pune range (411001-411999)
- `POST()`: Handles shipping info requests
- `OPTIONS()`: Handles CORS preflight
- `GET()`: Health check endpoint

### Error Handling
- Returns valid response even on parse errors
- Handles missing addresses gracefully
- Logs all requests for debugging

---

## References

- [Razorpay Magic Checkout Documentation](https://razorpay.com/docs/payments/magic-checkout/web/)
- [Razorpay Orders API](https://razorpay.com/docs/api/orders/)

