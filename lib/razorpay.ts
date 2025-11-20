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
  await loadRazorpayScript()

  // Build Razorpay options for standard checkout
  const razorpayOptions: any = {
    // Mandatory fields
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '', // Enter the Key ID generated from the Dashboard
    name: 'Mrs Bean', // your business name
    order_id: options.orderId, // This is the Order ID. Pass the `id` obtained in the response of Step 1; mandatory
    amount: options.amount, // Amount in paise
    
    // Callback URL approach - Razorpay will redirect to this URL on success/failure
    callback_url: options.callbackUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/api/razorpay/callback`,
    redirect: true, // Redirect to callback URL after payment
    
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
  
  // Note: When using callback_url + redirect, we don't use handler function
  // Razorpay will redirect to callback_url on success/failure
  
  const razorpay = new window.Razorpay(razorpayOptions)
  
  // Note: With callback_url + redirect, we don't need payment.failed handler
  // Razorpay will redirect to callback_url on failure with error parameters
  
  razorpay.open()
}
