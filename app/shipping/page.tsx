'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Truck, Clock, MapPin, Package } from 'lucide-react'
import Link from 'next/link'

export default function ShippingPage() {
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
              Shipping Information
            </h1>
            <p className="text-lg sm:text-xl text-navy-700">
              Fast, fresh delivery within 24 hours anywhere in Pune
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl border border-navy-100 p-6 sm:p-8 md:p-10 space-y-8 sm:space-y-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Delivery Time */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-navy-700" />
                <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">Delivery Time</h2>
              </div>
              <div className="bg-gradient-to-r from-navy-50 to-beige-50 border border-navy-200 rounded-lg p-4 sm:p-6 mb-4">
                <p className="text-2xl sm:text-3xl font-bold text-navy-900 mb-2">Within 24 Hours</p>
                <p className="text-base sm:text-lg text-navy-700">
                  Your fresh tempeh will be delivered to your doorstep within 24 hours of order confirmation. 
                  We prepare each order fresh and deliver it the same day or next day.
                </p>
              </div>
            </section>

            {/* Delivery Area */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-navy-700" />
                <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">Delivery Area</h2>
              </div>
              <div className="bg-beige-50 border border-navy-200 rounded-lg p-4 sm:p-6">
                <p className="text-lg sm:text-xl font-bold text-navy-900 mb-2">Currently Delivering Only in Pune</p>
                <p className="text-base sm:text-lg text-navy-700">
                  We currently offer delivery services exclusively within Pune city limits. We're working on expanding 
                  our delivery network to other cities soon. Stay tuned!
                </p>
              </div>
            </section>

            {/* Packaging */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6 text-navy-700" />
                <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">Packaging & Handling</h2>
              </div>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed mb-4">
                Your fresh tempeh is carefully packaged to maintain quality and freshness:
              </p>
              <ul className="space-y-3 text-base sm:text-lg text-navy-700 ml-4">
                <li>• Temperature-controlled packaging to preserve freshness</li>
                <li>• Hygienic and food-safe packaging materials</li>
                <li>• Insulated packaging to maintain optimal temperature</li>
                <li>• Proper labeling with best before date and storage instructions</li>
              </ul>
            </section>

            {/* Delivery Process */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-6 h-6 text-navy-700" />
                <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">Delivery Process</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-navy-50 rounded-lg">
                  <span className="text-2xl font-bold text-navy-700 flex-shrink-0">1</span>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">Order Confirmation</h3>
                    <p className="text-navy-700 text-sm sm:text-base">
                      Once you place an order, you'll receive an order confirmation with Order ID
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-navy-50 rounded-lg">
                  <span className="text-2xl font-bold text-navy-700 flex-shrink-0">2</span>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">Processing</h3>
                    <p className="text-navy-700 text-sm sm:text-base">
                      We prepare your fresh tempeh order and package it with care
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-navy-50 rounded-lg">
                  <span className="text-2xl font-bold text-navy-700 flex-shrink-0">3</span>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">Dispatch</h3>
                    <p className="text-navy-700 text-sm sm:text-base">
                      Your order is dispatched for delivery within 24 hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-navy-50 rounded-lg">
                  <span className="text-2xl font-bold text-navy-700 flex-shrink-0">4</span>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">Delivery</h3>
                    <p className="text-navy-700 text-sm sm:text-base">
                      You'll receive a call/SMS before delivery. Our team delivers your fresh tempeh to your doorstep
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Important Notes */}
            <section className="bg-beige-100 border border-navy-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl font-bold text-navy-900 mb-3">Important Delivery Notes</h3>
              <ul className="space-y-2 text-sm sm:text-base text-navy-700">
                <li>• Please ensure someone is available to receive the delivery</li>
                <li>• Provide accurate and complete delivery address</li>
                <li>• Include landmark or directions if your address is hard to locate</li>
                <li>• Delivery attempts may be rescheduled if recipient is unavailable</li>
                <li>• For any delivery queries, contact us at <a href="mailto:mrsbeantempeh@gmail.com" className="text-navy-900 font-semibold underline">mrsbeantempeh@gmail.com</a> or WhatsApp <a href="https://wa.me/919876543210" className="text-navy-900 font-semibold underline">+91 98765 43210</a></li>
              </ul>
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

