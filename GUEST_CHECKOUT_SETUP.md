# Guest Checkout Setup Guide

## Overview
The website now supports **guest checkout**, allowing customers to purchase without creating an account first. This significantly improves the buying experience by removing friction and making the checkout process smooth and fast.

## What Was Implemented

### 1. Database Schema Updates
A migration SQL file has been created: `supabase-guest-orders-migration.sql`

**Changes:**
- Made `user_id` nullable in `orders` and `transactions` tables
- Added `guest_name`, `guest_email`, `guest_phone` fields to `orders` table
- Added `guest_email`, `guest_phone` fields to `transactions` table
- Updated RLS policies to allow guest order creation
- Added indexes for guest order lookup

### 2. CheckoutModal Component
Created a new multi-step checkout modal (`components/CheckoutModal.tsx`) that:
- **Step 1:** Collects customer details (name, phone, optional email)
- **Step 2:** Collects delivery address (with landmark and instructions)
- **Step 3:** Shows order summary and processes payment via Razorpay
- **Optional:** Offers account creation after successful payment (for guests)

**Features:**
- ✅ Works for both logged-in users and guests
- ✅ Auto-fills information from user profile if logged in
- ✅ Smooth progress indicator
- ✅ Form validation at each step
- ✅ Beautiful, responsive design
- ✅ Optional account creation checkbox for guests

### 3. AuthContext Updates
Added new functions to support guest orders:
- `addGuestOrder()` - Creates orders for guests
- `addGuestTransaction()` - Creates transactions for guests

Updated interfaces to support nullable `user_id` and guest fields.

### 4. Products Page Updates
- Removed forced login requirement
- Integrated CheckoutModal component
- Simplified "Buy Now" button (opens modal instead of redirecting)
- Works seamlessly for both logged-in and guest users

### 5. Homepage Products Component
- Updated to redirect to `/products` page (where checkout modal is available)
- Removed "Please sign in to order" message
- Simplified buy flow

## Setup Instructions

### Step 1: Run Database Migration

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy the contents of `supabase-guest-orders-migration.sql`
4. Paste and run the SQL script

This will:
- Update the database schema to support guest orders
- Modify RLS policies to allow guest checkout
- Add necessary indexes

### Step 2: Test the Flow

1. **As a Guest:**
   - Visit the website without logging in
   - Click "Buy Now" on any product
   - Complete the 3-step checkout process:
     - Enter your name and phone (email optional)
     - Enter delivery address
     - Review and pay
   - Optionally create an account after payment

2. **As a Logged-in User:**
   - Log in to your account
   - Click "Buy Now" on any product
   - Checkout modal auto-fills your profile information
   - Enter delivery address (if not saved)
   - Review and pay

## Customer Information Collected

### Required Information:
- **Full Name** - For order processing and delivery
- **Phone Number** - For delivery coordination (10 digits)
- **Delivery Address** - Complete address with at least 10 characters

### Optional Information:
- **Email Address** - For order confirmations (optional for guests)
- **Landmark** - To help delivery drivers locate the address
- **Delivery Instructions** - Special instructions for delivery

### After Payment:
- Guest customers can optionally create an account
- If they choose to create an account, they'll receive a password reset email
- All order history will be linked to their new account

## Benefits

1. **Reduced Friction:** No forced account creation before purchase
2. **Faster Checkout:** Smooth, single-page flow with modal
3. **Better Conversion:** Removes barriers that cause cart abandonment
4. **Data Collection:** Still collects all necessary information for delivery
5. **Flexible:** Guests can optionally create accounts after purchase
6. **User-Friendly:** Auto-fills information for logged-in users

## Technical Details

### Guest Order Structure
```typescript
{
  user_id: null,
  order_id: "ORDER-1234567890",
  guest_name: "John Doe",
  guest_email: "john@example.com", // optional
  guest_phone: "9876543210",
  address: "Complete address...",
  // ... other order fields
}
```

### Logged-in Order Structure
```typescript
{
  user_id: "uuid-of-user",
  order_id: "ORDER-1234567890",
  // No guest_* fields
  address: "Complete address...",
  // ... other order fields
}
```

## Next Steps (Optional Enhancements)

1. **Address Book:** Save multiple addresses for logged-in users
2. **Quick Reorder:** One-click reorder for previous orders
3. **Order Tracking:** Allow guests to track orders by phone number
4. **Email Notifications:** Send order confirmation emails to guests
5. **Password Reset Flow:** Improve account creation flow after guest checkout

## Files Changed

- `supabase-guest-orders-migration.sql` - Database migration script
- `components/CheckoutModal.tsx` - New checkout modal component
- `contexts/AuthContext.tsx` - Added guest order functions
- `app/products/page.tsx` - Integrated CheckoutModal
- `components/Products.tsx` - Updated to redirect to products page

## Support

If you encounter any issues:
1. Check that the database migration has been run successfully
2. Verify RLS policies are updated correctly
3. Check browser console for any errors
4. Ensure Razorpay credentials are configured in environment variables

