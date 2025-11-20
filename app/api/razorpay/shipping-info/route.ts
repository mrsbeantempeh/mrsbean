import { NextRequest, NextResponse } from 'next/server'

/**
 * Shipping Info API for Razorpay Magic Checkout
 * 
 * Official Razorpay Documentation Reference:
 * https://razorpay.com/docs/payments/magic-checkout/web/
 * 
 * CRITICAL REQUIREMENTS:
 * - Must return HTTP 200 status code (even on errors)
 * - Must return valid JSON response
 * - Must respond within timeout (Razorpay timeout: ~10 seconds)
 * - Must be publicly accessible (no authentication)
 * - Must support CORS
 * - Response must match exact format specified in documentation
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 10

/**
 * Check if a pincode is a Pune pincode
 * Pune pincodes range from 411001 to 411999
 */
function isPunePincode(zipcode: string | number | undefined | null): boolean {
  try {
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
  } catch (error) {
    return false
  }
}

/**
 * Create a valid shipping method response
 */
function createShippingMethod(serviceable: boolean, isPune: boolean = false) {
  if (serviceable && isPune) {
    return {
      id: '1',
      name: '24-Hour Delivery',
      description: 'Fresh delivery within 24 hours in Pune',
      serviceable: true,
      shipping_fee: 0,  // Free shipping (in paise)
      cod: true,       // COD available
      cod_fee: 0,      // No COD charges (in paise)
    }
  }
  
  return {
    id: '1',
    name: 'Not Serviceable',
    description: 'Currently we only deliver in Pune. Please check back soon!',
    serviceable: false,
    shipping_fee: 0,
    cod: false,
    cod_fee: 0,
  }
}

/**
 * POST /api/razorpay/shipping-info
 * 
 * Handles shipping info requests from Razorpay Magic Checkout
 * CRITICAL: Must always return HTTP 200 with valid JSON response
 */
export async function POST(request: NextRequest) {
  // CORS headers - required for Razorpay to access this endpoint
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }

  // Default response structure - always return this format
  const defaultResponse = {
    addresses: [
      {
        id: '0',
        zipcode: '',
        country: 'in',
        shipping_methods: [
          createShippingMethod(false),
        ],
      },
    ],
  }

  let requestBody: any = {}
  
  try {
    // Parse request body - handle both text and JSON
    const requestText = await request.text()
    
    if (!requestText || requestText.trim() === '') {
      console.warn('⚠️ Shipping Info API - Empty request body')
      return NextResponse.json(defaultResponse, { status: 200, headers: corsHeaders })
    }
    
    requestBody = JSON.parse(requestText)
    
    // Log request details (without sensitive data)
    console.log('📦 Shipping Info API - Request:', {
      order_id: requestBody.order_id || 'N/A',
      razorpay_order_id: requestBody.razorpay_order_id || 'N/A',
      addresses_count: Array.isArray(requestBody.addresses) ? requestBody.addresses.length : 0,
    })
  } catch (error: any) {
    // CRITICAL: Always return valid response, never throw error
    console.error('❌ Shipping Info API - Parse Error:', error.message)
    return NextResponse.json(defaultResponse, { status: 200, headers: corsHeaders })
  }

  // Extract addresses from request
  let addresses: any[] = []
  
  try {
    addresses = Array.isArray(requestBody.addresses) ? requestBody.addresses : []
  } catch (error) {
    console.error('❌ Shipping Info API - Error extracting addresses:', error)
    return NextResponse.json(defaultResponse, { status: 200, headers: corsHeaders })
  }
  
  // If no addresses, return default response
  if (addresses.length === 0) {
    console.warn('⚠️ Shipping Info API - No addresses in request')
    return NextResponse.json(defaultResponse, { status: 200, headers: corsHeaders })
  }

  // Process each address - ensure we always return valid response
  let responseAddresses: any[] = []
  
  try {
    responseAddresses = addresses.map((addr: any, index: number) => {
      try {
        // Extract zipcode - handle both string and number types
        let zipcode: string = ''
        if (addr.zipcode !== undefined && addr.zipcode !== null) {
          zipcode = String(addr.zipcode).trim()
        }
        
        // Extract country - normalize to lowercase
        const country = String(addr.country ?? 'in').toLowerCase()
        
        // Extract address ID - ensure it's a string
        const addressId = String(addr.id ?? index.toString())
        
        // Check if pincode is Pune
        const isPune = isPunePincode(zipcode)
        const cleanedZipcode = zipcode.replace(/[^\d]/g, '')
        
        console.log(`📍 Address ${index + 1}: zipcode="${zipcode}" (cleaned: "${cleanedZipcode}"), country="${country}", isPune=${isPune}`)
        
        // Determine serviceability
        const serviceable = isPune && country === 'in'
        
        // Create response for this address
        return {
          id: addressId,
          zipcode: zipcode || '',
          country: country,
          shipping_methods: [
            createShippingMethod(serviceable, isPune),
          ],
        }
      } catch (addrError: any) {
        // If processing individual address fails, return default for that address
        console.error(`❌ Error processing address ${index}:`, addrError)
        return {
          id: String(addr.id ?? index.toString()),
          zipcode: String(addr.zipcode ?? ''),
          country: String(addr.country ?? 'in').toLowerCase(),
          shipping_methods: [
            createShippingMethod(false),
          ],
        }
      }
    })
  } catch (error: any) {
    // If processing fails completely, return default response
    console.error('❌ Shipping Info API - Processing Error:', error)
    return NextResponse.json(defaultResponse, { status: 200, headers: corsHeaders })
  }

  // Ensure we have at least one address in response
  if (responseAddresses.length === 0) {
    responseAddresses = [defaultResponse.addresses[0]]
  }

  // Log response (truncated for large responses)
  const responseLog = responseAddresses.length > 0 
    ? { 
        address_count: responseAddresses.length,
        first_address: {
          zipcode: responseAddresses[0].zipcode,
          country: responseAddresses[0].country,
          serviceable: responseAddresses[0].shipping_methods[0]?.serviceable,
        }
      }
    : 'empty'
  console.log('✅ Shipping Info API - Response:', JSON.stringify(responseLog, null, 2))
  
  // CRITICAL: Always return HTTP 200 with valid JSON
  try {
    return NextResponse.json(
      { addresses: responseAddresses },
      { status: 200, headers: corsHeaders }
    )
  } catch (error: any) {
    // Last resort: return default response
    console.error('❌ Shipping Info API - Response Error:', error)
    return NextResponse.json(defaultResponse, { status: 200, headers: corsHeaders })
  }
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
  
  return NextResponse.json({}, { status: 200, headers: corsHeaders })
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
    { status: 200, headers: corsHeaders }
  )
}
