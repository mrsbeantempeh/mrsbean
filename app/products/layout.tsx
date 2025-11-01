import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Classic Tempeh - Mrs Bean | Fresh Tempeh Online India',
  description: 'Pure, unflavored tempeh perfect for any recipe. Neutral taste, maximum versatility. Freshly crafted with traditional fermentation methods. ₹125 per 200g.',
  openGraph: {
    title: 'Classic Tempeh - Mrs Bean | Fresh Tempeh Online India',
    description: 'Pure, unflavored tempeh perfect for any recipe. Neutral taste, maximum versatility. Freshly crafted with traditional fermentation methods.',
    type: 'website',
    url: 'https://mrsbean.in/products',
    siteName: 'Mrs Bean',
    images: [
      {
        url: 'https://images.pexels.com/photos/6822603/pexels-photo-6822603.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
        width: 800,
        height: 800,
        alt: 'Classic Tempeh by Mrs Bean',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Classic Tempeh - Mrs Bean',
    description: 'Pure, unflavored tempeh perfect for any recipe. Freshly crafted with traditional fermentation methods.',
    images: ['https://images.pexels.com/photos/6822603/pexels-photo-6822603.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop'],
  },
  other: {
    'product:brand': 'Mrs Bean',
    'product:availability': 'in stock',
    'product:condition': 'new',
    'product:price:amount': '125',
    'product:price:currency': 'INR',
    'product:retailer_item_id': 'mrsbean_classic_tempeh_001',
    'product:item_group_id': 'mrsbean_tempeh',
  },
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

