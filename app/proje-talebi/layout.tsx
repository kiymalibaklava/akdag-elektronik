import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/site-url'

const title = 'Sistem Kurulum Talebi & Ücretsiz Keşif | Akdağ Elektronik'
const description = 'Okul, cami, konferans salonu, spor tesisi ve hastaneler için profesyonel ses, ışık ve görüntü sistemi kurulum talebi oluşturun. Ücretsiz keşif ve teklif için hemen formu doldurun.'
const url = `${getSiteUrl()}/proje-talebi`

export const metadata: Metadata = {
  title,
  description,
  keywords: ['ses sistemi kurulumu', 'cami ses sistemi', 'okul ses sistemi', 'konferans salonu sistemleri', 'ücretsiz keşif', 'kayseri ses sistemi', 'akdağ elektronik proje'],
  alternates: {
    canonical: url,
  },
  openGraph: {
    title,
    description,
    url,
    siteName: 'Akdağ Elektronik',
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function ProjeTalebiLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Profesyonel Ses, Işık ve Görüntü Sistemleri Kurulumu',
    provider: {
      '@type': 'LocalBusiness',
      name: 'Akdağ Elektronik',
      url: getSiteUrl(),
      telephone: '+903522316915'
    },
    areaServed: 'TR',
    description: 'Okul, cami, konferans salonu ve diğer mekanlar için profesyonel keşif, projelendirme ve anahtar teslim kurulum hizmetleri.',
    url: url
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
