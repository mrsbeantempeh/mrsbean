import { NextRequest, NextResponse } from 'next/server'

/**
 * Apply Promotions API for Razorpay Magic Checkout
 * 
 * According to Razorpay documentation:
 * - Must be publicly accessible
 * - No authentication required
 * - Validates the promotion code applied by the customer
 * - Returns the discount amount
 * - Magic Checkout uses this endpoint to apply promotions via your server
 * 
 * Request format (from Razorpay):
 * {
 *   "order_id": "order_EKwxwAgItmmXdp",
 *   "email": "customer@example.com",  // optional
 *   "contact": "+919000090000",  // optional
 *   "code": "WELCOME10"  // promotion code applied by customer
 * }
 * 
 * Response format (expected by Razorpay):
 * {
 *   "promotion": {
 *     "reference_id": "promo_123",
 *     "code": "WELCOME10",
 *     "type": "coupon",  // or "offer"
 *     "value": 10000,  // discount value in paise
 *     "value_type": "percentage",  // or "fixed_amount"
 *     "description": "10% off on total cart value"
 *   }
 * }
 */
export const dynamic = 'force-dynamic'
export const runtime = 'edge'
export const maxDuration = 10

export async function POST(request: NextRequest) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
  }

  try {
    // Parse request body
    const body = await request.json()
    console.log('Apply Promotions API Request:', JSON.stringify(body, null, 2))

    // Extract request parameters
    const { order_id, email, contact, code, amount } = body || {}

    // Log request details for debugging
    console.log('Apply Promotions API - Request Details:', {
      order_id,
      email,
      contact,
      code,
      amount,
    })

    // Validate that code is provided
    if (!code) {
      return NextResponse.json(
        {
          error: 'Promotion code is required',
          promotion: null,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    // Normalize code to uppercase for comparison
    const normalizedCode = String(code).toUpperCase().trim()

    // Define available promotions with their discount details
    // You can customize these based on your business logic
    const promotions: Record<string, any> = {
      // Welcome discount: 10% off, max ₹50, min order ₹10
      WELCOME10: {
        reference_id: 'promo_welcome10',
        code: 'WELCOME10',
        type: 'coupon',
        value: 10, // 10% discount
        value_type: 'percentage',
        description: '10% off on total cart value',
        min_amount: 1000, // Minimum order: ₹10 (1000 paise)
        max_discount: 5000, // Maximum discount: ₹50 (5000 paise)
        applicable: email ? true : false, // Only for customers with email
      },
      // Flat discount: ₹50 off on orders above ₹500
      FLAT50: {
        reference_id: 'promo_flat50',
        code: 'FLAT50',
        type: 'coupon',
        value: 5000, // ₹50 = 5000 paise
        value_type: 'fixed_amount',
        description: 'Flat ₹50 off on orders above ₹500',
        min_amount: 50000, // Minimum order: ₹500 (50000 paise)
        max_discount: 5000, // Same as value for fixed discount
        applicable: amount && amount >= 50000 ? true : false,
      },
      // Free shipping: No discount, just free shipping
      FREESHIP: {
        reference_id: 'promo_freeship',
        code: 'FREESHIP',
        type: 'coupon',
        value: 0, // No discount, just free shipping
        value_type: 'fixed_amount',
        description: 'Free shipping on all orders',
        min_amount: 0, // No minimum amount
        max_discount: 0,
        applicable: true, // Always applicable
      },
      // Summer sale: 20% off on orders above ₹1000
      SUMMER20: {
        reference_id: 'promo_summer20',
        code: 'SUMMER20',
        type: 'coupon',
        value: 20, // 20% discount
        value_type: 'percentage',
        description: '20% off on orders above ₹1000',
        min_amount: 100000, // Minimum order: ₹1000 (100000 paise)
        max_discount: 20000, // Maximum discount: ₹200 (20000 paise)
        applicable: amount && amount >= 100000 ? true : false,
      },
    }

    // Check if promotion code exists
    const promotion = promotions[normalizedCode]

    if (!promotion) {
      console.warn('Invalid promotion code:', normalizedCode)
      return NextResponse.json(
        {
          error: 'Invalid promotion code',
          promotion: null,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    // Check if promotion is applicable
    if (!promotion.applicable) {
      console.warn('Promotion not applicable:', {
        code: normalizedCode,
        reason: 'Promotion conditions not met',
        email: !!email,
        amount,
        min_amount: promotion.min_amount,
      })
      return NextResponse.json(
        {
          error: 'Promotion code is not applicable',
          promotion: null,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    // Calculate discount amount based on order amount
    let discountAmount = 0

    if (promotion.value_type === 'percentage') {
      // Percentage discount
      if (amount) {
        discountAmount = Math.round((amount * promotion.value) / 100)
        // Apply max discount limit if specified
        if (promotion.max_discount && discountAmount > promotion.max_discount) {
          discountAmount = promotion.max_discount
        }
      }
    } else if (promotion.value_type === 'fixed_amount') {
      // Fixed amount discount
      discountAmount = promotion.value
    }

    // Build response with promotion details
    const response = {
      promotion: {
        reference_id: promotion.reference_id,
        code: promotion.code,
        type: promotion.type,
        value: discountAmount, // Discount amount in paise
        value_type: promotion.value_type,
        description: promotion.description,
      },
    }

    console.log('Apply Promotions API Response:', JSON.stringify(response, null, 2))

    return NextResponse.json(response, {
      status: 200,
      headers: corsHeaders,
    })
  } catch (error: any) {
    // Log error
    console.error('Apply Promotions API Error:', {
      message: error?.message || 'Unknown error',
      error: error?.toString() || 'Unknown',
    })

    // Return error response
    return NextResponse.json(
      {
        error: error?.message || 'Failed to apply promotion',
        promotion: null,
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
  return NextResponse.json({}, { headers: corsHeaders })
}

// Also support GET for health checks
export async function GET(request: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }

  return NextResponse.json(
    {
      status: 'ok',
      message: 'Apply promotions API is active',
      endpoint: '/api/razorpay/apply-promotions',
      method: 'POST',
      description: 'Validates promotion code and returns discount amount',
    },
    { headers: corsHeaders }
  )
}

