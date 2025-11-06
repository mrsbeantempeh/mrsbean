import { NextRequest, NextResponse } from 'next/server'

/**
 * Get Promotions API for Razorpay Magic Checkout
 * 
 * According to Razorpay documentation:
 * - Must be publicly accessible
 * - No authentication required
 * - Should return a list of promotions applicable to the specified order_id and customer
 * - Magic Checkout uses this endpoint to fetch promotions and display them in the checkout modal
 * 
 * Request format (from Razorpay):
 * {
 *   "order_id": "order_EKwxwAgItmmXdp",
 *   "email": "customer@example.com",  // optional
 *   "contact": "+919000090000",  // optional
 *   "amount": 50000  // order amount in paise
 * }
 * 
 * Response format (expected by Razorpay):
 * {
 *   "promotions": [
 *     {
 *       "id": "promo_1",
 *       "code": "WELCOME10",
 *       "name": "Welcome Discount",
 *       "description": "Get 10% off on your first order",
 *       "discount_type": "percentage",  // or "fixed"
 *       "discount_value": 10,  // percentage or amount in paise
 *       "min_amount": 1000,  // minimum order amount in paise
 *       "max_discount": 5000,  // maximum discount in paise (for percentage)
 *       "valid_from": "2024-01-01T00:00:00Z",
 *       "valid_until": "2024-12-31T23:59:59Z",
 *       "applicable": true
 *     }
 *   ]
 * }
 */
export const dynamic = 'force-dynamic'
export const maxDuration = 10 // Maximum execution time in seconds (Vercel limit)

export async function POST(request: NextRequest) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
  }

  // Default response - return empty promotions list if anything goes wrong
  const defaultResponse = {
    promotions: [],
  }

  try {
    // Parse request body
    const body = await request.json()
    console.log('Get Promotions API Request:', JSON.stringify(body, null, 2))

    // Extract request parameters
    const { order_id, email, contact, amount } = body || {}

    // Log request details for debugging
    console.log('Get Promotions API - Request Details:', {
      order_id,
      email,
      contact,
      amount,
    })

    // Define available promotions
    // You can customize these based on your business logic
    // Format matches Razorpay's expected format: code, summary, description
    const promotions: any[] = []

    // Example: Welcome discount for new customers (if email is provided)
    if (email) {
      promotions.push({
        code: 'WELCOME10',
        summary: '10% off on total cart value',
        description: 'Get 10% discount on your total purchase. Valid for first-time customers only.',
      })
    }

    // Example: Flat discount for orders above ₹500
    if (amount && amount >= 50000) { // ₹500 = 50000 paise
      promotions.push({
        code: 'FLAT50',
        summary: 'Flat ₹50 off on orders above ₹500',
        description: 'Get ₹50 off on orders above ₹500. Limited time offer.',
      })
    }

    // Example: Free shipping promotion
    promotions.push({
      code: 'FREESHIP',
      summary: 'Free shipping on all orders',
      description: 'Enjoy free shipping on all orders. No minimum order value required.',
    })

    // Example: Summer sale promotion
    promotions.push({
      code: 'SUMMER20',
      summary: '20% off on orders above ₹1000',
      description: 'Get 20% discount on orders above ₹1000. Valid during summer sale.',
    })

    console.log('Get Promotions API Response:', JSON.stringify({ promotions }, null, 2))

    return NextResponse.json(
      { promotions },
      {
        status: 200,
        headers: corsHeaders,
      }
    )
  } catch (error: any) {
    // Log error but always return a valid response
    console.error('Get Promotions API Error:', {
      message: error?.message || 'Unknown error',
      error: error?.toString() || 'Unknown',
    })

    // Always return a valid response (empty promotions list)
    return NextResponse.json(defaultResponse, {
      status: 200,
      headers: corsHeaders,
    })
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
      message: 'Get promotions API is active',
      endpoint: '/api/razorpay/get-promotions',
      method: 'POST',
      description: 'Returns a list of promotions applicable to the specified order_id and customer',
    },
    { headers: corsHeaders }
  )
}

