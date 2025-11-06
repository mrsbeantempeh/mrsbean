import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

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

    const { amount, currency = 'INR', receipt, notes, product } = await request.json()

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

    // CRITICAL: For Magic Checkout, we MUST include line_items_total and line_items
    // Without these, Razorpay defaults to Standard Checkout
    const options: any = {
      amount: amountInPaise, // Dynamic cart value in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      // Magic Checkout required parameters
      line_items_total: amountInPaise, // Total of offer_price for all line items (in paise)
      line_items: product ? [
        {
          sku: product.sku || `SKU-${Date.now()}`, // Unique product ID
          variant_id: product.variant_id || `VARIANT-${Date.now()}`, // Unique variant ID
          price: Math.round((product.price || amount) * 100), // Original price in paise
          offer_price: Math.round((product.offerPrice || product.price || amount) * 100), // Final price after discount in paise
          tax_amount: Math.round((product.taxAmount || 0) * 100), // Tax amount in paise
          quantity: product.quantity || 1,
          name: product.name || 'Product',
          description: product.description || product.name || 'Product description',
          weight: product.weight || 0, // Weight in grams
          dimensions: product.dimensions || {
            length: product.length || 0,
            width: product.width || 0,
            height: product.height || 0,
          },
          image_url: product.image_url || product.image || '',
          product_url: product.product_url || '',
          notes: product.notes || {},
        }
      ] : [],
    }

    // Add notes for Magic Checkout (customer details, address, etc.)
    if (notes && Object.keys(notes).length > 0) {
      options.notes = notes
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    })
  } catch (error: any) {
    console.error('Razorpay order creation error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode,
    })
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create order',
        details: error.code || 'Unknown error',
      },
      { status: error.statusCode || 500 }
    )
  }
}
