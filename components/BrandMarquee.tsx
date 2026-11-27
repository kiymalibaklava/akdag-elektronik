'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ShieldCheck } from 'lucide-react'

export interface BrandItem {
  id: string
  name: string
  query: string
  logo: string
}

const BRANDS: BrandItem[] = [
  { id: 'soundcraft', name: 'Soundcraft', query: 'SOUNDCRAFT', logo: '/brands/soundcraft-clean.webp' },
  { id: 'ld-systems', name: 'LD Systems', query: 'LD SYSTEMS', logo: '/brands/ld-systems-clean.webp' },
  { id: 'rcf', name: 'RCF', query: 'RCF', logo: '/brands/rcf-clean.webp' },
  { id: 'alto', name: 'Alto Professional', query: 'ALTO', logo: '/brands/alto-clean.webp' },
  { id: 'db-technologies', name: 'dB Technologies', query: 'DB TECHNOLOGIES', logo: '/brands/db-technologies-clean.webp' },
  { id: 'mackie', name: 'Mackie', query: 'MACKIE', logo: '/brands/mackie-clean.webp' },
  { id: 'martin-audio', name: 'Martin Audio London', query: 'MARTIN AUDIO', logo: '/brands/martin-audio-clean.webp' },
  { id: 'audac', name: 'Audac', query: 'AUDAC', logo: '/brands/audac-clean.webp' },
  { id: 'allen-heath', name: 'Allen & Heath', query: 'ALLEN&HEATH', logo: '/brands/allen-heath-clean.webp' },
  { id: 'shure', name: 'Shure', query: 'SHURE', logo: '/brands/shure-clean.webp' },
  { id: 'sennheiser', name: 'Sennheiser', query: 'SENNHEISER', logo: '/brands/sennheiser-clean.webp' },
  { id: 'yamaha', name: 'Yamaha', query: 'YAMAHA', logo: '/brands/yamaha-clean.webp' },
  { id: 'jbl', name: 'JBL', query: 'JBL', logo: '/brands/jbl-clean.webp' },
  { id: 'behringer', name: 'Behringer', query: 'BEHRINGER', logo: '/brands/behringer-clean.webp' },
]

const MARQUEE_BRANDS = [...BRANDS, ...BRANDS]

export default function BrandMarquee() {
  return (
    <section className="py-16 bg-[#0A0A0A] border-y border-white/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-brand-red/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-brand-red/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <ShieldCheck size={14} className="text-brand-red" />
              <div className="w-6 h-px bg-brand-red" />
              <span className="font-display font-bold text-[11px] tracking-[0.28em] uppercase text-brand-red">
                Yetkili Distribütör &amp; Satış Güvencesi
              </span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-white leading-none">
              ÇALIŞTIĞIMIZ <span className="text-brand-red">DÜNYA MARKALARI</span>
            </h2>

            <p className="font-body text-white/55 text-sm mt-2.5 max-w-2xl leading-relaxed">
              50 yılı aşkın deneyimimizle dünya standardı profesyonel ses, sahne ve stüdyo markalarının yetkili temin ve teknik desteğini sunuyoruz. Ürünlerini incelemek istediğiniz markaya tıklayın.
            </p>
          </div>

          <Link
            href="/urunler"
            className="btn-outline text-xs tracking-widest uppercase self-start md:self-auto"
          >
            Tüm Kataloğu Gör <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Kayan Resmi Marka Kartları (Beyaz Yuvarlak Kartlar + Orijinal WebP Logolar) */}
      <div className="relative w-full overflow-hidden py-3 group">
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-20 bg-gradient-to-r from-[#0A0A0A] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-20 bg-gradient-to-l from-[#0A0A0A] to-transparent pointer-events-none" />

        <div className="flex gap-3 sm:gap-5 animate-marquee [animation-duration:38s] whitespace-nowrap items-center w-max px-4 group-hover:[animation-play-state:paused]">
          {MARQUEE_BRANDS.map((brand, i) => (
            <Link
              key={`${brand.id}-${i}`}
              href={`/urunler?marka=${encodeURIComponent(brand.query)}`}
              title={`${brand.name} ürünlerini incele`}
              aria-label={`${brand.name} Yetkili Satıcı Ürünleri`}
              className="flex-shrink-0 w-[170px] sm:w-[200px] h-[72px] sm:h-[82px] bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-brand-red flex items-center justify-center px-5 py-3 shadow-sm hover:shadow-xl hover:shadow-brand-red/15 hover:-translate-y-1 transition-all duration-300 group/card cursor-pointer"
            >
              <div className="relative h-8 sm:h-9 w-28 sm:w-32 flex items-center justify-center">
                <Image
                  src={brand.logo}
                  alt={`${brand.name} Resmi Logo`}
                  width={140}
                  height={40}
                  unoptimized
                  className="max-h-full max-w-full w-auto h-auto object-contain transition-all duration-300 opacity-85 group-hover/card:opacity-100 group-hover/card:scale-105"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
