import { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getSiteUrl } from '@/lib/site-url'
import { NEW_KATEGORI_HIYERARSI, CategoryNode } from '@/lib/categories'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawUrl = getSiteUrl()
  const baseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/urunler`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/hakkimizda`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/iletisim`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: urunler } = await supabase
      .from('urunler')
      .select('id, slug, created_at')
      .order('created_at', { ascending: false })
      .limit(5000) 

    const urunPages: MetadataRoute.Sitemap = (urunler || []).map((urun) => ({
      url: `${baseUrl}/urun/${urun.slug || urun.id}`,
      lastModified: new Date(urun.created_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    const categoryUrls: string[] = []
    const traverse = (nodes: CategoryNode[], currentPath: string) => {
      for (const node of nodes) {
        const newPath = currentPath ? currentPath + '/' + node.slug : node.slug
        categoryUrls.push(newPath)
        if (node.children) traverse(node.children, newPath)
      }
    }
    traverse(NEW_KATEGORI_HIYERARSI, '')

    const categoryPages: MetadataRoute.Sitemap = categoryUrls.map((path) => ({
      url: `${baseUrl}/urunler/${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    return [...staticPages, ...categoryPages, ...urunPages]
  } catch (error) {
    console.error('Sitemap urunleri cekerken hata:', error)
    return staticPages
  }
}
