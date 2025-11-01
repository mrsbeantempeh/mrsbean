import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import WhatsAppButton from '@/components/WhatsAppButton'

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
  other: {
    'facebook-domain-verification': '4ienf5inpeqngh99o24of2tdsvuqm9',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-IN">
      <head>
        {/* Facebook Domain Verification */}
        <meta name="facebook-domain-verification" content="4ienf5inpeqngh99o24of2tdsvuqm9" />
        {/* Google Tag Manager - inline script in head as required */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K53J97H4');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K53J97H4"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        <AuthProvider>
          <GoogleAnalytics />
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  )
}
