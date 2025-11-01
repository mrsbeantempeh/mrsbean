# Quick Migration Guide - Guest Checkout Support

## The Issue
You're seeing: `Could not find the 'guest_name' column of 'orders' in the schema cache`

This means the database migration hasn't been run yet. Follow these steps:

## How to Run the Migration

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your **Mrs Bean** project

### Step 2: Open SQL Editor
1. In the left sidebar, click **SQL Editor**
2. Click **New Query** (or the + button)

### Step 3: Run the Migration
1. Open the file `supabase-guest-orders-migration.sql` in your project
2. **Copy the ENTIRE contents** of that file
3. **Paste it into the SQL Editor** in Supabase
4. Click **Run** (or press `Ctrl/Cmd + Enter`)

### Step 4: Verify It Worked
You should see:
- ✅ **Success** message in the results panel
- No errors

You can also verify by:
1. Go to **Table Editor** → **orders**
2. Check if the columns `guest_name`, `guest_email`, `guest_phone` exist

### Step 5: Test Guest Checkout
1. Refresh your website
2. Try the checkout flow without logging in
3. It should work now!

## What the Migration Does

This migration:
- ✅ Adds `guest_name`, `guest_email`, `guest_phone` columns to `orders` table
- ✅ Adds `guest_email`, `guest_phone` columns to `transactions` table
- ✅ Makes `user_id` nullable (so guests can have `user_id = NULL`)
- ✅ Updates RLS policies to allow guest order creation
- ✅ Adds indexes for faster guest order lookup

## Troubleshooting

### Error: "column already exists"
- This means the migration was partially run before
- You can skip those lines or run the migration again (it uses `IF NOT EXISTS`)

### Error: "permission denied"
- Make sure you're logged in as the project owner
- Check that you're running the SQL in the correct project

### Error: "relation does not exist"
- First run `supabase-schema.sql` to create the base tables
- Then run this migration

## Need Help?

If you're still seeing errors:
1. Copy the exact error message
2. Check the Supabase logs: **Logs** → **Postgres Logs**
3. Verify your tables exist: **Table Editor**

---

**File Location**: `supabase-guest-orders-migration.sql`

