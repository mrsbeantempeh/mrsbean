import { NextRequest, NextResponse } from 'next/server'

/**
 * Shipping Info API for Razorpay Magic Checkout
 * This endpoint is called by Razorpay to check shipping serviceability
 * 
 * According to Razorpay docs:
 * - Must be publicly accessible
 * - No authentication required
 * - Should return shipping serviceability, COD serviceability, shipping fees and COD fees
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract customer addresses from request
    const { addresses } = body

    // For now, we'll return serviceable for all addresses in Pune
    // You can customize this logic based on your delivery areas
    const responses = addresses.map((address: any) => {
      const city = address.city?.toLowerCase() || ''
      const state = address.state?.toLowerCase() || ''
      const zipcode = address.zipcode || ''

      // Check if address is in Pune (customize based on your delivery area)
      const isServiceable = city.includes('pune') || state.includes('maharashtra')

      return {
        id: address.id || `addr_${Date.now()}`,
        shipping: {
          serviceable: isServiceable,
          // Shipping fee in paise (₹0 for free shipping)
          fee: isServiceable ? 0 : null,
          // Estimated delivery time in hours
          estimated_delivery_time: isServiceable ? 24 : null,
        },
        cod: {
          // COD serviceability (set to true if you offer COD)
          serviceable: isServiceable,
          // COD fee in paise (₹0 for no COD fee)
          fee: isServiceable ? 0 : null,
        },
      }
    })

    return NextResponse.json({
      addresses: responses,
    })
  } catch (error: any) {
    console.error('Shipping info API error:', error)
    
    // Return a default response that allows checkout to proceed
    // This prevents Magic Checkout from getting stuck
    return NextResponse.json({
      addresses: [
        {
          id: 'default',
          shipping: {
            serviceable: true,
            fee: 0,
            estimated_delivery_time: 24,
          },
          cod: {
            serviceable: true,
            fee: 0,
          },
        },
      ],
    })
  }
}

// Also support GET for health checks
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Shipping info API is active',
  })
}

