'use client'

import { useEffect, useState, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, GitCompare, Heart, MessageCircle, Package, Search, ShoppingCart, Check, Tag } from 'lucide-react'
import { dovizToTL, formatFiyat, type KurData } from '@/lib/kur'
import { addToCart } from '@/lib/cart'
import {
  getCompareList,
  isCompared,
  isFavorite,
  toggleCompare,
  toggleFavorite,
  type SavedProduct,
} from '@/lib/product-lists'
import { createClient } from '@/lib/supabase'

interface Product {
  id: string
  slug?: string
  ad: string
  aciklama?: string
  kategori: string
  fotograflar: string[]
  fiyat?: number
  bayi_fiyati?: number
  para_birimi?: string
  bayi_para_birimi?: string
  stok_durumu?: string
  fiyat_guncelleme?: string
  stok_adedi?: number | null
  kritik_stok?: number | null
  marka?: string | null
  kullanim_alani?: string | null
}

interface Props {
  products: Product[]
  suggested?: Product[] | null
  searchQuery?: string
  isBayi?: boolean
  showPrice?: boolean
}

import { getKurClient } from '@/lib/kur-client'

function useKur() {
  const [kur, setKur] = useState<KurData>({ USD: 32.5, EUR: 35.2, guncelleme: null })
  useEffect(() => {
    getKurClient().then(setKur)
  }, [])
  return kur
}

