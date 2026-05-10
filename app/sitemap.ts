import { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getSiteUrl } from '@/lib/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // baseUrl'in sonundaki / işaretini temizleyerek çift slash hatasını önleriz
  const rawUrl = getSiteUrl()
  const baseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl

  // 1. Sabit (Statik) Sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/urunler`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hakkimizda`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/iletisim`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  try {
    const supabase = await createServerSupabaseClient()
    
    // 2. Dinamik Ürün Sayfaları
    const { data: urunler } = await supabase
      .from('urunler')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(5000) 

    const urunPages: MetadataRoute.Sitemap = (urunler || []).map((urun) => ({
      url: `${baseUrl}/urun/${urun.id}`,
      lastModified: new Date(urun.created_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    return [...staticPages, ...urunPages]
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return staticPages
  }
}