# Admin Dashboard Setup Guide

## Overview
The admin dashboard is located at `/admin` and allows you to manage and track all customers and their orders.

## Access
- **URL**: `https://mrsbean.in/admin` (or `http://localhost:3000/admin` in development)
- **Password**: `Netsky4933#`

## Features

### 1. Statistics Dashboard
- Total Orders
- Pending Orders
- Delivered Orders
- Total Revenue (from successful transactions)
- Total Customers (unique count)

### 2. Order Management
- View all orders (logged-in users and guests)
- Search orders by:
  - Order ID
  - Customer name
  - Phone number
  - Email
  - Product name
- Filter by status:
  - All Status
  - Pending
  - Confirmed
  - Delivered
  - Cancelled

### 3. Order Details
For each order, you can see:
- Order ID
- Customer information (name, phone, email)
- Product details
- Quantity
- Total amount
- Current status
- Order date
- Payment method

### 4. Update Order Status
- Change order status directly from the table
- Statuses: Pending → Confirmed → Delivered
- Can also mark as Cancelled

## Setup Instructions

### Step 1: Add Service Role Key to Environment Variables

The admin dashboard uses an API route that needs the Supabase Service Role Key to bypass RLS (Row Level Security) and access all orders.

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Find **Service Role Key** (keep this secret!)
4. Copy the service role key
5. Add it to your `.env.local` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important**: 
- The service role key bypasses RLS and has full database access
- Never expose this key in client-side code
- Never commit it to git (it should be in `.gitignore`)
- Only use it in server-side API routes

### Step 2: Deploy to Production

When deploying to Vercel or another platform:

1. Add `SUPABASE_SERVICE_ROLE_KEY` to your environment variables
2. Make sure it's marked as "Secret" or "Sensitive"
3. Restart your deployment after adding it

### Step 3: Test Admin Access

1. Visit `/admin`
2. Enter password: `Netsky4933#`
3. You should see:
   - Statistics dashboard
   - All orders table
   - Search and filter options

## Security Notes

### Current Implementation
- Password is hardcoded in the code (for simplicity)
- Admin session is stored in `sessionStorage` (client-side)
- API routes require password in header

### Production Recommendations
1. **Change the password** regularly
2. **Use environment variable** for admin password:
   ```env
   ADMIN_PASSWORD=Netsky4933#
   ```
3. **Add session expiration** (e.g., 1 hour)
4. **Use server-side sessions** instead of client-side storage
5. **Add IP whitelist** (optional)
6. **Add audit logging** for admin actions
7. **Use proper authentication** (Supabase Auth with admin role)

## API Routes

### GET `/api/admin/orders`
Fetches all orders and transactions.

**Query Parameters:**
- `password`: Admin password

**Response:**
```json
{
  "orders": [...],
  "transactions": [...]
}
```

### PATCH `/api/admin/orders`
Updates order status.

**Headers:**
- `x-admin-password`: Admin password

**Body:**
```json
{
  "orderId": "uuid-of-order",
  "status": "pending" | "confirmed" | "delivered" | "cancelled"
}
```

## Troubleshooting

### Issue: "Unauthorized" error
- Check that the password is correct
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in environment variables
- Restart your dev server after adding the key

### Issue: "Supabase credentials not configured"
- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- Make sure it's the correct service role key from Supabase dashboard

### Issue: Can't see all orders
- The admin API route uses service role key to bypass RLS
- Make sure the service role key is configured correctly
- Check Supabase logs for any errors

### Issue: Orders not updating
- Check browser console for errors
- Verify API route is working
- Check Supabase logs

## Future Enhancements

1. **Customer Details View**
   - Click on customer to see all their orders
   - Customer order history
   - Contact information

2. **Order Details Modal**
   - Full order information
   - Delivery address
   - Transaction details
   - Edit order information

3. **Export Data**
   - Export orders to CSV
   - Export customer list
   - Generate reports

4. **Analytics**
   - Revenue charts
   - Order trends
   - Customer growth

5. **Bulk Actions**
   - Update multiple orders at once
   - Send bulk emails/SMS

## Files

- `/app/admin/page.tsx` - Admin dashboard UI
- `/app/api/admin/orders/route.ts` - Admin API routes (server-side)

---

**Password**: `Netsky4933#`
**Access URL**: `/admin`

