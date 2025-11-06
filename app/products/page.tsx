'use client'

import { motion } from 'framer-motion'
import { IndianRupee, Leaf, Heart, Dumbbell, ChefHat, Shield, Award, Truck, Star, CheckCircle, Plus, Minus } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { openRazorpayCheckout } from '@/lib/razorpay'

const product = {
  id: 1,
  name: 'Classic Tempeh',
  price: 125,
  weight: '200g',
  description: 'Pure, unflavored tempeh perfect for any recipe. Neutral taste, maximum versatility. Freshly crafted with traditional fermentation methods.',
  image: 'https://images.pexels.com/photos/6822603/pexels-photo-6822603.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
  features: ['Non-GMO Soybeans', 'High Protein (19g per 100g)', 'Fresh Fermented', 'Made in Pune', 'Naturally Gut-Friendly'],
}

const benefits = [
  {
    icon: Dumbbell,
    title: 'High Protein',
    description: 'Packed with complete plant protein — perfect for muscle building and recovery. More protein than tofu!',
    stat: '19g per 100g',
  },
  {
    icon: Heart,
    title: 'Gut Health',
    description: 'Naturally fermented with beneficial probiotics that support digestion and boost immunity.',
    stat: 'Live Cultures',
  },
  {
    icon: Leaf,
    title: 'Sustainable',
    description: 'Eco-friendly plant-based protein with a low carbon footprint. Better for you and the planet.',
    stat: '100% Plant-Based',
  },
  {
    icon: ChefHat,
    title: 'Versatile',
    description: 'Nutty, savory, and incredibly versatile. Perfect in curries, stir-fries, sandwiches, and more.',
    stat: 'Endless Recipes',
  },
]

const trustElements = [
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'Every batch is tested for quality and freshness before delivery.',
  },
  {
    icon: Award,
    title: 'Premium Ingredients',
    description: 'Made with non-GMO soybeans sourced from trusted farmers.',
  },
  {
    icon: Truck,
    title: '24-Hour Delivery',
    description: 'Fresh delivery within 24 hours in Pune. Temperature-controlled packaging.',
  },
  {
    icon: CheckCircle,
    title: '100% Natural',
    description: 'No preservatives, no artificial additives. Just pure, fermented goodness.',
  },
]

