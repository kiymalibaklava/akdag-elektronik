import React from 'react'

const brands = [
  'Bosch', 'Yamaha', 'Shure', 'JBL', 'Sony',
  'Panasonic', 'Crown', 'BSS', 'QSC', 'Electro-Voice',
  'Sennheiser', 'Audio-Technica', 'Bose', 'Allen & Heath',
]

export default function BrandMarquee() {
  return (
    <section className="py-14 bg-[#0A0A0A] border-y border-white/5 overflow-hidden">
      <div className="flex items-center gap-3 justify-center mb-10">
        <div className="h-px w-12 bg-brand-red/40" />
        <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-white/20">
          Çalıştığımız Markalar
        </span>
        <div className="h-px w-12 bg-brand-red/40" />
      </div>

      {/* Marquee track */}
      <div className="relative flex overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#0A0A0A] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#0A0A0A] to-transparent pointer-events-none" />

        {/* Track — duplicated for seamless loop */}
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {[...brands, ...brands].map((brand, i) => (
            <span
              key={i}
              className="font-display font-black text-2xl uppercase tracking-widest text-white/8 hover:text-[#C0C0C0]/60 transition-colors duration-500 cursor-default select-none flex-shrink-0"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
