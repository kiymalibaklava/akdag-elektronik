import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl()
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/bayi/',
          '/hesabim/',
          '/sepet/',
          '/teklif/',
        ],
      },
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'DotBot',
          'PetalBot',
          'MJ12bot',
          'BLEXBot',
          'DataForSeoBot',
          'Amazonbot',
          'Bytespider',
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'anthropic-ai',
          'CCBot',
          'PerplexityBot',
          'Scrapy',
          'Diffbot',
        ],
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
