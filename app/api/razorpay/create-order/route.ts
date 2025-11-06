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
    // Must be an integer, not a float
    const amountInPaise = Math.round(Number(amount) * 100)
    
    // Validate that amount is a valid number
    if (isNaN(amountInPaise) || !isFinite(amountInPaise)) {
      console.error('Invalid amount conversion:', { amount, amountInPaise })
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be a valid number.', details: `Received amount: ${amount}` },
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
      console.error('Amount is not an integer:', { amount, amountInPaise })
      return NextResponse.json(
        { error: 'Amount must be an integer (in paise).', details: `Calculated amount: ${amountInPaise}` },
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
      // Must be integers, not floats
      const priceInPaise = Math.round(Number(product.price || amount) * 100)
      const offerPriceInPaise = Math.round(Number(product.offerPrice || product.price || amount) * 100)
      const taxAmountInPaise = Math.round(Number(product.taxAmount || 0) * 100)
      const quantity = Number(product.quantity || 1)
      
      // Validate all amounts are integers
      if (!Number.isInteger(priceInPaise) || !Number.isInteger(offerPriceInPaise) || !Number.isInteger(taxAmountInPaise) || !Number.isInteger(quantity)) {
        console.error('Invalid price conversion:', {
          originalPrice: product.price,
          originalOfferPrice: product.offerPrice,
          originalTaxAmount: product.taxAmount,
          originalQuantity: product.quantity,
          priceInPaise,
          offerPriceInPaise,
          taxAmountInPaise,
          quantity,
        })
        return NextResponse.json(
          { error: 'Invalid product prices. All prices must be valid numbers.', details: 'Prices must be integers in paise' },
          { status: 400 }
        )
      }
      
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
      line_items_sample: lineItems.length > 0 ? {
        sku: lineItems[0].sku,
        variant_id: lineItems[0].variant_id,
        price: lineItems[0].price,
        offer_price: lineItems[0].offer_price,
        tax_amount: lineItems[0].tax_amount,
        quantity: lineItems[0].quantity,
        name: lineItems[0].name,
        description: lineItems[0].description,
      } : null,
    })

    // Log full order options (for debugging - remove sensitive data in production)
    console.log('Full order options (sanitized):', JSON.stringify({
      ...options,
      line_items: lineItems.map(item => ({
        sku: item.sku,
        variant_id: item.variant_id,
        price: item.price,
        offer_price: item.offer_price,
        tax_amount: item.tax_amount,
        quantity: item.quantity,
        name: item.name,
        description: item.description,
        weight: item.weight,
        dimensions: item.dimensions,
      })),
    }, null, 2))

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
