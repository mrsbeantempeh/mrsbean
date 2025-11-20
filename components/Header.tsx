'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Menu, X, ShoppingBag, LogOut } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { user, profile, logout } = useAuth()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isUserMenuOpen && !target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  const menuItems = [
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
    { label: 'Products', href: '/products' },
    { label: 'Recipe', href: '#recipe' },
    { label: 'Blog', href: '#blog' },
  ]

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setIsUserMenuOpen(false)
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-2 sm:py-2.5 px-3 sm:px-4">
      <nav className="container mx-auto max-w-7xl">
        <div
          className={`w-full rounded-full transition-all duration-300 ${
            isScrolled
              ? 'bg-white/95 backdrop-blur-md shadow-lg border border-navy-100'
              : 'bg-white/90 backdrop-blur-sm border border-navy-100/50'
          }`}
        >
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 md:py-2.5">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              {/* Logo */}
              <motion.a
                href="/"
                className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative w-32 h-12 sm:w-40 sm:h-14 md:w-52 md:h-16 lg:w-56 lg:h-20 flex items-center">
                  <Image
                    src="/mrsbeannobg.png"
                    alt="Mrs Bean Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </motion.a>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-4 xl:gap-5 2xl:gap-6 flex-wrap">
                {menuItems.map((item, index) => {
                  const isExternal = item.href.startsWith('#')
                  
                  if (isExternal) {
                    return (
                      <motion.a
                        key={item.label}
                        href={item.href}
                        className={`font-semibold transition-colors relative group text-xs xl:text-sm whitespace-nowrap ${
                          isScrolled ? 'text-navy-700 hover:text-navy-600' : 'text-navy-800 hover:text-navy-600'
                        }`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {item.label}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-navy-600 group-hover:w-full transition-all duration-300" />
                      </motion.a>
                    )
                  }
                  
                  return (
                    <Link key={item.label} href={item.href}>
                      <motion.div
                        className={`font-semibold transition-colors relative group text-xs xl:text-sm cursor-pointer whitespace-nowrap ${
                          isScrolled ? 'text-navy-700 hover:text-navy-600' : 'text-navy-800 hover:text-navy-600'
                        }`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {item.label}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-navy-600 group-hover:w-full transition-all duration-300" />
                      </motion.div>
                    </Link>
                  )
                })}
                
                {user ? (
                  <div className="relative user-menu-container flex-shrink-0">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-navy-700 text-white rounded-full font-semibold text-xs sm:text-sm hover:bg-navy-800 transition-colors whitespace-nowrap"
                    >
                      <span className="hidden xl:inline">{profile?.name || user.email?.split('@')[0] || 'Account'}</span>
                      <span className="xl:hidden">Account</span>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-navy-100 py-2 z-50">
                        <Link
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-navy-700 hover:bg-navy-50 transition-colors text-sm font-semibold"
                        >
                          My Account
                        </Link>
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoggingOut ? (
                            <>
                              <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-red-600 mr-2"></span>
                              Logging out...
                            </>
                          ) : (
                            <>
                              <LogOut className="w-4 h-4 inline mr-2" />
                              Logout
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link href="/products" className="flex-shrink-0">
                      <motion.div
                        className="bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-600 hover:to-navy-800 text-white px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full font-bold text-xs shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-1.5 sm:gap-2 group cursor-pointer whitespace-nowrap ml-1 sm:ml-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">Buy Now</span>
                        <span className="sm:hidden">Buy</span>
                      </motion.div>
                    </Link>
                  </>
                )}
              </div>

              {/* Tablet Navigation - Show fewer items */}
              <div className="hidden md:flex lg:hidden items-center gap-3 flex-wrap flex-shrink-0">
                {menuItems.slice(0, 3).map((item) => {
                  const isExternal = item.href.startsWith('#')
                  if (isExternal) {
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        className="font-semibold text-navy-700 hover:text-navy-600 transition-colors text-xs whitespace-nowrap"
                      >
                        {item.label}
                      </a>
                    )
                  }
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="font-semibold text-navy-700 hover:text-navy-600 transition-colors text-xs whitespace-nowrap"
                    >
                      {item.label}
                    </Link>
                  )
                })}
                {user ? (
                  <Link
                    href="/account"
                    className="bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-600 hover:to-navy-800 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
                  >
                    Account
                  </Link>
                ) : (
                  <Link href="/products" className="flex-shrink-0">
                    <motion.div
                      className="bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-600 hover:to-navy-800 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ShoppingBag className="w-3 h-3" />
                      Buy
                    </motion.div>
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden lg:hidden p-1.5 sm:p-2 text-navy-900 hover:text-navy-600 transition-colors flex-shrink-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Outside the capsule */}
        <motion.div
          className={`md:hidden mt-2 sm:mt-3 overflow-hidden ${
            isMobileMenuOpen ? 'max-h-96' : 'max-h-0'
          } transition-all duration-300`}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-navy-100 p-4 sm:p-5 md:p-6 space-y-2.5 sm:space-y-3 md:space-y-4">
            {menuItems.map((item) => {
              const isExternal = item.href.startsWith('#')
              if (isExternal) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block font-semibold text-navy-700 hover:text-navy-600 transition-colors py-2 sm:py-2.5 md:py-3 border-b border-navy-100 last:border-0 text-sm sm:text-base"
                  >
                    {item.label}
                  </a>
                )
              }
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block font-semibold text-navy-700 hover:text-navy-600 transition-colors py-2 sm:py-2.5 md:py-3 border-b border-navy-100 last:border-0 text-sm sm:text-base"
                >
                  {item.label}
                </Link>
              )
            })}
            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block font-semibold text-navy-700 hover:text-navy-600 transition-colors py-2 sm:py-2.5 md:py-3 border-b border-navy-100 text-sm sm:text-base"
                >
                  My Account
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    handleLogout()
                  }}
                  disabled={isLoggingOut}
                  className="block w-full font-semibold text-red-600 hover:text-red-700 transition-colors py-2 sm:py-2.5 md:py-3 text-sm sm:text-base text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600 mr-2"></span>
                      Logging out...
                    </>
                  ) : (
                    'Logout'
                  )}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 font-semibold text-navy-700 hover:text-navy-600 transition-colors py-2 sm:py-2.5 md:py-3 border-b border-navy-100 text-sm sm:text-base"
                >
                  Sign In
                </Link>
                <Link
                  href="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-600 hover:to-navy-800 text-white px-5 sm:px-6 py-2.5 sm:py-3 md:py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-300 text-center mt-3 sm:mt-4 md:mt-6"
                >
                  <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Buy Now
                  </span>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </nav>
    </header>
  )
}
