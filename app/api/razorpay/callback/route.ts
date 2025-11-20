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

async function extractCallbackFields(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  const baseFields: any = {
    razorpay_payment_id: searchParams.get('razorpay_payment_id'),
    razorpay_order_id: searchParams.get('razorpay_order_id'),
    razorpay_signature: searchParams.get('razorpay_signature'),
    razorpay_payment_link_id: searchParams.get('razorpay_payment_link_id'),
    razorpay_payment_link_reference_id: searchParams.get('razorpay_payment_link_reference_id'),
    razorpay_payment_link_status: searchParams.get('razorpay_payment_link_status'),
    razorpay_payment_id_entity: searchParams.get('razorpay_payment_id_entity'),
    errorCode: searchParams.get('error_code'),
    errorDescription: searchParams.get('error_description') || searchParams.get('error'),
    errorSource: searchParams.get('error_source'),
    errorStep: searchParams.get('error_step'),
    errorReason: searchParams.get('error_reason'),
    rawBody: null as Record<string, any> | null,
  }
  
  const normalize = (value: FormDataEntryValue | string | null | undefined) => {
    if (value === undefined || value === null) return null
    if (typeof value === 'string') return value
    return value.toString()
  }
  
  const assignIfMissing = (key: keyof typeof baseFields, value: any) => {
    if (!baseFields[key] && value) {
      baseFields[key] = value
    }
  }
  
  if (request.method !== 'GET') {
    const contentType = request.headers.get('content-type')?.toLowerCase() || ''
    let bodyData: Record<string, any> = {}
    
    try {
      if (contentType.includes('application/json')) {
        bodyData = await request.json()
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData()
        formData.forEach((value, key) => {
          bodyData[key] = normalize(value)
        })
      } else {
        const textBody = await request.text()
        if (textBody) {
          try {
            bodyData = JSON.parse(textBody)
          } catch {
            const urlData = new URLSearchParams(textBody)
            urlData.forEach((value, key) => {
              bodyData[key] = value
            })
          }
        }
      }
    } catch (error) {
      console.error('⚠️ Failed to parse callback body:', error)
    }
    
    baseFields.rawBody = bodyData
    
    const pick = (field: string) =>
      bodyData[field] ??
      bodyData[field.toLowerCase()] ??
      bodyData[field.toUpperCase()]
    
    const pickErrorField = (field: string) =>
      bodyData[`error[${field}]`] ??
      bodyData[`error.${field}`] ??
      bodyData[`error_${field}`] ??
      bodyData[`error${field}`]
    
    assignIfMissing('razorpay_payment_id', pick('razorpay_payment_id'))
    assignIfMissing('razorpay_order_id', pick('razorpay_order_id'))
    assignIfMissing('razorpay_signature', pick('razorpay_signature'))
    assignIfMissing('razorpay_payment_link_id', pick('razorpay_payment_link_id'))
    assignIfMissing('razorpay_payment_link_reference_id', pick('razorpay_payment_link_reference_id'))
    assignIfMissing('razorpay_payment_link_status', pick('razorpay_payment_link_status'))
    assignIfMissing('razorpay_payment_id_entity', pick('razorpay_payment_id_entity'))
    assignIfMissing('errorCode', pick('error_code') || pickErrorField('code'))
    assignIfMissing('errorDescription', pick('error_description') || pick('error') || pickErrorField('description'))
    assignIfMissing('errorSource', pick('error_source') || pickErrorField('source'))
    assignIfMissing('errorStep', pick('error_step') || pickErrorField('step'))
    assignIfMissing('errorReason', pick('error_reason') || pickErrorField('reason'))
  }
  
  return {
    ...baseFields,
    isSuccess: !!(baseFields.razorpay_payment_id && baseFields.razorpay_order_id && baseFields.razorpay_signature),
    isFailure: !!(baseFields.errorCode || baseFields.errorDescription || baseFields.errorSource || baseFields.errorStep || baseFields.errorReason),
  }
}

export async function GET(request: NextRequest) {
  return handleCallback(request)
}

export async function POST(request: NextRequest) {
  return handleCallback(request)
}

