# Mrs Bean - Fresh Tempeh D2C Website

**Website:** [mrsbean.in](https://mrsbean.in)

A beautiful, professional, high-converting D2C website for selling Tempeh in India. Built with Next.js 14, Tailwind CSS, and Framer Motion.

## Features

- 🎨 Beautiful, minimalist design with natural color palette (beige, brown, green)
- 🎬 Full-screen video hero section
- 💰 Razorpay integration for payments (UPI, COD)
- 📱 Fully responsive, mobile-first design
- ✨ Smooth animations with Framer Motion
- 🛒 Product showcase with quick buy options
- ⭐ Customer reviews and trust signals
- 📋 FAQ section
- 🔄 Sticky "Buy Now" CTA button
- 🚀 SEO optimized

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Configuration

### Razorpay Setup

1. Get your Razorpay keys from [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Create a `.env.local` file:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
NEXT_PUBLIC_RAZORPAY_KEY_SECRET=your_key_secret
```
3. Update `lib/razorpay.ts` with your keys
4. Create a backend API endpoint to generate Razorpay orders (recommended)

### Customization

- Update contact information in `components/Footer.tsx`
- Modify products in `components/Products.tsx`
- Change colors in `tailwind.config.js`
- Replace stock images with your own product photos

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Razorpay** - Payment gateway

## Deployment

Deploy easily on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Or use any other hosting platform that supports Next.js.

## License

MIT

