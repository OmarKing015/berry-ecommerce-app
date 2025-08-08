import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import {Analytics} from "@vercel/analytics/next"
import {SpeedInsights} from "@vercel/speed-insights/next"

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'Mazagk - Wear Your Mood | Premium Custom Apparel',
    template: '%s | Mazagk'
  },
  description: 'Discover premium custom apparel at Mazagk. Wear your mood with our unique collection of customizable clothing. Fast shipping, secure checkout.',
  keywords: [
    'custom apparel',
    'personalized clothing',
    'premium fashion',
    'custom t-shirts',
    'design your own clothes',
    'mood clothing',
    'customizable fashion'
  ],
  authors: [{ name: 'Mazagk' }],
  creator: 'Mazagk',
  publisher: 'Mazagk',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mazagk.vercel.app',
    siteName: 'Mazagk',
    title: 'Mazagk - Wear Your Mood | Premium Custom Apparel',
    description: 'Discover premium custom apparel at Mazagk. Wear your mood with our unique collection of customizable clothing.',
    images: [
      {
        url: 'https://mazagk.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mazagk - Wear Your Mood',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mazagk - Wear Your Mood',
    description: 'Discover premium custom apparel at Mazagk. Wear your mood with our unique collection of customizable clothing.',
    images: ['https://mazagk.com/twitter-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://mazagk.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Analytics/>
      <SpeedInsights/>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        {children}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Mazagk",
              "url": "https://mazagk.com",
              "description": "Premium custom apparel - Wear your mood",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://mazagk.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </body>
    </html>
  )
}
