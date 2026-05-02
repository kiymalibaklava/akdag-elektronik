import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import KvkkBanner from '@/components/KvkkBanner'

export const metadata: Metadata = {
  title: 'Akdağ Elektronik | Ses, Işık & Görüntü Sistemleri – Kayseri',
  description: 'Kayseri\'nin lider ses, ışık ve görüntü sistemleri firması. Profesyonel ses sistemleri, sahne ekipmanları ve akıllı okul çözümleri. AKUSTEK ana bayisi.',
  keywords: 'ses sistemi, ışık sistemi, görüntü sistemi, kayseri, akdağ elektronik, akustek, okul saati, simultune',
  openGraph: {
    title: 'Akdağ Elektronik | Ses, Işık & Görüntü Sistemleri',
    description: 'Kayseri\'nin profesyonel ses ve görüntü sistemleri uzmanı.',
    url: 'https://akdagelektronik.com',
    siteName: 'Akdağ Elektronik',
    locale: 'tr_TR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="bg-[#0F0F0F] text-white antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
        <KvkkBanner />
      </body>
    </html>
  )
}
