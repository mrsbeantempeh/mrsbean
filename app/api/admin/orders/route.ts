import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This route uses service role key to bypass RLS for admin access
// Only use this with proper authentication in production

export async function GET(request: NextRequest) {
  try {
    // Check for admin password in query params or headers
    const password = request.headers.get('x-admin-password') || request.nextUrl.searchParams.get('password')
    
    const ADMIN_PASSWORD = 'Netsky4933#'
    
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase credentials not configured' },
        { status: 500 }
      )
    }

    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Get all orders
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (ordersError) {
      return NextResponse.json(
        { error: ordersError.message },
        { status: 500 }
      )
    }

    // Get all transactions
    const { data: transactions, error: transactionsError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (transactionsError) {
      return NextResponse.json(
        { error: transactionsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      orders: orders || [],
      transactions: transactions || [],
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const password = request.headers.get('x-admin-password')
    const ADMIN_PASSWORD = 'Netsky4933#'
    
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing orderId or status' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase credentials not configured' },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

