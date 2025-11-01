'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function CancellationRefundsPage() {
  return (
    <div className="min-h-screen bg-beige-50 pt-16 sm:pt-20 md:pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-navy-700 hover:text-navy-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Home</span>
          </Link>

          {/* Header */}
          <motion.div
            className="mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy-900 mb-4">
              Cancellation & Refunds
            </h1>
            <p className="text-lg sm:text-xl text-navy-700">
              Your satisfaction is our priority. Cancel or request a refund at any time.
            </p>
          </motion.div>

          {/* Content Sections */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl border border-navy-100 p-6 sm:p-8 md:p-10 space-y-8 sm:space-y-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Full Refund Policy */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">Full Refund Policy</h2>
              </div>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed mb-4">
                At Mrs Bean, we stand behind the quality of our products. If you're not completely satisfied with your purchase, 
                we offer a <strong className="text-navy-900">100% full refund</strong> of your order amount, no questions asked.
              </p>
              <div className="bg-beige-50 border border-navy-200 rounded-lg p-4 sm:p-6 mt-4">
                <p className="text-sm sm:text-base text-navy-800 font-semibold mb-2">✓ Full Refund Guarantee:</p>
                <ul className="space-y-2 text-sm sm:text-base text-navy-700 ml-4">
                  <li>• 100% refund of the order amount</li>
                  <li>• No questions asked</li>
                  <li>• Quick processing within 5-7 business days</li>
                  <li>• Refunded to your original payment method</li>
                </ul>
              </div>
            </section>

            {/* Cancellation Policy */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">Cancel Anytime</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed mb-4">
                You have the flexibility to cancel your order at any time, whether it's before dispatch or after delivery. 
                Our cancellation policy is designed to give you complete peace of mind.
              </p>
              
              <div className="space-y-4 sm:space-y-6 mt-6">
                <div className="border-l-4 border-navy-700 pl-4 sm:pl-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-navy-900 mb-2">Before Delivery</h3>
                  <p className="text-base sm:text-lg text-navy-700 leading-relaxed">
                    Cancel your order before delivery and receive a full refund immediately. Simply contact us via WhatsApp 
                    or email with your Order ID.
                  </p>
                </div>

                <div className="border-l-4 border-navy-700 pl-4 sm:pl-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-navy-900 mb-2">After Delivery</h3>
                  <p className="text-base sm:text-lg text-navy-700 leading-relaxed">
                    Even after receiving your order, you can cancel and get a full refund. We'll arrange for pickup of the product 
                    and process your refund within 5-7 business days.
                  </p>
                </div>
              </div>
            </section>

            {/* How to Cancel */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">How to Cancel or Request a Refund</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-navy-50 rounded-lg">
                  <span className="text-2xl font-bold text-navy-700 flex-shrink-0">1</span>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">Contact Us</h3>
                    <p className="text-navy-700 text-sm sm:text-base">
                      Reach out to us via WhatsApp at <a href="https://wa.me/917558534933" className="text-navy-900 font-semibold underline">+91 75585 34933</a> or email at <a href="mailto:mrsbeantempeh@gmail.com" className="text-navy-900 font-semibold underline">mrsbeantempeh@gmail.com</a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-navy-50 rounded-lg">
                  <span className="text-2xl font-bold text-navy-700 flex-shrink-0">2</span>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">Provide Order Details</h3>
                    <p className="text-navy-700 text-sm sm:text-base">
                      Share your Order ID and reason for cancellation/refund (optional)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-navy-50 rounded-lg">
                  <span className="text-2xl font-bold text-navy-700 flex-shrink-0">3</span>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">Get Refunded</h3>
                    <p className="text-navy-700 text-sm sm:text-base">
                      We'll process your refund within 5-7 business days to your original payment method
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Important Notes */}
            <section className="bg-beige-100 border border-navy-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl font-bold text-navy-900 mb-3">Important Notes</h3>
              <ul className="space-y-2 text-sm sm:text-base text-navy-700">
                <li>• Refunds are processed within 5-7 business days</li>
                <li>• Refund amount will be credited to your original payment method</li>
                <li>• For COD orders, refund will be processed via bank transfer or UPI</li>
                <li>• Product must be returned in original condition for post-delivery cancellations</li>
                <li>• For any queries, contact us at <a href="mailto:mrsbeantempeh@gmail.com" className="text-navy-900 font-semibold underline">mrsbeantempeh@gmail.com</a></li>
              </ul>
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

