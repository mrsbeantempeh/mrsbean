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
  onSuccess: (paymentId: string, orderId: string, signature: string) => void
  onError: (error: any) => void
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
        options.onError({ message: 'Payment cancelled by user' })
      },
    },
    
    // Handler (for JS handler approach - alternative to callback_url + redirect)
    handler: function (response: any) {
      options.onSuccess(
        response.razorpay_payment_id,
        response.razorpay_order_id,
        response.razorpay_signature
      )
    },
  }

  const razorpay = new window.Razorpay(razorpayOptions)
  razorpay.on('payment.failed', function (response: any) {
    options.onError(response.error || { message: 'Payment failed' })
  })
  
  razorpay.open()
}
