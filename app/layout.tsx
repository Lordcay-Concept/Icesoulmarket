// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://icesoulmarket.com'),
  title: {
    default: 'IcesoulMarket - Premium Call of Duty Accounts & Items',
    template: '%s | IcesoulMarket',
  },
  description: 'Buy premium Call of Duty accounts, weapon skins, COD Points, and exclusive gaming items with secure payment and instant delivery.',
  keywords: 'call of duty accounts, cod points, cod skins, buy gaming accounts, cod marketplace, gaming store',
  authors: [{ name: 'IcesoulMarket' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://icesoulmarket.com',
    siteName: 'IcesoulMarket',
    title: 'IcesoulMarket - Premium Call of Duty Accounts & Items',
    description: 'Buy premium Call of Duty accounts, weapon skins, COD Points, and exclusive gaming items with secure payment and instant delivery.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'IcesoulMarket - Premium Gaming Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IcesoulMarket - Premium Call of Duty Accounts & Items',
    description: 'Buy premium Call of Duty accounts, weapon skins, COD Points, and exclusive gaming items.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}