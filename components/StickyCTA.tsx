'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsVisible(scrollPosition > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.a
          href="/products"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-600 hover:to-navy-800 text-white px-5 sm:px-6 md:px-7 py-3 sm:py-4 rounded-full font-bold shadow-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Buy Now</span>
          <span className="sm:hidden">Buy</span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
