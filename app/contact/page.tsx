'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Mail, MessageCircle, Phone, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
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
            className="mb-8 sm:mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy-900 mb-4">
              Contact Us
            </h1>
            <p className="text-lg sm:text-xl text-navy-700">
              We'd love to hear from you! Get in touch with us through any of the channels below.
            </p>
          </motion.div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <motion.a
              href="mailto:mrsbeantempeh@gmail.com"
              className="bg-white rounded-2xl shadow-lg border border-navy-100 p-6 sm:p-8 hover:shadow-xl transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="bg-navy-700 p-4 rounded-full w-fit mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-navy-900 mb-2">Email Us</h3>
              <p className="text-navy-700 mb-4 text-sm sm:text-base">
                Send us an email for support, inquiries, or feedback
              </p>
              <p className="text-navy-900 font-semibold text-base sm:text-lg break-all">
                mrsbeantempeh@gmail.com
              </p>
            </motion.a>

            <motion.a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl shadow-lg border border-navy-100 p-6 sm:p-8 hover:shadow-xl transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="bg-navy-700 p-4 rounded-full w-fit mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-navy-900 mb-2">WhatsApp</h3>
              <p className="text-navy-700 mb-4 text-sm sm:text-base">
                Chat with us on WhatsApp for quick assistance
              </p>
              <p className="text-navy-900 font-semibold text-base sm:text-lg">
                +91 98765 43210
              </p>
            </motion.a>
          </div>

          {/* Additional Information */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl border border-navy-100 p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-navy-700" />
                <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">Response Time</h2>
              </div>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed">
                We aim to respond to all inquiries within 24 hours. For urgent matters, please reach out via WhatsApp 
                for the fastest response.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-navy-700" />
                <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">Location</h2>
              </div>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed">
                We are based in Pune, Maharashtra, India. Currently, we deliver fresh tempeh within 24 hours anywhere in Pune city.
              </p>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">What Can We Help With?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-beige-50 border border-navy-200 rounded-lg p-4">
                  <h3 className="font-semibold text-navy-900 mb-2">Order Inquiries</h3>
                  <p className="text-sm text-navy-700">Questions about your order status, delivery, or modifications</p>
                </div>
                <div className="bg-beige-50 border border-navy-200 rounded-lg p-4">
                  <h3 className="font-semibold text-navy-900 mb-2">Product Information</h3>
                  <p className="text-sm text-navy-700">Learn more about our tempeh products and nutritional information</p>
                </div>
                <div className="bg-beige-50 border border-navy-200 rounded-lg p-4">
                  <h3 className="font-semibold text-navy-900 mb-2">Feedback & Reviews</h3>
                  <p className="text-sm text-navy-700">Share your experience and help us improve our service</p>
                </div>
                <div className="bg-beige-50 border border-navy-200 rounded-lg p-4">
                  <h3 className="font-semibold text-navy-900 mb-2">General Support</h3>
                  <p className="text-sm text-navy-700">Any other questions or concerns - we're here to help!</p>
                </div>
              </div>
            </section>

            <section className="bg-navy-50 border border-navy-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl font-bold text-navy-900 mb-3">Support Hours</h3>
              <p className="text-base sm:text-lg text-navy-700">
                Our customer support team is available Monday to Saturday, 9:00 AM to 6:00 PM IST. 
                We'll respond to emails and WhatsApp messages as soon as possible.
              </p>
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

