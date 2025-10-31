import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#102a43',
}

export const metadata: Metadata = {
  title: 'Mrs Bean | Fresh Tempeh Delivered | Buy Tempeh Online India',
  description: 'Delicious, protein-packed, fermented tempeh made fresh in India. High protein, gut-friendly, sustainable. Order fresh tempeh online with COD & UPI.',
  keywords: 'buy tempeh online india, fresh tempeh, plant protein, vegan protein, gut health, fermented food, protein rich food',
  openGraph: {
    title: 'Mrs Bean | Fresh Tempeh Delivered',
    description: 'Delicious, protein-packed, fermented tempeh made fresh in India.',
    type: 'website',
    url: 'https://mrsbean.in',
    siteName: 'Mrs Bean',
  },
  alternates: {
    canonical: 'https://mrsbean.in',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-IN">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
