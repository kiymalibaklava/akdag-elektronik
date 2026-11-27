'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react'
import { ProductCard } from './ProductGrid'

interface Props {
  products: any[]
}

export default function HomeSecondaryShowcase({ products }: Props) {
  // İkinci vitrinde de Shure, Soundcraft, Behringer, AKG, Sennheiser, Mackie, dBTechnologies, RCF gibi lider markaların farklı modellerini öne çıkar
  const sorted = React.useMemo(() => {
    const BRAND_ORDER = [
      'AKG',
      'SOUNDCRAFT',
      'SHURE',
      'BEHRINGER',
      'SENNHEISER',
      'MACKIE',
      'DB TECHNOLOGIES',
      'RCF',
      'YAMAHA',
      'JBL',
      'AUDAC',
      'MARTIN AUDIO',
    ]
    const norm = (p: any) => (p.marka || '').trim().toUpperCase()
    const inStock = (p: any) => (p.stok_durumu === 'stokta' || (p.stok_adedi && p.stok_adedi > 0) ? 1 : 0)
    const hasPhoto = (p: any) => (p.fotograflar && p.fotograflar.length > 0 ? 1 : 0)

    const buckets = new Map<string, any[]>()
    for (const p of products) {
      if (!hasPhoto(p)) continue
      const b = norm(p)
      if (!buckets.has(b)) buckets.set(b, [])
      buckets.get(b)!.push(p)
    }

    buckets.forEach((arr) => {
      arr.sort((a, b) => inStock(b) - inStock(a))
    })

    const picked: any[] = []
    const used = new Set<string>()
    // Her markanın 2. (veya tek ürünü varsa 1.) modelini alarak ilk vitrinle birebir çakışmayı önle
    for (const b of BRAND_ORDER) {
      const arr = buckets.get(b)
      if (arr && arr.length > 0) {
        const candidate = arr[1] || arr[0]
        if (candidate && !used.has(candidate.id)) {
          picked.push(candidate)
          used.add(candidate.id)
        }
      }
      if (picked.length >= 8) break
    }

    // 8'den az kaldıysa kalan ürünlerle tamamla
    if (picked.length < 8) {
      for (const p of products) {
        if (!used.has(p.id) && hasPhoto(p)) {
          picked.push(p)
          used.add(p.id)
          if (picked.length >= 8) break
        }
      }
    }

    return picked
  }, [products])

  if (!sorted || sorted.length === 0) return null

  return (
    <section className="py-20 bg-[#0A0A0A] border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Sparkles size={16} className="text-brand-red animate-pulse" />
              <div className="w-8 h-px bg-brand-red" />
              <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">
                GÜNCEL TEKNOLOJİLER
              </span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-white leading-none">
              YENİ NESİL <span className="text-brand-red">PRO AUDIO ÇÖZÜMLERİ</span>
            </h2>
            <p className="font-body text-white/50 text-sm mt-3 max-w-lg leading-relaxed">
              Sektörün en güncel akustik ve dijital ses standartlarını karşılayan en son donanımlar.
            </p>
          </div>

          <Link
            href="/urunler"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white font-display font-bold text-xs uppercase tracking-widest transition-colors group"
          >
            Tüm Kataloğu İncele <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4 Column Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {sorted.map((p, idx) => (
            <ProductCard key={p.id} product={p} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}
