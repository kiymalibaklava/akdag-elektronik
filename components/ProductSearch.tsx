'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, ArrowRight, Layers, Tag, Package, ChevronRight, Loader2, Sparkles, FolderTree } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { SEARCH_SUGGESTION_FIELDS } from '@/lib/product-queries'
import { getAllFlattenedCategories, type FlattenedCategory } from '@/lib/categories'

interface Product {
  id: string
  slug?: string
  ad: string
  kategori: string
  fotograflar: string[]
  marka?: string | null
  fiyat?: number | null
  para_birimi?: string | null
}

function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim()
}

export default function ProductSearch({ fullPage = false }: { fullPage?: boolean }) {
  const [query, setQuery] = useState('')
  const [productResults, setProductResults] = useState<Product[]>([])
  const [categoryResults, setCategoryResults] = useState<FlattenedCategory[]>([])
  const [brandResults, setBrandResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = useRef(createClient()).current

  // Tüm kategorileri bellekte tut (0ms eşleşme)
  const allCategories = useRef<FlattenedCategory[]>(getAllFlattenedCategories()).current

  useEffect(() => {
    const cleanQuery = query.trim()
    if (!cleanQuery || cleanQuery.length < 2) {
      setProductResults([])
      setCategoryResults([])
      setBrandResults([])
      setOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)

      // 1. Kategoriler & Alt Kategoriler eşleşmesi (client-side anlık filtreleme)
      const normalizedQuery = normalizeSearch(cleanQuery)
      const matchedCats = allCategories
        .filter(cat => {
          const normName = normalizeSearch(cat.name)
          const normHier = normalizeSearch(cat.hierarchyText)
          return normName.includes(normalizedQuery) || normHier.includes(normalizedQuery)
        })
        .slice(0, 4)

      setCategoryResults(matchedCats)

      try {
        // 2. Marka eşleşmesi (Supabase'den benzersiz markaları çek)
        const brandPromise = supabase
          .from('urunler')
          .select('marka')
          .ilike('marka', `%${cleanQuery}%`)
          .limit(20)

        // 3. Ürün eşleşmesi
        const productPromise = supabase
          .from('urunler')
          .select(`${SEARCH_SUGGESTION_FIELDS}, marka, fiyat, para_birimi`)
          .or(`ad.ilike.%${cleanQuery}%,marka.ilike.%${cleanQuery}%,model_kodu.ilike.%${cleanQuery}%`)
          .limit(5)

        const [brandRes, prodRes] = await Promise.all([brandPromise, productPromise])

        // Benzersiz markaları al
        if (brandRes.data) {
          const uniqueBrands = Array.from(
            new Set(brandRes.data.map((r: any) => r.marka).filter(Boolean))
          ).slice(0, 4) as string[]
          setBrandResults(uniqueBrands)
        } else {
          setBrandResults([])
        }

        // Ürün sonuçları
        setProductResults((prodRes.data as any) || [])
        setOpen(true)
      } catch (err) {
        console.error('Arama hatası:', err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, allCategories, supabase])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setOpen(false)
    router.push(`/urunler?q=${encodeURIComponent(query.trim())}`)
  }

  const clear = () => {
    setQuery('')
    setProductResults([])
    setCategoryResults([])
    setBrandResults([])
    setOpen(false)
    inputRef.current?.focus()
  }

  const hasAnyResults = categoryResults.length > 0 || brandResults.length > 0 || productResults.length > 0

  return (
    <div className={`relative ${fullPage ? 'w-full' : 'w-full max-w-2xl mx-auto'}`}>
      {/* ── ARAMA INPUTU ──────────────────────────────────── */}
      <form onSubmit={handleSearch} className="relative flex items-center">
        <Search size={18} className="absolute left-4 text-brand-red flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 250)}
          placeholder="Ürün, marka veya kategori arayın... (JBL, hoparlör, mikser...)"
          className="input-dark rounded-2xl pl-12 pr-24 py-3.5 text-sm sm:text-base shadow-sm focus:ring-2 focus:ring-brand-red/20 transition-all font-body placeholder:text-white/30"
        />
        
        {loading && (
          <div className="absolute right-14">
            <Loader2 size={16} className="text-brand-red animate-spin" />
          </div>
        )}
        
        {query && (
          <div className="absolute right-3.5 flex items-center gap-1.5">
            <button 
              type="button" 
              onClick={clear} 
              className="p-1 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              title="Temizle"
            >
              <X size={15} />
            </button>
            <button 
              type="submit" 
              className="w-8 h-8 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white flex items-center justify-center transition-all shadow-sm"
              title="Ara"
            >
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </form>

      {/* ── GELİŞMİŞ DROPDOWN SONUÇLARI ───────────────────── */}
      {open && hasAnyResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[75vh] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* 1. BÖLÜM: KATEGORİLER VE ALT KATEGORİLER */}
          {categoryResults.length > 0 && (
            <div className="p-3 border-b border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-1.5 px-2 pb-2 text-[10px] font-display font-bold uppercase tracking-wider text-brand-red">
                <FolderTree size={12} />
                <span>Kategoriler & Alt Kategoriler</span>
              </div>
              <div className="space-y-1">
                {categoryResults.map((cat) => (
                  <Link
                    key={cat.path}
                    href={cat.path}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-brand-red/5 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-brand-red transition-colors flex items-center gap-2">
                        <span>{cat.name}</span>
                        <span className="text-[10px] font-normal uppercase tracking-wider text-white/50 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                          {cat.level === 1 ? 'Ana Kategori' : cat.level === 2 ? 'Alt Kategori' : '3. Seviye Tip'}
                        </span>
                      </div>
                      <div className="text-[11px] text-white/50 truncate mt-0.5">
                        {cat.hierarchyText}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-white/30 group-hover:text-brand-red group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 2. BÖLÜM: MARKALAR */}
          {brandResults.length > 0 && (
            <div className="p-3 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-1.5 px-2 pb-2 text-[10px] font-display font-bold uppercase tracking-wider text-amber-500">
                <Tag size={12} />
                <span>Eşleşen Markalar</span>
              </div>
              <div className="flex flex-wrap gap-2 px-1">
                {brandResults.map((brand) => (
                  <Link
                    key={brand}
                    href={`/urunler?marka=${encodeURIComponent(brand)}`}
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-brand-red/10 border border-white/10 hover:border-brand-red/30 text-xs font-semibold text-white hover:text-brand-red transition-all group"
                  >
                    <span>{brand}</span>
                    <span className="text-[10px] text-white/40 group-hover:text-brand-red">Marka</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 3. BÖLÜM: ÜRÜNLER */}
          {productResults.length > 0 && (
            <div className="p-3">
              <div className="flex items-center gap-1.5 px-2 pb-2 text-[10px] font-display font-bold uppercase tracking-wider text-white/50">
                <Package size={12} />
                <span>Ürünler</span>
              </div>
              <div className="space-y-1">
                {productResults.map((product) => (
                  <Link
                    href={`/urun/${product.slug || product.id}`}
                    key={product.id}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-brand-red/5 transition-colors group"
                  >
                    {/* Ürün Görseli */}
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex-shrink-0 relative overflow-hidden">
                      {product.fotograflar?.[0] ? (
                        <Image
                          src={product.fotograflar[0]}
                          alt={product.ad}
                          fill
                          sizes="48px"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <Package size={18} />
                        </div>
                      )}
                    </div>

                    {/* Ürün Bilgisi */}
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-xs sm:text-sm text-white group-hover:text-brand-red transition-colors uppercase tracking-wide truncate">
                        {product.ad}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {product.marka && (
                          <span className="text-[10px] text-white/70 bg-white/5 border border-white/10 px-1.5 py-0.2 rounded font-medium">
                            {product.marka}
                          </span>
                        )}
                        <span className="text-[11px] text-white/40 truncate">
                          {product.kategori}
                        </span>
                      </div>
                    </div>

                    <ArrowRight size={14} className="text-white/20 group-hover:text-brand-red group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* TÜM SONUÇLARI GÖR DÜĞMESİ */}
          <Link
            href={`/urunler?q=${encodeURIComponent(query.trim())}`}
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 p-3.5 bg-white/5 border-t border-white/10 text-brand-red font-display font-bold text-xs tracking-wider uppercase hover:bg-brand-red/10 transition-colors"
          >
            <span>&ldquo;{query}&rdquo; için tüm ürün ve sonuçları listele</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* SONUÇ BULUNAMADI */}
      {open && query.trim().length >= 2 && !hasAnyResults && !loading && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-[#141414] border border-white/10 rounded-2xl p-6 text-center shadow-2xl">
          <p className="font-body text-white/40 text-sm">
            &ldquo;<span className="text-white font-medium">{query}</span>&rdquo; ile eşleşen ürün, marka veya kategori bulunamadı.
          </p>
        </div>
      )}
    </div>
  )
}
