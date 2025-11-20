import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

/**
 * Razorpay Webhook Handler
 * 
 * Webhooks provide server-to-server notifications for payment events.
 * This is more reliable than callback URLs because:
 * - Works even if user closes browser before redirect
 * - Handles refunds, chargebacks, and other events
 * - More reliable for order status updates
 * 
 * Webhook Events to Subscribe:
 * - payment.captured - Payment successfully captured
 * - payment.failed - Payment failed
 * - payment.authorized - Payment authorized (for manual capture)
 * - refund.created - Refund initiated
 * - order.paid - Order payment completed
 * 
 * Setup in Razorpay Dashboard:
 * 1. Go to Settings → Webhooks
 * 2. Add New Webhook
 * 3. URL: https://mrsbean.in/api/razorpay/webhook
 * 4. Secret: (generate a secret and set WEBHOOK_SECRET env variable)
 * 5. Select events: payment.captured, payment.failed, refund.created
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * Verify webhook signature
 * Razorpay sends webhook signature in X-Razorpay-Signature header
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    console.error('Webhook signature verification error:', error)
    return false
  }
}

/**
 * POST /api/razorpay/webhook
 * 
 * Handles webhook events from Razorpay
 */
export async function POST(request: NextRequest) {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || ''
    
    if (!webhookSecret) {
      console.warn('⚠️ RAZORPAY_WEBHOOK_SECRET not configured. Webhook verification disabled.')
      // In development, allow webhooks without secret (not recommended for production)
    }

    // Get signature from headers
    const signature = request.headers.get('X-Razorpay-Signature') || ''
    
    // Get raw body for signature verification
    const rawBody = await request.text()
    
    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret)
      
      if (!isValid) {
        console.error('❌ Invalid webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    // Parse webhook payload
    const event = JSON.parse(rawBody)
    
    console.log('📦 Razorpay Webhook Event:', {
      event: event.event,
      entity: event.entity,
      payload_id: event.payload?.payment?.entity?.id || event.payload?.order?.entity?.id,
    })

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity)
        break
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity)
        break
      
      case 'payment.authorized':
        await handlePaymentAuthorized(event.payload.payment.entity)
        break
      
      case 'refund.created':
        await handleRefundCreated(event.payload.refund.entity)
        break
      
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity)
        break
      
      default:
        console.log(`ℹ️ Unhandled webhook event: ${event.event}`)
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error)
    // Still return 200 to prevent Razorpay from retrying
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 200 }
    )
  }
}

/**
 * Handle payment.captured event
 */
async function handlePaymentCaptured(payment: any) {
  console.log('✅ Payment Captured:', {
    payment_id: payment.id,
    order_id: payment.order_id,
    amount: payment.amount,
    status: payment.status,
  })

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Supabase not configured, skipping database update')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Extract order_id from payment notes or use payment.order_id
    const orderId = payment.notes?.order_id || `ORDER-${payment.order_id}`
    const transactionId = `TXN-${payment.id}`
    const amount = payment.amount ? payment.amount / 100 : 0 // Convert from paise to rupees
    
    // Update or create transaction record
    const { data: existingTransaction } = await supabase
      .from('transactions')
      .select('id')
      .eq('razorpay_payment_id', payment.id)
      .single()
    
    if (existingTransaction) {
      // Update existing transaction
      await supabase
        .from('transactions')
        .update({
          status: 'success',
          amount: amount,
        })
        .eq('razorpay_payment_id', payment.id)
    } else {
      // Create new transaction
      await supabase.from('transactions').insert({
        transaction_id: transactionId,
        order_id: orderId,
        user_id: null, // Will be updated if order exists
        amount: amount,
        status: 'success',
        payment_method: 'Razorpay',
        razorpay_payment_id: payment.id,
        razorpay_order_id: payment.order_id,
      })
    }
    
    // Update order status to confirmed
    await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('order_id', orderId)
    
    console.log('✅ Transaction and order updated successfully')
  } catch (error: any) {
    console.error('❌ Error handling payment.captured:', error)
  }
}

/**
 * Handle payment.failed event
 */
async function handlePaymentFailed(payment: any) {
  console.log('❌ Payment Failed:', {
    payment_id: payment.id,
    order_id: payment.order_id,
    error_code: payment.error_code,
    error_description: payment.error_description,
  })

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const orderId = payment.notes?.order_id || `ORDER-${payment.order_id}`
    
    // Update order status to cancelled
    await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('order_id', orderId)
    
    console.log('✅ Order status updated to cancelled')
  } catch (error: any) {
    console.error('❌ Error handling payment.failed:', error)
  }
}

/**
 * Handle payment.authorized event (for manual capture)
 */
async function handlePaymentAuthorized(payment: any) {
  console.log('🔐 Payment Authorized:', {
    payment_id: payment.id,
    order_id: payment.order_id,
  })
  // Handle manual capture if needed
}

/**
 * Handle refund.created event
 */
async function handleRefundCreated(refund: any) {
  console.log('💰 Refund Created:', {
    refund_id: refund.id,
    payment_id: refund.payment_id,
    amount: refund.amount,
  })

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Update transaction status to refunded
    await supabase
      .from('transactions')
      .update({ status: 'refunded' })
      .eq('razorpay_payment_id', refund.payment_id)
    
    // Update order status
    const { data: transaction } = await supabase
      .from('transactions')
      .select('order_id')
      .eq('razorpay_payment_id', refund.payment_id)
      .single()
    
    if (transaction) {
      await supabase
        .from('orders')
        .update({ status: 'refunded' })
        .eq('order_id', transaction.order_id)
    }
    
    console.log('✅ Refund processed successfully')
  } catch (error: any) {
    console.error('❌ Error handling refund.created:', error)
  }
}

/**
 * Handle order.paid event
 */
async function handleOrderPaid(order: any) {
  console.log('💳 Order Paid:', {
    order_id: order.id,
    amount: order.amount,
  })
  // Similar to payment.captured
  // Can be used as additional confirmation
}

