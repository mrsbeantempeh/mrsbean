'use client'

import { motion } from 'framer-motion'
import { Dumbbell, Heart, Leaf, ChefHat } from 'lucide-react'

const benefits = [
  {
    icon: Dumbbell,
    title: 'High Protein',
    description: 'Packed with complete plant protein — perfect for muscle building and recovery. More protein than tofu!',
    image: 'https://images.pexels.com/photos/34439456/pexels-photo-34439456.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
  {
    icon: Heart,
    title: 'Good for Gut Health',
    description: 'Naturally fermented with beneficial probiotics that support digestion and boost immunity.',
    image: 'https://images.pexels.com/photos/11280496/pexels-photo-11280496.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
  {
    icon: Leaf,
    title: 'Sustainable',
    description: 'Eco-friendly plant-based protein with a low carbon footprint. Better for you and the planet.',
    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&h=400&fit=crop',
  },
  {
    icon: ChefHat,
    title: 'Tastes Great',
    description: 'Nutty, savory, and versatile. Perfect in curries, stir-fries, sandwiches, and more. You\'ll love it!',
    image: 'https://images.pexels.com/photos/6822603/pexels-photo-6822603.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  },
]

export default function WhyTempeh() {
  return (
    <section id="why-tempeh" className="py-16 sm:py-20 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12 sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4 sm:mb-6">
            Why Tempeh?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-navy-700 max-w-2xl mx-auto leading-relaxed px-2">
            Discover why health enthusiasts and foodies across India are falling in love with tempeh
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.title}
                className="bg-beige-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group border border-navy-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img
                    src={benefit.image}
                    alt={benefit.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent" />
                  <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5">
                    <div className="bg-navy-700 p-3 sm:p-4 rounded-full shadow-lg">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-5 sm:p-6 md:p-7">
                  <h3 className="text-lg sm:text-xl font-bold text-navy-900 mb-2 sm:mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-sm sm:text-base text-navy-700 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