export default function ProductGrid({ products, suggested, searchQuery, isBayi = false, showPrice: showPriceProp }: Props) {
  const kur = useKur()
  const [compareCount, setCompareCount] = useState(0)
  const [authChecked, setAuthChecked] = useState(false)
  const [isBayiAuth, setIsBayiAuth] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then((res: any) => {
      const session = res.data?.session
      if (session?.user) {
        supabase.from('bayiler').select('onaylandi').eq('user_id', session.user.id).maybeSingle()
          .then(({ data }: any) => {
            setIsBayiAuth(!!data?.onaylandi)
            setAuthChecked(true)
          })
      } else {
        setAuthChecked(true)
      }
    })
  }, [])

  const showPrice = isBayi || isBayiAuth

  useEffect(() => {
    const sync = () => setCompareCount(getCompareList().length)
    sync()
    window.addEventListener('product-lists-updated', sync)
    return () => window.removeEventListener('product-lists-updated', sync)
  }, [])

  if (products.length === 0) {
    return (
      <div>
        {compareCount > 0 && (
          <div className="mb-5 flex items-center justify-between border border-white/10 bg-[#141414] px-4 py-3">
            <span className="font-body text-white/50 text-sm">{compareCount} ürün karşılaştırma listesinde</span>
            <Link href="/karsilastir" className="btn-outline text-xs">Karşılaştırmaya Git</Link>
          </div>
        )}
        <div className="text-center py-20 border border-white/5 bg-[#141414] mb-12">
          <Search size={40} className="text-white/10 mx-auto mb-4" />
          <p className="font-display font-bold text-lg uppercase text-white/20 tracking-widest mb-2">Sonuç Bulunamadı</p>
          {searchQuery && (
            <p className="font-body text-white/20 text-sm">
              &quot;<span className="text-white/40">{searchQuery}</span>&quot; için ürün bulunamadı.
            </p>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/urunler" className="btn-outline text-xs">Tüm Ürünleri Gör</Link>
            <Link href="/iletisim" className="btn-primary text-xs">Ürün Sor <ArrowRight size={13} /></Link>
          </div>
        </div>
        {suggested && suggested.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-brand-red" />
              <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-white/40">Bunlara Bakabilirsiniz</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
              {suggested.map(p => <ProductCard key={p.id} product={p} isBayi={isBayi || isBayiAuth} kur={kur} showPrice={showPrice} />)}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {compareCount > 0 && (
        <div className="mb-5 flex items-center justify-between border border-white/10 bg-[#141414] px-4 py-3">
          <span className="font-body text-white/50 text-sm">{compareCount} ürün karşılaştırma listesinde</span>
          <Link href="/karsilastir" className="btn-outline text-xs">Karşılaştırmaya Git</Link>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 md:gap-2">
        {products.map((p, index) => <ProductCard key={p.id} product={p} index={index} isBayi={isBayi || isBayiAuth} kur={kur} showPrice={showPrice} />)}
      </div>
    </>
  )
}

export const ProductCard = memo(function ProductCard({ product, index = 0, isBayi = false, kur, showPrice = false }: { product: Product; index?: number; isBayi?: boolean; kur?: KurData; showPrice?: boolean }) {
  const kurData = kur || { USD: 32.5, EUR: 35.2, guncelleme: null }
  const pb = product.para_birimi || 'TRY'
  const bayiPb = product.bayi_para_birimi || pb

  const hasBayiFiyat = isBayi && product.bayi_fiyati && product.fiyat &&
    dovizToTL(product.bayi_fiyati, bayiPb, kurData) < dovizToTL(product.fiyat, pb, kurData)

  const stok = product.stok_durumu || 'stokta'
  const isRecentUpdate = product.fiyat_guncelleme
    ? (Date.now() - new Date(product.fiyat_guncelleme).getTime()) < 7 * 24 * 60 * 60 * 1000
    : false

  const normalFiyatTL = product.fiyat ? dovizToTL(product.fiyat, pb, kurData) : null
  const bayiFiyatTL = product.bayi_fiyati ? dovizToTL(product.bayi_fiyati, bayiPb, kurData) : null

  const indirimYuzde = hasBayiFiyat && normalFiyatTL && bayiFiyatTL
    ? Math.round((1 - bayiFiyatTL / normalFiyatTL) * 100)
    : 0
  const [fav, setFav] = useState(false)
  const [cmp, setCmp] = useState(false)
  const [cartAdded, setCartAdded] = useState(false)
  const stockCount = product.stok_adedi ?? null
  const isCritical =
    stockCount !== null &&
    product.kritik_stok !== null &&
    product.kritik_stok !== undefined &&
    stockCount <= product.kritik_stok

  useEffect(() => {
    setFav(isFavorite(product.id))
    setCmp(isCompared(product.id))
  }, [product.id])

  const asSaved = (): SavedProduct => ({
    id: product.id,
    ad: product.ad,
    kategori: product.kategori,
    fiyat: product.fiyat,
    para_birimi: product.para_birimi,
    stok_durumu: product.stok_durumu,
    stok_adedi: product.stok_adedi ?? null,
    kritik_stok: product.kritik_stok ?? null,
    marka: product.marka ?? null,
    kullanim_alani: product.kullanim_alani ?? null,
  })

  // Sepete ekleme handler
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!product.fiyat || stok === 'tukendi') return

    const fiyatTL = dovizToTL(product.fiyat, pb, kurData)
    const bayiFiyatTLVal = product.bayi_fiyati ? dovizToTL(product.bayi_fiyati, bayiPb, kurData) : null

    addToCart({
      id: product.id,
      ad: product.ad,
      kategori: product.kategori,
      fotograf: product.fotograflar?.[0] || '',
      fiyat: fiyatTL,
      fiyat_doviz: product.fiyat,
      para_birimi: pb,
      bayi_fiyati: bayiFiyatTLVal,
      bayi_fiyat_doviz: product.bayi_fiyati || null,
      bayi_para_birimi: bayiPb,
    })
    setCartAdded(true)
    setTimeout(() => setCartAdded(false), 2000)
  }

  // WhatsApp handler (window.open ile)
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(
      `https://wa.me/905323934370?text=${encodeURIComponent(`Merhaba, ${product.ad} ürünü hakkında fiyat bilgisi almak istiyorum.`)}`,
      '_blank'
    )
  }

  return (
    <div className="product-card group relative bg-[#141414] border border-white/5 overflow-hidden hover:border-brand-red/30 flex flex-col">
      {/* Tıklanabilir alan — Link ile sarılı (SEO + navigasyon) */}
      <Link href={`/urun/${product.slug || product.id}`} className="flex flex-col flex-1">
        {/* Görsel */}
        <div className="aspect-square bg-[#1A1A1A] relative overflow-hidden">
          {product.fotograflar?.[0] ? (
            <Image src={product.fotograflar[0]} alt={product.ad} fill
              priority={index < 8}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={40} className="text-white/10" />
            </div>
          )}

          {hasBayiFiyat && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-brand-red text-white px-2 py-0.5">
              <Tag size={9} />
              <span className="font-display font-black text-xs">BAYİ ÖZEL</span>
            </div>
          )}
          {isRecentUpdate && !hasBayiFiyat && (
            <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-0.5 font-display font-black text-xs">
              YENİ FİYAT
            </div>
          )}
          {stok === 'tukendi' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="font-display font-black text-sm uppercase tracking-widest text-white/60">Tükendi</span>
            </div>
          )}
          {stok === 'siparise_gore' && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-black px-2 py-0.5 font-display font-black text-[9px] uppercase tracking-wider">
              Siparişe Göre
            </div>
          )}
        </div>

        {/* İçerik */}
        <div className="p-4 flex flex-col flex-1">
          <div className="font-display font-semibold text-xs tracking-widest uppercase text-brand-red/60 mb-1">{product.kategori}</div>
          <h3 className="font-display font-bold text-sm uppercase tracking-wide text-white group-hover:text-brand-red transition-colors leading-tight mb-3 flex-1">
            {product.ad}
          </h3>
          {(product.marka || product.kullanim_alani) && (
            <p className="font-body text-white/35 text-xs mb-3">
              {product.marka ? `Marka: ${product.marka}` : ''}
              {product.marka && product.kullanim_alani ? ' • ' : ''}
              {product.kullanim_alani || ''}
            </p>
          )}

          <div className="mt-auto space-y-0.5">
            {showPrice ? (
              <>
                {hasBayiFiyat && bayiFiyatTL && normalFiyatTL ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="font-body text-white/25 text-xs line-through">
                        {formatFiyat(product.fiyat!, pb)}
                      </span>
                      <span className="font-display font-black text-xs bg-brand-red/10 text-brand-red px-1.5 py-0.5">
                        %{indirimYuzde} İND
                      </span>
                    </div>
                    <div className="font-display font-black text-lg text-brand-red">
                      {formatFiyat(product.bayi_fiyati!, bayiPb)}
                    </div>
                    <div className="font-body text-white/30 text-xs">
                      ≈ {bayiFiyatTL.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                    </div>
                  </>
                ) : product.fiyat ? (
                  <>
                    <div className="font-display font-black text-lg text-white">
                      {formatFiyat(product.fiyat, pb)}
                    </div>
                    {pb !== 'TRY' && normalFiyatTL && (
                      <div className="font-body text-white/25 text-xs">
                        ≈ {normalFiyatTL.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                      </div>
                    )}
                  </>
                ) : (
                  <span className="font-body text-white/25 text-xs">Fiyat için iletişime geçin</span>
                )}
              </>
            ) : (
              /* Fiyat gizli — WhatsApp bilgi metni (link değil, düz text) */
              <div className="flex items-center gap-1 text-white/30 pt-1">
                <span className="font-display font-semibold text-[10px] tracking-wider uppercase">Fiyat için alttan ulaşın</span>
              </div>
            )}

            {product.fiyat_guncelleme && showPrice && (
              <div className="font-body text-white/15 text-[10px]">
                {new Date(product.fiyat_guncelleme).toLocaleDateString('tr-TR')}
              </div>
            )}
            {stockCount !== null && (
              <div className={`mt-2 font-display font-bold text-[10px] tracking-wider uppercase ${isCritical ? 'text-brand-red animate-pulse' : 'text-white/20'}`}>
                {stockCount <= 0 ? (
                  <span className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-sm">
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                    STOKTA YOK
                  </span>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1 h-1 rounded-full ${isCritical ? 'bg-brand-red' : 'bg-green-500'}`} />
                      {stockCount > 20 ? 'STOKTA: 20+ ADET' : `STOKTA: ${stockCount} ADET`}
                    </div>
                    {isCritical && <span className="text-[9px] text-brand-red/60 leading-none">SON ÜRÜNLER!</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Alt butonlar — Favori, Karşılaştır, Sepete Ekle */}
      <div className="border-t border-white/5 p-2">
        {showPrice && product.fiyat && stok !== 'tukendi' ? (
          /* Bayi giriş yapmış veya fiyat görünen kullanıcı — Sepete Ekle butonu */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
            <button
              type="button"
              className={`hidden md:flex items-center justify-center px-2 py-1.5 border text-xs transition-all duration-200 ${fav ? 'border-brand-red text-brand-red bg-brand-red/10' : 'border-white/10 text-white/40 hover:border-brand-red hover:text-brand-red'}`}
              onClick={(e) => { e.stopPropagation(); setFav(toggleFavorite(asSaved())) }}
            >
              <Heart size={12} />
            </button>
            <button
              type="button"
              className={`hidden md:flex items-center justify-center px-2 py-1.5 border text-xs transition-all duration-200 ${cmp ? 'border-brand-red text-brand-red bg-brand-red/10' : 'border-white/10 text-white/40 hover:border-brand-red hover:text-brand-red'}`}
              onClick={(e) => {
                e.stopPropagation()
                const next = toggleCompare(asSaved())
                if (next.overflow) { alert('Karşılaştırma listesi en fazla 4 ürün olabilir.'); return }
                setCmp(next.active)
              }}
            >
              <GitCompare size={12} />
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex items-center justify-center gap-1 text-xs font-display font-semibold uppercase tracking-wider px-2 py-1.5 border transition-all duration-300 ${
                cartAdded
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-brand-red border-brand-red text-white hover:bg-brand-red/80'
              }`}
            >
              {cartAdded ? <Check size={12} /> : <ShoppingCart size={12} />}
              {cartAdded ? '✓' : 'Ekle'}
            </button>
          </div>
        ) : (
          /* Fiyat gizli veya stok yok — Favori, Karşılaştır, WhatsApp */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
            <button
              type="button"
              className={`hidden md:flex items-center justify-center px-2 py-1.5 border text-xs transition-all duration-200 ${fav ? 'border-brand-red text-brand-red bg-brand-red/10' : 'border-white/10 text-white/40 hover:border-brand-red hover:text-brand-red'}`}
              onClick={() => setFav(toggleFavorite(asSaved()))}
            >
              <Heart size={12} />
            </button>
            <button
              type="button"
              className={`hidden md:flex items-center justify-center px-2 py-1.5 border text-xs transition-all duration-200 ${cmp ? 'border-brand-red text-brand-red bg-brand-red/10' : 'border-white/10 text-white/40 hover:border-brand-red hover:text-brand-red'}`}
              onClick={() => {
                const next = toggleCompare(asSaved())
                if (next.overflow) { alert('Karşılaştırma listesi en fazla 4 ürün olabilir.'); return }
                setCmp(next.active)
              }}
            >
              <GitCompare size={12} />
            </button>
            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-1 text-xs font-display font-semibold uppercase tracking-wider px-2 py-1.5 bg-green-600 border border-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <MessageCircle size={12} />
              WhatsApp
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-red group-hover:w-full transition-all duration-500" />
    </div>
  )
})
