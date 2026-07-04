import { createServerSupabaseClient } from '@/lib/supabase-server'
import Image from 'next/image'
import Link from 'next/link'
import { Package, ArrowRight, Star } from 'lucide-react'
import { PARA_BIRIMLERI } from '@/lib/kur'
import { LIGHT_PRODUCT_FIELDS } from '@/lib/product-queries'
import FeaturedCarousel from './FeaturedCarousel'

export default async function FeaturedProducts() {
  const supabase = await createServerSupabaseClient()
  
  // Sadece is_featured = true olan ürünleri getir
  const { data } = await supabase
    .from('urunler')
    .select(LIGHT_PRODUCT_FIELDS)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(10)

  const featuredProducts = data as any[] | null

  if (!featuredProducts || featuredProducts.length === 0) return null

  return (
    <div className="py-20 bg-[#0A0A0A] border-y border-white/5 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-brand-red/5 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-red/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Star size={16} className="text-brand-red fill-brand-red animate-pulse" />
              <div className="h-[2px] w-12 bg-brand-red" />
              <span className="font-display font-black text-[10px] tracking-[0.4em] uppercase text-brand-red">SANA ÖZEL</span>
            </div>
            <h2 className="font-display font-black text-4xl md:text-5xl uppercase text-white tracking-tighter">
              ÖNE ÇIKAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-white">ÜRÜNLER</span>
            </h2>
          </div>
          
          <Link href="/urunler" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-display font-bold uppercase tracking-widest group">
            Tüm Kataloğu Gör <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <FeaturedCarousel products={featuredProducts} />
      </div>
    </div>
  )
}
