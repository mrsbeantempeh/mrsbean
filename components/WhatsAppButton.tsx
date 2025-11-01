'use client'

import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function WhatsAppButton() {
  const phoneNumber = '+917558534933'
  const defaultMessage = 'Hi! I\'m interested in buying fresh tempeh from Mrs Bean.'

  const handleClick = () => {
    const message = encodeURIComponent(defaultMessage)
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <motion.button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20BA5A] text-white p-4 sm:p-5 rounded-full shadow-2xl transition-all duration-300 group"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1, boxShadow: '0 10px 25px rgba(37, 211, 102, 0.4)' }}
      whileTap={{ scale: 0.95 }}
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
    </motion.button>
  )
}

