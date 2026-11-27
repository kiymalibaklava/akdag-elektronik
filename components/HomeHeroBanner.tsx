'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Phone,
  ShieldCheck,
  Zap,
  Award,
  Wrench,
} from 'lucide-react'
import type { StoreBanner } from '@/lib/banner-service'
import HeroParticles from './HeroParticles'
import ProductSearch from './ProductSearch'

interface HomeHeroBannerProps {
  banners: StoreBanner[]
}

export default function HomeHeroBanner({ banners }: HomeHeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const hasBanners = banners && banners.length > 0

  useEffect(() => {
    if (!hasBanners || banners.length <= 1 || isPaused) return

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [hasBanners, banners.length, isPaused])

  const nextSlide = () => {
    if (!hasBanners) return
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    if (!hasBanners) return
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  }

  return (
    <div className="relative bg-[#0A0A0A] overflow-hidden">
      {/* ═══════════════════════════════════════════════
          DURUM A: BANNER VARSA — PROFESYONEL BANNER SLIDER
      ═══════════════════════════════════════════════ */}
      {hasBanners ? (
        <section
          className="w-full px-3 sm:px-6 lg:px-8 pt-4 pb-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <h1 className="sr-only">
            Akdağ Elektronik — Profesyonel Ses, Işık ve Görüntü Sistemleri | Kayseri &amp; Türkiye Geneli
          </h1>
          <div className="max-w-7xl mx-auto">
            {/* Carousel Container: 16/6 veya 21/9 oranında, kristal netliğinde görsel */}
            <div
              className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl shadow-black bg-[#111] group aspect-[16/9] sm:aspect-[16/7] lg:aspect-[16/6]"
            >
              {/* Banner Slaytları */}
              {banners.map((banner, idx) => {
                const isActive = idx === currentIndex
                const isExternal = banner.link_url?.startsWith('http')
                const hasCustomText = Boolean(banner.title || banner.subtitle)

                const bannerContent = (
                  <div className="relative w-full h-full">
                    {/* Görsel — Orijinal renkler, hiçbir karartıcı gradient YOK */}
                    <Image
                      src={banner.image_url}
                      alt={banner.title || 'Akdağ Elektronik Kampanya'}
                      fill
                      priority={idx === 0}
                      className="object-cover object-center"
                    />

                    {/* Sadece admin özel başlık/açıklama yazdıysa köşede şık cam kart göster */}
                    {hasCustomText && (
                      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 pointer-events-none max-w-xs sm:max-w-md">
                        <div className="backdrop-blur-md bg-black/70 border border-white/15 p-4 sm:p-5 shadow-2xl border-l-4 border-l-brand-red pointer-events-auto">
                          {banner.title && (
                            <h2 className="font-display font-black text-sm sm:text-lg md:text-xl text-white uppercase tracking-tight mb-1 line-clamp-1">
                              {banner.title}
                            </h2>
                          )}
                          {banner.subtitle && (
                            <p className="font-body text-white/75 text-xs sm:text-sm line-clamp-2">
                              {banner.subtitle}
                            </p>
                          )}
                          {banner.link_url && (
                            <div className="mt-2.5">
                              <span className="inline-flex items-center gap-1.5 bg-brand-red text-white px-3 py-1 font-display font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-brand-red/80 transition-colors">
                                İncele <ArrowRight size={12} />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )

                return (
                  <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    {banner.link_url ? (
                      isExternal ? (
                        <a
                          href={banner.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full h-full cursor-pointer"
                        >
                          {bannerContent}
                        </a>
                      ) : (
                        <Link href={banner.link_url} className="block w-full h-full cursor-pointer">
                          {bannerContent}
                        </Link>
                      )
                    ) : (
                      bannerContent
                    )}
                  </div>
                )
              })}

              {/* Slider Okları (Birden fazla banner varsa) */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      prevSlide()
                    }}
                    aria-label="Önceki Banner"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center bg-black/60 hover:bg-brand-red text-white border border-white/20 hover:border-brand-red rounded-full backdrop-blur-md transition-all shadow-xl opacity-80 sm:opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      nextSlide()
                    }}
                    aria-label="Sonraki Banner"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center bg-black/60 hover:bg-brand-red text-white border border-white/20 hover:border-brand-red rounded-full backdrop-blur-md transition-all shadow-xl opacity-80 sm:opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Alt Dot Göstergeleri */}
                  <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 z-30 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
                    {banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setCurrentIndex(idx)
                        }}
                        aria-label={`Slayt ${idx + 1}`}
                        className="p-1 focus:outline-none"
                      >
                        <div
                          className={`transition-all duration-300 rounded-full ${
                            idx === currentIndex
                              ? 'w-6 h-1.5 bg-brand-red'
                              : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      ) : (
        /* ═══════════════════════════════════════════════
           DURUM B: BANNER YOKSA — KLASİK MARKA HERO
        ═══════════════════════════════════════════════ */
        <section className="relative min-h-[580px] flex items-center overflow-hidden border-b border-white/5 py-20">
          <div className="absolute inset-0 hero-grid opacity-30 pointer-events-none" />
          <HeroParticles />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 border border-brand-red/30 bg-brand-red/5 px-4 py-2 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">
                  Kayseri&apos;nin Profesyonel Ses & Işık Uzmanı
                </span>
              </div>
              <h1 className="uppercase leading-none mb-6">
                <span className="block font-display font-black text-6xl md:text-8xl text-white tracking-tight">
                  SES,
                </span>
                <span className="block font-display font-black text-6xl md:text-8xl text-white tracking-tight">
                  IŞIK &
                </span>
                <span className="block font-display font-black text-6xl md:text-8xl text-brand-red tracking-tight">
                  GÖRÜNTÜ.
                </span>
              </h1>
              <p className="font-body text-white/50 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
                1976&apos;dan bugüne yarım asırlık (50+ yıl) deneyimimizle Türkiye genelinde profesyonel ses, ışık ve görüntü sistemleri{' '}
                <span className="silver-text font-medium">kurulum, satış ve servis</span> hizmetleri sunuyoruz.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/urunler" className="btn-primary text-sm">
                  Ürünleri İncele
                  <ArrowRight size={16} />
                </Link>
                <a href="tel:+903522316915" className="btn-outline text-sm">
                  <Phone size={14} />
                  Hemen Arayın
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          GÜVEN STRİP (4 DİREK GÜVEN BARİ)
      ═══════════════════════════════════════════════ */}
      <section className="bg-[#111111] border-b border-white/5 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red flex-shrink-0">
                <Award size={20} />
              </div>
              <div>
                <div className="font-display font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                  50+ Yıl Tecrübe
                </div>
                <div className="font-body text-[11px] sm:text-xs text-white/40">1976&apos;dan beri sektör lideri</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <div className="font-display font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                  Geniş Envanter &amp; Stok
                </div>
                <div className="font-body text-[11px] sm:text-xs text-white/40">Merkezi depo ve anlık stok takibi</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red flex-shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="font-display font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                  Resmi Distribütör
                </div>
                <div className="font-body text-[11px] sm:text-xs text-white/40">%100 orijinal marka garantisi</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Wrench size={20} />
              </div>
              <div>
                <div className="font-display font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                  Kurulum & Servis
                </div>
                <div className="font-body text-[11px] sm:text-xs text-white/40">Ücretsiz keşif & teknik servis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          HIZLI ÜRÜN ARAMA BARI
      ═══════════════════════════════════════════════ */}
      <section className="py-6 bg-[#0F0F0F] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ProductSearch />
        </div>
      </section>
    </div>
  )
}
