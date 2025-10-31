'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const reviews = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'Best tempeh I\'ve had! High protein, great taste. My gym routine feels complete now. Fresh delivery and excellent packaging.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Rahul Mehta',
    location: 'Delhi',
    rating: 5,
    text: 'As a vegetarian, finding quality protein was tough. This tempeh changed everything! Easy to cook, delicious, and keeps me full.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Ananya Reddy',
    location: 'Bangalore',
    rating: 5,
    text: 'Love the spiced variant! Made amazing curry with it. Gut health has improved since I started eating this regularly.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Vikram Singh',
    location: 'Pune',
    rating: 5,
    text: 'Fresh delivery, amazing quality! This tempeh is fire! Perfect for my plant-based journey. Highly recommend!',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
  },
]

export default function Reviews() {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12 sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4 sm:mb-6">
            Loved by Our Customers
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-navy-700 leading-relaxed">
            Real reviews from real people across India
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8 mb-12 sm:mb-16">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-5 sm:p-6 md:p-7 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-navy-100"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-navy-200 flex-shrink-0"
                />
                <div>
                  <p className="font-semibold text-navy-900 text-sm sm:text-base">{review.name}</p>
                  <p className="text-xs sm:text-sm text-navy-600">{review.location}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-4 sm:mb-5">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-navy-700 text-navy-700" />
                ))}
              </div>
              <p className="text-sm sm:text-base text-navy-700 leading-relaxed">
                "{review.text}"
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="p-6 sm:p-7 md:p-8 bg-beige-50 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-navy-100">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">⭐</div>
            <p className="font-semibold text-navy-900 text-sm sm:text-base">4.9/5 Rating</p>
          </div>
          <div className="p-6 sm:p-7 md:p-8 bg-beige-50 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-navy-100">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🚚</div>
            <p className="font-semibold text-navy-900 text-sm sm:text-base">Fresh Delivery</p>
          </div>
          <div className="p-6 sm:p-7 md:p-8 bg-beige-50 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-navy-100">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🇮🇳</div>
            <p className="font-semibold text-navy-900 text-sm sm:text-base">Made in Pune</p>
          </div>
          <div className="p-6 sm:p-7 md:p-8 bg-beige-50 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-navy-100">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">✓</div>
            <p className="font-semibold text-navy-900 text-sm sm:text-base">Hygiene Assured</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
