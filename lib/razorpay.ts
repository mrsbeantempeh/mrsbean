// Razorpay integration helper

declare global {
  interface Window {
    Razorpay: any
  }
}

export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve()
      return
    }

    // Use standard Razorpay checkout script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay Checkout'))
    document.body.appendChild(script)
  })
}

interface RazorpayOptions {
  amount: number
  productName: string
  orderId: string
  customerName?: string
  customerEmail?: string
  customerContact?: string
  notes?: Record<string, string> // Additional notes (max 15 key-value pairs, 256 chars each)
  // Callback URL approach - Razorpay will redirect to this URL on success/failure
  callbackUrl?: string // Optional: defaults to /api/razorpay/callback
  // Handler function approach (alternative to callback URL)
  onSuccess?: (paymentId: string, orderId: string, signature: string) => void
  onError?: (error: any) => void
}

export const openRazorpayCheckout = async (options: RazorpayOptions) => {
  try {
    console.log('📦 Loading Razorpay script...')
    await loadRazorpayScript()
    console.log('✅ Razorpay script loaded successfully')

    // Get Razorpay key from environment
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''
    
    if (!razorpayKey) {
      console.error('❌ Razorpay key not found! Check NEXT_PUBLIC_RAZORPAY_KEY_ID environment variable')
      alert('Payment gateway not configured. Please contact support.')
      throw new Error('Razorpay key not configured')
    }

    // Determine environment to handle localhost differently
    const isBrowser = typeof window !== 'undefined'
    const origin = isBrowser ? window.location.origin : ''
    const hostname = isBrowser ? window.location.hostname : ''
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')

    // Build Razorpay options for standard checkout
    const callbackUrl = options.callbackUrl || `${origin}/api/razorpay/callback`
    
    const razorpayOptions: any = {
      // Mandatory fields
      key: razorpayKey,
      name: 'Mrs Bean', // your business name
      order_id: options.orderId, // This is the Order ID. Pass the `id` obtained in the response of Step 1; mandatory
      amount: options.amount, // Amount in paise
      
      // Prefill customer details (optional but recommended for better conversion)
      prefill: {
        name: options.customerName || '', // your customer's name
        email: options.customerEmail || '', // your customer's email
        contact: options.customerContact || '', // Provide the customer's phone number for better conversion rates
      },
      
      // Notes (optional): Store additional information (max 15 key-value pairs, 256 chars each)
      ...(options.notes && { notes: options.notes }),
      
      // Theme customization (optional)
      theme: {
        color: '#3399cc', // Customize checkout theme
      },
    }

    if (isLocalhost) {
      // Razorpay cannot call localhost callback URLs from their servers.
      // In dev, handle the redirect manually via the handler and client-side navigation.
      razorpayOptions.redirect = false
      razorpayOptions.handler = (response: any) => {
        console.log('✅ Razorpay handler invoked (localhost mode)', response)
        const params = new URLSearchParams({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        })
        window.location.href = `${callbackUrl}?${params.toString()}`
      }
    } else {
      // Production/staging: let Razorpay redirect directly to our callback route
      razorpayOptions.callback_url = callbackUrl
      razorpayOptions.redirect = true
    }
    
    console.log('🚀 Opening Razorpay checkout with options:', {
      key: razorpayKey.substring(0, 10) + '...',
      order_id: options.orderId,
      amount: options.amount,
      callback_url: callbackUrl,
      redirect_mode: isLocalhost ? 'handler' : 'callback_url',
      hasCustomerName: !!options.customerName,
      hasCustomerEmail: !!options.customerEmail,
      hasCustomerContact: !!options.customerContact,
    })
    
    // Note: When using callback_url + redirect, we don't use handler function
    // Razorpay will redirect to callback_url on success/failure
    
    if (!window.Razorpay) {
      console.error('❌ Razorpay object not found on window!')
      alert('Payment gateway failed to load. Please refresh the page and try again.')
      throw new Error('Razorpay not loaded')
    }
    
    const razorpay = new window.Razorpay(razorpayOptions)
    
    if (isLocalhost) {
      // Handle payment failures manually so dev mirrors prod behaviour
      razorpay.on('payment.failed', (response: any) => {
        console.error('❌ Razorpay payment failed (localhost mode):', response)
        const params = new URLSearchParams({
          error: 'payment_failed',
          error_code: response.error?.code || 'UNKNOWN',
          error_description: response.error?.description || 'Payment failed. Please try again.',
          error_source: response.error?.source || 'customer',
          error_reason: response.error?.reason || 'unknown',
        })
        window.location.href = `${callbackUrl}?${params.toString()}`
      })
    }
    
    // Note: With callback_url + redirect, we don't need payment.failed handler
    // Razorpay will redirect to callback_url on failure with error parameters
    
    console.log('✅ Razorpay instance created, opening checkout...')
    razorpay.open()
    console.log('✅ Razorpay.open() called')
  } catch (error: any) {
    console.error('❌ Error opening Razorpay checkout:', error)
    alert(`Failed to open payment gateway: ${error.message || 'Unknown error'}. Please try again.`)
    throw error
  }
}
