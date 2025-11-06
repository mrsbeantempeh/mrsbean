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

  // Build Razorpay options exactly as per Razorpay documentation
  const razorpayOptions: any = {
    // Mandatory fields for Magic Checkout
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '', // Enter the Key ID generated from the Dashboard
    one_click_checkout: true, // Mandatory: true for Magic Checkout
    name: 'Mrs Bean', // your business name
    order_id: options.orderId, // This is the Order ID. Pass the `id` obtained in the response of Step 1; mandatory
    
    // Optional Magic Checkout options
    show_coupons: true, // default true; false if coupon widget should be hidden
    
    // Callback URL approach - Razorpay will redirect to this URL on success/failure
    callback_url: options.callbackUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/api/razorpay/callback`,
    redirect: 'true', // Redirect to callback URL after payment (as string, not boolean)
    
    // Prefill customer details (optional but recommended for better conversion)
    // We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
    prefill: {
      name: options.customerName || '', // your customer's name
      email: options.customerEmail || '', // your customer's email
      contact: options.customerContact || '', // Provide the customer's phone number for better conversion rates
    },
    
    // Notes (optional): Store additional information (max 15 key-value pairs, 256 chars each)
    ...(options.notes && { notes: options.notes }),
  }
  
  // Customer ID for returning customers (Magic Checkout feature) - optional
  if (options.customerId) {
    razorpayOptions.customer_id = options.customerId
  }
  
  // Note: When using callback_url + redirect, we don't use handler function
  // Razorpay will redirect to callback_url on success/failure
  
  const razorpay = new window.Razorpay(razorpayOptions)
  
  // Note: With callback_url + redirect, we don't need payment.failed handler
  // Razorpay will redirect to callback_url on failure with error parameters
  
  razorpay.open()
}
