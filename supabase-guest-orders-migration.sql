-- Migration to support guest orders
-- Run this SQL in your Supabase SQL Editor

-- Add guest customer info fields to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS guest_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- Make user_id nullable to support guest orders
ALTER TABLE orders 
  ALTER COLUMN user_id DROP NOT NULL;

-- Drop the foreign key constraint temporarily to allow NULL user_id
ALTER TABLE orders 
  DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Re-add foreign key constraint that allows NULL
ALTER TABLE orders 
  ADD CONSTRAINT orders_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Do the same for transactions table
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_phone TEXT;

ALTER TABLE transactions 
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE transactions 
  DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

ALTER TABLE transactions 
  ADD CONSTRAINT transactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to allow guest order creation
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;

-- New policies for orders (support guest orders)
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert orders (guest checkout)"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert transactions (guest checkout)"
  ON transactions FOR INSERT
  WITH CHECK (true);

-- Add index for guest orders lookup
CREATE INDEX IF NOT EXISTS idx_orders_guest_phone ON orders(guest_phone) WHERE guest_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(guest_email) WHERE guest_email IS NOT NULL;
