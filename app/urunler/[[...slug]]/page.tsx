import { Suspense } from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { ChevronRight, X } from 'lucide-react'
import { unstable_cache } from 'next/cache'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import ProductSearch from '@/components/ProductSearch'
import ProductGrid from '@/components/ProductGrid'
import Pagination from '@/components/Pagination'
import BannerCarousel from '@/components/BannerCarousel'
import ProductFilters from '@/components/ProductFilters'
import CategorySeoText from '@/components/CategorySeoText'
import {
  HIERARCHY_DATA,
  NEW_KATEGORI_HIYERARSI,
  findCategoryBySlug,
  type CategoryNode,
} from '@/lib/categories'
import { getActiveBanners } from '@/lib/banner-service'
import { PUBLIC_PRODUCT_FIELDS } from '@/lib/product-queries'
import { getSiteUrl } from '@/lib/site-url'
import { buildCanonicalUrl } from '@/lib/seo-utils'

export const revalidate = 300
const PER_PAGE = 20

function normalizeBrandName(m?: string): string {
  if (!m) return ''
  const trimmed = m.trim()
  const upper = trimmed.toUpperCase()
  if (upper === 'LD SYSTEM') return 'LD SYSTEMS'
  if (upper === 'ALLEN&HEALTH' || upper === 'ALLEN & HEALTH' || upper === 'ALLEN & HEATH' || upper === 'ALLEN AND HEATH') {
    return 'ALLEN&HEATH'
  }
  return trimmed
}

function getCategoryPathBreadcrumbs(slugArray: string[], marka?: string) {
  const baseUrl = getSiteUrl()
  const crumbs = [
    { name: 'Ana Sayfa', url: baseUrl },
    { name: 'Ürünler', url: `${baseUrl}/urunler` },
  ]
  if (marka && slugArray.length === 0) {
    crumbs.push({ name: marka, url: `${baseUrl}/urunler?marka=${encodeURIComponent(marka)}` })
    return crumbs
  }
  let currentList = HIERARCHY_DATA
  let path = '/urunler'
  for (const slug of slugArray) {
    const node = currentList.find((n) => n.slug === slug)
    if (node) {
      path += `/${node.slug}`
      crumbs.push({ name: node.name, url: `${baseUrl}${path}` })
      currentList = node.children || []
    } else {
      path += `/${slug}`
      crumbs.push({ name: slug, url: `${baseUrl}${path}` })
      break
    }
  }
  if (marka && slugArray.length > 0) {
    crumbs.push({ name: marka, url: `${baseUrl}${path}?marka=${encodeURIComponent(marka)}` })
  }
  return crumbs
}

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
  targetNames?: string[] | null
  categoryLevel?: number
  min?: number | null
  max?: number | null
  stok?: string
  marka?: string
  kullanim?: string
  sirala?: string
}

