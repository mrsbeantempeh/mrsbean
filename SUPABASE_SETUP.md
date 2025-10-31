# Supabase Setup Guide for Mrs Bean

This guide will help you set up Supabase authentication and database for the Mrs Bean website.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: Mrs Bean
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to India (e.g., Asia Pacific)
5. Click "Create new project" and wait for setup to complete (~2 minutes)

## Step 2: Get Your API Keys

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Set Up Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" to execute the SQL
5. Verify tables were created:
   - Go to **Table Editor**
   - You should see: `profiles`, `orders`, `transactions`

## Step 5: Enable Email Authentication

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Make sure **Email** provider is enabled
3. (Optional) Configure email templates under **Authentication** → **Email Templates**

## Step 6: Test the Setup

1. Run your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/signup`
3. Try creating an account
4. Check Supabase dashboard:
   - **Authentication** → **Users** - should see your new user
   - **Table Editor** → **profiles** - should see your profile

## Database Schema Overview

### `profiles` Table
- Stores user profile information
- Automatically created when user signs up (via trigger)
- Fields: `id`, `name`, `email`, `phone`, `created_at`, `updated_at`

### `orders` Table
- Stores all customer orders
- Fields: `id`, `user_id`, `order_id`, `product_name`, `quantity`, `price`, `total`, `status`, `payment_method`, `address`, `created_at`

### `transactions` Table
- Stores payment transactions
- Fields: `id`, `user_id`, `transaction_id`, `order_id`, `amount`, `status`, `payment_method`, `created_at`

## Row Level Security (RLS)

All tables have Row Level Security enabled:
- Users can only view/modify their own data
- Automatic security policies prevent unauthorized access

## Troubleshooting

### Issue: "Missing Supabase environment variables"
- Make sure `.env.local` exists in project root
- Check that variables start with `NEXT_PUBLIC_`
- Restart your development server after adding env variables

### Issue: "Failed to create profile"
- Check that the SQL schema was run successfully
- Verify the trigger `on_auth_user_created` exists in database
- Check Supabase logs under **Logs** → **Postgres Logs**

### Issue: "Permission denied" when querying
- Check RLS policies are enabled
- Verify user is authenticated
- Check Supabase logs for specific error messages

## Next Steps

Once authentication is working:
1. Users can sign up and login
2. Orders and transactions are automatically tracked
3. Users can manage their account from `/account` page
4. Product purchases require login

## Security Notes

- Never commit `.env.local` to git (it's in `.gitignore`)
- The `anon` key is safe for client-side use (it's protected by RLS)
- For production, consider setting up email verification
- Implement proper password reset flow if needed

