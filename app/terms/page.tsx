'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
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
              Terms and Conditions
            </h1>
            <p className="text-lg sm:text-xl text-navy-700">
              Please read these terms carefully before using our service.
            </p>
            <p className="text-sm text-navy-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </motion.div>

          {/* Content */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl border border-navy-100 p-6 sm:p-8 md:p-10 space-y-8 sm:space-y-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed">
                By accessing and using the Mrs Bean website (mrsbean.in), you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">2. Products and Services</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed mb-4">
                We offer fresh, handcrafted tempeh products made in Pune. Our products are:
              </p>
              <ul className="space-y-2 text-base sm:text-lg text-navy-700 ml-4">
                <li>• Made with non-GMO soybeans</li>
                <li>• Naturally fermented using traditional methods</li>
                <li>• Prepared fresh for each order</li>
                <li>• Delivered within 24 hours in Pune</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">3. Orders and Payment</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed mb-4">
                When you place an order:
              </p>
              <ul className="space-y-2 text-base sm:text-lg text-navy-700 ml-4">
                <li>• You agree to provide accurate and complete information</li>
                <li>• All prices are in Indian Rupees (INR)</li>
                <li>• Payment is required at the time of order confirmation</li>
                <li>• We reserve the right to refuse or cancel any order at our discretion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">4. Delivery</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed mb-4">
                We currently deliver within 24 hours anywhere in Pune:
              </p>
              <ul className="space-y-2 text-base sm:text-lg text-navy-700 ml-4">
                <li>• Delivery time: Within 24 hours of order confirmation</li>
                <li>• Delivery area: Pune city only</li>
                <li>• Products are shipped in temperature-controlled packaging</li>
                <li>• You must provide accurate delivery address</li>
                <li>• We are not responsible for delays caused by incorrect address or recipient unavailability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">5. Cancellation and Refunds</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed mb-4">
                You may cancel your order at any time and receive a full refund. For detailed information, please refer to our 
                <Link href="/cancellation-refunds" className="text-navy-900 font-semibold underline ml-1">Cancellation & Refunds Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">6. Product Quality and Freshness</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed mb-4">
                We guarantee:
              </p>
              <ul className="space-y-2 text-base sm:text-lg text-navy-700 ml-4">
                <li>• All products are fresh and prepared daily</li>
                <li>• Products are packaged hygienically</li>
                <li>• Best before date is clearly mentioned on packaging</li>
                <li>• If you receive a product that doesn't meet our quality standards, contact us immediately for a full refund</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">7. User Accounts</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed mb-4">
                To place orders, you must create an account:
              </p>
              <ul className="space-y-2 text-base sm:text-lg text-navy-700 ml-4">
                <li>• You are responsible for maintaining the confidentiality of your account</li>
                <li>• You must provide accurate and complete information</li>
                <li>• You are responsible for all activities that occur under your account</li>
                <li>• You must notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed">
                Mrs Bean shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including 
                but not limited to loss of profits, data, or use, incurred by you or any third party, whether in an action in contract 
                or tort, even if we have been advised of the possibility of such damages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">9. Changes to Terms</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any changes by posting the new 
                terms on this page. Your continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">10. Contact Information</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed">
                For any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-navy-50 rounded-lg p-4 sm:p-6 mt-4">
                <p className="text-base sm:text-lg text-navy-900 font-semibold mb-2">Email:</p>
                <a href="mailto:mrsbeantempeh@gmail.com" className="text-navy-700 hover:text-navy-900 underline">
                  mrsbeantempeh@gmail.com
                </a>
                <p className="text-base sm:text-lg text-navy-900 font-semibold mb-2 mt-4">WhatsApp:</p>
                <a href="https://wa.me/919876543210" className="text-navy-700 hover:text-navy-900 underline">
                  +91 98765 43210
                </a>
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

