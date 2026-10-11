import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import ProductSearch from '@/components/ProductSearch'
import ProductGrid from '@/components/ProductGrid'
import Pagination from '@/components/Pagination'
import { TUM_KATEGORILER, KATEGORI_HIYERARSI, NEW_KATEGORI_HIYERARSI, findCategoryBySlug, type CategoryNode } from '@/lib/categories'
import { notFound } from 'next/navigation'
import { Filter, SlidersHorizontal, ChevronRight, X, RotateCcw, FolderTree } from 'lucide-react'
import { getActiveBanners } from '@/lib/banner-service'
import BannerCarousel from '@/components/BannerCarousel'

import { PUBLIC_PRODUCT_FIELDS } from '@/lib/product-queries'
import { unstable_cache } from 'next/cache'

export const revalidate = 300

const PER_PAGE = 20

// Next.js build sırasında tüm kategori URL'lerini statik HTML olarak CDN'e basar (0 CPU)
export async function generateStaticParams() {
  const paths: { slug: string[] }[] = [{ slug: [] }]
  const traverse = (nodes: CategoryNode[], current: string[]) => {
    for (const node of nodes) {
      const next = [...current, node.slug]
      paths.push({ slug: next })
      if (node.children) traverse(node.children, next)
    }
  }
  traverse(NEW_KATEGORI_HIYERARSI, [])
  return paths
}

interface ProductQueryFilters {
  q?: string
  categoryName?: string
  categoryLevel?: number
  min?: number | null
  max?: number | null
  stok?: string
  marka?: string
  kullanim?: string
  sirala?: string
}

// Modül seviyesinde önbellek fonksiyonu (Data Cache ile Vercel CPU tasarrufu sağlar)
const getCachedProducts = unstable_cache(
  async (from: number, to: number, cacheKey: string, filters: ProductQueryFilters) => {
    const sb = await createServerSupabaseClient()
    let q = sb.from('urunler').select(PUBLIC_PRODUCT_FIELDS, { count: 'exact' })

    if (filters.q) q = q.or(`ad.ilike.%${filters.q}%,marka.ilike.%${filters.q}%,model_kodu.ilike.%${filters.q}%`)
    if (filters.categoryName) {
      if (filters.categoryLevel === 1) q = q.eq('kategori', filters.categoryName)
      else if (filters.categoryLevel === 2) q = q.eq('alt_kategori', filters.categoryName)
      else if (filters.categoryLevel === 3) q = q.eq('urun_tipi', filters.categoryName)
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
    else q = q.order('created_at', { ascending: false })

    return q.range(from, to)
  },
  ['catalog-products-cache'],
  { revalidate: 300, tags: ['products'] }
)

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

import { buildCanonicalUrl } from '@/lib/seo-utils'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const isAllProducts = !params.slug || params.slug.length === 0
  const category = !isAllProducts ? findCategoryBySlug(params.slug || []) : null

  // SEO: 55-60 Karakter Title Optimizasyonu
  let title = isAllProducts 
    ? 'Tüm Ürünler ve Profesyonel Ses Sistemleri' 
    : `${category?.name || 'Ürünler'}`
  
  if (title.length > 35) {
    title = `${title.substring(0, 35)}... | Akdağ Elektronik`
  } else {
    title = `${title} | Akdağ Elektronik`
  }
  
  // SEO: 140-155 Karakter Description Optimizasyonu ve CTA
  const baseDesc = isAllProducts
    ? 'Profesyonel ses, ışık ve sahne sistemlerinde aradığınız tüm ürünler.'
    : `${category?.name || 'Ürün'} kategorisindeki en iyi profesyonel ses cihazları.`
    
  const description = `${baseDesc} Uygun fiyat, Kayseri içi stoktan teslim ve teknik destek avantajıyla ürünleri hemen inceleyin!`.substring(0, 155)

  // Canonical URL Entegrasyonu
  const rawPath = isAllProducts 
    ? '/urunler' 
    : `/urunler/${(params.slug || []).join('/')}`
    
  const canonicalUrl = buildCanonicalUrl(rawPath)

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Akdağ Elektronik',
      type: 'website',
      locale: 'tr_TR',
    }
  }
}

