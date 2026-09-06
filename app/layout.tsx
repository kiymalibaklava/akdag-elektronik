import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import dynamic from 'next/dynamic'
import { getSiteUrl } from '@/lib/site-url'

// Fonts optimized for performance and no layout shift
const barlow = Barlow({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-body',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
})

// Dynamic imports for non-critical global components to reduce initial bundle
const WhatsAppButton = dynamic(() => import('@/components/WhatsAppButton'), { ssr: false })
const KvkkBanner = dynamic(() => import('@/components/KvkkBanner'), { ssr: false })

export const metadata: Metadata = {
  title: {
    template: '%s | Akdağ Elektronik',
    default: 'Akdağ Elektronik | Ses, Işık & Görüntü Sistemleri – Kayseri',
  },
  description: 'Kayseri\'nin lider ses, ışık ve görüntü sistemleri firması. Profesyonel ses sistemleri, sahne ekipmanları ve akıllı okul çözümleri.',
  keywords: 'ses sistemi, fabrika ses sistemi, kafe ses sistemi, okul ses sistemi, cami ses sistemi, konferans salonu ses sistemi, profesyonel ses sistemleri, kayseri ses sistemleri, akdağ elektronik, akustek, sahne ses sistemleri',
  metadataBase: new URL(getSiteUrl()),
  alternates: {
    canonical: '/',
  },
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
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Akdağ Elektronik | Ses, Işık & Görüntü Sistemleri',
    description: 'Kayseri\'nin profesyonel ses ve görüntü sistemleri uzmanı.',
    url: getSiteUrl(),
    siteName: 'Akdağ Elektronik',
    locale: 'tr_TR',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Akdağ Elektronik',
    description: 'Profesyonel Ses ve Görüntü Çözümleri',
    images: ['/og-image.jpg'],
  },
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Akdağ Elektronik',
  description: 'Kayseri profesyonel ses, ışık ve görüntü sistemleri firması. Cami, okul ve sahneler için ekipman satışı ve kurulumu.',
  url: getSiteUrl(),
  telephone: '+90-352-231-69-15',
  email: 'info@akdagelektronik.com.tr',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Cumhuriyet Mah. Sur Cad. No:17/A',
    addressLocality: 'Melikgazi',
    addressRegion: 'Kayseri',
    postalCode: '38040',
    addressCountry: 'TR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '38.7176', // Temsili koordinatlar
    longitude: '35.4839'
  },
  openingHours: 'Mo,Tu,We,Th,Fr,Sa 09:00-19:00',
  priceRange: '$$'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" data-theme="light" className={`${barlow.variable} ${barlowCondensed.variable}`} suppressHydrationWarning>
      <body className="bg-[#0F0F0F] text-white antialiased font-body">
        {/* Flash önleyici tema script'i — React öncesi çalışır */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('akdag-theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
        <KvkkBanner />
      </body>
    </html>
  )
}
