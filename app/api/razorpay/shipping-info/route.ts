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
export const maxDuration = 10 // Maximum execution time in seconds (Vercel limit)

export async function POST(request: NextRequest) {
  // CORS headers
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
        country: 'IN',
        shipping_methods: [
          {
            id: '1',
            description: 'Free shipping',
            name: 'Delivery within 24 hours',
            serviceable: true,
            shipping_fee: 0, // in paise (0 = ₹0)
            cod: true,
            cod_fee: 0, // in paise (0 = ₹0)
          },
        ],
      },
    ],
  }

  try {
    // Parse request body
    const body = await request.json()
    console.log('Shipping Info API Request:', JSON.stringify(body, null, 2))

    // Extract addresses from request
    const { addresses, order_id, razorpay_order_id, email, contact } = body || {}

    // Log request details for debugging
    console.log('Shipping Info API - Request Details:', {
      order_id,
      razorpay_order_id,
      email,
      contact,
      addressesCount: addresses?.length || 0,
    })

    // If addresses are provided, process them
    if (addresses && Array.isArray(addresses) && addresses.length > 0) {
      const responseAddresses = addresses.map((address: any) => {
        // Handle different address formats from Razorpay
        // id can be number (0) or string ("0") - convert to string
        const addressId = address?.id !== undefined ? String(address.id) : '0'
        
        // zipcode
        const addressZipcode = address?.zipcode || ''
        
        // state_code (optional)
        const addressStateCode = address?.state_code || ''
        
        // country can be lowercase ("in") or uppercase ("IN") - convert to uppercase
        const addressCountry = address?.country 
          ? String(address.country).toUpperCase() 
          : 'IN'

        // Determine serviceability based on country
        // Service all addresses in India
        const isServiceable = addressCountry === 'IN' || addressCountry === ''

        // Return address with shipping methods
        return {
          id: addressId,
          zipcode: addressZipcode,
          ...(addressStateCode && { state_code: addressStateCode }), // Include state_code only if present
          country: addressCountry,
          shipping_methods: [
            {
              id: '1',
              description: 'Free shipping',
              name: 'Delivery within 24 hours',
              serviceable: isServiceable,
              shipping_fee: 0, // in paise (0 = ₹0)
              cod: isServiceable, // COD available if serviceable
              cod_fee: 0, // in paise (0 = ₹0)
            },
          ],
        }
      })

      console.log('Shipping Info API Response:', JSON.stringify({ addresses: responseAddresses }, null, 2))
      
      return NextResponse.json(
        { addresses: responseAddresses },
        { 
          status: 200, 
          headers: corsHeaders 
        }
      )
    }

    // If no addresses provided, return default response
    console.warn('Shipping Info API: No addresses provided, returning default response')
    return NextResponse.json(defaultResponse, { 
      status: 200,
      headers: corsHeaders 
    })
  } catch (error: any) {
    // Log error but always return a valid response
    console.error('Shipping Info API Error:', {
      message: error?.message || 'Unknown error',
      error: error?.toString() || 'Unknown',
    })
    
    // Always return a valid response to prevent Magic Checkout from getting stuck
    return NextResponse.json(defaultResponse, { 
      status: 200,
      headers: corsHeaders 
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
      message: 'Shipping info API is active',
      endpoint: '/api/razorpay/shipping-info',
      method: 'POST',
      description: 'Returns shipping serviceability, COD availability, and fees for given addresses',
    },
    { headers: corsHeaders }
  )
}
