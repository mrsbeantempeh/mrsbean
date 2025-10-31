'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQ {
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    question: 'How is tempeh delivered and how long does it stay fresh?',
    answer: 'We use temperature-controlled packaging and partner with trusted delivery partners. We deliver within 24 hours in Pune. Tempeh stays fresh for 5-7 days when refrigerated and up to 3 months when frozen.',
  },
  {
    question: 'How do I order?',
    answer: 'Simply click "Buy Now" on any product page, and you\'ll be redirected to WhatsApp where you can place your order. We\'ll confirm your order and delivery details.',
  },
  {
    question: 'Is tempeh suitable for vegetarians and vegans?',
    answer: 'Absolutely! Tempeh is 100% plant-based, made from fermented soybeans. It\'s perfect for vegetarians, vegans, and anyone looking for sustainable protein sources.',
  },
  {
    question: 'How do I cook tempeh?',
    answer: 'Tempeh is very versatile! You can pan-fry, bake, grill, or crumble it. It absorbs flavors beautifully, so marinate it in your favorite spices. Check our recipes section for inspiration!',
  },
  {
    question: 'Is your tempeh non-GMO and organic?',
    answer: 'Yes, we use only non-GMO soybeans sourced from trusted farmers. Our fermentation process is natural, using traditional methods without any artificial additives. Made fresh in Pune.',
  },
  {
    question: 'Do you deliver pan-India?',
    answer: 'We currently deliver only in Pune with 24-hour delivery service. We\'re expanding rapidly and will soon reach more cities across India!',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-beige-50">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <motion.div
          className="text-center mb-12 sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4 sm:mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-navy-700 leading-relaxed">
            Everything you need to know about our tempeh
          </p>
        </motion.div>

        <div className="space-y-4 sm:space-y-5">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="border border-navy-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-5 sm:px-6 md:px-7 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-navy-50 transition-colors"
              >
                <span className="font-semibold text-navy-900 pr-4 text-sm sm:text-base">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-navy-600 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-5 sm:px-6 md:px-7 pb-4 sm:pb-5"
                >
                  <p className="text-sm sm:text-base text-navy-700 leading-relaxed pt-2">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
