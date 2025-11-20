import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
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
    const { orderId } = params
    const body = await request.json()
    const { final_status } = body

    // Validate final_status
    if (final_status !== null && !['Order Packed', 'Order Shipped', 'Order Delivered'].includes(final_status)) {
      return NextResponse.json(
        { error: 'Invalid final_status value' },
        { status: 400 }
      )
    }

    // Update order final_status
    const { data, error } = await supabase
      .from('orders')
      .update({ final_status })
      .eq('order_id', orderId)
      .select()
      .single()

    if (error) {
      console.error('Error updating order final_status:', error)
      return NextResponse.json(
        { error: 'Failed to update order', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, order: data })
  } catch (error: any) {
    console.error('Error in update order API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

