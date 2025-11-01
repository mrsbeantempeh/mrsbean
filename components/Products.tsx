'use client'

import { motion } from 'framer-motion'
import { IndianRupee } from 'lucide-react'
import { useRouter } from 'next/navigation'

const product = {
  id: 1,
  name: 'Classic Tempeh',
  price: 125,
  weight: '200g',
  description: 'Pure, unflavored tempeh perfect for any recipe. Neutral taste, maximum versatility. Freshly crafted with traditional fermentation methods.',
  image: 'https://images.pexels.com/photos/6822603/pexels-photo-6822603.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
  features: ['Non-GMO Soybeans', 'High Protein (19g per 100g)', 'Fresh Fermented', 'Made in Pune', 'Naturally Gut-Friendly'],
}

export default function Products() {
  const router = useRouter()

  const handleBuyNow = () => {
    // Redirect to products page for checkout (works for both logged-in and guest users)
    router.push('/products')
  }

  return (
    <section id="products" className="py-16 sm:py-20 md:py-24 bg-beige-50">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12 sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4 sm:mb-6">
            Our Product
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-navy-700 max-w-2xl mx-auto leading-relaxed px-2">
            Fresh, handcrafted tempeh delivered to your doorstep in 24 hours (Pune only)
          </p>
        </motion.div>

        <div className="flex justify-center">
          <motion.div
            className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 group w-full max-w-5xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:grid md:grid-cols-2 gap-0">
              {/* Image Section */}
              <div className="relative h-64 sm:h-80 md:h-full md:min-h-[500px] overflow-hidden order-2 md:order-1">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-navy-900/20 to-transparent md:from-transparent md:to-navy-900/20" />
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                  <span className="bg-navy-700 text-white px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                    Fresh
                  </span>
                </div>
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                  <span className="bg-navy-900/80 backdrop-blur-sm text-white px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full text-xs sm:text-sm font-bold">
                    Made in Pune
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-between order-1 md:order-2">
                <div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy-900 mb-3 sm:mb-4">
                    {product.name}
                  </h3>
                  <p className="text-navy-700 mb-5 sm:mb-6 text-base sm:text-lg leading-relaxed">
                    {product.description}
                  </p>
                  
                  <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 sm:gap-3 text-navy-800">
                        <span className="text-navy-700 text-lg sm:text-xl font-bold flex-shrink-0">✓</span>
                        <span className="font-medium text-sm sm:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="border-t border-navy-200 pt-5 sm:pt-6 mb-5 sm:mb-6">
                    <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-navy-900" />
                      <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900">{product.price}</span>
                    </div>
                    <span className="text-navy-700 font-medium text-sm sm:text-base mb-3 sm:mb-4 block">per {product.weight}</span>
                    <div className="bg-navy-50 border border-navy-200 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm font-semibold text-navy-800 mb-1">🚚 24-Hour Delivery</p>
                      <p className="text-xs text-navy-600">Currently delivering only in Pune</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-600 hover:to-navy-800 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    Buy Now
                    <span className="text-lg sm:text-xl">→</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
