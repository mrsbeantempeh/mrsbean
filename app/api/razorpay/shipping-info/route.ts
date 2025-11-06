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
 *       "state_code": "MH",
 *       "country": "IN"
 *     }
 *   ]
 * }
 * 
 * Response format:
 * {
 *   "order_id": "receipt#1",
 *   "razorpay_order_id": "order_EKwxwAgItmmXdp",
 *   "shipping_info": [
 *     {
 *       "id": "0",
 *       "serviceable": true,
 *       "cod_available": true,
 *       "shipping_fee": 0,
 *       "cod_fee": 0
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

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { error: 'Addresses array is required' },
        { status: 400 }
      )
    }

    // Process each address and determine serviceability
    // Currently servicing all pin codes in India
    const shipping_info = addresses.map((address: any) => {
      const { id, zipcode, state_code, country, city, state } = address

      // Service all addresses in India (country code 'IN')
      // You can customize this logic if you want to restrict to specific areas
      const isIndia = country === 'IN' || !country || country === ''
      
      // Service all pin codes - set to true for all addresses
      const serviceable = isIndia

      // Shipping fee in paise (₹0 for free shipping)
      const shipping_fee = serviceable ? 0 : null

      // COD availability (enabled for all serviceable areas)
      const cod_available = serviceable

      // COD fee in paise (₹0 for no COD fee)
      const cod_fee = serviceable ? 0 : null

      return {
        id: id || '0',
        serviceable: serviceable,
        cod_available: cod_available,
        shipping_fee: shipping_fee,
        cod_fee: cod_fee,
      }
    })

    // Return response in the format expected by Razorpay Magic Checkout
    return NextResponse.json({
      order_id: order_id || '',
      razorpay_order_id: razorpay_order_id || '',
      shipping_info: shipping_info,
    })
  } catch (error: any) {
    console.error('Shipping info API error:', error)
    
    // Return a default response that allows checkout to proceed
    // This prevents Magic Checkout from getting stuck
    const body = await request.json().catch(() => ({}))
    const { order_id, razorpay_order_id, addresses } = body

    return NextResponse.json({
      order_id: order_id || '',
      razorpay_order_id: razorpay_order_id || '',
      shipping_info: (addresses || []).map((address: any) => ({
        id: address.id || '0',
        serviceable: true, // Default to serviceable to allow checkout
        cod_available: true,
        shipping_fee: 0,
        cod_fee: 0,
      })),
    })
  }
}

// Also support GET for health checks
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Shipping info API is active',
    endpoint: '/api/razorpay/shipping-info',
    method: 'POST',
    description: 'Returns shipping serviceability, COD availability, and fees for given addresses',
  })
}