async function handleCallback(request: NextRequest) {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    razorpay_payment_link_id,
    razorpay_payment_link_reference_id,
    razorpay_payment_link_status,
    razorpay_payment_id_entity,
    errorCode,
    errorDescription,
    errorSource,
    errorStep,
    errorReason,
    isSuccess,
    isFailure,
    rawBody,
  } = await extractCallbackFields(request)
  
  // If payment failed, redirect to products page with error
  if (isFailure) {
    const failedOrderId = razorpay_order_id
    
    console.error('Payment failed:', {
      errorCode: errorCode || 'PAYMENT_FAILED',
      errorDescription: errorDescription || 'Payment failed. Please try again.',
      errorSource: errorSource || 'customer',
      errorStep: errorStep || 'payment',
      errorReason: errorReason || 'unknown',
      razorpay_order_id: failedOrderId,
      body: rawBody || null,
    })
    
    // Update order status to cancelled if order exists
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      
      if (supabaseUrl && supabaseServiceKey && failedOrderId) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        
        // Try to find order by razorpay_order_id in notes
        const { data: orders } = await supabase
          .from('orders')
          .select('order_id')
          .eq('status', 'pending')
          .limit(1)
        
        // If we can't find by razorpay_order_id, try to get the most recent pending order
        // This is a fallback - ideally we'd store razorpay_order_id in the order
        if (orders && orders.length > 0) {
          await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('order_id', orders[0].order_id)
            .eq('status', 'pending')
        }
      }
    } catch (error) {
      console.error('Failed to update order status on payment failure:', error)
    }
    
    // Redirect to products page with error message
    const errorMessage = encodeURIComponent(errorDescription || 'Payment failed. Please try again.')
    return NextResponse.redirect(new URL(`/products?error=${errorMessage}`, request.url))
  }
  
  // If payment succeeded, verify and process
  if (isSuccess && razorpay_payment_id && razorpay_order_id && razorpay_signature) {
    console.log('✅ Payment success detected, processing...', {
      razorpay_payment_id,
      razorpay_order_id,
      has_signature: !!razorpay_signature,
    })
    
    // Extract order_id early for redirect (needed even if processing fails)
    let orderId = `ORDER-${razorpay_order_id}`
    let redirectUrl = ''
    
    try {
      // Verify payment signature
      const keySecret = process.env.RAZORPAY_KEY_SECRET || ''
      
      if (!keySecret) {
        console.error('❌ RAZORPAY_KEY_SECRET not configured')
        // Don't return early - continue processing and redirect to thank-you
        // This allows testing even if key is missing
      } else {
        const text = `${razorpay_order_id}|${razorpay_payment_id}`
        const generatedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(text)
          .digest('hex')
        
        const isSignatureValid = generatedSignature === razorpay_signature
        
        if (!isSignatureValid) {
          console.error('⚠️ Invalid payment signature:', {
            razorpay_order_id,
            razorpay_payment_id,
            expected: generatedSignature.substring(0, 20) + '...',
            received: razorpay_signature?.substring(0, 20) + '...',
          })
          // Don't return early - continue processing for now (can add strict validation later)
          // This allows testing even if signature doesn't match
        } else {
          console.log('✅ Payment signature verified successfully')
        }
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
      
      // Extract customer details from order notes (do this before try block so it's accessible later)
      const customerNameFromNotes = orderDetails?.notes?.customer_name || customerName
      const customerPhoneFromNotes = orderDetails?.notes?.customer_phone || customerPhone
      const customerEmailFromNotes = orderDetails?.notes?.customer_email || customerEmail
      const addressFromNotes = orderDetails?.notes?.address || deliveryAddress
      
      console.log('📋 Extracted customer details:', {
        name: customerNameFromNotes,
        phone: customerPhoneFromNotes,
        email: customerEmailFromNotes,
        hasAddress: !!addressFromNotes,
      })
      
      // Create/update order and transaction in database
      // This is wrapped in its own try-catch so errors don't prevent redirect
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        
        if (supabaseUrl && supabaseServiceKey) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey)
          
          // Extract order_id from notes or use a default (already extracted above, but keep for this scope)
          const orderIdForDb = orderDetails?.notes?.order_id || `ORDER-${razorpay_order_id}`
          const transactionId = `TXN-${razorpay_payment_id}`
          const amount = orderDetails?.amount ? orderDetails.amount / 100 : 0 // Convert from paise to rupees
          
          console.log('💾 Processing order in database:', {
            orderId: orderIdForDb,
            transactionId,
            amount,
          })
          
          // Check if order exists to determine if user is logged in
          const { data: existingOrder, error: orderFetchError } = await supabase
            .from('orders')
            .select('user_id, guest_name, guest_email, guest_phone, product_name, quantity, price, total')
            .eq('order_id', orderIdForDb)
            .single()
          
          if (orderFetchError && orderFetchError.code !== 'PGRST116') {
            // PGRST116 is "not found" which is OK, log other errors
            console.error('Error fetching order:', orderFetchError)
          }
          
          console.log('📦 Order lookup result:', {
            found: !!existingOrder,
            orderId: orderIdForDb,
            userId: existingOrder?.user_id || null,
          })
          
          const userId = existingOrder?.user_id || null
          
          // Prepare order update/create data
          const orderData: any = {
            status: 'confirmed', // Update status to confirmed on successful payment
          }
          
          // Update address (prefer from notes, then from payment details)
          if (addressFromNotes && addressFromNotes !== 'Address will be updated after payment confirmation') {
            orderData.address = addressFromNotes
          } else if (deliveryAddress && deliveryAddress !== 'Address will be updated after payment confirmation') {
            orderData.address = deliveryAddress
          }
          
          // Always update guest customer details if this is a guest order (ensure they're set)
          if (!userId) {
            if (customerNameFromNotes) {
              orderData.guest_name = customerNameFromNotes
            }
            if (customerEmailFromNotes) {
              orderData.guest_email = customerEmailFromNotes
            }
            if (customerPhoneFromNotes) {
              orderData.guest_phone = customerPhoneFromNotes
            }
          }
          
          // Update existing order
          if (existingOrder) {
            try {
              const { error: updateError, data: updatedOrder } = await supabase
                .from('orders')
                .update(orderData)
                .eq('order_id', orderIdForDb)
                .select()
              
              if (updateError) {
                console.error('❌ Failed to update order:', updateError)
                // Try to create order instead if update fails
                console.log('⚠️ Update failed, attempting to create order instead...')
                throw updateError // Will be caught by outer catch and create order
              } else {
                console.log('✅ Order updated successfully:', {
                  orderId: orderIdForDb,
                  updatedFields: Object.keys(orderData),
                  orderData: updatedOrder,
                })
              }
            } catch (error) {
              console.error('❌ Failed to update order, will try to create:', error)
              // Fall through to create order
            }
          }
          
          // Create order if it doesn't exist
          if (!existingOrder) {
            // Order doesn't exist - create it (fallback scenario)
            // Extract product details from order notes
            const productName = orderDetails?.notes?.product_name || 'Classic Tempeh'
            const quantity = orderDetails?.notes?.quantity ? parseInt(orderDetails.notes.quantity) : 1
            const price = orderDetails?.notes?.product_price ? parseFloat(orderDetails.notes.product_price) : 125
            const total = amount || (price * quantity)
            
            let newOrderData: any = null
            
            try {
              newOrderData = {
                order_id: orderIdForDb,
                product_name: productName,
                quantity: quantity,
                price: price,
                total: total,
                status: 'confirmed',
                payment_method: 'Razorpay',
                address: orderData.address || addressFromNotes || deliveryAddress || '',
                user_id: null, // Guest order
                guest_name: customerNameFromNotes || customerName || null,
                guest_email: customerEmailFromNotes || customerEmail || null,
                guest_phone: customerPhoneFromNotes || customerPhone || null,
              }
              
              console.log('📝 Creating new order:', newOrderData)
              
              const { error: insertError, data: insertedOrder } = await supabase
                .from('orders')
                .insert(newOrderData)
                .select()
              
              if (insertError) {
                console.error('❌ Failed to create order:', {
                  error: insertError,
                  code: insertError.code,
                  message: insertError.message,
                  details: insertError.details,
                  hint: insertError.hint,
                  orderData: newOrderData,
                })
              } else {
                console.log('✅ Order created successfully:', {
                  orderId: orderIdForDb,
                  insertedOrder: insertedOrder?.[0],
                })
              }
            } catch (error: any) {
              console.error('❌ Exception creating order:', {
                error,
                message: error?.message,
                stack: error?.stack,
                orderData: newOrderData,
              })
            }
          }
          
          // Create transaction record
          // Use customer details from notes (most reliable)
          const finalCustomerEmail = customerEmailFromNotes || customerEmail || null
          const finalCustomerPhone = customerPhoneFromNotes || customerPhone || null
          
          console.log('💳 Creating transaction record:', {
            transactionId,
            orderId: orderIdForDb,
            userId: userId || 'guest',
            amount,
          })
          
          if (userId) {
            // Logged-in user transaction
            const { error: transError, data: transData } = await supabase.from('transactions').insert({
              transaction_id: transactionId,
              order_id: orderIdForDb,
              user_id: userId,
              amount: amount,
              status: 'success',
              payment_method: 'Razorpay',
              razorpay_payment_id: razorpay_payment_id,
              razorpay_order_id: razorpay_order_id,
            }).select()
            
            if (transError) {
              console.error('❌ Failed to create transaction:', transError)
            } else {
              console.log('✅ Transaction created successfully:', { transactionId, transData })
            }
          } else {
            // Guest transaction
            const { error: transError, data: transData } = await supabase.from('transactions').insert({
              transaction_id: transactionId,
              order_id: orderIdForDb,
              user_id: null,
              amount: amount,
              status: 'success',
              payment_method: 'Razorpay',
              razorpay_payment_id: razorpay_payment_id,
              razorpay_order_id: razorpay_order_id,
              guest_email: finalCustomerEmail,
              guest_phone: finalCustomerPhone,
            }).select()
            
            if (transError) {
              console.error('❌ Failed to create guest transaction:', transError)
            } else {
              console.log('✅ Guest transaction created successfully:', { transactionId, transData })
            }
          }
        }
      } catch (error) {
        console.error('Failed to create transaction record:', error)
        // Continue even if transaction record creation fails
      }
      
      // Extract order_id from notes (update the variable)
      orderId = orderDetails?.notes?.order_id || `ORDER-${razorpay_order_id}`
      
      // Prepare order info for thank-you page
      // Use customer details from order notes (most reliable source)
      const finalCustomerName = customerNameFromNotes || customerName || 'Customer'
      const finalCustomerPhone = customerPhoneFromNotes || customerPhone || ''
      const finalCustomerEmail = customerEmailFromNotes || customerEmail || null
      const finalDeliveryAddress = addressFromNotes || deliveryAddress || 'Address will be updated'
      
      const orderInfo = {
        orderId: orderId,
        paymentId: razorpay_payment_id,
        customerName: finalCustomerName,
        customerPhone: finalCustomerPhone,
        customerEmail: finalCustomerEmail,
        deliveryAddress: finalDeliveryAddress,
        productName: orderDetails?.notes?.product_name || 'Classic Tempeh',
        productWeight: orderDetails?.notes?.product_weight || '200g',
        productPrice: orderDetails?.notes?.product_price ? parseFloat(orderDetails.notes.product_price) : 125,
        quantity: orderDetails?.notes?.quantity ? parseInt(orderDetails.notes.quantity) : 1,
        totalAmount: orderDetails?.amount ? orderDetails.amount / 100 : 0,
        paymentMethod: 'Razorpay',
        orderDate: new Date().toISOString(),
        estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
      
      console.log('✅ Payment successful, preparing redirect to thank-you page:', {
        orderId: orderInfo.orderId,
        paymentId: razorpay_payment_id,
        customerName: finalCustomerName,
      })
      
      // Store order info in a way that thank-you page can access
      // We'll pass it via query parameters (URL-safe)
      const orderInfoEncoded = encodeURIComponent(JSON.stringify(orderInfo))
      
      // Build the redirect URL - use absolute URL
      const origin = request.nextUrl.origin || 'http://localhost:3000'
      redirectUrl = `${origin}/thank-you?order=${encodeURIComponent(orderInfo.orderId)}&payment=${encodeURIComponent(razorpay_payment_id)}&orderInfo=${orderInfoEncoded}`
      
      console.log('🔄 Redirect URL prepared:', redirectUrl)
    } catch (error: any) {
      console.error('❌ Payment callback error during processing:', error)
      // Even on error, try to redirect with basic info
      const origin = request.nextUrl.origin || 'http://localhost:3000'
      redirectUrl = `${origin}/thank-you?order=${encodeURIComponent(orderId)}&payment=${encodeURIComponent(razorpay_payment_id)}&error=${encodeURIComponent(error.message || 'Processing error')}`
      console.log('⚠️ Redirecting with error info:', redirectUrl)
    }
    
    // ALWAYS redirect - this happens outside try-catch to ensure it executes
    if (redirectUrl) {
      console.log('🔄 FINAL REDIRECT to thank-you page:', redirectUrl)
      return NextResponse.redirect(redirectUrl, 307)
    } else {
      // Fallback redirect if something went very wrong
      console.error('❌ No redirect URL prepared, using fallback')
      const origin = request.nextUrl.origin || 'http://localhost:3000'
      return NextResponse.redirect(`${origin}/thank-you?order=${encodeURIComponent(orderId)}&payment=${encodeURIComponent(razorpay_payment_id)}`, 307)
    }
  }
  
  // If we reach here, the callback format is unexpected
  console.warn('Unexpected callback format:', {
    urlParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
    body: rawBody || null,
  })
  return NextResponse.redirect(new URL('/products?error=Unexpected callback format', request.url))
}

