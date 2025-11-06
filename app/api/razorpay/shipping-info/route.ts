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

  try {
    // Parse request body with timeout handling
    let body: any = {}
    try {
      // Parse request body - use timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 3000) // 3 second timeout
      )
      body = await Promise.race([request.json(), timeoutPromise]) as any
    } catch (parseError) {
      // If parsing fails or times out, return default response immediately
      console.warn('Shipping Info API: Failed to parse request body, using default response', parseError)
      return NextResponse.json(defaultResponse, { 
        status: 200,
        headers: corsHeaders 
      })
    }

    // Log the request for debugging (but don't block on it)
    console.log('Shipping Info API Request:', JSON.stringify(body, null, 2))

    // Extract request parameters
    const { order_id, razorpay_order_id, email, contact, addresses } = body

    // Validate required parameters - be lenient, don't fail if some are missing
    // Razorpay may send requests with different formats
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      console.warn('Shipping Info API: No addresses provided, returning default response')
      // Return default response immediately
      return NextResponse.json(defaultResponse, { 
        status: 200,
        headers: corsHeaders 
      })
    }

    // Process each address and determine serviceability
    // Currently servicing all pin codes in India
    const responseAddresses = addresses.map((address: any) => {
      const { id, zipcode, state_code, country } = address

      // Validate required address fields - be lenient with validation
      // Razorpay may send addresses with missing fields, we should handle gracefully
      const addressId = id || '0'
      const addressZipcode = zipcode || ''
      const addressCountry = (country || '').toUpperCase()
      const addressStateCode = state_code || ''

      // Service all addresses - default to serviceable for all
      // Check if country is India (IN) or if country is missing/empty (default to India)
      const isIndia = addressCountry === 'IN' || addressCountry === '' || !addressCountry
      
      // Service all pin codes - ALWAYS return serviceable: true
      // This ensures Magic Checkout doesn't get stuck
      const serviceable = true // Always serviceable for all pincodes

      // Define shipping methods - ALWAYS return shipping methods
      // Method 1: Free shipping with COD (5 days delivery)
      // Method 2: Standard delivery without COD (same day delivery)
      // Always return shipping methods to ensure checkout proceeds
      const shipping_methods = [
        {
          id: '1',
          description: 'Free shipping',
          name: 'Delivery within 5 days',
          serviceable: true,
          shipping_fee: 0, // Free shipping in paise (₹0)
          cod: true, // COD available
          cod_fee: 0, // No COD fee in paise (₹0)
        },
        {
          id: '2',
          description: 'Standard Delivery',
          name: 'Delivered on the same day',
          serviceable: true,
          shipping_fee: 0, // Free shipping in paise (₹0)
          cod: false, // COD not available for same day delivery
          cod_fee: 0, // No COD fee in paise (₹0)
        }
      ]

      return {
        id: addressId,
        zipcode: addressZipcode,
        state_code: addressStateCode, // Include state_code in response
        country: addressCountry || 'IN', // Default to IN if missing
        shipping_methods: shipping_methods, // Always return shipping methods
      }
    })

    // Log the response for debugging
    console.log('Shipping Info API Response:', JSON.stringify({ addresses: responseAddresses }, null, 2))

    // Return response in the format expected by Razorpay Magic Checkout
    // Add CORS headers to allow Razorpay to access this endpoint
    return NextResponse.json(
      {
        addresses: responseAddresses,
      },
      {
        headers: corsHeaders,
      }
    )
  } catch (error: any) {
    // Log error but don't let it block the response
    console.error('Shipping info API error:', {
      message: error?.message || 'Unknown error',
      error: error?.toString() || 'Unknown',
    })
    
    // ALWAYS return a valid response immediately, even on error
    // This prevents Magic Checkout from getting stuck
    // Return default serviceable response for all addresses
    return NextResponse.json(defaultResponse, { 
      status: 200, // Always return 200, even on error, to prevent checkout from getting stuck
      headers: corsHeaders 
    })
  }
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
