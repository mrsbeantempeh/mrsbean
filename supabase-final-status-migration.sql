-- Migration to add final_status column to orders table
-- Run this SQL in your Supabase SQL Editor

-- Add final_status column to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS final_status TEXT CHECK (
    final_status IN ('Order Packed', 'Order Shipped', 'Order Delivered') 
    OR final_status IS NULL
  );

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_final_status ON orders(final_status);

-- Add comment to column
COMMENT ON COLUMN orders.final_status IS 'Final order fulfillment status: Order Packed, Order Shipped, or Order Delivered';

