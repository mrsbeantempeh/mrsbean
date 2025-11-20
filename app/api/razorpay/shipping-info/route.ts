import { NextRequest, NextResponse } from 'next/server'

/**
 * Shipping Info API for Razorpay Magic Checkout
 * 
 * Official Razorpay Documentation Reference:
 * https://razorpay.com/docs/payments/magic-checkout/web/
 * 
 * Requirements:
 * - Must be publicly accessible (no authentication)
 * - Must accept POST requests
 * - Must return shipping serviceability, COD serviceability, shipping fees and COD fees
 * - Must support CORS
 * 
 * Request Format (from Razorpay):
 * {
 *   "order_id": "receipt_xxx",
 *   "razorpay_order_id": "order_xxx",
 *   "email": "customer@example.com",  // optional
 *   "contact": "+919000000000",       // optional
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
 * Response Format (to Razorpay):
 * {
 *   "addresses": [
 *     {
 *       "id": "0",
 *       "zipcode": "411001",
 *       "country": "in",
 *       "shipping_methods": [
 *         {
 *           "id": "1",
 *           "name": "Standard Delivery",
 *           "description": "Delivered in 3-5 business days",
 *           "serviceable": true,
 *           "shipping_fee": 0,    // in paise
 *           "cod": true,
 *           "cod_fee": 0         // in paise
 *         }
 *       ]
 *     }
 *   ]
 * }
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 10

/**
 * Check if a pincode is a Pune pincode
 * Pune pincodes range from 411001 to 411999
 */
function isPunePincode(zipcode: string | number | undefined | null): boolean {
  if (zipcode === null || zipcode === undefined) {
    return false
  }
  
  const zipcodeStr = String(zipcode).trim()
  const cleanZipcode = zipcodeStr.replace(/[^\d]/g, '')
  
  if (cleanZipcode.length !== 6) {
    return false
  }
  
  const pincodeNum = parseInt(cleanZipcode, 10)
  
  if (isNaN(pincodeNum) || !isFinite(pincodeNum)) {
    return false
  }
  
  // Pune pincodes: 411001 to 411999
  return pincodeNum >= 411001 && pincodeNum <= 411999
}

/**
 * POST /api/razorpay/shipping-info
 * 
 * Handles shipping info requests from Razorpay Magic Checkout
 */
export async function POST(request: NextRequest) {
  // CORS headers - required for Razorpay to access this endpoint
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }

  let requestBody: any = {}
  
  try {
    // Parse request body
    const requestText = await request.text()
    console.log('📦 Shipping Info API - Incoming Request:', requestText)
    
    requestBody = JSON.parse(requestText)
    
    // Log request details
    console.log('📦 Shipping Info API - Parsed Request:', {
      order_id: requestBody.order_id,
      razorpay_order_id: requestBody.razorpay_order_id,
      email: requestBody.email,
      contact: requestBody.contact,
      addresses_count: Array.isArray(requestBody.addresses) ? requestBody.addresses.length : 0,
    })
  } catch (error: any) {
    console.error('❌ Shipping Info API - JSON Parse Error:', error)
    // Return valid response even on parse error
    return NextResponse.json(
      {
        addresses: [
          {
            id: '0',
            zipcode: '',
            country: 'in',
            shipping_methods: [
              {
                id: '1',
                name: 'Error',
                description: 'Invalid request format',
                serviceable: false,
                shipping_fee: 0,
                cod: false,
                cod_fee: 0,
              },
            ],
          },
        ],
      },
      { status: 200, headers: corsHeaders }
    )
  }

  // Extract addresses from request
  const addresses = Array.isArray(requestBody.addresses) ? requestBody.addresses : []
  
  if (addresses.length === 0) {
    console.warn('⚠️ Shipping Info API - No addresses in request')
    return NextResponse.json(
      {
        addresses: [
          {
            id: '0',
            zipcode: '',
            country: 'in',
            shipping_methods: [
              {
                id: '1',
                name: 'No Address',
                description: 'No address provided',
                serviceable: false,
                shipping_fee: 0,
                cod: false,
                cod_fee: 0,
              },
            ],
          },
        ],
      },
      { status: 200, headers: corsHeaders }
    )
  }

  // Process each address
  const responseAddresses = addresses.map((addr: any, index: number) => {
    // Extract zipcode - handle both string and number types
    let zipcode: string = ''
    if (addr.zipcode !== undefined && addr.zipcode !== null) {
      zipcode = String(addr.zipcode).trim()
    }
    
    // Extract country - normalize to lowercase
    const country = String(addr.country ?? 'in').toLowerCase()
    
    // Extract address ID
    const addressId = String(addr.id ?? index.toString())
    
    // Check if pincode is Pune
    const isPune = isPunePincode(zipcode)
    const cleanedZipcode = zipcode.replace(/[^\d]/g, '')
    
    console.log(`📍 Address ${index + 1}: zipcode="${zipcode}" (cleaned: "${cleanedZipcode}"), country="${country}", isPune=${isPune}`)
    
    // For Pune pincodes in India: serviceable with COD
    if (isPune && country === 'in') {
      console.log(`✅ Pune pincode ${zipcode} is serviceable with COD`)
      
      return {
        id: addressId,
        zipcode: zipcode,
        country: country,
        shipping_methods: [
          {
            id: '1',
            name: '24-Hour Delivery',
            description: 'Fresh delivery within 24 hours in Pune',
            serviceable: true,
            shipping_fee: 0,  // Free shipping (in paise)
            cod: true,       // COD available
            cod_fee: 0,      // No COD charges (in paise)
          },
        ],
      }
    }
    
    // For non-Pune areas: not serviceable
    console.log(`❌ Pincode ${zipcode} is NOT serviceable`)
    
    return {
      id: addressId,
      zipcode: zipcode,
      country: country,
      shipping_methods: [
        {
          id: '1',
          name: 'Not Serviceable',
          description: 'Currently we only deliver in Pune. Please check back soon!',
          serviceable: false,
          shipping_fee: 0,
          cod: false,
          cod_fee: 0,
        },
      ],
    }
  })

  // Log response
  console.log('✅ Shipping Info API - Response:', JSON.stringify({ addresses: responseAddresses }, null, 2))
  
  // Return response
  return NextResponse.json(
    { addresses: responseAddresses },
    { status: 200, headers: corsHeaders }
  )
}

/**
 * OPTIONS /api/razorpay/shipping-info
 * 
 * Handles CORS preflight requests
 */
export async function OPTIONS() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
  
  return NextResponse.json({}, { headers: corsHeaders })
}

/**
 * GET /api/razorpay/shipping-info
 * 
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }

  return NextResponse.json(
    {
      status: 'ok',
      message: 'Shipping Info API is active',
      endpoint: '/api/razorpay/shipping-info',
      method: 'POST',
      description: 'Returns shipping serviceability, COD availability, and fees for given addresses',
      documentation: 'https://razorpay.com/docs/payments/magic-checkout/web/',
    },
    { headers: corsHeaders }
  )
}
