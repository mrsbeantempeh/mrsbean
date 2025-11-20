import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

/**
 * Razorpay Payment Callback Handler
 * 
 * This route handles payment success/failure callbacks from Razorpay.
 * 
 * On success:
 * - Verifies payment signature
 * - Creates transaction record
 * - Fetches order details
 * - Stores order info in session
 * - Redirects to thank-you page
 * 
 * On failure:
 * - Logs the error
 * - Redirects to products page with error message
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  // Extract payment details from query parameters
  const razorpay_payment_id = searchParams.get('razorpay_payment_id')
  const razorpay_order_id = searchParams.get('razorpay_order_id')
  const razorpay_signature = searchParams.get('razorpay_signature')
  const razorpay_payment_link_id = searchParams.get('razorpay_payment_link_id')
  const razorpay_payment_link_reference_id = searchParams.get('razorpay_payment_link_reference_id')
  const razorpay_payment_link_status = searchParams.get('razorpay_payment_link_status')
  const razorpay_payment_id_entity = searchParams.get('razorpay_payment_id_entity')
  
  // Check if this is a payment success or failure
  const isSuccess = !!razorpay_payment_id && !!razorpay_order_id && !!razorpay_signature
  const isFailure = searchParams.get('error') !== null || searchParams.get('error_code') !== null
  
  // If payment failed, redirect to products page with error
  if (isFailure) {
    const errorCode = searchParams.get('error_code') || 'PAYMENT_FAILED'
    const errorDescription = searchParams.get('error_description') || 'Payment failed. Please try again.'
    const errorSource = searchParams.get('error_source') || 'customer'
    const errorStep = searchParams.get('error_step') || 'payment'
    const errorReason = searchParams.get('error_reason') || 'unknown'
    
    console.error('Payment failed:', {
      errorCode,
      errorDescription,
      errorSource,
      errorStep,
      errorReason,
      razorpay_order_id: searchParams.get('razorpay_order_id'),
    })
    
    // Redirect to products page with error message
    const errorMessage = encodeURIComponent(errorDescription)
    return NextResponse.redirect(new URL(`/products?error=${errorMessage}`, request.url))
  }
  
  // If payment succeeded, verify and process
  if (isSuccess && razorpay_payment_id && razorpay_order_id && razorpay_signature) {
    try {
      // Verify payment signature
      const keySecret = process.env.RAZORPAY_KEY_SECRET || ''
      
      if (!keySecret) {
        console.error('RAZORPAY_KEY_SECRET not configured')
        return NextResponse.redirect(new URL('/products?error=Payment verification failed', request.url))
      }
      
      const text = `${razorpay_order_id}|${razorpay_payment_id}`
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(text)
        .digest('hex')
      
      const isSignatureValid = generatedSignature === razorpay_signature
      
      if (!isSignatureValid) {
        console.error('Invalid payment signature:', {
          razorpay_order_id,
          razorpay_payment_id,
          expected: generatedSignature,
          received: razorpay_signature,
        })
        return NextResponse.redirect(new URL('/products?error=Invalid payment signature', request.url))
      }
      
      // Fetch order details and payment details from Razorpay
      let orderDetails: any = null
      let paymentDetails: any = null
      let customerName = 'Customer'
      let customerEmail: string | null = null
      let customerPhone: string | null = null
      let deliveryAddress = 'Address will be updated after payment confirmation'
      
      try {
        // Fetch order details
        const orderDetailsResponse = await fetch(
          `${request.nextUrl.origin}/api/razorpay/get-order?order_id=${razorpay_order_id}`
        )
        if (orderDetailsResponse.ok) {
          orderDetails = await orderDetailsResponse.json()
          if (orderDetails.notes?.name) customerName = orderDetails.notes.name
          if (orderDetails.notes?.email) customerEmail = orderDetails.notes.email
          if (orderDetails.notes?.contact) customerPhone = orderDetails.notes.contact
        }

        // Fetch payment details - this contains the shipping address collected during Magic Checkout
        const paymentDetailsResponse = await fetch(
          `${request.nextUrl.origin}/api/razorpay/get-payment?payment_id=${razorpay_payment_id}`
        )
        if (paymentDetailsResponse.ok) {
          paymentDetails = await paymentDetailsResponse.json()
          
          console.log('📦 Payment details fetched:', {
            payment_id: razorpay_payment_id,
            has_shipping_address: !!paymentDetails.shipping_address,
            has_billing_address: !!paymentDetails.billing_address,
            has_notes: !!paymentDetails.notes,
            shipping_address: paymentDetails.shipping_address,
            notes: paymentDetails.notes,
          })
          
          // Extract customer details from payment (more reliable than order notes)
          if (paymentDetails.email) customerEmail = paymentDetails.email
          if (paymentDetails.contact) customerPhone = paymentDetails.contact
          
          // Extract shipping address from payment details
          // Razorpay Magic Checkout stores address in payment.shipping_address
          if (paymentDetails.shipping_address) {
            const addr = paymentDetails.shipping_address
            // Format address from Razorpay shipping_address object
            const addressParts = []
            if (addr.line1) addressParts.push(addr.line1)
            if (addr.line2) addressParts.push(addr.line2)
            if (addr.city) addressParts.push(addr.city)
            if (addr.state) addressParts.push(addr.state)
            if (addr.zipcode) addressParts.push(addr.zipcode)
            if (addr.country) addressParts.push(addr.country)
            
            if (addressParts.length > 0) {
              deliveryAddress = addressParts.join(', ')
              console.log('✅ Shipping address extracted:', deliveryAddress)
            }
          } else if (paymentDetails.notes?.shipping_address) {
            // Fallback: check notes for address
            deliveryAddress = paymentDetails.notes.shipping_address
            console.log('✅ Shipping address from payment notes:', deliveryAddress)
          } else if (paymentDetails.notes?.address) {
            // Fallback: check payment notes for address
            deliveryAddress = paymentDetails.notes.address
            console.log('✅ Address from payment notes:', deliveryAddress)
          } else if (orderDetails.notes?.address) {
            // Fallback: check order notes
            deliveryAddress = orderDetails.notes.address
            console.log('✅ Address from order notes:', deliveryAddress)
          } else {
            console.warn('⚠️ No shipping address found in payment details')
          }
        } else {
          console.error('Failed to fetch payment details:', await paymentDetailsResponse.text())
        }
      } catch (error) {
        console.error('Failed to fetch order/payment details:', error)
      }
      
      // Create transaction record in database
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        
        if (supabaseUrl && supabaseServiceKey) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey)
          
          // Extract order_id from notes or use a default
          const orderId = orderDetails?.notes?.order_id || `ORDER-${razorpay_order_id}`
          const transactionId = `TXN-${razorpay_payment_id}`
          const amount = orderDetails?.amount ? orderDetails.amount / 100 : 0 // Convert from paise to rupees
          
          // Check if order exists to determine if user is logged in
          const { data: existingOrder } = await supabase
            .from('orders')
            .select('user_id')
            .eq('order_id', orderId)
            .single()
          
          const userId = existingOrder?.user_id || null
          
          // Update order with shipping address if available
          if (deliveryAddress && deliveryAddress !== 'Address will be updated after payment confirmation') {
            try {
              await supabase
                .from('orders')
                .update({ address: deliveryAddress })
                .eq('order_id', orderId)
            } catch (error) {
              console.error('Failed to update order address:', error)
            }
          }
          
          // Create transaction record
          if (userId) {
            // Logged-in user transaction
            await supabase.from('transactions').insert({
              transaction_id: transactionId,
              order_id: orderId,
              user_id: userId,
              amount: amount,
              status: 'success',
              payment_method: 'Razorpay',
              razorpay_payment_id: razorpay_payment_id,
              razorpay_order_id: razorpay_order_id,
            })
          } else {
            // Guest transaction
            await supabase.from('transactions').insert({
              transaction_id: transactionId,
              order_id: orderId,
              user_id: null,
              amount: amount,
              status: 'success',
              payment_method: 'Razorpay',
              razorpay_payment_id: razorpay_payment_id,
              razorpay_order_id: razorpay_order_id,
              guest_email: customerEmail,
              guest_phone: customerPhone,
            })
          }
        }
      } catch (error) {
        console.error('Failed to create transaction record:', error)
        // Continue even if transaction record creation fails
      }
      
      // Prepare order info for thank-you page
      const orderInfo = {
        orderId: orderDetails?.notes?.order_id || `ORDER-${razorpay_order_id}`,
        paymentId: razorpay_payment_id,
        customerName,
        customerPhone: customerPhone || '',
        customerEmail,
        deliveryAddress,
        productName: orderDetails?.notes?.product_name || 'Classic Tempeh',
        productWeight: orderDetails?.notes?.product_weight || '200g',
        productPrice: orderDetails?.notes?.product_price ? parseFloat(orderDetails.notes.product_price) : 125,
        quantity: orderDetails?.notes?.quantity ? parseInt(orderDetails.notes.quantity) : 1,
        totalAmount: orderDetails?.amount ? orderDetails.amount / 100 : 0,
        paymentMethod: 'Razorpay',
        orderDate: new Date().toISOString(),
        estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
      
      // Store order info in a way that thank-you page can access
      // We'll pass it via query parameters (URL-safe)
      const orderInfoEncoded = encodeURIComponent(JSON.stringify(orderInfo))
      
      // Redirect to thank-you page with payment details
      return NextResponse.redirect(
        new URL(
          `/thank-you?order=${orderInfo.orderId}&payment=${razorpay_payment_id}&orderInfo=${orderInfoEncoded}`,
          request.url
        )
      )
    } catch (error: any) {
      console.error('Payment callback error:', error)
      return NextResponse.redirect(
        new URL(`/products?error=${encodeURIComponent(error.message || 'Payment processing failed')}`, request.url)
      )
    }
  }
  
  // If we reach here, the callback format is unexpected
  console.warn('Unexpected callback format:', Object.fromEntries(searchParams.entries()))
  return NextResponse.redirect(new URL('/products?error=Unexpected callback format', request.url))
}