export default function ProductsPage() {
  const router = useRouter()
  const { user, profile, addOrder, addTransaction, addGuestOrder, addGuestTransaction } = useAuth()
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const totalPrice = product.price * quantity

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 20) {
      setQuantity(newQuantity)
    }
  }

  const handleBuyNow = async () => {
    setLoading(true)

    try {
      // Step 1: Create Razorpay order with Magic Checkout parameters
      const createOrderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalPrice,
          currency: 'INR',
          receipt: `receipt_${Date.now()}_qty_${quantity}`,
          product: {
            // Mandatory fields for Magic Checkout
            sku: `SKU-${product.name.replace(/\s+/g, '-').toUpperCase()}`, // Unique product ID
            variant_id: `VARIANT-${Date.now()}`, // Unique variant ID
            price: product.price, // Original price in rupees (will be converted to paise)
            offerPrice: product.price, // Final price after discount in rupees
            taxAmount: 0, // Tax amount in rupees (will be converted to paise)
            quantity: quantity, // Number of units
            name: product.name, // Product name
            description: `${product.name} - ${product.weight || 'Premium Coffee'}`, // Product description
            
            // Optional fields
            weight: product.weight || 200, // Weight in grams
            dimensions: {
              length: 10, // Length in centimeters (will be converted to string)
              width: 10, // Width in centimeters (will be converted to string)
              height: 5, // Height in centimeters (will be converted to string)
            },
            image: product.image, // Product image
            image_url: product.image, // Product image URL
            product_url: typeof window !== 'undefined' ? `${window.location.origin}/products` : '', // Product page URL
          },
        }),
      })

      if (!createOrderResponse.ok) {
        // Get the actual error message from the API
        const errorData = await createOrderResponse.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.details || 'Failed to create payment order'
        console.error('Order creation failed:', {
          status: createOrderResponse.status,
          statusText: createOrderResponse.statusText,
          error: errorData,
        })
        throw new Error(errorMessage)
      }

      const razorpayOrder = await createOrderResponse.json()

      // Step 2: Create or get Razorpay customer for Magic Checkout (if user is logged in)
      let customerId: string | undefined
      
      if (user && profile) {
        try {
          const customerResponse = await fetch('/api/razorpay/create-customer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: profile.name || '',
              email: user.email || '',
              contact: profile.phone || '',
            }),
          })

          if (customerResponse.ok) {
            const customer = await customerResponse.json()
            customerId = customer.id
          }
        } catch (error) {
          console.error('Failed to create Razorpay customer:', error)
        }
      }

      // Step 3: Create order record in database (pending status)
      const orderId = `ORDER-${Date.now()}`

      if (user) {
        await addOrder({
          order_id: orderId,
          product_name: product.name,
          quantity,
          price: product.price,
          total: totalPrice,
          status: 'pending',
          payment_method: 'Razorpay',
          address: 'Address will be updated after payment',
        })
      } else {
        await addGuestOrder({
          order_id: orderId,
          product_name: product.name,
          quantity,
          price: product.price,
          total: totalPrice,
          status: 'pending',
          payment_method: 'Razorpay',
          address: 'Address will be updated after payment',
          guest_name: undefined,
          guest_email: undefined,
          guest_phone: undefined,
          user_id: null,
        })
      }

      // Step 4: Open Razorpay Magic Checkout directly
      await openRazorpayCheckout({
        amount: razorpayOrder.amount,
        productName: `${quantity}x ${product.name} (₹${totalPrice})`,
        orderId: razorpayOrder.id,
        customerName: user && profile ? (profile.name || '') : undefined,
        customerEmail: user ? (user.email || undefined) : undefined,
        customerContact: user && profile ? (profile.phone || '') : undefined,
        customerId: customerId,
        onSuccess: async (paymentId, razorpayOrderId, signature) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: razorpayOrderId,
                razorpay_payment_id: paymentId,
                razorpay_signature: signature || '',
                expected_amount: totalPrice,
              }),
            })

            if (!verifyResponse.ok) {
              throw new Error(`Verification failed: ${verifyResponse.status}`)
            }

            const verifyResult = await verifyResponse.json()
            const paymentStatus: 'success' | 'pending' = verifyResult.verified === true ? 'success' : 'pending'

            // Fetch order details from Razorpay to get customer address
            let customerName = user && profile ? profile.name : 'Customer'
            let customerEmail = user ? user.email : undefined
            let customerPhone = user && profile ? profile.phone : undefined
            let deliveryAddress = 'Address from Razorpay Magic Checkout'

            try {
              const orderDetailsResponse = await fetch(`/api/razorpay/get-order?order_id=${razorpayOrderId}`)
              if (orderDetailsResponse.ok) {
                const orderDetails = await orderDetailsResponse.json()
                if (orderDetails.notes?.name) customerName = orderDetails.notes.name
                if (orderDetails.notes?.email) customerEmail = orderDetails.notes.email
                if (orderDetails.notes?.contact) customerPhone = orderDetails.notes.contact
                if (orderDetails.notes?.address) deliveryAddress = orderDetails.notes.address
              }
            } catch (error) {
              console.error('Failed to fetch order details:', error)
            }

            // Create transaction record
            const transactionId = `TXN-${paymentId}`
            
            if (user) {
              await addTransaction({
                transaction_id: transactionId,
                order_id: orderId,
                amount: totalPrice,
                status: paymentStatus,
                payment_method: 'Razorpay',
              })
            } else {
              await addGuestTransaction({
                transaction_id: transactionId,
                order_id: orderId,
                amount: totalPrice,
                status: paymentStatus,
                payment_method: 'Razorpay',
                guest_email: customerEmail,
                guest_phone: customerPhone,
                user_id: null,
              })
            }

            // Store order info for thank-you page
            const orderInfo = {
              orderId,
              paymentId,
              customerName,
              customerPhone: customerPhone || '',
              customerEmail: customerEmail || null,
              deliveryAddress,
              productName: product.name,
              productWeight: product.weight,
              productPrice: product.price,
              quantity,
              totalAmount: totalPrice,
              paymentMethod: 'Razorpay',
              orderDate: new Date().toISOString(),
              estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            }
            
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('orderInfo', JSON.stringify(orderInfo))
            }

            // Redirect to thank-you page
            router.push(`/thank-you?order=${orderId}&payment=${paymentId}&amount=${totalPrice}&quantity=${quantity}`)
          } catch (error) {
            console.error('Payment verification error:', error)
            
            // Create transaction record even if verification fails
            const transactionId = `TXN-${paymentId || Date.now()}`
            
            try {
              if (user) {
                await addTransaction({
                  transaction_id: transactionId,
                  order_id: orderId,
                  amount: totalPrice,
                  status: 'pending',
                  payment_method: 'Razorpay',
                })
              } else {
                await addGuestTransaction({
                  transaction_id: transactionId,
                  order_id: orderId,
                  amount: totalPrice,
                  status: 'pending',
                  payment_method: 'Razorpay',
                  guest_email: undefined,
                  guest_phone: undefined,
                  user_id: null,
                })
              }
            } catch (txnError) {
              console.error('Failed to create transaction record:', txnError)
            }
            
            router.push(`/thank-you?order=${orderId}&payment=${paymentId}&amount=${totalPrice}&quantity=${quantity}&verify=error`)
          }
        },
        onError: (error) => {
          console.error('Payment error:', error)
          alert(error.message || 'Payment failed. Please try again.')
          setLoading(false)
        },
      })
    } catch (error: any) {
      console.error('Error processing order:', error)
      alert(error.message || 'Failed to process order. Please try again.')
      setLoading(false)
    }
  }

  // Generate JSON-LD microdata for Facebook/Meta catalog
  const productMicrodata = {
    "@context": "https://schema.org",
    "@type": "Product",
    "productID": `mrsbean_classic_tempeh_001`,
    "name": product.name,
    "description": product.description,
    "url": "https://mrsbean.in/products",
    "image": product.image,
    "brand": {
      "@type": "Brand",
      "name": "Mrs Bean"
    },
    "offers": [
      {
        "@type": "Offer",
        "price": product.price.toString(),
        "priceCurrency": "INR",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year from now
      }
    ],
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "propertyID": "item_group_id",
        "value": "mrsbean_tempeh"
      },
      {
        "@type": "PropertyValue",
        "propertyID": "weight",
        "value": product.weight
      }
    ]
  }

  return (
    <div className="min-h-screen bg-beige-50 pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12">
      {/* JSON-LD Microdata for Facebook/Meta Catalog */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productMicrodata),
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-10 sm:mb-12 md:mb-16 pt-4 sm:pt-6 md:pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-navy-900 mb-3 sm:mb-4 md:mb-5">
            Our Premium Tempeh
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-navy-700 max-w-2xl mx-auto">
            Fresh, handcrafted tempeh delivered to your doorstep in 24 hours
          </p>
        </motion.div>

        {/* Product Section */}
        <div className="mb-12 sm:mb-16 md:mb-20 lg:mb-24">
          <div className="flex justify-center">
            <motion.div
              className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 group w-full max-w-5xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col md:grid md:grid-cols-2 gap-0">
                {/* Image Section */}
                <div className="relative h-80 sm:h-96 md:h-full md:min-h-[500px] overflow-hidden order-2 md:order-1">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-navy-900/20 to-transparent md:from-transparent md:to-navy-900/20" />
                  <div className="absolute top-6 right-6">
                    <span className="bg-navy-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      Fresh
                    </span>
                  </div>
                  <div className="absolute top-6 left-6">
                    <span className="bg-navy-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold">
                      Made in Pune
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 sm:p-10 md:p-12 flex flex-col justify-between order-1 md:order-2">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
                      {product.name}
                    </h2>
                    <p className="text-lg sm:text-xl text-navy-700 mb-6 leading-relaxed">
                      {product.description}
                    </p>
                    
                    <ul className="space-y-3 sm:space-y-4 mb-8">
                      {product.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-navy-800">
                          <span className="text-navy-700 text-xl font-bold flex-shrink-0">✓</span>
                          <span className="font-medium text-base sm:text-lg">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="border-t border-navy-200 pt-6 mb-6">
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2 mb-2">
                          <IndianRupee className="w-6 h-6 sm:w-7 sm:h-7 text-navy-900" />
                          <span className="text-4xl sm:text-5xl font-bold text-navy-900">{product.price}</span>
                        </div>
                        <span className="text-navy-700 font-medium text-sm sm:text-base block mb-4">per {product.weight}</span>
                      </div>

                      {/* Quantity Selector */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-navy-900 mb-2">Quantity</label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-navy-300 text-navy-700 hover:bg-navy-50 hover:border-navy-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-navy-300"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1
                              handleQuantityChange(Math.min(Math.max(1, value), 20))
                            }}
                            className="w-16 sm:w-20 text-center text-lg sm:text-xl font-bold text-navy-900 border-2 border-navy-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-navy-700 focus:border-navy-700"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={quantity >= 20}
                            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-navy-300 text-navy-700 hover:bg-navy-50 hover:border-navy-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-navy-300"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Total Price */}
                      <div className="bg-navy-50 border border-navy-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm sm:text-base font-semibold text-navy-800">Subtotal:</span>
                          <div className="flex items-baseline gap-1">
                            <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-navy-900" />
                            <span className="text-2xl sm:text-3xl font-bold text-navy-900">{totalPrice}</span>
                          </div>
                        </div>
                        {quantity > 1 && (
                          <p className="text-xs sm:text-sm text-navy-600">
                            {quantity} × ₹{product.price} = ₹{totalPrice}
                          </p>
                        )}
                      </div>

                      <div className="bg-navy-50 border border-navy-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-navy-800 mb-1">🚚 24-Hour Delivery</p>
                        <p className="text-xs text-navy-600">Currently delivering only in Pune</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleBuyNow}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-600 hover:to-navy-800 text-white px-8 py-5 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                      {loading ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Processing...
                        </>
                      ) : (
                        <>
                          Buy Now
                          <span className="text-xl">→</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Benefits Section */}
        <motion.section
          className="mb-12 sm:mb-16 md:mb-20 lg:mb-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 text-center mb-12 sm:mb-16">
            Why Choose Our Tempeh?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-navy-100"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <div className="bg-navy-700 p-4 rounded-xl w-fit mb-4">
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-navy-900 mb-2 sm:mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-navy-700 mb-4 leading-relaxed text-sm sm:text-base">
                    {benefit.description}
                  </p>
                  <div className="bg-beige-50 rounded-lg px-4 py-2 inline-block">
                    <span className="text-navy-900 font-semibold text-sm">{benefit.stat}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* Trust Building Section */}
        <motion.section
          className="mb-12 sm:mb-16 md:mb-20 lg:mb-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 text-center mb-8 sm:mb-12 md:mb-16">
            Why Trust Mrs Bean?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
            {trustElements.map((element, index) => {
              const Icon = element.icon
              return (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-navy-100 text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <div className="bg-navy-700 p-4 rounded-full w-fit mx-auto mb-4">
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-navy-900 mb-3">
                    {element.title}
                  </h3>
                  <p className="text-navy-700 leading-relaxed text-sm sm:text-base">
                    {element.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* Customer Reviews / Testimonials */}
        <motion.section
          className="mb-12 sm:mb-16 md:mb-20 lg:mb-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 text-center mb-8 sm:mb-12 md:mb-16">
            Loved by Our Customers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            {[
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
                name: 'Vikram Singh',
                location: 'Pune',
                rating: 5,
                text: 'Fresh delivery, amazing quality! This tempeh is fire! Perfect for my plant-based journey. Highly recommend!',
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
              },
            ].map((review, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-navy-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-navy-200 flex-shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-navy-900 text-base">{review.name}</p>
                    <p className="text-sm text-navy-600">{review.location}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-navy-700 text-navy-700" />
                  ))}
                </div>
                <p className="text-base text-navy-700 leading-relaxed">
                  "{review.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Stats & Guarantees */}
        <motion.section
          className="bg-white rounded-2xl p-8 sm:p-10 md:p-12 shadow-xl border border-navy-100"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 text-center mb-8 sm:mb-12">
            Our Promise to You
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-700 mb-2">200+</div>
              <p className="text-sm sm:text-base text-navy-600 font-medium">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-700 mb-2">4.9★</div>
              <p className="text-sm sm:text-base text-navy-600 font-medium">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-700 mb-2">24h</div>
              <p className="text-sm sm:text-base text-navy-600 font-medium">Delivery Time</p>
            </div>
          </div>
          
          <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 md:pt-10 border-t border-navy-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8 max-w-3xl mx-auto">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">Freshness Guarantee</h3>
                  <p className="text-navy-700 text-sm">Every pack is made fresh and delivered within 24 hours to ensure maximum freshness.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">Quality Assured</h3>
                  <p className="text-navy-700 text-sm">We use only the finest non-GMO soybeans and traditional fermentation methods.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">Made with Care</h3>
                  <p className="text-navy-700 text-sm">Crafted locally in Pune with love and attention to detail in every batch.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">Customer Support</h3>
                  <p className="text-navy-700 text-sm">We're here to help! Contact us anytime via WhatsApp or email.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Magic Checkout - Opens directly when Buy Now is clicked */}
    </div>
  )
}

