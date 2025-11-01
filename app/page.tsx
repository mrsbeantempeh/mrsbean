'use client'

import Hero from '@/components/Hero'
import WhyTempeh from '@/components/WhyTempeh'
import Products from '@/components/Products'
import Story from '@/components/Story'
import Reviews from '@/components/Reviews'
import FAQ from '@/components/FAQ'
import StickyCTA from '@/components/StickyCTA'
import { useEffect, useState } from 'react'

export default function Home() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <Hero />
      <WhyTempeh />
      <Products />
      <Story />
      <Reviews />
      <FAQ />
      <StickyCTA />
    </>
  )
}

