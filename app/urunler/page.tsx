import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import ProductSearch from '@/components/ProductSearch'
import ProductGrid from '@/components/ProductGrid'
import Pagination from '@/components/Pagination'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Ürünler | Akdağ Elektronik',
  description: 'Ses, ışık ve görüntü sistemleri ürünleri. AKUSTEK okul saati ve otomasyon sistemleri.',
}

import { TUM_KATEGORILER, KATEGORI_HIYERARSI } from '@/lib/categories'

const KATEGORILER = TUM_KATEGORILER

const PER_PAGE = 16

export default async function UrunlerPage({
  searchParams,
}: {
  searchParams: {
    q?: string
    kategori?: string
    sayfa?: string
    min?: string
    max?: string
    stok?: string
    marka?: string
    kullanim?: string
    alt?: string
    urun_tipi?: string
  }
}) {
  const supabase = await createServerSupabaseClient()
  const sayfa = Math.max(1, parseInt(searchParams.sayfa || '1'))
  const from = (sayfa - 1) * PER_PAGE
  const to = from + PER_PAGE - 1
  const min = searchParams.min ? Number(searchParams.min) : null
  const max = searchParams.max ? Number(searchParams.max) : null

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
  if (searchParams.alt) {
    query = query.eq('alt_kategori', searchParams.alt)
  }
  if (searchParams.urun_tipi) {
    query = query.eq('urun_tipi', searchParams.urun_tipi)
  }
  if (min !== null && !Number.isNaN(min)) {
    query = query.gte('fiyat', min)
  }
  if (max !== null && !Number.isNaN(max)) {
    query = query.lte('fiyat', max)
  }
  if (searchParams.stok && searchParams.stok !== 'tum') {
    query = query.eq('stok_durumu', searchParams.stok)
  }
  if (searchParams.marka && searchParams.marka !== 'tum') {
    query = query.eq('marka', searchParams.marka)
  }
  if (searchParams.kullanim && searchParams.kullanim !== 'tum') {
    query = query.eq('kullanim_alani', searchParams.kullanim)
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
  const { data: filterRows } = await supabase
    .from('urunler')
    .select('marka, kullanim_alani')
    .order('created_at', { ascending: false })
    .limit(300)

  const markalar = Array.from(new Set((filterRows || []).map((r) => r.marka).filter(Boolean))) as string[]
  const kullanimAlanlari = Array.from(new Set((filterRows || []).map((r) => r.kullanim_alani).filter(Boolean))) as string[]

  const baseParams = new URLSearchParams()
  if (searchParams.q) baseParams.set('q', searchParams.q)
  if (searchParams.kategori) baseParams.set('kategori', searchParams.kategori)
  if (searchParams.min) baseParams.set('min', searchParams.min)
  if (searchParams.max) baseParams.set('max', searchParams.max)
  if (searchParams.stok) baseParams.set('stok', searchParams.stok)
  if (searchParams.marka) baseParams.set('marka', searchParams.marka)
  if (searchParams.kullanim) baseParams.set('kullanim', searchParams.kullanim)
  if (searchParams.alt) baseParams.set('alt', searchParams.alt)
  if (searchParams.urun_tipi) baseParams.set('urun_tipi', searchParams.urun_tipi)

  // Alt kategori kırılımları
  const activeAna = KATEGORI_HIYERARSI.find(k => k.label === activeKategori)
  const altKategoriler = activeAna?.altKategoriler || []
  const activeAlt = searchParams.alt || ''
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
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-8">
          <input name="q" defaultValue={searchParams.q || ''} className="input-dark" placeholder="Metin ara..." />
          <input name="min" type="number" min="0" defaultValue={searchParams.min || ''} className="input-dark" placeholder="Min fiyat" />
          <input name="max" type="number" min="0" defaultValue={searchParams.max || ''} className="input-dark" placeholder="Max fiyat" />
          <select name="stok" defaultValue={searchParams.stok || 'tum'} className="input-dark appearance-none">
            <option value="tum">Tüm stoklar</option>
            <option value="stokta">Stokta</option>
            <option value="siparise_gore">Siparişe Göre</option>
            <option value="tukendi">Tükendi</option>
          </select>
          <select name="marka" defaultValue={searchParams.marka || 'tum'} className="input-dark appearance-none">
            <option value="tum">Tüm markalar</option>
            {markalar.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select name="kullanim" defaultValue={searchParams.kullanim || 'tum'} className="input-dark appearance-none">
            <option value="tum">Tüm kullanım alanları</option>
            {kullanimAlanlari.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <input type="hidden" name="kategori" value={activeKategori} />
          <button className="btn-primary text-xs lg:col-span-1" type="submit">Filtrele</button>
          <a href="/urunler" className="btn-outline text-xs lg:col-span-1">Temizle</a>
        </form>

        {/* Kategori filtresi */}
        <div className="flex flex-wrap gap-2 mb-8">
          {KATEGORILER.map((kat) => {
            const params = new URLSearchParams()
            if (searchParams.q) params.set('q', searchParams.q)
            if (searchParams.min) params.set('min', searchParams.min)
            if (searchParams.max) params.set('max', searchParams.max)
            if (searchParams.stok) params.set('stok', searchParams.stok)
            if (searchParams.marka) params.set('marka', searchParams.marka)
            if (searchParams.kullanim) params.set('kullanim', searchParams.kullanim)
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

        {/* Alt kategori filtreleri */}
        {altKategoriler.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="font-display font-semibold text-[10px] tracking-widest uppercase text-white/25 self-center mr-2">Alt Filtre:</span>
            {altKategoriler.map((alt) => {
              const params = new URLSearchParams()
              if (searchParams.q) params.set('q', searchParams.q)
              if (searchParams.min) params.set('min', searchParams.min)
              if (searchParams.max) params.set('max', searchParams.max)
              if (searchParams.stok) params.set('stok', searchParams.stok)
              if (searchParams.marka) params.set('marka', searchParams.marka)
              if (searchParams.kullanim) params.set('kullanim', searchParams.kullanim)
              params.set('kategori', activeKategori)
              if (activeAlt === alt.label) {
                // Tıklanmışsa kaldır
              } else {
                params.set('alt', alt.label)
              }
              return (
                <a
                  key={alt.label}
                  href={`/urunler?${params.toString()}`}
                  className={`font-body text-xs px-3 py-1.5 border transition-all duration-200 ${
                    activeAlt === alt.label
                      ? 'bg-brand-red/20 border-brand-red/40 text-brand-red'
                      : 'border-white/5 text-white/30 hover:border-brand-red/20 hover:text-white/60'
                  }`}
                >
                  {alt.label}
                </a>
              )
            })}
          </div>
        )}

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
