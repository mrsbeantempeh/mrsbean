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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract request parameters
    const { order_id, razorpay_order_id, email, contact, addresses } = body

    // Validate required parameters
    if (!order_id || !razorpay_order_id || !email || !contact) {
      return NextResponse.json(
        { error: 'Missing required parameters: order_id, razorpay_order_id, email, contact are mandatory' },
        { status: 400 }
      )
    }

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { error: 'Addresses array is required' },
        { status: 400 }
      )
    }

    // Process each address and determine serviceability
    // Currently servicing all pin codes in India
    const responseAddresses = addresses.map((address: any) => {
      const { id, zipcode, state_code, country } = address

      // Validate required address fields
      if (!id || !zipcode || !country) {
        throw new Error('Address must have id, zipcode, and country')
      }

      // Service all addresses in India (country code 'IN')
      // You can customize this logic if you want to restrict to specific areas
      const isIndia = country === 'IN' || !country || country === ''
      
      // Service all pin codes - set to true for all addresses
      const serviceable = isIndia

      // Define shipping methods
      // Method 1: Free shipping with COD (5 days delivery)
      // Method 2: Standard delivery without COD (same day delivery)
      const shipping_methods = serviceable ? [
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
      ] : []

      return {
        id: id,
        zipcode: zipcode,
        state_code: state_code || '', // Include state_code in response
        country: country,
        shipping_methods: shipping_methods,
      }
    })

    // Return response in the format expected by Razorpay Magic Checkout
    // Add CORS headers to allow Razorpay to access this endpoint
    return NextResponse.json(
      {
        addresses: responseAddresses,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  } catch (error: any) {
    console.error('Shipping info API error:', error)
    
    // Return a default response that allows checkout to proceed
    // This prevents Magic Checkout from getting stuck
    try {
      const body = await request.json().catch(() => ({}))
      const { addresses } = body

      return NextResponse.json({
        addresses: (addresses || []).map((address: any) => ({
          id: address.id || '0',
          zipcode: address.zipcode || '',
          state_code: address.state_code || '',
          country: address.country || 'IN',
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
        })),
      })
    } catch (fallbackError) {
      // If we can't parse the request, return a minimal valid response
      return NextResponse.json({
        addresses: [
          {
            id: '0',
            zipcode: '000000',
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
      })
    }
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

// Also support GET for health checks
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      message: 'Shipping info API is active',
      endpoint: '/api/razorpay/shipping-info',
      method: 'POST',
      description: 'Returns shipping serviceability, COD availability, and fees for given addresses',
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}
