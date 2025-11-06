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

    const body = await request.json()
    const { amount, currency = 'INR', receipt, notes, product } = body

    // Log the request for debugging
    console.log('Order creation request:', {
      amount,
      currency,
      receipt,
      hasProduct: !!product,
      productName: product?.name,
      productPrice: product?.price,
      productQuantity: product?.quantity,
    })

    // Validate dynamic cart value
    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount)
      return NextResponse.json(
        { error: 'Invalid cart amount. Amount must be greater than 0.', details: `Received amount: ${amount}` },
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
    // Reference: https://razorpay.com/docs/payments/magic-checkout/web/
    
    let lineItems: any[] = []
    let lineItemsTotal = 0
    
    if (product) {
      // Convert prices from rupees to paise
      const priceInPaise = Math.round((product.price || amount) * 100)
      const offerPriceInPaise = Math.round((product.offerPrice || product.price || amount) * 100)
      const taxAmountInPaise = Math.round((product.taxAmount || 0) * 100)
      const quantity = product.quantity || 1
      
      // Calculate line_items_total: sum of (offer_price * quantity) for all items
      // For single item: offer_price * quantity
      lineItemsTotal = offerPriceInPaise * quantity
      
      // Build line_item according to Razorpay Magic Checkout documentation
      const lineItem: any = {
        // Mandatory fields
        sku: product.sku || `SKU-${Date.now()}`, // Unique product ID (alphanumeric)
        variant_id: product.variant_id || `VARIANT-${Date.now()}`, // Unique variant ID (alphanumeric)
        price: priceInPaise, // Original price in paise
        offer_price: offerPriceInPaise, // Final price after discount in paise
        tax_amount: taxAmountInPaise, // Tax amount in paise
        quantity: quantity, // Number of units
        name: product.name || 'Product', // Product name
        description: product.description || product.name || 'Product description', // Product description
        
        // Optional fields
        weight: product.weight || 0, // Weight in grams
        dimensions: product.dimensions ? {
          length: String(product.dimensions.length || product.length || 0), // Length in centimeters (string)
          width: String(product.dimensions.width || product.width || 0), // Width in centimeters (string)
          height: String(product.dimensions.height || product.height || 0), // Height in centimeters (string)
        } : {
          length: String(product.length || 0),
          width: String(product.width || 0),
          height: String(product.height || 0),
        },
        image_url: product.image_url || product.image || '', // Product image URL
        product_url: product.product_url || '', // Product page URL
        notes: product.notes || {}, // Additional notes (key-value pairs)
      }
      
      // Optional: other_product_codes (UPC, EAN, UNSPSC)
      if (product.other_product_codes) {
        lineItem.other_product_codes = product.other_product_codes
      }
      
      lineItems.push(lineItem)
    }
    
    // Validate that we have line items for Magic Checkout
    if (lineItems.length === 0) {
      console.error('No line items provided for Magic Checkout', {
        hasProduct: !!product,
        productData: product,
      })
      return NextResponse.json(
        { 
          error: 'Product information is required for Magic Checkout',
          details: 'line_items array cannot be empty. Product data is missing or invalid.',
          receivedProduct: product || null,
        },
        { status: 400 }
      )
    }

    // Ensure line_items_total matches the sum of line items
    if (lineItemsTotal === 0) {
      console.error('line_items_total is 0, recalculating from line items')
      lineItemsTotal = lineItems.reduce((sum, item) => sum + (item.offer_price * item.quantity), 0)
    }

    // Build order options according to Razorpay Magic Checkout documentation
    const options: any = {
      // Standard order fields
      amount: amountInPaise, // Total order amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      
      // Magic Checkout required parameters
      // line_items_total: Total of offer_price for all line items (in paise)
      // This is CRITICAL - without this, Razorpay defaults to Standard Checkout
      line_items_total: lineItemsTotal,
      line_items: lineItems, // Array of line items
    }

    // Add notes for Magic Checkout (customer details, address, etc.)
    if (notes && Object.keys(notes).length > 0) {
      options.notes = notes
    }

    // Log the order options for debugging (without sensitive data)
    console.log('Creating Razorpay order:', {
      amount: amountInPaise,
      currency,
      receipt: options.receipt,
      line_items_total: lineItemsTotal,
      line_items_count: lineItems.length,
    })

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
      description: error.description,
      field: error.field,
      source: error.source,
      step: error.step,
      reason: error.reason,
    })
    
    // Return detailed error information
    return NextResponse.json(
      { 
        error: error.message || error.description || 'Failed to create order',
        details: error.code || 'Unknown error',
        field: error.field || null,
        source: error.source || null,
        step: error.step || null,
        reason: error.reason || null,
        statusCode: error.statusCode || 500,
      },
      { status: error.statusCode || 500 }
    )
  }
}