const getCachedProducts = unstable_cache(
  async (from: number, to: number, cacheKey: string, filters: ProductQueryFilters) => {
    const sb = await createServerSupabaseClient()
    let q = sb.from('urunler').select(PUBLIC_PRODUCT_FIELDS, { count: 'exact' })

    if (filters.q) {
      q = q.or(`ad.ilike.%${filters.q}%,marka.ilike.%${filters.q}%,model_kodu.ilike.%${filters.q}%`)
    }

    if (filters.targetNames && filters.targetNames.length > 0) {
      if (filters.categoryLevel === 1) q = q.in('kategori', filters.targetNames)
      else if (filters.categoryLevel === 2) q = q.in('alt_kategori', filters.targetNames)
      else if (filters.categoryLevel === 3) q = q.in('urun_tipi', filters.targetNames)
    }

    if (filters.min !== null && filters.min !== undefined && !isNaN(filters.min)) {
      q = q.gte('fiyat', filters.min)
    }
    if (filters.max !== null && filters.max !== undefined && !isNaN(filters.max)) {
      q = q.lte('fiyat', filters.max)
    }
    if (filters.stok && filters.stok !== 'tum') {
      q = q.eq('stok_durumu', filters.stok)
    }
    if (filters.marka && filters.marka !== 'tum') {
      const targetMarka = normalizeBrandName(filters.marka)
      if (targetMarka === 'ALLEN&HEATH') {
        q = q.or('marka.ilike.%ALLEN%HEATH%,marka.ilike.%ALLEN%HEALTH%')
      } else if (targetMarka === 'LD SYSTEMS') {
        q = q.ilike('marka', '%LD SYSTEM%')
      } else {
        q = q.ilike('marka', `%${targetMarka}%`)
      }
    }
    if (filters.kullanim && filters.kullanim !== 'tum') {
      q = q.eq('kullanim_alani', filters.kullanim)
    }

    if (filters.sirala === 'fiyat_artan') {
      q = q.order('fiyat', { ascending: true, nullsFirst: false })
    } else if (filters.sirala === 'fiyat_azalan') {
      q = q.order('fiyat', { ascending: false, nullsFirst: false })
    } else if (filters.sirala === 'ad_asc') {
      q = q.order('ad', { ascending: true })
    } else if (filters.sirala === 'ad_desc') {
      q = q.order('ad', { ascending: false })
    } else {
      // Varsayılan: Stokta olanlar her zaman önde, ardından en yeniler
      q = q
        .order('stok_adedi', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
    }

    return q.range(from, to)
  },
  ['catalog-products-cache-v2'],
  { revalidate: 300, tags: ['products'] }
)

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
  { revalidate: 3600 }
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

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const isAllProducts = !params.slug || params.slug.length === 0
  const category = !isAllProducts ? findCategoryBySlug(params.slug || []) : null
  const hasFilterParams = !!(
    searchParams?.min ||
    searchParams?.max ||
    searchParams?.stok ||
    searchParams?.sirala ||
    searchParams?.kullanim ||
    searchParams?.q ||
    (searchParams?.sayfa && Number(searchParams.sayfa) > 1)
  )
  const robots = hasFilterParams
    ? { index: false, follow: true }
    : { index: true, follow: true }

  if (searchParams?.marka && isAllProducts) {
    const marka = searchParams.marka
    const title = `${marka} Ürünleri ve Modelleri`
    const description = `Tüm orijinal ${marka} profesyonel ses, sahne ve stüdyo ekipmanları yetkili satış ve teknik servis güvencesiyle Akdağ Elektronik'te.`
    const canonicalUrl = `${getSiteUrl()}/urunler?marka=${encodeURIComponent(marka)}`
    return {
      title,
      description,
      robots,
      alternates: { canonical: canonicalUrl },
      openGraph: { title: `${title} | Akdağ Elektronik`, description, url: canonicalUrl, siteName: 'Akdağ Elektronik', type: 'website', locale: 'tr_TR', images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
    }
  }

  let title = isAllProducts
    ? 'Tüm Ürünler ve Profesyonel Ses Sistemleri'
    : `${category?.name || 'Ürünler'}`

  if (title.length > 44) {
    title = `${title.substring(0, 44)}...`
  }

  const baseDesc = isAllProducts
    ? 'Profesyonel ses, ışık, görüntü ve sahne sistemlerinde aradığınız tüm ekipmanlar.'
    : `${category?.name || 'Ürün'} kategorisindeki profesyonel ses, ışık ve görüntü ekipmanları.`

  const description = `${baseDesc} Resmi distribütör garantisi, kurumsal projelendirme ve teknik destek avantajıyla inceleyin.`.substring(0, 158)

  const canonicalSlug = category?.canonicalPath ? category.canonicalPath.join('/') : (params.slug || []).join('/')
  const rawPath = isAllProducts ? '/urunler' : `/urunler/${canonicalSlug}`
  const canonicalUrl = buildCanonicalUrl(rawPath)

  return {
    title,
    description,
    robots,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${title} | Akdağ Elektronik`,
      description,
      url: canonicalUrl,
      siteName: 'Akdağ Elektronik',
      type: 'website',
      locale: 'tr_TR',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    },
  }
}

export default async function UrunlerPage({ params, searchParams }: Props) {
  const slugArray = params.slug || []

  // Kategori Bulma + Sescim Canonical Yönlendirme
  let activeCategory: any = null
  if (slugArray.length > 0) {
    activeCategory = findCategoryBySlug(slugArray)
    if (!activeCategory) notFound()

    if (activeCategory.canonicalPath && activeCategory.canonicalPath.join('/') !== slugArray.join('/')) {
      const sp = new URLSearchParams()
      for (const [key, val] of Object.entries(searchParams || {})) {
        if (val !== undefined) sp.set(key, String(val))
      }
      const qStr = sp.toString() ? `?${sp.toString()}` : ''
      redirect(`/urunler/${activeCategory.canonicalPath.join('/')}${qStr}`)
    }
  }

  const sayfa = Math.max(1, parseInt(searchParams.sayfa || '1'))
  const from = (sayfa - 1) * PER_PAGE
  const to = from + PER_PAGE - 1
  const min = searchParams.min ? Number(searchParams.min) : null
  const max = searchParams.max ? Number(searchParams.max) : null
  const sirala = searchParams.sirala || 'yeni'

  const targetNames = activeCategory
    ? Array.isArray(activeCategory.dbName)
      ? activeCategory.dbName
      : [activeCategory.dbName || activeCategory.name]
    : null

  const filters: ProductQueryFilters = {
    q: searchParams.q,
    targetNames,
    categoryLevel: activeCategory?.level || slugArray.length,
    min,
    max,
    stok: searchParams.stok,
    marka: searchParams.marka,
    kullanim: searchParams.kullanim,
    sirala,
  }

  const cacheKey = JSON.stringify({ from, to, ...filters })
  const [{ data: products, count }, { markalar, kullanimAlanlari }, banners] = await Promise.all([
    getCachedProducts(from, to, cacheKey, filters) as Promise<any>,
    getCachedFilters(),
    getActiveBanners(),
  ])

  const totalPages = Math.ceil((count || 0) / PER_PAGE)

  const baseParams = new URLSearchParams()
  Object.entries(searchParams).forEach(([k, v]) => {
    if (v && k !== 'sayfa') baseParams.set(k, v)
  })

  const categoryPath = slugArray.length > 0 ? `/urunler/${slugArray.join('/')}` : '/urunler'
  const baseUrl = getSiteUrl()
  const crumbs = getCategoryPathBreadcrumbs(slugArray, filters.marka)

  const hasActiveFilters = Boolean(
    (searchParams.marka && searchParams.marka !== 'tum') ||
      (searchParams.kullanim && searchParams.kullanim !== 'tum') ||
      (searchParams.stok && searchParams.stok !== 'tum') ||
      searchParams.min ||
      searchParams.max ||
      searchParams.q
  )

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: filters.marka
      ? `${filters.marka} Ürünleri`
      : activeCategory
        ? `${activeCategory.name} Modelleri`
        : 'Akdağ Elektronik Ürün Kataloğu',
    numberOfItems: (products || []).length,
    itemListElement: (products || []).slice(0, 16).map((p: any, idx: number) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${baseUrl}/urun/${encodeURIComponent(p.slug || p.id)}`,
      name: p.ad,
    })),
  }

  const collectionPageJsonLd = activeCategory
    ? {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${activeCategory.name} Modelleri`,
        description: `${activeCategory.name} profesyonel ses, ışık ve görüntü ekipmanları Akdağ Elektronik güvencesiyle.`,
        url: `${baseUrl}${categoryPath}`,
        isPartOf: {
          '@type': 'WebSite',
          name: 'Akdağ Elektronik',
          url: baseUrl,
        },
      }
    : null

  return (
    <div className="min-h-screen pb-24 bg-[#0A0A0A]">
      {/* Google Rich Snippets: BreadcrumbList, CollectionPage & ItemList */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {collectionPageJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }} />
      )}
      {products && products.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}

      {/* Kampanya / Banner Alanı (Sadece Ana Ürünler Sayfasında ve Filtre Yokken) */}
      {slugArray.length === 0 && !hasActiveFilters && banners && banners.length > 0 && (
        <BannerCarousel banners={banners} />
      )}

      {/* Üst Başlık, Breadcrumb ve Arama — Sescim Birebir Düzeni */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6 border-b border-white/5">
        {/* Görsel ve Semantik Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center flex-wrap gap-1.5 text-xs text-white/50">
            {crumbs.map((c, i) => (
              <li key={c.url} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3 h-3 text-white/30 flex-shrink-0" />}
                {i === crumbs.length - 1 ? (
                  <span className="font-semibold text-white">{c.name}</span>
                ) : (
                  <Link href={c.url.replace(baseUrl, '') || '/'} className="hover:text-brand-red transition-colors">
                    {c.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex items-center gap-3 mb-2.5">
          <div className="w-10 h-[2px] bg-brand-red" />
          <span className="font-display font-black text-[10px] tracking-[0.35em] uppercase text-brand-red">
            {filters.marka
              ? 'Marka Kataloğu'
              : activeCategory
                ? 'Kategori Kataloğu'
                : 'Profesyonel Ürün Kataloğu'}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase text-white tracking-tight leading-none">
              {filters.marka && !activeCategory
                ? filters.marka
                : activeCategory
                  ? activeCategory.name
                  : 'TÜM ÜRÜNLER'}
            </h1>
            {filters.marka ? (
              <p className="text-xs sm:text-sm text-white/55 mt-2 max-w-xl font-body">
                Tüm orijinal <strong className="text-white">{filters.marka}</strong> profesyonel ses, stüdyo ve sahne sistemleri. Resmi distribütör garantisi ve uzman teknik destek güvencesiyle.
              </p>
            ) : !activeCategory ? (
              <p className="text-xs sm:text-sm text-white/55 mt-2 max-w-xl font-body">
                Profesyonel ses, ışık, görüntü, stüdyo, DJ ve sahne ekipmanlarını kategori ve marka bazlı filtreleyerek inceleyin.
              </p>
            ) : null}

            {/* Aktif Filtre Rozetleri */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {filters.marka && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-red/10 border border-brand-red/25 rounded-full text-xs font-bold text-brand-red font-display tracking-wide">
                    <span>Marka: {filters.marka}</span>
                    <Link
                      href={categoryPath}
                      className="hover:bg-brand-red hover:text-white rounded-full p-0.5 transition-colors"
                      title="Filtreyi Temizle"
                    >
                      <X size={12} />
                    </Link>
                  </span>
                )}
                {filters.q && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/15 rounded-full text-xs font-bold text-white/80 font-display tracking-wide">
                    <span>Arama: &quot;{filters.q}&quot;</span>
                    <Link
                      href={categoryPath}
                      className="hover:text-brand-red rounded-full p-0.5 transition-colors"
                      title="Aramayı Temizle"
                    >
                      <X size={12} />
                    </Link>
                  </span>
                )}
                {filters.stok && filters.stok !== 'tum' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-xs font-bold text-emerald-500 font-display tracking-wide">
                    <span>{filters.stok === 'stokta' ? 'Sadece Stoktakiler' : 'Siparişe Göre'}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="w-full md:w-[420px] shrink-0">
            <ProductSearch fullPage />
          </div>
        </div>
      </div>

      {/* Sescim 2 Kolonlu Katalog Düzeni: Sol Filtre Sidebar + Sağ Ürünler ve Alt Kategoriler */}
      <div
        id="tum-urunler-grid"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 flex flex-col lg:flex-row gap-8 scroll-mt-24"
      >
        {/* Sol Sidebar Filtreler */}
        <div className="w-full lg:w-[270px] xl:w-[290px] flex-shrink-0">
          <ProductFilters
            markalar={markalar}
            kullanimAlanlari={kullanimAlanlari}
            searchParams={searchParams}
            slugArray={slugArray}
          />
        </div>

        {/* Sağ Ana İçerik */}
        <div className="w-full lg:flex-1 min-w-0">
          {/* Dinamik Kategori Gezgini (Sescim Stili) */}
          <div className="mb-7">
            {!activeCategory ? (
              <div className="flex flex-wrap gap-2">
                {NEW_KATEGORI_HIYERARSI.map((kat) => (
                  <Link
                    key={kat.slug}
                    href={
                      filters.marka
                        ? `/urunler/${kat.slug}?marka=${encodeURIComponent(filters.marka)}`
                        : `/urunler/${kat.slug}`
                    }
                    className="font-display font-bold text-[11px] tracking-widest uppercase px-4 py-2.5 rounded-lg border border-white/10 bg-[#141414] text-white/70 hover:border-brand-red/50 hover:text-brand-red transition-all duration-200"
                  >
                    {kat.name}
                  </Link>
                ))}
              </div>
            ) : activeCategory.children && activeCategory.children.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/50">
                  <span className="font-display font-bold text-[10px] uppercase tracking-[0.28em] whitespace-nowrap">
                    ALT KATEGORİLER
                  </span>
                  <div className="h-px bg-white/10 flex-1" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeCategory.children.map((child: any) => (
                    <Link
                      key={child.slug}
                      href={
                        filters.marka
                          ? `/urunler/${slugArray.join('/')}/${child.slug}?marka=${encodeURIComponent(filters.marka)}`
                          : `/urunler/${slugArray.join('/')}/${child.slug}`
                      }
                      className="font-display font-bold text-[11px] tracking-wider uppercase px-4 py-2 rounded-lg border border-brand-red/20 bg-brand-red/5 text-brand-red hover:bg-brand-red hover:text-white transition-all"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Sonuç Sayacı & Sayfa Göstergesi */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="font-display font-bold text-xs tracking-widest text-white/55 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                TOPLAM <strong className="text-white ml-0.5">{count || 0}</strong> ÜRÜN LİSTELENİYOR
              </span>
            </div>
            {count && count > 0 ? (
              <div className="font-body text-xs text-white/45">
                SAYFA {sayfa} / {totalPages}
              </div>
            ) : null}
          </div>

          {/* Ürün Grid */}
          <Suspense key={`suspense-${categoryPath}-${sayfa}`} fallback={<GridSkeleton />}>
            <ProductGrid
              key={`products-${categoryPath}-${sayfa}`}
              products={products || []}
              searchQuery={searchParams.q}
            />
          </Suspense>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="mt-16">
              <Pagination
                currentPage={sayfa}
                totalPages={totalPages}
                baseParams={baseParams.toString()}
                basePath={categoryPath}
              />
            </div>
          )}

          {/* Kategori SEO Rehber & Uzman Notu (Sescim Birebir Yapısı) */}
          <CategorySeoText
            categorySlug={slugArray[slugArray.length - 1] || activeCategory?.slug}
            categoryName={filters.marka ? `${filters.marka} Profesyonel Ekipmanları` : activeCategory?.name}
          />
        </div>
      </div>
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-[#141414] border border-white/10 rounded-xl h-[380px] overflow-hidden">
          <div className="aspect-square bg-white/[0.03] animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse" />
            <div className="pt-4 flex justify-between items-center">
              <div className="h-5 bg-white/10 rounded w-1/3 animate-pulse" />
              <div className="h-8 bg-white/10 rounded w-1/4 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
