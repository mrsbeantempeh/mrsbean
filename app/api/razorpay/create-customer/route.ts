import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(request: NextRequest) {
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

    const { name, email, contact } = await request.json()

    if (!name || !contact) {
      return NextResponse.json(
        { error: 'Name and contact are required' },
        { status: 400 }
      )
    }

    // Create Razorpay customer for Magic Checkout
    const customer = await razorpay.customers.create({
      name,
      email: email || undefined,
      contact: contact.replace(/[^0-9]/g, ''), // Remove non-numeric characters
    })

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      contact: customer.contact,
    })
  } catch (error: any) {
    console.error('Razorpay customer creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create customer' },
      { status: error.statusCode || 500 }
    )
  }
}

