import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import ProductSearch from '@/components/ProductSearch'
import ProductGrid from '@/components/ProductGrid'
import Pagination from '@/components/Pagination'

export const metadata = {
  title: 'Ürünler | Akdağ Elektronik',
  description: 'Ses, ışık ve görüntü sistemleri ürünleri. AKUSTEK okul saati ve otomasyon sistemleri.',
}

const KATEGORILER = [
  'Tümü',
  'Ses Sistemleri',
  'Işık Sistemleri',
  'Görüntü Sistemleri',
  'Okul Saat Sistemleri',
  'Simultune Sistemleri',
  'Aksesuarlar',
]

const PER_PAGE = 16

export default async function UrunlerPage({
  searchParams,
}: {
  searchParams: { q?: string; kategori?: string; sayfa?: string }
}) {
  const supabase = await createServerSupabaseClient()
  const sayfa = Math.max(1, parseInt(searchParams.sayfa || '1'))
  const from = (sayfa - 1) * PER_PAGE
  const to = from + PER_PAGE - 1

  let query = supabase
    .from('urunler')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (searchParams.q) {
    query = query.ilike('ad', `%${searchParams.q}%`)
  }
  if (searchParams.kategori && searchParams.kategori !== 'Tümü') {
    query = query.eq('kategori', searchParams.kategori)
  }

  const { data: products, count } = await query
  const totalPages = Math.ceil((count || 0) / PER_PAGE)

  // Boş durum için öneri ürünleri
  let suggested = null
  if ((products?.length === 0) && searchParams.q) {
    const { data } = await supabase
      .from('urunler')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4)
    suggested = data
  }

  const activeKategori = searchParams.kategori || 'Tümü'
  const baseParams = new URLSearchParams()
  if (searchParams.q) baseParams.set('q', searchParams.q)
  if (searchParams.kategori) baseParams.set('kategori', searchParams.kategori)

  return (
    <div className="min-h-screen pt-8 pb-24">
      {/* Header */}
      <div className="bg-[#0A0A0A] border-b border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-brand-red" />
            <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Kataloğumuz</span>
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl uppercase text-white mb-6">
            TÜM<br /><span className="text-brand-red">ÜRÜNLER</span>
          </h1>
          <div className="max-w-2xl">
            <ProductSearch fullPage />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12">
        {/* Kategori filtresi */}
        <div className="flex flex-wrap gap-2 mb-8">
          {KATEGORILER.map((kat) => {
            const params = new URLSearchParams()
            if (searchParams.q) params.set('q', searchParams.q)
            params.set('kategori', kat)
            return (
              <a
                key={kat}
                href={`/urunler?${params.toString()}`}
                className={`font-display font-semibold text-xs tracking-widest uppercase px-4 py-2 border transition-all duration-200 ${
                  activeKategori === kat
                    ? 'bg-brand-red border-brand-red text-white'
                    : 'border-white/10 text-white/40 hover:border-brand-red/40 hover:text-white'
                }`}
              >
                {kat}
              </a>
            )
          })}
        </div>

        {/* Sonuç sayısı */}
        <div className="font-body text-white/30 text-sm mb-8 flex items-center justify-between">
          <span>
            {count || 0} ürün bulundu
            {searchParams.q && (
              <span> — "<span className="text-white">{searchParams.q}</span>" araması</span>
            )}
          </span>
          {count && count > 0 && (
            <span className="text-white/20">
              Sayfa {sayfa} / {totalPages}
            </span>
          )}
        </div>

        {/* Ürünler */}
        <Suspense fallback={<GridSkeleton />}>
          <ProductGrid products={products || []} suggested={suggested} searchQuery={searchParams.q} />
        </Suspense>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={sayfa}
            totalPages={totalPages}
            baseParams={baseParams.toString()}
          />
        )}
      </div>
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-[#141414] border border-white/5">
          <div className="aspect-square bg-white/5 animate-pulse" />
          <div className="p-5 space-y-2">
            <div className="w-20 h-2.5 bg-white/5 animate-pulse" />
            <div className="w-full h-4 bg-white/5 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
