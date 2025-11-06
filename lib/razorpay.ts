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

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
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
  onSuccess: (paymentId: string, orderId: string, signature: string) => void
  onError: (error: any) => void
}

export const openRazorpayCheckout = async (options: RazorpayOptions) => {
  await loadRazorpayScript()

  const razorpayOptions: any = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    amount: options.amount, // Amount in paise (already converted)
    currency: 'INR',
    name: 'Mrs Bean',
    description: options.productName,
    order_id: options.orderId,
    handler: function (response: any) {
      options.onSuccess(
        response.razorpay_payment_id,
        response.razorpay_order_id,
        response.razorpay_signature
      )
    },
    prefill: {
      name: options.customerName || '',
      email: options.customerEmail || '',
      contact: options.customerContact || '',
    },
    // Magic Checkout configuration
    // Note: Magic Checkout is automatically enabled when activated on your Razorpay account
    // These options enhance the checkout experience
    method: {
      card: true,
      netbanking: true,
      wallet: true,
      upi: true,
      emi: true,
    },
    // Enable save for Magic Checkout - allows customers to save payment methods
    save: {
      enabled: true,
    },
    // Add customer_id for returning customers (Magic Checkout feature)
    ...(options.customerId && { customer_id: options.customerId }),
    theme: {
      color: '#102a43', // Navy blue theme
    },
    modal: {
      ondismiss: function () {
        options.onError({ message: 'Payment cancelled by user' })
      },
    },
  }

  const razorpay = new window.Razorpay(razorpayOptions)
  razorpay.on('payment.failed', function (response: any) {
    options.onError(response.error || { message: 'Payment failed' })
  })
  
  razorpay.open()
}
