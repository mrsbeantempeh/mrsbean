import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function GET(request: NextRequest) {
  try {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Razorpay keys not configured' },
        { status: 503 }
      )
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('order_id')

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Fetch order details from Razorpay
    const order = await razorpay.orders.fetch(orderId)

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      notes: order.notes || {},
      created_at: order.created_at,
    })
  } catch (error: any) {
    console.error('Razorpay get order error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' },
      { status: error.statusCode || 500 }
    )
  }
}

