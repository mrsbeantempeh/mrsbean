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
    const paymentId = searchParams.get('payment_id')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Fetch payment details from Razorpay
    // This includes shipping address collected during Magic Checkout
    const payment = await razorpay.payments.fetch(paymentId)

    return NextResponse.json({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      order_id: payment.order_id,
      // Shipping address from Magic Checkout
      notes: payment.notes || {},
      // Address fields from payment (if available)
      shipping_address: payment.shipping_address || null,
      billing_address: payment.billing_address || null,
      // Customer details
      contact: payment.contact || null,
      email: payment.email || null,
      // Additional payment details
      created_at: payment.created_at,
      captured: payment.captured,
      description: payment.description || null,
    })
  } catch (error: any) {
    console.error('Razorpay get payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment' },
      { status: error.statusCode || 500 }
    )
  }
}

