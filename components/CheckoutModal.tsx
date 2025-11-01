'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Phone, Mail, MapPin, Lock, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { openRazorpayCheckout } from '@/lib/razorpay'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    name: string
    price: number
    weight: string
    image: string
  }
  quantity: number
}

export default function CheckoutModal({ isOpen, onClose, product, quantity }: CheckoutModalProps) {
  const router = useRouter()
  const { user, profile, addOrder, addTransaction, addGuestOrder, addGuestTransaction, signup } = useAuth()
  const [loading, setLoading] = useState(false)
  const [createAccount, setCreateAccount] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    name: user ? (profile?.name || '') : '',
    phone: user ? (profile?.phone || '') : '',
    email: user ? (user.email || '') : '',
    address: '',
    landmark: '',
    instructions: '',
  })

  // Auto-fill from profile if logged in
  useEffect(() => {
    if (user && profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || prev.name,
        phone: profile.phone || prev.phone,
        email: user.email || prev.email,
      }))
    }
  }, [user, profile])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCreateAccount(false)
      setErrors({})
      if (!user) {
        setFormData({
          name: '',
          phone: '',
          email: '',
          address: '',
          landmark: '',
          instructions: '',
        })
      } else {
        // Reset address fields for logged-in users too
        setFormData(prev => ({
          ...prev,
          address: '',
          landmark: '',
          instructions: '',
        }))
      }
    }
  }, [isOpen, user])

  const totalPrice = product.price * quantity

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }
    
    // Validate email (optional but if provided, must be valid)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = 'Delivery address is required'
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please provide a complete address (at least 10 characters)'
    }
    
    setErrors(newErrors)
    
    // Scroll to first error if any
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0]
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()
      }
    }
    
    return Object.keys(newErrors).length === 0
  }

  const handleBuyNow = async () => {
    // Validate all fields before proceeding
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Step 1: Create Razorpay order
      const createOrderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalPrice,
          currency: 'INR',
          receipt: `receipt_${Date.now()}_qty_${quantity}`,
        }),
      })

      if (!createOrderResponse.ok) {
        throw new Error('Failed to create payment order')
      }

      const razorpayOrder = await createOrderResponse.json()

      // Step 2: Create order record in database
      const orderId = `ORDER-${Date.now()}`
      const fullAddress = `${formData.address}${formData.landmark ? `, ${formData.landmark}` : ''}${formData.instructions ? ` (${formData.instructions})` : ''}`

      if (user) {
        // Logged in user - use regular order function
        await addOrder({
          order_id: orderId,
          product_name: product.name,
          quantity,
          price: product.price,
          total: totalPrice,
          status: 'pending',
          payment_method: 'Razorpay',
          address: fullAddress,
        })
      } else {
        // Guest order
        const guestOrderResult = await addGuestOrder({
          order_id: orderId,
          product_name: product.name,
          quantity,
          price: product.price,
          total: totalPrice,
          status: 'pending',
          payment_method: 'Razorpay',
          address: fullAddress,
          guest_name: formData.name,
          guest_email: formData.email || undefined,
          guest_phone: formData.phone,
          user_id: null,
        })

        if (!guestOrderResult.success) {
          throw new Error(guestOrderResult.error || 'Failed to create order')
        }
      }

      // Step 3: Open Razorpay checkout
      await openRazorpayCheckout({
        amount: razorpayOrder.amount,
        productName: `${quantity}x ${product.name} (₹${totalPrice})`,
        orderId: razorpayOrder.id,
        customerName: formData.name,
        customerEmail: formData.email || undefined,
        customerContact: formData.phone,
        onSuccess: async (paymentId, razorpayOrderId, signature) => {
          try {
            // Verify payment on server
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

            const verifyResult = await verifyResponse.json()

            // Create transaction record
            const transactionId = `TXN-${paymentId}`
            
            if (user) {
              // Logged in user - use regular transaction function
              await addTransaction({
                transaction_id: transactionId,
                order_id: orderId,
                amount: totalPrice,
                status: verifyResult.verified ? 'success' : 'pending',
                payment_method: 'Razorpay',
              })
            } else {
              // Guest transaction
              await addGuestTransaction({
                transaction_id: transactionId,
                order_id: orderId,
                amount: totalPrice,
                status: verifyResult.verified ? 'success' : 'pending',
                payment_method: 'Razorpay',
                guest_email: formData.email || undefined,
                guest_phone: formData.phone,
                user_id: null,
              })

              // Optional: Create account if requested
              if (createAccount && formData.email) {
                // Generate a random password (user will need to reset it)
                const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)
                await signup(formData.name, formData.email, tempPassword, formData.phone)
                // In production, you'd send a password reset email here
              }
            }

            // Store order information in sessionStorage for thank-you page
            const orderInfo = {
              orderId,
              paymentId,
              customerName: formData.name,
              customerPhone: formData.phone,
              customerEmail: formData.email || null,
              deliveryAddress: formData.address,
              landmark: formData.landmark || null,
              deliveryInstructions: formData.instructions || null,
              productName: product.name,
              productWeight: product.weight,
              productPrice: product.price,
              quantity,
              totalAmount: totalPrice,
              paymentMethod: 'Razorpay',
              orderDate: new Date().toISOString(),
              estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
            }
            
            // Store in sessionStorage
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('orderInfo', JSON.stringify(orderInfo))
            }

            // Close modal and redirect to thank you page
            onClose()
            router.push(`/thank-you?order=${orderId}&payment=${paymentId}&amount=${totalPrice}&quantity=${quantity}`)
          } catch (error) {
            console.error('Payment verification error:', error)
            
            // Store order info even if verification fails
            const orderInfo = {
              orderId,
              paymentId,
              customerName: formData.name,
              customerPhone: formData.phone,
              customerEmail: formData.email || null,
              deliveryAddress: formData.address,
              landmark: formData.landmark || null,
              deliveryInstructions: formData.instructions || null,
              productName: product.name,
              productWeight: product.weight,
              productPrice: product.price,
              quantity,
              totalAmount: totalPrice,
              paymentMethod: 'Razorpay',
              orderDate: new Date().toISOString(),
              estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              verifyStatus: 'error',
            }
            
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('orderInfo', JSON.stringify(orderInfo))
            }
            
            // Still redirect but mark as pending
            onClose()
            router.push(`/thank-you?order=${orderId}&payment=${paymentId}&amount=${totalPrice}&quantity=${quantity}&verify=error`)
          }
        },
        onError: (error) => {
          console.error('Payment error:', error)
          alert(error.message || 'Payment failed. Please try again.')
          setLoading(false)
        },
      })
    } catch (error: any) {
      console.error('Error processing order:', error)
      alert(error.message || 'Failed to process order. Please try again.')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-navy-200 flex-shrink-0">
            <h2 className="text-2xl font-bold text-navy-900">Checkout</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-navy-50 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-navy-700" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Order Summary - Sticky at top */}
            <div className="bg-navy-50 rounded-xl p-5 border border-navy-200">
              <h3 className="text-lg font-bold text-navy-900 mb-4">Order Summary</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-navy-900">{product.name}</h4>
                  <p className="text-sm text-navy-600">{product.weight}</p>
                  <p className="text-sm text-navy-700 mt-1">
                    Quantity: <span className="font-semibold">{quantity}</span> × ₹{product.price}
                  </p>
                </div>
              </div>
              <div className="border-t border-navy-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-navy-900">Total:</span>
                  <span className="text-xl font-bold text-navy-900">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-navy-600 mt-2">Free shipping • 24-hour delivery in Pune</p>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h3 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-navy-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-700 ${
                        errors.name ? 'border-red-500' : 'border-navy-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-navy-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const phone = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
                        setFormData({ ...formData, phone })
                      }}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-700 ${
                        errors.phone ? 'border-red-500' : 'border-navy-300'
                      }`}
                      placeholder="Enter your 10-digit phone number"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-navy-700 mb-2">
                    Email Address <span className="text-navy-500 text-xs font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-700 ${
                        errors.email ? 'border-red-500' : 'border-navy-300'
                      }`}
                      placeholder="your@email.com (for order updates)"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Delivery Address Section */}
            <div>
              <h3 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Address
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-navy-700 mb-2">
                    Complete Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-navy-400" />
                    <textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-700 min-h-[100px] ${
                        errors.address ? 'border-red-500' : 'border-navy-300'
                      }`}
                      placeholder="House/Flat number, Building name, Street, Area, City"
                      rows={4}
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  <p className="text-xs text-navy-600 mt-1">
                    Currently delivering only in Pune. Please ensure your address is within Pune.
                  </p>
                </div>

                <div>
                  <label htmlFor="landmark" className="block text-sm font-semibold text-navy-700 mb-2">
                    Landmark <span className="text-navy-500 text-xs font-normal">(Optional)</span>
                  </label>
                  <input
                    id="landmark"
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-700"
                    placeholder="Nearby landmark or location"
                  />
                </div>

                <div>
                  <label htmlFor="instructions" className="block text-sm font-semibold text-navy-700 mb-2">
                    Delivery Instructions <span className="text-navy-500 text-xs font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-700 min-h-[80px]"
                    placeholder="Any special delivery instructions (e.g., gate code, floor number, etc.)"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Optional Account Creation (only for guests) */}
            {!user && (
              <div className="bg-beige-50 border border-navy-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    className="mt-1 w-4 h-4 text-navy-700 border-navy-300 rounded focus:ring-navy-700"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-navy-700" />
                      <span className="font-semibold text-navy-900">Create an account</span>
                    </div>
                    <p className="text-sm text-navy-600 mt-1">
                      Track your orders and enjoy faster checkout next time. We'll send you a password reset link.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Security Note */}
            <div className="flex items-center gap-2 text-sm text-navy-600 bg-green-50 border border-green-200 rounded-lg p-3">
              <Lock className="w-4 h-4 text-green-700 flex-shrink-0" />
              <span>Your payment is secured by Razorpay. We never store your card details.</span>
            </div>
          </div>

          {/* Footer with Payment Button - Sticky at bottom */}
          <div className="p-6 border-t border-navy-200 bg-navy-50 flex-shrink-0">
            <button
              onClick={handleBuyNow}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-navy-700 to-navy-900 text-white rounded-lg font-bold text-lg hover:from-navy-600 hover:to-navy-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Pay ₹{totalPrice.toLocaleString('en-IN')}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}