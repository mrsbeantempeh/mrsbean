'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Lock, Eye } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-lg sm:text-xl text-navy-700">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
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
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-navy-700" />
                <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">Our Commitment to Privacy</h2>
              </div>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed">
                At Mrs Bean, we are committed to protecting your privacy. We understand that your personal information is 
                important, and we take the responsibility of safeguarding it seriously.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-navy-700" />
                <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">Information We Collect</h2>
              </div>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed mb-4">
                We collect the following types of information:
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-navy-700 pl-4 sm:pl-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-navy-900 mb-2">Personal Information</h3>
                  <ul className="space-y-2 text-base sm:text-lg text-navy-700 ml-4">
                    <li>• Name and email address (required for account creation)</li>
                    <li>• Phone number (optional, for delivery updates)</li>
                    <li>• Delivery address</li>
                    <li>• Payment information (processed securely through payment gateways)</li>
                  </ul>
                </div>
                <div className="border-l-4 border-navy-700 pl-4 sm:pl-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-navy-900 mb-2">Usage Information</h3>
                  <ul className="space-y-2 text-base sm:text-lg text-navy-700 ml-4">
                    <li>• Browsing behavior on our website</li>
                    <li>• Order history and preferences</li>
                    <li>• Device and browser information</li>
                    <li>• IP address and location data</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-navy-700" />
                <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">How We Use Your Information</h2>
              </div>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed mb-4">
                We use your information to:
              </p>
              <ul className="space-y-2 text-base sm:text-lg text-navy-700 ml-4">
                <li>• Process and fulfill your orders</li>
                <li>• Communicate with you about your orders and delivery updates</li>
                <li>• Provide customer support</li>
                <li>• Improve our website and services</li>
                <li>• Send you marketing communications (only with your consent)</li>
                <li>• Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">Data Security</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="space-y-2 text-base sm:text-lg text-navy-700 ml-4">
                <li>• Encrypted data transmission (SSL/TLS)</li>
                <li>• Secure database storage</li>
                <li>• Limited access to personal information (only authorized personnel)</li>
                <li>• Regular security audits and updates</li>
                <li>• Payment information is handled by secure payment gateways</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">Data Sharing</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information only with:
              </p>
              <ul className="space-y-2 text-base sm:text-lg text-navy-700 ml-4">
                <li>• Delivery partners (for order fulfillment)</li>
                <li>• Payment processors (for transaction processing)</li>
                <li>• Service providers who assist in our operations (under strict confidentiality agreements)</li>
                <li>• Legal authorities when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">Your Rights</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="space-y-2 text-base sm:text-lg text-navy-700 ml-4">
                <li>• Access your personal information</li>
                <li>• Correct inaccurate information</li>
                <li>• Request deletion of your data</li>
                <li>• Opt-out of marketing communications</li>
                <li>• Withdraw consent for data processing</li>
                <li>• Request a copy of your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">Cookies and Tracking</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="space-y-2 text-base sm:text-lg text-navy-700 ml-4">
                <li>• Remember your preferences</li>
                <li>• Analyze website traffic and usage</li>
                <li>• Improve user experience</li>
                <li>• Provide personalized content</li>
              </ul>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed mt-4">
                You can control cookies through your browser settings. However, disabling cookies may affect website functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">Third-Party Services</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed">
                Our website may contain links to third-party websites or use third-party services (like Google Analytics, 
                payment processors). We are not responsible for the privacy practices of these third parties. We encourage you 
                to read their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">Children's Privacy</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed">
                Our services are not intended for children under 18 years of age. We do not knowingly collect personal 
                information from children. If you believe we have collected information from a child, please contact us 
                immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">Changes to Privacy Policy</h2>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy 
                Policy periodically.
              </p>
            </section>

            <section className="bg-beige-100 border border-navy-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl font-bold text-navy-900 mb-3">Contact Us</h3>
              <p className="text-base sm:text-lg text-navy-700 leading-relaxed mb-4">
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2">
                <p className="text-base sm:text-lg text-navy-900 font-semibold">Email:</p>
                <a href="mailto:mrsbeantempeh@gmail.com" className="text-navy-700 hover:text-navy-900 underline">
                  mrsbeantempeh@gmail.com
                </a>
                <p className="text-base sm:text-lg text-navy-900 font-semibold mt-4">WhatsApp:</p>
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