export default async function UrunlerPage({ params, searchParams }: Props) {
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

  const filters: ProductQueryFilters = {
    q: searchParams.q,
    categoryName: activeCategory?.name,
    categoryLevel: slugArray.length,
    min,
    max,
    stok: searchParams.stok,
    marka: searchParams.marka,
    kullanim: searchParams.kullanim,
    sirala,
  }

  const cacheKey = JSON.stringify({ from, to, ...filters })
  const { data: products, count } = await getCachedProducts(from, to, cacheKey, filters) as any
  const totalPages = Math.ceil((count || 0) / PER_PAGE)

  // Cache'den filtreleri çek
  const { markalar, kullanimAlanlari } = await getCachedFilters()

  // Aktif Bannerları Çek
  const banners = await getActiveBanners()

  const baseParams = new URLSearchParams()
  Object.entries(searchParams).forEach(([k, v]) => { if (v && k !== 'sayfa') baseParams.set(k, v) })

  const hasActiveFilters = Boolean(
    (searchParams.marka && searchParams.marka !== 'tum') ||
    (searchParams.kullanim && searchParams.kullanim !== 'tum') ||
    (searchParams.stok && searchParams.stok !== 'tum') ||
    searchParams.min ||
    searchParams.max ||
    (searchParams.sirala && searchParams.sirala !== 'yeni') ||
    searchParams.q
  )
  let activeFilterCount = 0
  if (searchParams.marka && searchParams.marka !== 'tum') activeFilterCount++
  if (searchParams.kullanim && searchParams.kullanim !== 'tum') activeFilterCount++
  if (searchParams.stok && searchParams.stok !== 'tum') activeFilterCount++
  if (searchParams.min) activeFilterCount++
  if (searchParams.max) activeFilterCount++
  if (searchParams.sirala && searchParams.sirala !== 'yeni') activeFilterCount++
  if (searchParams.q) activeFilterCount++

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

      {/* Başlık + Arama — Banner’ın hemen altında */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-[2px] bg-brand-red" />
          <span className="font-display font-bold text-[10px] tracking-[0.3em] uppercase text-brand-red">
            {activeCategory ? 'Kategori Kataloğu' : 'Tüm Ürünler'}
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase text-white tracking-tight leading-none">
            {activeCategory ? activeCategory.name : 'ÜRÜN KATALOĞU'}
          </h1>
          <div className="w-full md:w-[480px]">
            <ProductSearch fullPage />
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Akıllı Filtre Paneli */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl shadow-sm mb-8 overflow-hidden">
          {/* Mobil Toggle Checkbox */}
          <input type="checkbox" id="mobile-filter-toggle" className="peer hidden" />
          
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red">
                <SlidersHorizontal size={15} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display font-bold text-xs uppercase tracking-wider text-white">
                  Filtreleme Seçenekleri
                </span>
                {activeFilterCount > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-red/15 text-brand-red border border-brand-red/30 px-2 py-0.5 rounded-full">
                    {activeFilterCount} Filtre Aktif
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <a
                  href={slugArray.length > 0 ? `/urunler/${slugArray.join('/')}` : '/urunler'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:border-brand-red/40 hover:text-brand-red text-white/60 text-xs font-semibold transition-all"
                  title="Filtreleri Sıfırla"
                >
                  <RotateCcw size={12} />
                  <span className="hidden sm:inline">Temizle</span>
                </a>
              )}
              <label 
                htmlFor="mobile-filter-toggle" 
                className="sm:hidden px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-white/80 cursor-pointer"
              >
                <span className="peer-checked:hidden">Filtreler</span>
                <span className="hidden peer-checked:block">Gizle</span>
              </label>
            </div>
          </div>

          {/* Form Alanı (Masaüstünde açık, mobilde peer-checked ile açılır) */}
          <div className="hidden peer-checked:block sm:block p-4 sm:p-5">
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {searchParams.q && <input type="hidden" name="q" value={searchParams.q} />}
              
              {/* Marka */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/60">Marka</label>
                <select name="marka" defaultValue={searchParams.marka || 'tum'} className="input-dark text-xs py-2.5 rounded-xl cursor-pointer">
                  <option value="tum">Tüm Markalar</option>
                  {markalar.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Kullanım Alanı */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/60">Kullanım Alanı</label>
                <select name="kullanim" defaultValue={searchParams.kullanim || 'tum'} className="input-dark text-xs py-2.5 rounded-xl cursor-pointer">
                  <option value="tum">Tüm Alanlar</option>
                  {kullanimAlanlari.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              {/* Stok Durumu */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/60">Stok Durumu</label>
                <select name="stok" defaultValue={searchParams.stok || 'tum'} className="input-dark text-xs py-2.5 rounded-xl cursor-pointer">
                  <option value="tum">Tüm Stoklar</option>
                  <option value="stokta">Stokta Mevcut</option>
                  <option value="siparise_gore">Siparişe Göre</option>
                  <option value="tukendi">Tükendi</option>
                </select>
              </div>

              {/* Fiyat Aralığı (TL) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/60">Fiyat Aralığı (₺)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input name="min" type="number" min="0" defaultValue={searchParams.min || ''} className="input-dark text-xs py-2.5 rounded-xl" placeholder="Min ₺" />
                  <input name="max" type="number" min="0" defaultValue={searchParams.max || ''} className="input-dark text-xs py-2.5 rounded-xl" placeholder="Max ₺" />
                </div>
              </div>

              {/* Sıralama */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/60">Sıralama</label>
                <select name="sirala" defaultValue={searchParams.sirala || 'yeni'} className="input-dark text-xs py-2.5 rounded-xl cursor-pointer">
                  <option value="yeni">En Yeniler</option>
                  <option value="fiyat_artan">Fiyat: Düşükten Yükseğe</option>
                  <option value="fiyat_azalan">Fiyat: Yüksekten Düşüğe</option>
                  <option value="ad_asc">İsim: A-Z</option>
                </select>
              </div>

              {/* Butonlar */}
              <div className="flex items-end gap-2 pt-1 sm:pt-0">
                <button className="w-full py-2.5 px-4 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95" type="submit">
                  <Filter size={13} />
                  <span>Uygula</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Dinamik Kategori Gezgini */}
        <div className="mb-10">
          {!activeCategory ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white/50 text-[11px] font-display font-bold uppercase tracking-wider">
                <FolderTree size={13} className="text-brand-red" />
                <span>Kategorilere Göre İnceleyin</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {NEW_KATEGORI_HIYERARSI.map((kat) => (
                  <a
                    key={kat.slug}
                    href={`/urunler/${kat.slug}`}
                    className="font-display font-semibold text-xs tracking-wider uppercase px-4 py-2.5 rounded-xl border border-white/10 bg-[#141414] hover:bg-brand-red/5 hover:border-brand-red/40 text-white/80 hover:text-brand-red transition-all duration-200 shadow-sm flex items-center gap-2 group"
                  >
                    <span>{kat.name}</span>
                    <ChevronRight size={13} className="text-white/20 group-hover:text-brand-red group-hover:translate-x-0.5 transition-all" />
                  </a>
                ))}
              </div>
            </div>
          ) : activeCategory.children && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-white/50 text-[11px] font-display font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FolderTree size={13} className="text-brand-red" />
                  <span>Alt Kategoriler ({activeCategory.name})</span>
                </div>
                <a href="/urunler" className="text-brand-red hover:underline text-[11px] font-normal normal-case">
                  ← Tüm Kategorileri Göster
                </a>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeCategory.children.map((child: any) => (
                  <a
                    key={child.slug}
                    href={`/urunler/${slugArray.join('/')}/${child.slug}`}
                    className="font-display font-semibold text-xs tracking-wider uppercase px-4 py-2 rounded-xl border border-brand-red/20 bg-brand-red/5 hover:bg-brand-red text-brand-red hover:text-white transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <span>{child.name}</span>
                    <ChevronRight size={12} className="opacity-60" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sonuç Sayacı */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div className="font-display font-bold text-xs tracking-wider text-white/60 uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>TOPLAM <strong className="text-white font-extrabold">{count || 0}</strong> ÜRÜN LİSTELENİYOR</span>
          </div>
          {count && count > 0 && (
            <div className="font-body text-xs text-white/40">
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
