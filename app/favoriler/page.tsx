'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { getFavorites, toggleFavorite, type SavedProduct } from '@/lib/product-lists'
import { formatFiyat } from '@/lib/kur'

export default function FavorilerPage() {
  const [items, setItems] = useState<SavedProduct[]>([])

  useEffect(() => {
    const sync = () => setItems(getFavorites())
    sync()
    window.addEventListener('product-lists-updated', sync)
    return () => window.removeEventListener('product-lists-updated', sync)
  }, [])

  return (
    <div className="min-h-screen pt-8 pb-24">
      <div className="bg-[#0A0A0A] border-b border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-brand-red" />
            <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Kişisel Liste</span>
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl uppercase text-white">Favoriler</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        {items.length === 0 ? (
          <div className="text-center py-20 border border-white/5 bg-[#141414]">
            <Heart size={34} className="text-white/15 mx-auto mb-4" />
            <p className="font-body text-white/40 mb-6">Henüz favori ürün eklenmedi.</p>
            <Link href="/urunler" className="btn-primary text-sm">Ürünleri Gör</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((x) => (
              <div key={x.id} className="border border-white/5 bg-[#141414] p-5">
                <div className="font-display text-xs uppercase tracking-widest text-brand-red/60 mb-2">{x.kategori}</div>
                <h3 className="font-display font-bold uppercase text-white mb-2">{x.ad}</h3>
                <p className="font-body text-white/35 text-xs mb-4">
                  {x.marka ? `Marka: ${x.marka}` : ''} {x.kullanim_alani ? `• ${x.kullanim_alani}` : ''}
                </p>
                {x.fiyat && (
                  <div className="font-display text-white mb-4">{formatFiyat(x.fiyat, x.para_birimi || 'TRY')}</div>
                )}
                <div className="flex gap-2">
                  <Link href={`/urunler/${x.id}`} className="btn-outline text-xs flex-1 justify-center">Detay</Link>
                  <button
                    type="button"
                    className="btn-outline text-xs"
                    onClick={() => {
                      toggleFavorite(x)
                      setItems(getFavorites())
                    }}
                  >
                    Kaldır
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
