'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { StoreBanner } from '@/lib/banner-service'

interface BannerCarouselProps {
  banners: StoreBanner[]
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [banners.length])

  if (!banners || banners.length === 0) return null

  const banner = banners[currentIndex]

  return (
    <div className="relative w-full overflow-hidden bg-[#0A0A0A] border-b border-white/5">
      {/* Aspect ratio container (21:9 ultra-wide feel) */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] w-full group">
        
        {/* Banner Images Background */}
        {banners.map((b, idx) => (
          <div 
            key={b.id} 
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {b.link_url ? (
              <a href={b.link_url} className="block w-full h-full relative" target={b.link_url.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer">
                <Image 
                  src={b.image_url} 
                  alt={b.title || 'Kampanya Banner'} 
                  fill 
                  className="object-cover" 
                  priority={idx === 0}
                />
              </a>
            ) : (
              <Image 
                src={b.image_url} 
                alt={b.title || 'Kampanya Banner'} 
                fill 
                className="object-cover" 
                priority={idx === 0}
              />
            )}
            
            {/* Cinematic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent pointer-events-none" />
          </div>
        ))}

        {/* Banner Content (Glassmorphism overlay on active banner) */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20 pointer-events-none">
          <div className="max-w-7xl mx-auto flex flex-col items-start">
            
            {(banner.title || banner.subtitle) && (
              <div className="backdrop-blur-md bg-black/40 border border-white/10 p-6 shadow-2xl max-w-lg mb-6 transform transition-all duration-700 translate-y-0 opacity-100 pointer-events-auto border-l-4 border-l-brand-red">
                {banner.title && (
                  <h2 className="font-display font-black text-2xl md:text-4xl text-white uppercase tracking-tight mb-2">
                    {banner.title}
                  </h2>
                )}
                {banner.subtitle && (
                  <p className="font-body text-white/70 text-sm md:text-base">
                    {banner.subtitle}
                  </p>
                )}
                {banner.link_url && (
                  <div className="mt-6">
                    <a 
                      href={banner.link_url} 
                      className="inline-flex items-center gap-2 bg-brand-red text-white px-5 py-2.5 font-display font-bold text-xs uppercase tracking-widest hover:bg-brand-red/80 transition-colors"
                      target={banner.link_url.startsWith('http') ? '_blank' : '_self'} 
                      rel="noopener noreferrer"
                    >
                      İncele <ArrowRight size={14} />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Controls */}
        {banners.length > 1 && (
          <>
            <button 
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-black/30 backdrop-blur-md border border-white/10 text-white hover:bg-brand-red hover:border-brand-red transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-black/30 backdrop-blur-md border border-white/10 text-white hover:bg-brand-red hover:border-brand-red transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {banners.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 rounded-full ${idx === currentIndex ? 'w-8 h-1.5 bg-brand-red' : 'w-2 h-1.5 bg-white/30 hover:bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
