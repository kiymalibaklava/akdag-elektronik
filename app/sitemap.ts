import { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getSiteUrl } from '@/lib/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl()

  const supabase = await createServerSupabaseClient()
  const { data: products } = await supabase
    .from('urunler')
    .select('id, updated_at')

  const productUrls: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${baseUrl}/urunler/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/urunler`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/iletisim`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/hakkimizda`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.55,
    },
    {
      url: `${baseUrl}/bayi/basvuru`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sepet`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.35,
    },
    {
      url: `${baseUrl}/favoriler`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/karsilastir`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.3,
    },
    ...productUrls,
  ]
}
