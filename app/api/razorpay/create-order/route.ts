import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function POST(request: NextRequest) {
  try {
    // Check for environment variables at runtime
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      console.error('Razorpay environment variables missing:', {
        hasKeyId: !!keyId,
        hasKeySecret: !!keySecret,
      })
      return NextResponse.json(
        { 
          error: 'Razorpay keys not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables.',
          details: 'Missing environment variables'
        },
        { status: 503 } // Service Unavailable instead of 500
      )
    }

    // Initialize Razorpay at runtime, not at module level
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    let body: any = {}
    try {
      body = await request.json()
    } catch (error: any) {
      console.error('Invalid JSON in request body:', error)
      return NextResponse.json(
        { 
          error: 'Invalid request body. Expected JSON format.',
          details: error.message || 'JSON parse error'
        },
        { status: 400 }
      )
    }
    
    const { amount, currency = 'INR', receipt, notes } = body

    // Log the request for debugging
    console.log('Order creation request:', {
      amount,
      currency,
      receipt,
    })

    // Convert amount from rupees to paise (if provided in rupees)
    // Standard checkout: amount should be in paise
    let amountInPaise: number
    
    // If amount is less than 1000, assume it's in rupees and convert to paise
    // Otherwise, assume it's already in paise
    if (amount < 1000) {
      amountInPaise = parseInt(String(Math.round(Number(amount) * 100)), 10)
    } else {
      amountInPaise = parseInt(String(Math.round(Number(amount))), 10)
    }
    
    // Validate that amount is a valid number
    if (isNaN(amountInPaise) || !isFinite(amountInPaise)) {
      console.error('Invalid amount conversion:', { amount, amountInPaise })
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be a valid number.', details: `Amount: ${amount}` },
        { status: 400 }
      )
    }

    // Ensure minimum amount (Razorpay minimum is 1 rupee = 100 paise)
    if (amountInPaise < 100) {
      return NextResponse.json(
        { error: 'Minimum order amount is ₹1' },
        { status: 400 }
      )
    }
    
    // Ensure amount is an integer (Razorpay requirement)
    if (!Number.isInteger(amountInPaise)) {
      console.error('Amount is not an integer:', { amountInPaise })
      return NextResponse.json(
        { error: 'Amount must be an integer (in paise).', details: `Calculated amount: ${amountInPaise}` },
        { status: 400 }
      )
    }
    
    // Standard checkout order options (no line_items required)
    const options: any = {
      amount: amountInPaise, // Total order amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    }

    // Add notes if provided
    if (notes && Object.keys(notes).length > 0) {
      options.notes = notes
    }

    // Log the order options for debugging
    console.log('Creating Razorpay order (Standard Checkout):', {
      amount: amountInPaise,
      currency,
      receipt: options.receipt,
    })

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    })
  } catch (error: any) {
    // Log full error details for debugging
    console.error('Razorpay order creation error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode,
      description: error.description,
      field: error.field,
      source: error.source,
      step: error.step,
      reason: error.reason,
      errorObject: JSON.stringify(error, null, 2),
      errorKeys: Object.keys(error || {}),
    })
    
    // Extract error details from Razorpay error object
    // Razorpay errors can have different structures
    const errorMessage = error.message || error.description || error.error?.description || 'Failed to create order'
    const errorCode = error.code || error.error?.code || error.statusCode || 'UNKNOWN_ERROR'
    const errorDetails = error.description || error.error?.description || error.reason || error.error?.field || 'Unknown error'
    const statusCode = error.statusCode || error.error?.statusCode || 500
    
    // Return detailed error information
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        code: errorCode,
        field: error.field || error.error?.field || null,
        source: error.source || error.error?.source || null,
        step: error.step || error.error?.step || null,
        reason: error.reason || error.error?.reason || null,
        statusCode: statusCode,
        // Include full error for debugging (in development)
        ...(process.env.NODE_ENV === 'development' && { 
          fullError: {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            description: error.description,
          }
        }),
      },
      { status: statusCode }
    )
  }
}
