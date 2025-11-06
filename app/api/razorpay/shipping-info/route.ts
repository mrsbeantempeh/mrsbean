import { NextRequest, NextResponse } from 'next/server'

/**
 * Shipping Info API for Razorpay Magic Checkout
 * 
 * According to Razorpay documentation:
 * - Must be publicly accessible
 * - No authentication required
 * - Should return shipping serviceability, COD serviceability, shipping fees and COD fees
 * 
 * Request format (from Razorpay):
 * {
 *   "order_id": "receipt#1",
 *   "razorpay_order_id": "order_EKwxwAgItmmXdp",
 *   "email": "customer@example.com",
 *   "contact": "+919000090000",
 *   "addresses": [
 *     {
 *       "id": "0" or 0,
 *       "zipcode": "411001",
 *       "state_code": "MH",  // optional
 *       "country": "IN" or "in"
 *     }
 *   ]
 * }
 * 
 * Response format (expected by Razorpay):
 * {
 *   "addresses": [
 *     {
 *       "id": "0",
 *       "zipcode": "411001",
 *       "country": "IN",
 *       "shipping_methods": [
 *         {
 *           "id": "1",
 *           "description": "Free shipping",
 *           "name": "Delivery within 24 hours",
 *           "serviceable": true,
 *           "shipping_fee": 0,  // in paise
 *           "cod": true,
 *           "cod_fee": 0  // in paise
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
export const dynamic = 'force-dynamic'
export const runtime = 'edge'
export const maxDuration = 10

export async function POST(request: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  const defaultResponse = {
    addresses: [
      {
        id: '0',
        zipcode: '',
        country: 'in',
        shipping_methods: [
          {
            id: '1',
            name: 'Standard Delivery',
            description: 'Delivered in 3-5 business days',
            serviceable: true,
            shipping_fee: 5000,
            cod: true,
            cod_fee: 2000,
          },
        ],
      },
    ],
  }

  let body: any = {}
  try {
    const requestText = await request.text()
    console.log('📦 Incoming Shipping Info Payload:', requestText)
    body = JSON.parse(requestText)
  } catch (e) {
    console.error('❌ JSON parse failed:', e)
    return NextResponse.json(defaultResponse, { status: 200, headers: corsHeaders })
  }

  const addresses = Array.isArray(body.addresses) ? body.addresses : []
  const responseAddresses = addresses.map((addr: any) => ({
    id: String(addr.id ?? '0'),
    zipcode: addr.zipcode ?? '',
    country: String(addr.country ?? 'in').toLowerCase(),
    shipping_methods: [
      {
        id: '1',
        name: 'Standard Delivery',
        description: 'Delivered in 3-5 business days',
        serviceable: true,
        shipping_fee: 5000,
        cod: true,
        cod_fee: 2000,
      },
    ],
  }))

  console.log('✅ Shipping Info Response:', JSON.stringify({ addresses: responseAddresses }))
  return NextResponse.json({ addresses: responseAddresses }, { status: 200, headers: corsHeaders })
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
      message: 'Shipping info API is active',
      endpoint: '/api/razorpay/shipping-info',
      method: 'POST',
      description: 'Returns shipping serviceability, COD availability, and fees for given addresses',
    },
    { headers: corsHeaders }
  )
}
