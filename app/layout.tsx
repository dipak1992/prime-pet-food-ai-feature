import type { Metadata, Viewport } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { LazyToaster } from '@/components/providers/LazyToaster'
import { getSiteUrl } from '@/lib/seo'
import { organizationSchema } from '@/lib/schema'
import { productStory } from '@/lib/marketing/stats'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const fraunces = Fraunces({
  variable: '--font-serif',
  subsets: ['latin'],
  display: 'swap',
  axes: ['opsz'],
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'MealEase – Family-First AI Meal Prep Planner',
    template: '%s | MealEase',
  },
  description:
    productStory,
  keywords: ['meal prep app', 'meal planning app', 'AI meal prep planner', 'weekly meal prep with grocery list', 'meal prep for parents'],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/icons/favicon-96.png', type: 'image/png', sizes: '96x96' },
      { url: '/icons/favicon-48.png', type: 'image/png', sizes: '48x48' },
      { url: '/icons/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon-180.png', type: 'image/png', sizes: '180x180' },
    ],
    shortcut: '/icons/favicon-96.png',
  },
  openGraph: {
    title: 'MealEase – Family-First AI Meal Prep Planner',
    description: productStory,
    type: 'website',
    url: '/',
    siteName: 'MealEase',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'MealEase – Family-First AI Meal Prep Planner' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MealEase – Family-First AI Meal Prep Planner',
    description: productStory,
    images: ['/twitter-image'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#064E3B',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} antialiased`}
    >
      <body className="flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <Script id="pwa-service-worker" strategy="lazyOnload">
          {`if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(error){console.warn('[pwa] service worker registration failed',error)})}`}
        </Script>
        {children}
        <LazyToaster />
      </body>
    </html>
  )
}
