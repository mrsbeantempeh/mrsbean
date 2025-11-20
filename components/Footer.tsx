'use client'

import { Instagram, MessageCircle, Mail, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white py-12 sm:py-14 md:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-12">
          <div>
            <div className="relative w-40 h-16 sm:w-48 sm:h-20 md:w-52 md:h-22 mb-4 sm:mb-6">
              <Image
                src="/mrsbeannobg.png"
                alt="Mrs Bean Logo"
                fill
                className="object-contain object-left"
                priority={false}
              />
            </div>
            <p className="text-white/80 leading-relaxed text-sm sm:text-base">
              Fresh, handcrafted tempeh made with love in Pune. 
              Your source for premium plant protein.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 sm:mb-6 text-base sm:text-lg">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><a href="#why-tempeh" className="text-white/80 hover:text-white transition-colors text-sm sm:text-base">Why Tempeh?</a></li>
              <li><Link href="/products" className="text-white/80 hover:text-white transition-colors text-sm sm:text-base">Product</Link></li>
              <li><a href="#faq" className="text-white/80 hover:text-white transition-colors text-sm sm:text-base">FAQ</a></li>
              <li><Link href="/contact" className="text-white/80 hover:text-white transition-colors text-sm sm:text-base">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 sm:mb-6 text-base sm:text-lg">Legal</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><Link href="/cancellation-refunds" className="text-white/80 hover:text-white transition-colors text-sm sm:text-base">Cancellation & Refunds</Link></li>
              <li><Link href="/terms" className="text-white/80 hover:text-white transition-colors text-sm sm:text-base">Terms and Conditions</Link></li>
              <li><Link href="/shipping" className="text-white/80 hover:text-white transition-colors text-sm sm:text-base">Shipping</Link></li>
              <li><Link href="/privacy" className="text-white/80 hover:text-white transition-colors text-sm sm:text-base">Privacy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 sm:mb-6 text-base sm:text-lg">Contact</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-center gap-2 sm:gap-3 text-white/80">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <a href="mailto:mrsbeantempeh@gmail.com" className="hover:text-white transition-colors text-sm sm:text-base">mrsbeantempeh@gmail.com</a>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-white/80">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <a href="tel:+917558534933" className="hover:text-white transition-colors text-sm sm:text-base">+91 75585 34933</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 sm:mb-6 text-base sm:text-lg">Follow Us</h4>
            <div className="flex gap-3 sm:gap-4">
              <a
                href="https://instagram.com/mrsbean"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-navy-800 hover:bg-navy-700 p-3 sm:p-4 rounded-full transition-colors shadow-md hover:shadow-lg"
                aria-label="Instagram @mrsbean"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/917558534933?text=Hi! I'm interested in buying fresh tempeh from Mrs Bean."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-navy-800 hover:bg-navy-700 p-3 sm:p-4 rounded-full transition-colors shadow-md hover:shadow-lg"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-navy-800 pt-6 sm:pt-8 text-center text-white/60 text-xs sm:text-sm">
          <p>&copy; {new Date().getFullYear()} Mrs Bean. All rights reserved. Made with ❤️ in Pune</p>
        </div>
      </div>
    </footer>
  )
}
