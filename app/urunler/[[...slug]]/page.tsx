import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import ProductSearch from '@/components/ProductSearch'
import ProductGrid from '@/components/ProductGrid'
import Pagination from '@/components/Pagination'
import { TUM_KATEGORILER, KATEGORI_HIYERARSI, NEW_KATEGORI_HIYERARSI, findCategoryBySlug } from '@/lib/categories'
import { notFound } from 'next/navigation'
import { Filter, SlidersHorizontal, ChevronRight, X } from 'lucide-react'
import { getActiveBanners } from '@/lib/banner-service'
import BannerCarousel from '@/components/BannerCarousel'

import { LIGHT_PRODUCT_FIELDS } from '@/lib/product-queries'
import { unstable_cache } from 'next/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

const PER_PAGE = 16

// Filtre seçeneklerini cache-leyerek egress tasarrufu yapıyoruz
const getCachedFilters = unstable_cache(
  async () => {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('urunler')
      .select('marka, kullanim_alani')
      .limit(5000)
    
    const markalar = Array.from(new Set((data || []).map((r) => r.marka).filter(Boolean))).sort() as string[]
    const kullanimAlanlari = Array.from(new Set((data || []).map((r) => r.kullanim_alani).filter(Boolean))).sort() as string[]
    
    return { markalar, kullanimAlanlari }
  },
  ['product-filters'],
  { revalidate: 3600 } // 1 saatlik cache
)

interface Props {
  params: { slug?: string[] }
  searchParams: {
    q?: string
    sayfa?: string
    min?: string
    max?: string
    stok?: string
    marka?: string
    kullanim?: string
    sirala?: string
  }
}

import type { Metadata } from 'next'

