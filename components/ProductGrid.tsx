'use client'

import { useEffect, useState, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Heart, MessageCircle, Package, Search, ShoppingCart, Check, Tag } from 'lucide-react'
import { dovizToTL, formatFiyat, type KurData } from '@/lib/kur'
import { addToCart } from '@/lib/cart'
import {
  isFavorite,
  toggleFavorite,
  type SavedProduct,
} from '@/lib/product-lists'
import { createClient } from '@/lib/supabase'
import { getBayiStatus } from '@/lib/bayi-client'

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
  const [authChecked, setAuthChecked] = useState(false)
  const [isBayiAuth, setIsBayiAuth] = useState(false)
  const [dealerPrices, setDealerPrices] = useState<Record<string, { bayi_fiyati: number; bayi_para_birimi: string }>>({})

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async (res: any) => {
      const session = res.data?.session
      if (session?.user) {
        const approved = await getBayiStatus(supabase, session.user.id)
        if (approved) {
          setIsBayiAuth(true)
          const allItems = [...products, ...(suggested || [])]
          const pIds = Array.from(new Set(allItems.map(p => p.id))).filter(Boolean)
          if (pIds.length > 0) {
            const { data: dpList } = await supabase
              .from('urunler')
              .select('id, bayi_fiyati, bayi_para_birimi')
              .in('id', pIds)

            if (dpList) {
              const map: Record<string, { bayi_fiyati: number; bayi_para_birimi: string }> = {}
              for (const item of dpList) {
                if (item.bayi_fiyati) {
                  map[item.id] = {
                    bayi_fiyati: item.bayi_fiyati,
                    bayi_para_birimi: item.bayi_para_birimi || 'TRY'
                  }
                }
              }
              setDealerPrices(map)
            }
          }
        }
        setAuthChecked(true)
      } else {
        setAuthChecked(true)
      }
    })
  }, [products, suggested])

  const showPrice = isBayi || isBayiAuth

  if (products.length === 0) {
    return (
      <div>
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
              {suggested.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  isBayi={isBayi || isBayiAuth} 
                  kur={kur} 
                  showPrice={showPrice} 
                  dealerPrice={dealerPrices[p.id]}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {products.map((p, index) => (
          <ProductCard 
            key={p.id} 
            product={p} 
            index={index} 
            isBayi={isBayi || isBayiAuth} 
            kur={kur} 
            showPrice={showPrice} 
            dealerPrice={dealerPrices[p.id]}
          />
        ))}
      </div>
    </>
  )
}

export const ProductCard = memo(function ProductCard({ 
  product, 
  index = 0, 
  isBayi = false, 
  kur, 
  showPrice = false,
  dealerPrice 
}: { 
  product: Product; 
  index?: number; 
  isBayi?: boolean; 
  kur?: KurData; 
  showPrice?: boolean;
  dealerPrice?: { bayi_fiyati: number; bayi_para_birimi?: string };
}) {
  const kurData = kur || { USD: 32.5, EUR: 35.2, guncelleme: null }
  const pb = product.para_birimi || 'TRY'
  const effectiveBayiFiyati = dealerPrice?.bayi_fiyati ?? product.bayi_fiyati
  const effectiveBayiPb = dealerPrice?.bayi_para_birimi ?? product.bayi_para_birimi ?? pb

  const hasBayiFiyat = isBayi && effectiveBayiFiyati && product.fiyat &&
    dovizToTL(effectiveBayiFiyati, effectiveBayiPb, kurData) < dovizToTL(product.fiyat, pb, kurData)

  const stok = product.stok_durumu || 'stokta'
  const isRecentUpdate = product.fiyat_guncelleme
    ? (Date.now() - new Date(product.fiyat_guncelleme).getTime()) < 7 * 24 * 60 * 60 * 1000
    : false

  const normalFiyatTL = product.fiyat ? dovizToTL(product.fiyat, pb, kurData) : null
  const bayiFiyatTL = effectiveBayiFiyati ? dovizToTL(effectiveBayiFiyati, effectiveBayiPb, kurData) : null

  const indirimYuzde = hasBayiFiyat && normalFiyatTL && bayiFiyatTL
    ? Math.round((1 - bayiFiyatTL / normalFiyatTL) * 100)
    : 0
  const [fav, setFav] = useState(false)
  const [cartAdded, setCartAdded] = useState(false)
  const stockCount = product.stok_adedi ?? null
  const isCritical =
    stockCount !== null &&
    product.kritik_stok !== null &&
    product.kritik_stok !== undefined &&
    stockCount <= product.kritik_stok

  useEffect(() => {
    setFav(isFavorite(product.id))
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
    const bayiFiyatTLVal = effectiveBayiFiyati ? dovizToTL(effectiveBayiFiyati, effectiveBayiPb, kurData) : null

    addToCart({
      id: product.id,
      ad: product.ad,
      kategori: product.kategori,
      fotograf: product.fotograflar?.[0] || '',
      fiyat: fiyatTL,
      fiyat_doviz: product.fiyat,
      para_birimi: pb,
      bayi_fiyati: bayiFiyatTLVal,
      bayi_fiyat_doviz: effectiveBayiFiyati || null,
      bayi_para_birimi: effectiveBayiPb,
    })
    setCartAdded(true)
    setTimeout(() => setCartAdded(false), 2000)
  }

  // WhatsApp handler (window.open ile)
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(
      `https://wa.me/903522316915?text=${encodeURIComponent(`Merhaba, ${product.ad} ürünü hakkında fiyat bilgisi almak istiyorum.`)}`,
      '_blank'
    )
  }

  return (
    <div className="product-card group relative bg-[#141414] border border-white/10 rounded-xl overflow-hidden hover:border-brand-red/40 flex flex-col h-full shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Tıklanabilir alan — Link ile sarılı (SEO + navigasyon) */}
      <Link href={`/urun/${product.slug || product.id}`} prefetch={false} className="flex flex-col flex-1">
        {/* Görsel — Temiz beyaz sahne + object-contain (ürün kırpılmaz) */}
        <div className="aspect-square bg-white relative overflow-hidden border-b border-white/5">
          {product.fotograflar?.[0] ? (
            <Image src={product.fotograflar[0]} alt={product.ad} fill
              priority={index < 8}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-3 transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50">
              <Package size={40} className="text-slate-300" />
            </div>
          )}

          {hasBayiFiyat && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-brand-red text-white px-2 py-0.5 rounded-md shadow-xs">
              <Tag size={9} />
              <span className="font-display font-black text-[10px] tracking-wider">BAYİ ÖZEL</span>
            </div>
          )}
          {isRecentUpdate && !hasBayiFiyat && (
            <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white px-2 py-0.5 rounded-md font-display font-black text-[10px] tracking-wider shadow-xs">
              YENİ FİYAT
            </div>
          )}
          {stok === 'tukendi' && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center z-10">
              <span className="font-display font-black text-xs uppercase tracking-widest bg-black/80 text-white px-3 py-1 rounded">Tükendi</span>
            </div>
          )}
          {stok === 'siparise_gore' && (
            <div className="absolute top-2.5 right-2.5 bg-amber-500 text-black px-2 py-0.5 rounded-md font-display font-black text-[9px] uppercase tracking-wider shadow-xs">
              Siparişe Göre
            </div>
          )}
          {stok === 'stokta' && (
            <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[9px] font-display font-bold uppercase tracking-wider shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              Stokta
            </div>
          )}
        </div>

        {/* İçerik */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1">
          <div className="font-display font-bold text-[10px] tracking-[0.15em] uppercase text-brand-red mb-1 truncate">
            {product.kategori}
          </div>
          <h3 className="font-display font-bold text-xs sm:text-sm uppercase tracking-wide text-white group-hover:text-brand-red transition-colors leading-snug mb-2 line-clamp-2 min-h-[2.4rem]">
            {product.ad}
          </h3>
          {(product.marka || product.kullanim_alani) && (
            <p className="font-body text-white/45 text-[11px] mb-2.5 truncate">
              {product.marka ? `${product.marka}` : ''}
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
                      {formatFiyat(effectiveBayiFiyati!, effectiveBayiPb)}
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
            {stockCount !== null ? (
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
            ) : stok === 'stokta' ? (
              <div className="mt-2 font-display font-bold text-[10px] tracking-wider uppercase text-emerald-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Stokta</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Link>

      {/* Alt butonlar — Favori, Sepete Ekle / WhatsApp */}
      <div className="border-t border-white/10 p-2.5 bg-white/[0.02]">
        {showPrice && product.fiyat && stok !== 'tukendi' ? (
          /* Bayi giriş yapmış veya fiyat görünen kullanıcı — Sepete Ekle butonu */
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Favorilere ekle"
              className={`flex items-center justify-center w-9 h-8 rounded-lg border text-xs transition-all duration-200 shrink-0 ${fav ? 'border-brand-red text-brand-red bg-brand-red/10' : 'border-white/10 text-white/45 hover:border-brand-red hover:text-brand-red'}`}
              onClick={(e) => { e.stopPropagation(); setFav(toggleFavorite(asSaved())) }}
            >
              <Heart size={13} fill={fav ? '#DA291C' : 'none'} />
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-[11px] font-display font-bold uppercase tracking-wider px-2 border transition-all duration-300 ${
                cartAdded
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-brand-red border-brand-red text-white hover:bg-brand-red-dark'
              }`}
            >
              {cartAdded ? <Check size={13} /> : <ShoppingCart size={13} />}
              {cartAdded ? 'Eklendi' : 'Sepete Ekle'}
            </button>
          </div>
        ) : (
          /* Fiyat gizli veya stok yok — Favori + WhatsApp */
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Favorilere ekle"
              className={`flex items-center justify-center w-9 h-8 rounded-lg border text-xs transition-all duration-200 shrink-0 ${fav ? 'border-brand-red text-brand-red bg-brand-red/10' : 'border-white/10 text-white/45 hover:border-brand-red hover:text-brand-red'}`}
              onClick={() => setFav(toggleFavorite(asSaved()))}
            >
              <Heart size={13} fill={fav ? '#DA291C' : 'none'} />
            </button>
            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-[11px] font-display font-bold uppercase tracking-wider px-2 bg-green-600 border border-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <MessageCircle size={13} />
              Teklif / Bilgi
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-red group-hover:w-full transition-all duration-500" />
    </div>
  )
})
