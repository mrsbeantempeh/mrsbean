'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface CheckoutFormData {
  name: string
  phone: string
  email: string
  address: string
}

interface CheckoutFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CheckoutFormData) => void
  productName: string
  quantity: number
  totalPrice: number
  defaultName?: string
  defaultPhone?: string
  defaultEmail?: string
}

export default function CheckoutForm({
  isOpen,
  onClose,
  onSubmit,
  productName,
  quantity,
  totalPrice,
  defaultName = '',
  defaultPhone = '',
  defaultEmail = '',
}: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: defaultName,
    phone: defaultPhone,
    email: defaultEmail,
    address: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Delivery address is required'
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please provide a complete address (at least 10 characters)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      // Format phone number (remove any non-digits and ensure it's 10 digits)
      const formattedPhone = formData.phone.replace(/[^0-9]/g, '').slice(0, 10)
      onSubmit({
        ...formData,
        phone: formattedPhone,
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
      })
    }
  }

  const handleChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-navy-100 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-navy-900">Checkout</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-navy-50 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-navy-600" />
            </button>
          </div>

          {/* Order Summary */}
          <div className="px-6 py-4 bg-beige-50 border-b border-navy-100">
            <h3 className="font-semibold text-navy-900 mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm text-navy-700">
              <div className="flex justify-between">
                <span>{quantity}x {productName}</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between font-bold text-navy-900 pt-2 border-t border-navy-200">
                <span>Total</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-navy-900 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.name ? 'border-red-500' : 'border-navy-200'
                } focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-navy-900 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.phone ? 'border-red-500' : 'border-navy-200'
                } focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent`}
                placeholder="10-digit phone number"
                maxLength={10}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy-900 mb-2">
                Email Address <span className="text-navy-400 text-xs">(Optional)</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-navy-200'
                } focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent`}
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-navy-900 mb-2">
                Delivery Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.address ? 'border-red-500' : 'border-navy-200'
                } focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none`}
                placeholder="Enter your complete delivery address including street, area, city, pincode"
              />
              {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-lg border border-navy-300 text-navy-700 font-medium hover:bg-navy-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-lg bg-navy-900 text-white font-medium hover:bg-navy-800 transition-colors"
              >
                Proceed to Payment
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

