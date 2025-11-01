'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Truck, Home, Package, User, Phone, Mail, MapPin, Calendar, CreditCard } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'

interface OrderInfo {
  orderId: string
  paymentId: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  deliveryAddress: string
  landmark: string | null
  deliveryInstructions: string | null
  productName: string
  productWeight: string
  productPrice: number
  quantity: number
  totalAmount: number
  paymentMethod: string
  orderDate: string
  estimatedDeliveryDate: string
  verifyStatus?: string
}

function ThankYouContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order') || ''
  const paymentId = searchParams.get('payment') || ''
  const amount = searchParams.get('amount') || '0'
  const quantity = searchParams.get('quantity') || '1'
  
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null)

  useEffect(() => {
    // Get order info from sessionStorage
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('orderInfo')
      if (stored) {
        try {
          setOrderInfo(JSON.parse(stored))
          // Clear sessionStorage after reading
          sessionStorage.removeItem('orderInfo')
        } catch (error) {
          console.error('Error parsing order info:', error)
        }
      }
    }
  }, [])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Calculate delivery estimate
  const getDeliveryDate = () => {
    if (orderInfo?.estimatedDeliveryDate) {
      return formatDate(orderInfo.estimatedDeliveryDate)
    }
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return formatDate(tomorrow.toISOString())
  }

  // Use orderInfo if available, otherwise fall back to URL params
  const displayName = orderInfo?.customerName || 'Customer'
  const displayPhone = orderInfo?.customerPhone || ''
  const displayEmail = orderInfo?.customerEmail || ''
  const displayAddress = orderInfo?.deliveryAddress || ''
  const displayLandmark = orderInfo?.landmark || ''
  const displayInstructions = orderInfo?.deliveryInstructions || ''
  const displayProductName = orderInfo?.productName || 'Classic Tempeh'
  const displayProductWeight = orderInfo?.productWeight || '200g'
  const displayProductPrice = orderInfo?.productPrice || 125
  const displayQuantity = orderInfo?.quantity || parseInt(quantity)
  const displayAmount = orderInfo?.totalAmount || parseInt(amount)
  const displayOrderDate = orderInfo?.orderDate ? formatDate(orderInfo.orderDate) : formatDate(new Date().toISOString())

  return (
    <div className="min-h-screen bg-beige-50 pt-16 sm:pt-20 md:pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 text-green-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
              Thank You!
            </h1>
            <p className="text-lg sm:text-xl text-navy-700 mb-2">
              Your order has been placed successfully
            </p>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl border border-navy-100 p-6 sm:p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mb-6 pb-4 border-b border-navy-200">
              Order Details
            </h2>
            
            <div className="space-y-4 mb-6">
              {/* Order ID & Payment ID */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-navy-700 font-medium">Order ID:</span>
                  <span className="text-navy-900 font-semibold font-mono text-sm">{orderId}</span>
                </div>
                {paymentId && (
                  <div className="flex justify-between items-center">
                    <span className="text-navy-700 font-medium">Payment ID:</span>
                    <span className="text-navy-900 font-semibold font-mono text-xs sm:text-sm">{paymentId.substring(0, 16)}...</span>
                  </div>
                )}
              </div>

              <div className="border-t border-navy-200 pt-4">
                <h3 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Order Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-navy-600">Order Date:</span>
                    <span className="text-navy-900 font-medium">{displayOrderDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-600">Product:</span>
                    <span className="text-navy-900 font-medium">{displayProductName} ({displayProductWeight})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-600">Quantity:</span>
                    <span className="text-navy-900 font-medium">{displayQuantity} × ₹{displayProductPrice}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-navy-100">
                    <span className="text-navy-900 font-bold">Total Amount:</span>
                    <span className="text-navy-900 font-bold text-lg">₹{displayAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-navy-600 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      Payment Method:
                    </span>
                    <span className="text-navy-900 font-medium">{orderInfo?.paymentMethod || 'Razorpay'}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              {(displayName || displayPhone || displayEmail) && (
                <div className="border-t border-navy-200 pt-4">
                  <h3 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    {displayName && (
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-navy-400 mt-0.5 flex-shrink-0" />
                        <span className="text-navy-900 font-medium">{displayName}</span>
                      </div>
                    )}
                    {displayPhone && (
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-navy-400 mt-0.5 flex-shrink-0" />
                        <a href={`tel:${displayPhone}`} className="text-navy-900 font-medium hover:text-navy-700">
                          {displayPhone}
                        </a>
                      </div>
                    )}
                    {displayEmail && (
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-navy-400 mt-0.5 flex-shrink-0" />
                        <a href={`mailto:${displayEmail}`} className="text-navy-900 font-medium hover:text-navy-700 break-all">
                          {displayEmail}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Delivery Information */}
          <motion.div
            className="bg-gradient-to-r from-navy-50 to-beige-50 rounded-2xl border border-navy-200 p-6 sm:p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-navy-700 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Information
                </h3>
                
                {displayAddress && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-navy-700 mb-1">Delivery Address:</p>
                    <p className="text-base text-navy-900 leading-relaxed whitespace-pre-line">
                      {displayAddress}
                      {displayLandmark && (
                        <>
                          {'\n'}
                          <span className="text-sm text-navy-600">Landmark: {displayLandmark}</span>
                        </>
                      )}
                    </p>
                    {displayInstructions && (
                      <p className="text-sm text-navy-600 mt-2 italic">
                        Instructions: {displayInstructions}
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-white/60 rounded-lg p-3 mb-3">
                  <p className="text-sm font-semibold text-navy-900 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Estimated Delivery Date
                  </p>
                  <p className="text-base text-navy-700 font-medium">
                    {getDeliveryDate()}
                  </p>
                </div>

                <div className="space-y-1 text-sm text-navy-700">
                  <p className="font-semibold">📦 Your fresh tempeh will be delivered within <strong className="text-navy-900">24 hours</strong></p>
                  <p>Currently delivering only in Pune. You will receive a confirmation call/SMS shortly with delivery details.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Thank You Message */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <p className="text-base sm:text-lg text-navy-700 mb-2">
              We truly appreciate your order and look forward to serving you fresh, handcrafted tempeh!
            </p>
            <p className="text-sm sm:text-base text-navy-600">
              If you have any questions, feel free to reach out to us via WhatsApp or email.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Link
              href="/"
              className="flex-1 bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-600 hover:to-navy-800 text-white px-6 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
            <Link
              href="/account"
              className="flex-1 bg-white border-2 border-navy-700 text-navy-900 hover:bg-navy-50 px-6 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Package className="w-5 h-5" />
              View Orders
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-beige-50 pt-16 sm:pt-20 md:pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-700 mb-4"></div>
          <p className="text-navy-700">Loading...</p>
        </div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  )
}

