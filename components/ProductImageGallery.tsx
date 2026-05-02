'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Package, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-[#141414] border border-white/5 flex items-center justify-center">
        <Package size={64} className="text-white/10" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square bg-[#141414] border border-white/5 overflow-hidden">
        <Image src={images[active]} alt={alt} fill className="object-contain p-4" />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 border border-white/10 flex items-center justify-center hover:border-brand-red transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setActive((a) => (a + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 border border-white/10 flex items-center justify-center hover:border-brand-red transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-16 h-16 border-2 overflow-hidden transition-all duration-200 ${
                active === i ? 'border-brand-red' : 'border-white/5 hover:border-white/20'
              }`}
            >
              <Image src={img} alt={`${alt} ${i + 1}`} width={64} height={64} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
