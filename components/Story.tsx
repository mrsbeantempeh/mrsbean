'use client'

import { motion } from 'framer-motion'
import { Heart, Leaf, Award } from 'lucide-react'

export default function Story() {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-beige-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative h-64 sm:h-80 md:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl group">
              <img
                src="https://images.pexels.com/photos/6822603/pexels-photo-6822603.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop"
                alt="Fresh tempeh made with traditional methods"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-6 sm:mb-8">
              Made with Love in Pune
            </h2>
            <p className="text-base sm:text-lg text-navy-700 mb-6 sm:mb-8 leading-relaxed">
              Our tempeh journey started with a simple belief: everyone deserves access to high-quality, 
              protein-rich food that's both delicious and sustainable. We craft each batch using traditional 
              Indonesian fermentation methods, ensuring you get authentic, gut-friendly tempeh.
            </p>
            <p className="text-base sm:text-lg text-navy-700 mb-8 sm:mb-10 leading-relaxed">
              Made with non-GMO soybeans sourced from trusted farmers, our tempeh is naturally 
              fermented, never mass-produced. Every pack is a promise of freshness, quality, and care—crafted right here in Pune.
            </p>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-5">
              <div className="text-center p-4 sm:p-5 md:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-navy-100">
                <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-navy-700 mx-auto mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm font-semibold text-navy-900">Made with Love</p>
              </div>
              <div className="text-center p-4 sm:p-5 md:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-navy-100">
                <Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-navy-700 mx-auto mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm font-semibold text-navy-900">100% Natural</p>
              </div>
              <div className="text-center p-4 sm:p-5 md:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-navy-100">
                <Award className="w-7 h-7 sm:w-8 sm:h-8 text-navy-700 mx-auto mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm font-semibold text-navy-900">Premium Quality</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
