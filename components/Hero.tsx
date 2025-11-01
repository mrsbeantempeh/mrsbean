'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Leaf, Heart, Truck } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative py-8 sm:py-10 md:py-12 lg:py-14 bg-white pt-16 sm:pt-20 md:pt-24 lg:pt-28 min-h-[calc(100vh-80px)] flex items-center">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
          {/* Left Part - Text Content */}
          <motion.div
            className="order-2 lg:order-1"
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Premium Badge */}
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-4 sm:mb-5"
            >
              <div className="inline-flex items-center gap-2 bg-navy-50 border border-navy-200 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-navy-700 flex-shrink-0" />
                <span className="text-xs font-semibold tracking-wide text-navy-800">Premium Quality • Made in Pune</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 text-navy-900 leading-tight"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
            >
              <span className="block mb-1">Fresh Tempeh,</span>
              <span className="block bg-gradient-to-r from-navy-700 via-navy-600 to-navy-800 bg-clip-text text-transparent">
                Crafted for Your
              </span>
              <span className="block mt-1">Gut & Gains</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-sm sm:text-base md:text-lg text-navy-700 mb-4 sm:mb-5 md:mb-6 leading-relaxed max-w-xl"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Delicious, protein-packed, fermented perfection — made fresh and delivered fresh to your doorstep.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-5 sm:mb-6 md:mb-7"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <motion.a
                href="/products"
                className="group relative bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-600 hover:to-navy-800 text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 rounded-full font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Buy Now
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.a>
              
              <motion.a
                href="#why-tempeh"
                className="group bg-white border-2 border-navy-700 hover:bg-navy-50 text-navy-700 hover:text-navy-900 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 rounded-full font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.a>
            </motion.div>

            {/* Trust Badges - Compact Design */}
            <motion.div
              className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-5 sm:mb-6"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              {[
                { icon: Truck, text: '24h', subtext: 'Delivery' },
                { icon: Heart, text: 'Pune', subtext: 'Made' },
                { icon: Leaf, text: 'Free', subtext: 'Shipping' },
              ].map((badge, index) => {
                const Icon = badge.icon
                return (
                  <motion.div
                    key={index}
                    className="bg-beige-50 border border-navy-100 rounded-lg p-2.5 sm:p-3 hover:bg-beige-100 transition-all duration-300 group text-center"
                    whileHover={{ scale: 1.05, y: -2 }}
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="p-1.5 bg-navy-700 rounded-lg group-hover:bg-navy-600 transition-colors">
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-navy-900 text-xs sm:text-sm mb-0.5">{badge.text}</p>
                        <p className="text-xs text-navy-600">{badge.subtext}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Stats - Clean Design */}
            <motion.div
              className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 pt-3 sm:pt-4 border-t border-navy-200"
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
            >
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-700 mb-0.5">19g</div>
                <div className="text-xs text-navy-600">Protein/100g</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-700 mb-0.5">200+</div>
                <div className="text-xs text-navy-600">Customers</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-700 mb-0.5">4.9★</div>
                <div className="text-xs text-navy-600">Rating</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Part - Tempeh Image */}
          <motion.div
            className="relative h-[280px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl order-1 lg:order-2"
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <img
              src="https://images.pexels.com/photos/6822603/pexels-photo-6822603.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&fit=crop"
              alt="Fresh tempeh - pure and natural"
              className="w-full h-full object-cover"
            />
            
            {/* Fresh Badge */}
            <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
              <span className="bg-white/95 backdrop-blur-sm text-navy-900 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold shadow-lg border border-navy-200">
                Fresh
              </span>
            </div>
            
            {/* Made in Pune Badge */}
            <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5">
              <span className="bg-navy-900/90 backdrop-blur-sm text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold shadow-lg">
                Made in Pune
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
