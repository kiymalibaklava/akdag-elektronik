import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl()
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',          // Admin panelini Google'dan gizle
        '/sepet/',          // Sepet sayfasını indexlemeye gerek yok
        '/hesabim/',        // Kullanıcı özel sayfalarını gizle
        '/login/',
        '/register/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
