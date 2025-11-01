import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(request: NextRequest) {
  try {
    // Check for environment variables at runtime
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Razorpay keys not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables.' },
        { status: 500 }
      )
    }

    // Initialize Razorpay at runtime, not at module level
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const { amount, currency = 'INR', receipt } = await request.json()

    // Validate dynamic cart value
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid cart amount. Amount must be greater than 0.' },
        { status: 400 }
      )
    }

    // Convert dynamic cart value from rupees to paise for Razorpay
    // Razorpay requires amount in the smallest currency unit (paise for INR)
    const amountInPaise = Math.round(amount * 100)

    // Ensure minimum amount (Razorpay minimum is 1 rupee = 100 paise)
    if (amountInPaise < 100) {
      return NextResponse.json(
        { error: 'Minimum order amount is ₹1' },
        { status: 400 }
      )
    }

    const options = {
      amount: amountInPaise, // Dynamic cart value in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    })
  } catch (error: any) {
    console.error('Razorpay order creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}
