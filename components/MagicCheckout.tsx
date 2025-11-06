'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { openRazorpayCheckout } from '@/lib/razorpay'

interface MagicCheckoutProps {
  product: {
    name: string
    price: number
    weight: string
    image: string
  }
  quantity: number
}

export default function MagicCheckout({ product, quantity }: MagicCheckoutProps) {
  const router = useRouter()
  const { user, profile, addOrder, addTransaction, addGuestOrder, addGuestTransaction } = useAuth()
  const [loading, setLoading] = useState(false)

  const totalPrice = product.price * quantity

  useEffect(() => {
    // Automatically trigger Magic Checkout when component mounts
    handleMagicCheckout()
  }, [])

  const handleMagicCheckout = async () => {
    setLoading(true)

    try {
      // Step 1: Create Razorpay order with Magic Checkout parameters
      // CRITICAL: Must include line_items_total and line_items for Magic Checkout
      const createOrderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalPrice,
          currency: 'INR',
          receipt: `receipt_${Date.now()}_qty_${quantity}`,
          product: {
            sku: `SKU-${product.name.replace(/\s+/g, '-').toUpperCase()}`,
            variant_id: `VARIANT-${Date.now()}`,
            price: product.price,
            offerPrice: product.price, // No discount, so same as price
            taxAmount: 0, // No tax
            quantity: quantity,
            name: product.name,
            description: `${product.name} - ${product.weight}`,
            weight: 200, // Default weight in grams (adjust as needed)
            dimensions: {
              length: 10,
              width: 10,
              height: 5,
            },
            image: product.image,
            image_url: product.image,
            product_url: typeof window !== 'undefined' ? window.location.origin + '/products' : '',
          },
        }),
      })

      if (!createOrderResponse.ok) {
        throw new Error('Failed to create payment order')
      }

      const razorpayOrder = await createOrderResponse.json()

      // Step 2: Create or get Razorpay customer for Magic Checkout (if user is logged in)
      let customerId: string | undefined
      
      if (user && profile) {
        try {
          const customerResponse = await fetch('/api/razorpay/create-customer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: profile.name || '',
              email: user.email || '',
              contact: profile.phone || '',
            }),
          })

          if (customerResponse.ok) {
            const customer = await customerResponse.json()
            customerId = customer.id
          }
        } catch (error) {
          console.error('Failed to create Razorpay customer:', error)
          // Continue without customer_id - Magic Checkout will still work
        }
      }

      // Step 3: Create order record in database (pending status)
      const orderId = `ORDER-${Date.now()}`

      if (user) {
        await addOrder({
          order_id: orderId,
          product_name: product.name,
          quantity,
          price: product.price,
          total: totalPrice,
          status: 'pending',
          payment_method: 'Razorpay',
          address: 'Address will be updated after payment', // Will be updated from Razorpay
        })
      } else {
        await addGuestOrder({
          order_id: orderId,
          product_name: product.name,
          quantity,
          price: product.price,
          total: totalPrice,
          status: 'pending',
          payment_method: 'Razorpay',
          address: 'Address will be updated after payment', // Will be updated from Razorpay
          guest_name: undefined, // Will be updated from Razorpay
          guest_email: undefined, // Will be updated from Razorpay
          guest_phone: undefined, // Will be updated from Razorpay
          user_id: null,
        })
      }

      // Step 4: Open Razorpay Magic Checkout
      // Magic Checkout will handle collecting customer details, address, and payment
      await openRazorpayCheckout({
        amount: razorpayOrder.amount,
        productName: `${quantity}x ${product.name} (₹${totalPrice})`,
        orderId: razorpayOrder.id,
        customerName: user && profile ? (profile.name || '') : undefined,
        customerEmail: user ? (user.email || undefined) : undefined,
        customerContact: user && profile ? (profile.phone || '') : undefined,
        customerId: customerId, // Use Razorpay customer ID for Magic Checkout
        onSuccess: async (paymentId, razorpayOrderId, signature) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: razorpayOrderId,
                razorpay_payment_id: paymentId,
                razorpay_signature: signature || '',
                expected_amount: totalPrice,
              }),
            })

            if (!verifyResponse.ok) {
              throw new Error(`Verification failed: ${verifyResponse.status}`)
            }

            const verifyResult = await verifyResponse.json()
            const paymentStatus: 'success' | 'pending' = verifyResult.verified === true ? 'success' : 'pending'

            // Fetch order details from Razorpay to get customer address
            // Note: Address will be available in Razorpay order details or webhook
            let customerName = user && profile ? profile.name : 'Customer'
            let customerEmail = user ? user.email : undefined
            let customerPhone = user && profile ? profile.phone : undefined
            let deliveryAddress = 'Address from Razorpay Magic Checkout'

            // Try to fetch order details from Razorpay
            try {
              const orderDetailsResponse = await fetch(`/api/razorpay/get-order?order_id=${razorpayOrderId}`)
              if (orderDetailsResponse.ok) {
                const orderDetails = await orderDetailsResponse.json()
                // Update customer details if available
                if (orderDetails.notes?.name) customerName = orderDetails.notes.name
                if (orderDetails.notes?.email) customerEmail = orderDetails.notes.email
                if (orderDetails.notes?.contact) customerPhone = orderDetails.notes.contact
                if (orderDetails.notes?.address) deliveryAddress = orderDetails.notes.address
              }
            } catch (error) {
              console.error('Failed to fetch order details:', error)
              // Continue with default values
            }

            // Create transaction record
            const transactionId = `TXN-${paymentId}`
            
            if (user) {
              await addTransaction({
                transaction_id: transactionId,
                order_id: orderId,
                amount: totalPrice,
                status: paymentStatus,
                payment_method: 'Razorpay',
              })
            } else {
              await addGuestTransaction({
                transaction_id: transactionId,
                order_id: orderId,
                amount: totalPrice,
                status: paymentStatus,
                payment_method: 'Razorpay',
                guest_email: customerEmail,
                guest_phone: customerPhone,
                user_id: null,
              })
            }

            // Store order info for thank-you page
            const orderInfo = {
              orderId,
              paymentId,
              customerName,
              customerPhone: customerPhone || '',
              customerEmail: customerEmail || null,
              deliveryAddress,
              productName: product.name,
              productWeight: product.weight,
              productPrice: product.price,
              quantity,
              totalAmount: totalPrice,
              paymentMethod: 'Razorpay',
              orderDate: new Date().toISOString(),
              estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            }
            
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('orderInfo', JSON.stringify(orderInfo))
            }

            // Redirect to thank-you page
            router.push(`/thank-you?order=${orderId}&payment=${paymentId}&amount=${totalPrice}&quantity=${quantity}`)
          } catch (error) {
            console.error('Payment verification error:', error)
            
            // Create transaction record even if verification fails
            const transactionId = `TXN-${paymentId || Date.now()}`
            
            try {
              if (user) {
                await addTransaction({
                  transaction_id: transactionId,
                  order_id: orderId,
                  amount: totalPrice,
                  status: 'pending',
                  payment_method: 'Razorpay',
                })
              } else {
                await addGuestTransaction({
                  transaction_id: transactionId,
                  order_id: orderId,
                  amount: totalPrice,
                  status: 'pending',
                  payment_method: 'Razorpay',
                  guest_email: undefined,
                  guest_phone: undefined,
                  user_id: null,
                })
              }
            } catch (txnError) {
              console.error('Failed to create transaction record:', txnError)
            }
            
            // Still redirect but mark as pending
            router.push(`/thank-you?order=${orderId}&payment=${paymentId}&amount=${totalPrice}&quantity=${quantity}&verify=error`)
          }
        },
        onError: (error) => {
          console.error('Payment error:', error)
          alert(error.message || 'Payment failed. Please try again.')
          setLoading(false)
          router.push('/products')
        },
      })
    } catch (error: any) {
      console.error('Error processing order:', error)
      alert(error.message || 'Failed to process order. Please try again.')
      setLoading(false)
      router.push('/products')
    }
  }

  // Show loading state while Magic Checkout is being initialized
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-700 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-navy-900 mb-2">Opening Magic Checkout</h2>
          <p className="text-navy-700">Please wait while we prepare your checkout...</p>
          {loading && (
            <p className="text-sm text-navy-600 mt-2">Razorpay Magic Checkout will open shortly</p>
          )}
        </div>
      </div>
    </div>
  )
}