import { getSiteUrl } from '@/lib/site-url'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const isAllProducts = !params.slug || params.slug.length === 0
  const category = !isAllProducts ? findCategoryBySlug(params.slug || []) : null

  const title = isAllProducts 
    ? 'Tüm Ürünler | Akdağ Elektronik' 
    : `${category?.name || 'Ürünler'} | Akdağ Elektronik`
  
  const description = isAllProducts
    ? 'Akdağ Elektronik geniş ürün yelpazesi: Profesyonel ses sistemleri, amfiler, hoparlörler, mikrofonlar ve sahne ışıklandırmaları.'
    : `${category?.name || 'Ürün'} kategorisindeki en kaliteli ve profesyonel cihazları Akdağ Elektronik güvencesiyle inceleyin.`

  const url = isAllProducts 
    ? `${getSiteUrl()}/urunler` 
    : `${getSiteUrl()}/urunler/${(params.slug || []).join('/')}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Akdağ Elektronik',
      type: 'website',
      locale: 'tr_TR',
    }
  }
}

export default async function UrunlerPage({ params, searchParams }: Props) {
  const supabase = await createServerSupabaseClient()
  const slugArray = params.slug || []
  
  // Kategori Bulma
  let activeCategory: any = null
  if (slugArray.length > 0) {
    activeCategory = findCategoryBySlug(slugArray)
    if (!activeCategory) notFound()
  }

  const sayfa = Math.max(1, parseInt(searchParams.sayfa || '1'))
  const from = (sayfa - 1) * PER_PAGE
  const to = from + PER_PAGE - 1
  const min = searchParams.min ? Number(searchParams.min) : null
  const max = searchParams.max ? Number(searchParams.max) : null
  const sirala = searchParams.sirala || 'yeni'

  // Ürünleri getiren ana fonksiyonu cache-liyoruz
  const getProducts = unstable_cache(
    async (from: number, to: number, filters: any) => {
      const sb = await createServerSupabaseClient()
      let q = sb.from('urunler').select(LIGHT_PRODUCT_FIELDS, { count: 'exact' })
      
      if (filters.q) q = q.ilike('ad', `%${filters.q}%`)
      if (filters.activeCategory) {
        if (filters.slugLength === 1) q = q.eq('kategori', filters.activeCategory.name)
        else if (filters.slugLength === 2) q = q.eq('alt_kategori', filters.activeCategory.name)
        else if (filters.slugLength === 3) q = q.eq('urun_tipi', filters.activeCategory.name)
      }
      if (filters.min) q = q.gte('fiyat', filters.min)
      if (filters.max) q = q.lte('fiyat', filters.max)
      if (filters.stok && filters.stok !== 'tum') q = q.eq('stok_durumu', filters.stok)
      if (filters.marka && filters.marka !== 'tum') q = q.eq('marka', filters.marka)
      if (filters.kullanim && filters.kullanim !== 'tum') q = q.eq('kullanim_alani', filters.kullanim)

      if (filters.sirala === 'yeni') q = q.order('created_at', { ascending: false })
      else if (filters.sirala === 'fiyat_artan') q = q.order('fiyat', { ascending: true })
      else if (filters.sirala === 'fiyat_azalan') q = q.order('fiyat', { ascending: false })
      else if (filters.sirala === 'ad_asc') q = q.order('ad', { ascending: true })

      return q.range(from, to)
    },
    ['product-list-cache'],
    { revalidate: 3600, tags: ['products'] }
  )

  const filters = {
    q: searchParams.q,
    activeCategory,
    slugLength: slugArray.length,
    min,
    max,
    stok: searchParams.stok,
    marka: searchParams.marka,
    kullanim: searchParams.kullanim,
    sirala
  }

  const { data: products, count } = await getProducts(from, to, filters) as any
  const totalPages = Math.ceil((count || 0) / PER_PAGE)

  // Cache'den filtreleri çek
  const { markalar, kullanimAlanlari } = await getCachedFilters()

  // Aktif Bannerları Çek
  const banners = await getActiveBanners()

  const baseParams = new URLSearchParams()
  Object.entries(searchParams).forEach(([k, v]) => { if (v && k !== 'sayfa') baseParams.set(k, v) })

  // JSON-LD ItemList for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: activeCategory ? activeCategory.name : 'Tüm Ürünler',
    url: `${getSiteUrl()}/urunler${activeCategory ? `/${activeCategory.slug}` : ''}`,
    numberOfItems: products?.length || 0,
    itemListElement: (products || []).map((p: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: p.ad,
        url: `${getSiteUrl()}/urun/${p.slug}`,
        image: p.fotograflar && p.fotograflar.length > 0 ? p.fotograflar[0] : `${getSiteUrl()}/logo.png`,
      }
    }))
  }

  return (
    <div className="min-h-screen pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* Kampanya / Banner Alanı */}
      <BannerCarousel banners={banners} />

      {/* Başlık + Arama — Banner’ın hemen altında, aktarımlı geçiş */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-[2px] bg-brand-red" />
          <span className="font-display font-black text-[10px] tracking-[0.4em] uppercase text-brand-red">
            {activeCategory ? 'Kategori Kataloğu' : 'Tüm Ürünler'}
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
          <h1 className="font-display font-black text-4xl md:text-6xl uppercase text-white tracking-tighter leading-none flex-shrink-0">
            {activeCategory ? activeCategory.name : 'ÜRÜN KATALOĞU'}
          </h1>
          <div className="flex-1 max-w-xl">
            <ProductSearch fullPage />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16">
        
        {/* Akıllı Filtre Paneli (Madde 3) */}
        <div className="bg-[#111111] border border-white/5 p-6 mb-12">
          <div className="flex items-center gap-2 mb-6">
            <SlidersHorizontal size={14} className="text-brand-red" />
            <span className="font-display font-bold text-[10px] tracking-[0.2em] uppercase text-white/40">FİLTRELEME SEÇENEKLERİ</span>
          </div>
          <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <div className="space-y-2">
              {searchParams.q && <input type="hidden" name="q" value={searchParams.q} />}
              <label className="block text-[9px] font-display font-bold uppercase text-white/20 tracking-widest">Marka</label>
              <select name="marka" defaultValue={searchParams.marka || 'tum'} className="input-dark text-xs py-3 border-white/10 hover:border-brand-red/30 transition-colors appearance-none cursor-pointer">
                <option value="tum">TÜM MARKALAR</option>
                {markalar.map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-[9px] font-display font-bold uppercase text-white/20 tracking-widest">Kullanım Alanı</label>
              <select name="kullanim" defaultValue={searchParams.kullanim || 'tum'} className="input-dark text-xs py-3 border-white/10 hover:border-brand-red/30 transition-colors appearance-none cursor-pointer">
                <option value="tum">TÜM ALANLAR</option>
                {kullanimAlanlari.map((k) => <option key={k} value={k}>{k.toUpperCase()}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] font-display font-bold uppercase text-white/20 tracking-widest">Stok Durumu</label>
              <select name="stok" defaultValue={searchParams.stok || 'tum'} className="input-dark text-xs py-3 border-white/10 hover:border-brand-red/30 transition-colors appearance-none cursor-pointer">
                <option value="tum">TÜM STOKLAR</option>
                <option value="stokta">STOKTA MEVCUT</option>
                <option value="siparise_gore">SİPARİŞE GÖRE</option>
                <option value="tukendi">TÜKENDİ</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] font-display font-bold uppercase text-white/20 tracking-widest">Fiyat Aralığı (TL)</label>
              <div className="grid grid-cols-2 gap-2">
                <input name="min" type="number" min="0" defaultValue={searchParams.min || ''} className="input-dark text-xs py-3 border-white/10" placeholder="MİN" />
                <input name="max" type="number" min="0" defaultValue={searchParams.max || ''} className="input-dark text-xs py-3 border-white/10" placeholder="MAX" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] font-display font-bold uppercase text-white/20 tracking-widest">Sıralama</label>
              <select name="sirala" defaultValue={searchParams.sirala || 'yeni'} className="input-dark text-xs py-3 border-white/10 hover:border-brand-red/30 transition-colors appearance-none cursor-pointer">
                <option value="yeni">EN YENİLER</option>
                <option value="fiyat_artan">FİYAT: DÜŞÜKTEN YÜKSEĞE</option>
                <option value="fiyat_azalan">FİYAT: YÜKSEKTEN DÜŞÜĞE</option>
                <option value="ad_asc">İSİM: A-Z</option>
              </select>
            </div>

            <div className="flex items-end gap-2 xl:col-span-1 sm:col-span-2">
              <button className="btn-primary flex-1 justify-center text-xs py-3.5 tracking-[0.2em]" type="submit">
                <Filter size={14} className="mr-2" /> UYGULA
              </button>
              {(searchParams.marka || searchParams.kullanim || searchParams.stok || searchParams.min || searchParams.max || searchParams.q) && (
                <a href={slugArray.length > 0 ? `/urunler/${slugArray.join('/')}` : '/urunler'} 
                   className="w-12 h-12 flex items-center justify-center border border-white/10 text-white/40 hover:border-brand-red/40 hover:text-brand-red transition-all"
                   title="Filtreleri Temizle">
                  <X size={16} />
                </a>
              )}
            </div>
          </form>
        </div>

        {/* Dinamik Kategori Gezgini */}
        <div className="mb-12">
          {!activeCategory ? (
            <div className="flex flex-wrap gap-2">
              {NEW_KATEGORI_HIYERARSI.map((kat) => (
                <a
                  key={kat.slug}
                  href={`/urunler/${kat.slug}`}
                  className="font-display font-bold text-[10px] tracking-widest uppercase px-6 py-3 border border-white/5 bg-[#141414] text-white/30 hover:border-brand-red/40 hover:text-white transition-all duration-300"
                >
                  {kat.name}
                </a>
              ))}
            </div>
          ) : activeCategory.children && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-white/20">
                <span className="font-display font-bold text-[9px] uppercase tracking-[0.3em] whitespace-nowrap">ALT KATEGORİLER</span>
                <div className="h-px bg-white/5 flex-1" />
              </div>
              <div className="flex flex-wrap gap-2">
                {activeCategory.children.map((child: any) => (
                  <a
                    key={child.slug}
                    href={`/urunler/${slugArray.join('/')}/${child.slug}`}
                    className="font-display font-bold text-[10px] tracking-widest uppercase px-5 py-2.5 border border-brand-red/10 bg-brand-red/[0.02] text-brand-red/50 hover:bg-brand-red hover:text-white transition-all"
                  >
                    {child.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sonuç Sayacı */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
          <div className="font-display font-bold text-[11px] tracking-widest text-white/20 uppercase">
             TOPLAM <span className="text-white ml-1">{count || 0}</span> ÜRÜN LİSTELENİYOR
          </div>
          {count && count > 0 && (
            <div className="font-body text-xs text-white/20">
              SAYFA {sayfa} / {totalPages}
            </div>
          )}
        </div>

        <Suspense fallback={<GridSkeleton />}>
          <ProductGrid products={products || []} searchQuery={searchParams.q} />
        </Suspense>

        {totalPages > 1 && (
          <div className="mt-20">
            <Pagination
              currentPage={sayfa}
              totalPages={totalPages}
              baseParams={baseParams.toString()}
              basePath={slugArray.length > 0 ? `/urunler/${slugArray.join('/')}` : '/urunler'}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-[#141414] border border-white/5 h-[400px] overflow-hidden">
          <div className="aspect-square bg-white/[0.02] animate-pulse" />
          <div className="p-4 space-y-3">
             <div className="h-4 bg-white/5 w-3/4 animate-pulse" />
             <div className="h-3 bg-white/[0.02] w-1/2 animate-pulse" />
             <div className="pt-4 flex justify-between items-center">
                <div className="h-5 bg-white/5 w-1/3 animate-pulse" />
                <div className="h-8 bg-white/5 w-1/4 animate-pulse" />
             </div>
          </div>
        </div>
      ))}
    </div>
  )
}
