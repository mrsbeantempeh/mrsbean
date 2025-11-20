import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch all orders ordered by created_at descending
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: error.message },
        { status: 500 }
      )
    }

    // Also fetch transactions to get payment status
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    // Combine orders with their transaction status
    const ordersWithTransactions = orders?.map(order => {
      const transaction = transactions?.find(t => t.order_id === order.order_id)
      return {
        ...order,
        transaction_status: transaction?.status || null,
        transaction_id: transaction?.transaction_id || null,
        payment_id: transaction?.razorpay_payment_id || null,
      }
    }) || []

    return NextResponse.json({ orders: ordersWithTransactions })
  } catch (error: any) {
    console.error('Error in orders API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

