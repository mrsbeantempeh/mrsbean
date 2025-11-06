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

    // Use Magic Checkout script for Magic Checkout integration
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/magic-checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay Magic Checkout'))
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
  customerId?: string // Razorpay customer ID for Magic Checkout
  notes?: Record<string, string> // Additional notes (max 15 key-value pairs, 256 chars each)
  // Callback URL approach - Razorpay will redirect to this URL on success/failure
  callbackUrl?: string // Optional: defaults to /api/razorpay/callback
  // Handler function approach (alternative to callback URL)
  onSuccess?: (paymentId: string, orderId: string, signature: string) => void
  onError?: (error: any) => void
}

export const openRazorpayCheckout = async (options: RazorpayOptions) => {
  await loadRazorpayScript()

  const razorpayOptions: any = {
    // Mandatory fields for Magic Checkout
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    one_click_checkout: true, // Mandatory: true for Magic Checkout
    name: 'Mrs Bean', // Mandatory: Business name
    order_id: options.orderId, // Mandatory: Order ID from Orders API
    
    // Standard Razorpay options (required for checkout)
    amount: options.amount, // Amount in paise (already converted)
    currency: 'INR',
    description: options.productName,
    
    // Optional Magic Checkout options
    show_coupons: true, // Optional: Show coupons (default: true)
    
    // Prefill customer details (optional but recommended for better conversion)
    prefill: {
      name: options.customerName || '',
      email: options.customerEmail || '',
      contact: options.customerContact || '', // Format: +(country code)(phone number)
    },
    
    // Notes (optional): Store additional information (max 15 key-value pairs, 256 chars each)
    ...(options.notes && { notes: options.notes }),
    
    // Customer ID for returning customers (Magic Checkout feature)
    ...(options.customerId && { customer_id: options.customerId }),
    
    // Theme (optional): Customize appearance
    theme: {
      color: '#102a43', // Navy blue theme
    },
    
    // Modal (optional): Handle modal behavior
    modal: {
      ondismiss: function () {
        if (options.onError) {
          options.onError({ message: 'Payment cancelled by user' })
        }
      },
    },
  }
  
  // Use callback URL approach (recommended) - Razorpay will redirect to callback URL on success/failure
  // This matches Razorpay's recommended approach for Magic Checkout
  const callbackUrl = options.callbackUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/api/razorpay/callback`
  razorpayOptions.callback_url = callbackUrl
  razorpayOptions.redirect = true // Redirect to callback URL after payment
  
  // Note: When using callback_url + redirect, we don't use handler function
  // Razorpay will redirect to callback_url on success/failure
  
  const razorpay = new window.Razorpay(razorpayOptions)
  
  // Note: With callback_url + redirect, we don't need payment.failed handler
  // Razorpay will redirect to callback_url on failure with error parameters
  
  razorpay.open()
}
