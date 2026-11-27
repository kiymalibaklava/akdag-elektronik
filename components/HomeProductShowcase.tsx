'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Speaker, Sliders, Mic2, Building2, ChevronLeft, ChevronRight, FileCheck } from 'lucide-react'
import { ProductCard } from './ProductGrid'

interface HomeProductShowcaseProps {
  products: any[]
}

type TabKey = 'selected' | 'live' | 'mixers' | 'mics' | 'install'

export default function HomeProductShowcase({ products }: HomeProductShowcaseProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('selected')
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Sort and filter products intelligently with flagship pro-audio brands + in-stock priority + brand diversity
  const categorizedProducts = useMemo(() => {
    const FLAGSHIP_ORDER = [
      'SHURE',
      'SOUNDCRAFT',
      'BEHRINGER',
      'AKG',
      'YAMAHA',
      'RCF',
      'JBL',
      'SENNHEISER',
      'MACKIE',
      'DB TECHNOLOGIES',
      'ALLEN&HEATH',
      'AUDAC',
      'ALTO',
      'LD SYSTEMS',
      'MARTIN AUDIO',
    ]

    const normBrand = (p: any) => (p.marka || '').trim().toUpperCase()

    const isFlagship = (p: any) => {
      const b = normBrand(p)
      return FLAGSHIP_ORDER.some((fb) => b === fb || b.includes(fb))
    }

    const inStockScore = (p: any) => {
      if (p.stok_durumu === 'stokta' || (p.stok_adedi && p.stok_adedi > 0)) return 2
      if (p.stok_durumu === 'siparise_gore') return 1
      return 0
    }

    const hasPhotoScore = (p: any) => (p.fotograflar && p.fotograflar.length > 0 ? 1 : 0)

    const prioritySort = (a: any, b: any) => {
      // 1. Photo availability
      const photoDiff = hasPhotoScore(b) - hasPhotoScore(a)
      if (photoDiff !== 0) return photoDiff

      // 2. Flagship pro-audio brands first
      const flagDiff = (isFlagship(b) ? 1 : 0) - (isFlagship(a) ? 1 : 0)
      if (flagDiff !== 0) return flagDiff

      // 3. In-stock products strictly prioritized within tier
      const stockDiff = inStockScore(b) - inStockScore(a)
      if (stockDiff !== 0) return stockDiff

      // 4. Featured flag
      if (b.is_featured && !a.is_featured) return 1
      if (!b.is_featured && a.is_featured) return -1

      return 0
    }

    // Round-robin interleave: FIRST fill completely from flagship brands (multiple rounds), only fall back to other brands if needed
    const interleaveByBrand = (list: any[], limit: number) => {
      const sorted = [...list].sort(prioritySort)
      const flagshipBuckets = new Map<string, any[]>()
      const otherBuckets = new Map<string, any[]>()

      for (const p of sorted) {
        const b = normBrand(p) || 'OTHER'
        if (isFlagship(p)) {
          if (!flagshipBuckets.has(b)) flagshipBuckets.set(b, [])
          flagshipBuckets.get(b)!.push(p)
        } else {
          if (!otherBuckets.has(b)) otherBuckets.set(b, [])
          otherBuckets.get(b)!.push(p)
        }
      }

      const orderedFlagshipKeys: string[] = []
      for (const fb of FLAGSHIP_ORDER) {
        for (const k of Array.from(flagshipBuckets.keys())) {
          if ((k === fb || k.includes(fb)) && !orderedFlagshipKeys.includes(k)) {
            orderedFlagshipKeys.push(k)
          }
        }
      }

      const result: any[] = []
      const used = new Set<string>()

      const drainBuckets = (buckets: Map<string, any[]>, keys: string[]) => {
        let round = 0
        while (result.length < limit) {
          let addedInRound = false
          for (const k of keys) {
            const arr = buckets.get(k)
            if (arr && arr[round]) {
              const item = arr[round]
              if (!used.has(item.id)) {
                result.push(item)
                used.add(item.id)
                addedInRound = true
                if (result.length >= limit) break
              }
            }
          }
          if (!addedInRound) break
          round++
        }
      }

      drainBuckets(flagshipBuckets, orderedFlagshipKeys)
      if (result.length < limit) {
        drainBuckets(otherBuckets, Array.from(otherBuckets.keys()))
      }
      return result
    }

    const allSorted = [...products].sort(prioritySort)

    // Canlı Ses & Konser (Hoparlör, Kabin, Line Array, Subwoofer, Power Amfi)
    const liveSound = allSorted.filter((p) => {
      const text = `${p.ad} ${p.kategori} ${p.alt_kategori || ''} ${p.marka}`.toLowerCase()
      return (
        text.includes('hoparlör') ||
        text.includes('kabin') ||
        text.includes('subwoofer') ||
        text.includes('power') ||
        text.includes('amfi') ||
        text.includes('line array') ||
        text.includes('aktif') ||
        text.includes('rcf') ||
        text.includes('jbl') ||
        text.includes('db technologies') ||
        text.includes('martin audio')
      )
    })

    // Miks Konsolları & İşlemciler (Soundcraft, Behringer, Yamaha, Mackie, Allen & Heath)
    const mixers = allSorted.filter((p) => {
      const text = `${p.ad} ${p.kategori} ${p.alt_kategori || ''} ${p.marka}`.toLowerCase()
      return (
        text.includes('mikser') ||
        text.includes('mixer') ||
        text.includes('deck') ||
        text.includes('konsol') ||
        text.includes('soundcraft') ||
        text.includes('behringer') ||
        text.includes('allen') ||
        text.includes('yamaha mg') ||
        text.includes('profx')
      )
    })

    // Kablosuz Mikrofon & Sahne (Shure, AKG, Sennheiser)
    const mics = allSorted.filter((p) => {
      const text = `${p.ad} ${p.kategori} ${p.alt_kategori || ''} ${p.marka}`.toLowerCase()
      return (
        text.includes('mikrofon') ||
        text.includes('telsiz') ||
        text.includes('shure') ||
        text.includes('akg') ||
        text.includes('sennheiser') ||
        text.includes('yaka') ||
        text.includes('headset')
      )
    })

    // Konferans & Tesis Akustiği
    const installSound = allSorted.filter((p) => {
      const text = `${p.ad} ${p.kategori} ${p.alt_kategori || ''} ${p.marka}`.toLowerCase()
      return (
        text.includes('duvar') ||
        text.includes('tavan') ||
        text.includes('anons') ||
        text.includes('konferans') ||
        text.includes('trafolu') ||
        text.includes('audac') ||
        text.includes('dexun') ||
        text.includes('gold audio')
      )
    })

    return {
      selected: interleaveByBrand(allSorted, 16),
      live: interleaveByBrand(liveSound.length > 0 ? liveSound : allSorted, 16),
      mixers: interleaveByBrand(mixers.length > 0 ? mixers : allSorted, 16),
      mics: interleaveByBrand(mics.length > 0 ? mics : allSorted, 16),
      install: interleaveByBrand(installSound.length > 0 ? installSound : allSorted, 16),
    }
  }, [products])

  const displayedProducts = categorizedProducts[activeTab] || categorizedProducts.selected

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -350 : 350
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  const tabs = [
    { id: 'selected' as TabKey, label: 'Seçkin Ekipmanlar', icon: Sparkles },
    { id: 'live' as TabKey, label: 'Canlı Ses & Konser', icon: Speaker },
    { id: 'mixers' as TabKey, label: 'Miks Konsolları & İşlemciler', icon: Sliders },
    { id: 'mics' as TabKey, label: 'Kablosuz Mikrofon & Sahne', icon: Mic2 },
    { id: 'install' as TabKey, label: 'Konferans & Tesis Akustiği', icon: Building2 },
  ]

  if (!products || products.length === 0) return null

  return (
    <section className="py-20 bg-[#0F0F0F] relative overflow-hidden border-b border-white/5">
      {/* Subtle Background Ambience */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-brand-red/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-px bg-brand-red" />
              <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">
                Profesyonel Pro Audio Kataloğu
              </span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-white leading-none">
              ÖNE ÇIKAN <span className="text-brand-red">SİSTEMLER VE EKİPMANLAR</span>
            </h2>

            <p className="font-body text-white/50 text-sm mt-3 max-w-2xl leading-relaxed">
              Konser salonlarından stüdyolara, kurumsal mekanlardan açık hava sahnelerine kadar en yüksek akustik standartları karşılayan seçkin donanımlar.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll('left')}
              aria-label="Önceki Ürünler"
              className="w-10 h-10 border border-white/10 hover:border-brand-red hover:bg-brand-red/10 text-white rounded-full flex items-center justify-center transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Sonraki Ürünler"
              className="w-10 h-10 border border-white/10 hover:border-brand-red hover:bg-brand-red/10 text-white rounded-full flex items-center justify-center transition-all"
            >
              <ChevronRight size={18} />
            </button>
            <Link
              href="/urunler"
              className="ml-2 inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest text-brand-red hover:text-white transition-colors"
            >
              Tüm Kataloğu İncele <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Prestigious Filter Tabs */}
        <div className="flex gap-2 pb-6 overflow-x-auto custom-scrollbar mb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/20'
                    : 'bg-[#141414] border-white/10 text-white/50 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-white' : 'text-brand-red'} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Products Carousel Track */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {displayedProducts.map((p, index) => (
            <div key={p.id} className="w-[280px] sm:w-[300px] flex-shrink-0 snap-start">
              <ProductCard product={p} index={index} />
            </div>
          ))}
        </div>

        {/* Bottom Consulting Strip */}
        <div className="mt-8 bg-[#141414] border border-white/10 p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileCheck size={20} className="text-brand-red flex-shrink-0" />
            <div className="text-xs font-body text-white/70">
              <strong className="text-white">Akustik Projelendirme &amp; Danışmanlık:</strong> Mekanınıza özel ses simülasyonu, hoparlör yerleşimi ve mühendislik çözümleri için uzman teknik ekibimizle iletişime geçebilirsiniz.
            </div>
          </div>
          <Link
            href="/proje-talebi"
            className="flex-shrink-0 px-5 py-2.5 bg-brand-red hover:bg-brand-red-dark text-white text-xs font-display font-bold uppercase tracking-wider rounded-md transition-all shadow-md shadow-brand-red/20"
          >
            Proje Teklifi Al
          </Link>
        </div>
      </div>
    </section>
  )
}
