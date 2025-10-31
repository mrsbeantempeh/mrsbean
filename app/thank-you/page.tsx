'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Truck, Home, Package } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order') || ''
  const paymentId = searchParams.get('payment') || ''
  const amount = searchParams.get('amount') || '0'
  const quantity = searchParams.get('quantity') || '1'

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
              <div className="flex justify-between items-center">
                <span className="text-navy-700 font-medium">Order ID:</span>
                <span className="text-navy-900 font-semibold">{orderId}</span>
              </div>
              {paymentId && (
                <div className="flex justify-between items-center">
                  <span className="text-navy-700 font-medium">Payment ID:</span>
                  <span className="text-navy-900 font-semibold text-sm sm:text-base">{paymentId.substring(0, 12)}...</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-navy-700 font-medium">Quantity:</span>
                <span className="text-navy-900 font-semibold">{quantity} x 200g</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-navy-200">
                <span className="text-navy-900 font-bold text-lg">Total Amount:</span>
                <span className="text-navy-900 font-bold text-xl">₹{parseInt(amount).toLocaleString('en-IN')}</span>
              </div>
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
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-navy-900 mb-2">
                  Delivery Information
                </h3>
                <p className="text-base sm:text-lg text-navy-700 mb-3 leading-relaxed">
                  Your fresh tempeh will be delivered to your doorstep within <strong className="text-navy-900">24 hours</strong>.
                </p>
                <p className="text-sm sm:text-base text-navy-600">
                  Currently delivering only in Pune. You will receive a confirmation call/SMS shortly with delivery details.
                </p>
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

