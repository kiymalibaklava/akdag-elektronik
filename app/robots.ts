import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl().replace(/\/$/, '')

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/bayi/panel',
          '/bayi/hizli-siparis',
          '/bayi/sifrele',
          '/bayi/sifre-sifirla',
          '/hesabim/',
          '/sepet/',
          '/teklif/',
        ],
      },
      {
        // Agresif SEO & scraping botları (AI arama motorlarına izin verilir)
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'DotBot',
          'PetalBot',
          'MJ12bot',
          'BLEXBot',
          'DataForSeoBot',
          'Bytespider',
          'CCBot',
          'Scrapy',
          'Diffbot',
        ],
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
