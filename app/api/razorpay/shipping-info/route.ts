import { NextRequest, NextResponse } from 'next/server'

/**
 * Shipping Info API for Razorpay Magic Checkout
 * 
 * According to Razorpay documentation:
 * - Must be publicly accessible
 * - No authentication required
 * - Should return shipping serviceability, COD serviceability, shipping fees and COD fees
 * 
 * Request format:
 * {
 *   "order_id": "receipt#1",
 *   "razorpay_order_id": "order_EKwxwAgItmmXdp",
 *   "email": "customer@example.com",
 *   "contact": "+919000090000",
 *   "addresses": [
 *     {
 *       "id": "0",
 *       "zipcode": "411001",
 *       "state_code": "MH",  // optional
 *       "country": "IN"
 *     }
 *   ]
 * }
 * 
 * Response format:
 * {
 *   "addresses": [
 *     {
 *       "id": "0",
 *       "zipcode": "411001",
 *       "country": "IN",
 *       "shipping_methods": [
 *         {
 *           "id": "standard",
 *           "name": "Standard Delivery",
 *           "description": "Free shipping",
 *           "serviceable": true,
 *           "shipping_fee": 0,
 *           "cod": true,
 *           "cod_fee": 0
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
export const dynamic = 'force-dynamic'
export const maxDuration = 10 // Maximum execution time in seconds (Vercel limit)

export async function POST(request: NextRequest) {
  // CORS headers - defined once at the top
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
  }

  // Default response - always return this if anything goes wrong
  // This is the simplest possible response that Razorpay will accept
  const defaultResponse = {
    addresses: [
      {
        id: '0',
        zipcode: '',
        state_code: '',
        country: 'IN',
        shipping_methods: [
          {
            id: '1',
            description: 'Free shipping',
            name: 'Delivery within 5 days',
            serviceable: true,
            shipping_fee: 0,
            cod: true,
            cod_fee: 0,
          },
          {
            id: '2',
            description: 'Standard Delivery',
            name: 'Delivered on the same day',
            serviceable: true,
            shipping_fee: 0,
            cod: false,
            cod_fee: 0,
          }
        ],
      }
    ],
  }

  // Try to parse request, but always return a valid response
  let body: any = {}
  try {
    body = await request.json()
    console.log('Shipping Info API Request:', JSON.stringify(body, null, 2))
  } catch (parseError) {
    // If parsing fails, just use empty body and return default response
    console.warn('Shipping Info API: Failed to parse request body, using default response')
  }

  // Extract addresses from request
  const { addresses } = body || {}

  // If addresses are provided, process them; otherwise return default
  if (addresses && Array.isArray(addresses) && addresses.length > 0) {
    try {
      const responseAddresses = addresses.map((address: any) => {
        const { id, zipcode, state_code, country } = address || {}
        
        return {
          id: id || '0',
          zipcode: zipcode || '',
          state_code: state_code || '',
          country: (country || 'IN').toUpperCase(),
          shipping_methods: [
            {
              id: '1',
              description: 'Free shipping',
              name: 'Delivery within 5 days',
              serviceable: true,
              shipping_fee: 0,
              cod: true,
              cod_fee: 0,
            },
            {
              id: '2',
              description: 'Standard Delivery',
              name: 'Delivered on the same day',
              serviceable: true,
              shipping_fee: 0,
              cod: false,
              cod_fee: 0,
            }
          ],
        }
      })

      console.log('Shipping Info API Response:', JSON.stringify({ addresses: responseAddresses }, null, 2))
      
      return NextResponse.json(
        { addresses: responseAddresses },
        { status: 200, headers: corsHeaders }
      )
    } catch (error) {
      console.error('Shipping Info API: Error processing addresses, using default response', error)
    }
  }

  // Always return a valid response (default or processed)
  return NextResponse.json(defaultResponse, { 
    status: 200,
    headers: corsHeaders 
  })
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}

// Also support GET for health checks and Razorpay compatibility
export async function GET(request: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }

  // If Razorpay calls with query parameters, try to extract them
  const searchParams = request.nextUrl.searchParams
  const orderId = searchParams.get('order_id')
  const razorpayOrderId = searchParams.get('razorpay_order_id')
  
  // If query parameters are present, return a default serviceable response
  if (orderId || razorpayOrderId) {
    return NextResponse.json(
      {
        addresses: [
          {
            id: '0',
            zipcode: '',
            state_code: '',
            country: 'IN',
            shipping_methods: [
              {
                id: '1',
                description: 'Free shipping',
                name: 'Delivery within 5 days',
                serviceable: true,
                shipping_fee: 0,
                cod: true,
                cod_fee: 0,
              },
              {
                id: '2',
                description: 'Standard Delivery',
                name: 'Delivered on the same day',
                serviceable: true,
                shipping_fee: 0,
                cod: false,
                cod_fee: 0,
              }
            ],
          }
        ],
      },
      { headers: corsHeaders }
    )
  }

  // Otherwise, return health check response
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
