'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Package, Search, Tag } from 'lucide-react'
import { dovizToTL, formatFiyat, type KurData } from '@/lib/kur'

interface Product {
  id: string
  ad: string
  aciklama: string
  kategori: string
  fotograflar: string[]
  fiyat?: number
  bayi_fiyati?: number
  para_birimi?: string
  bayi_para_birimi?: string
  stok_durumu?: string
  fiyat_guncelleme?: string
}

interface Props {
  products: Product[]
  suggested?: Product[] | null
  searchQuery?: string
  isBayi?: boolean
}

function useKur() {
  const [kur, setKur] = useState<KurData>({ USD: 32.5, EUR: 35.2, guncelleme: null })
  useEffect(() => {
    fetch('/api/kur').then(r => r.json()).then(setKur).catch(() => {})
  }, [])
  return kur
}

export default function ProductGrid({ products, suggested, searchQuery, isBayi = false }: Props) {
  const kur = useKur()

  if (products.length === 0) {
    return (
      <div>
        <div className="text-center py-20 border border-white/5 bg-[#141414] mb-12">
          <Search size={40} className="text-white/10 mx-auto mb-4" />
          <p className="font-display font-bold text-lg uppercase text-white/20 tracking-widest mb-2">Sonuç Bulunamadı</p>
          {searchQuery && (
            <p className="font-body text-white/20 text-sm">
              "<span className="text-white/40">{searchQuery}</span>" için ürün bulunamadı.
            </p>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <a href="/urunler" className="btn-outline text-xs">Tüm Ürünleri Gör</a>
            <a href="/iletisim" className="btn-primary text-xs">Ürün Sor <ArrowRight size={13} /></a>
          </div>
        </div>
        {suggested && suggested.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-brand-red" />
              <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-white/40">Bunlara Bakabilirsiniz</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
              {suggested.map(p => <ProductCard key={p.id} product={p} isBayi={isBayi} kur={kur} />)}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
      {products.map(p => <ProductCard key={p.id} product={p} isBayi={isBayi} kur={kur} />)}
    </div>
  )
}

export function ProductCard({ product, isBayi = false, kur }: { product: Product; isBayi?: boolean; kur?: KurData }) {
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

  return (
    <Link href={`/urunler/${product.id}`}
      className="product-card group relative bg-[#141414] border border-white/5 overflow-hidden hover:border-brand-red/30 flex flex-col">
      <div className="aspect-square bg-[#1A1A1A] relative overflow-hidden">
        {product.fotograflar?.[0] ? (
          <Image src={product.fotograflar[0]} alt={product.ad} fill
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
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="font-display font-semibold text-xs tracking-widest uppercase text-brand-red/60 mb-1">{product.kategori}</div>
        <h3 className="font-display font-bold text-sm uppercase tracking-wide text-white group-hover:text-brand-red transition-colors leading-tight mb-3 flex-1">
          {product.ad}
        </h3>

        <div className="mt-auto space-y-0.5">
          {hasBayiFiyat && bayiFiyatTL && normalFiyatTL ? (
            <>
              {/* Bayi görünümü */}
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

          {product.fiyat_guncelleme && (
            <div className="font-body text-white/15 text-[10px]">
              {new Date(product.fiyat_guncelleme).toLocaleDateString('tr-TR')}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-red group-hover:w-full transition-all duration-500" />
    </Link>
  )
}
