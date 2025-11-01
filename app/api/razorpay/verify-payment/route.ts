import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment details', verified: false },
        { status: 400 }
      )
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || ''
    
    if (!keySecret) {
      console.error('RAZORPAY_KEY_SECRET not configured')
      // In development, we might skip verification if secret is not set
      return NextResponse.json({
        verified: true, // Allow in development if secret not set
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      })
    }

    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex')

    const isSignatureValid = generatedSignature === razorpay_signature

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: 'Invalid signature', verified: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      verified: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    })
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment', verified: false },
      { status: 500 }
    )
  }
}
