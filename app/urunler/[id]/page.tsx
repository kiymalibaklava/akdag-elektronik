import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Phone, Mail, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import ProductImageGallery from '@/components/ProductImageGallery'
import ShareButtons from '@/components/ShareButtons'
import AddToCartButton from '@/components/AddToCartButton'
import UrunFiyatGosterge from '@/components/UrunFiyatGosterge'
import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/site-url'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createServerSupabaseClient()
  const { data: product } = await supabase.from('urunler').select('ad, aciklama').eq('id', params.id).single()
  if (!product) return { title: 'Ürün Bulunamadı | Akdağ Elektronik' }
  return { title: `${product.ad} | Akdağ Elektronik`, description: product.aciklama }
}

export default async function UrunDetayPage({ params }: Props) {
  const supabase = await createServerSupabaseClient()
  const { data: product } = await supabase.from('urunler').select('*').eq('id', params.id).single()
  if (!product) notFound()

  const { data: related } = await supabase
    .from('urunler')
    .select('id, ad, kategori, fotograflar, fiyat, bayi_fiyati, para_birimi, bayi_para_birimi')
    .eq('kategori', product.kategori).neq('id', product.id).limit(4)

  const stok = product.stok_durumu || 'stokta'
  const base = getSiteUrl()
  const currency = product.para_birimi || 'TRY'
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.ad,
    description: product.aciklama?.slice(0, 5000),
    image: product.fotograflar?.length ? product.fotograflar : undefined,
    sku: product.id,
    offers: product.fiyat
      ? {
          '@type': 'Offer',
          price: product.fiyat,
          priceCurrency: currency,
          availability:
            stok === 'tukendi'
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
          url: `${base}/urunler/${product.id}`,
        }
      : undefined,
  }

  return (
    <div className="min-h-screen pt-8 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-white/30 text-sm font-body mb-10">
          <Link href="/urunler" className="flex items-center gap-1 hover:text-brand-red transition-colors">
            <ChevronLeft size={14} />Ürünler
          </Link>
          <span>/</span>
          <span className="text-white/40">{product.kategori}</span>
          <span>/</span>
          <span className="text-white/60 truncate max-w-xs">{product.ad}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          <ProductImageGallery images={product.fotograflar || []} alt={product.ad} />

          <div>
            <div className="font-display font-semibold text-xs tracking-widest uppercase text-brand-red mb-3">{product.kategori}</div>
            <h1 className="font-display font-black text-4xl md:text-5xl uppercase text-white leading-tight mb-4">{product.ad}</h1>
            <div className="w-12 h-0.5 bg-brand-red mb-6" />

            {/* Fiyat — client component ile kur dönüşümü */}
            <UrunFiyatGosterge
              fiyat={product.fiyat}
              bayiFiyati={product.bayi_fiyati}
              paraBirimi={product.para_birimi || 'TRY'}
              bayiParaBirimi={product.bayi_para_birimi || product.para_birimi || 'TRY'}
              fiyatGuncelleme={product.fiyat_guncelleme}
            />

            {/* Stok */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${stok === 'stokta' ? 'bg-green-400' : stok === 'tukendi' ? 'bg-red-500' : 'bg-yellow-400'}`} />
              <span className="font-body text-sm text-white/50">
                {stok === 'stokta' ? 'Stokta Mevcut' : stok === 'tukendi' ? 'Tükendi' : 'Siparişe Göre'}
              </span>
            </div>

            <p className="font-body text-white/50 text-base leading-relaxed mb-8 whitespace-pre-line">{product.aciklama}</p>

            <ShareButtons productName={product.ad} />

            {/* CTA */}
            <div className="border border-white/5 bg-[#141414] p-6 space-y-3 mt-8">
              {product.fiyat && stok !== 'tukendi' ? (
                <AddToCartButton urun={{
                  id: product.id,
                  ad: product.ad,
                  kategori: product.kategori,
                  fotograflar: product.fotograflar || [],
                  fiyat: product.fiyat,
                  bayi_fiyati: product.bayi_fiyati,
                  para_birimi: product.para_birimi || 'TRY',
                  bayi_para_birimi: product.bayi_para_birimi || product.para_birimi || 'TRY',
                }} />
              ) : stok === 'tukendi' ? (
                <div className="font-display font-bold text-sm uppercase text-center text-white/30 tracking-widest py-3 border border-white/10">
                  Stokta Yok
                </div>
              ) : null}
              <a href="tel:+903522316915"
                className={`${product.fiyat ? 'btn-outline' : 'btn-primary'} text-sm justify-center w-full`}>
                <Phone size={15} />
                {product.fiyat ? 'Telefonla Sipariş' : 'Fiyat İçin Arayın'}
              </a>
              <a href={`mailto:info@akdagelektronik.com?subject=${encodeURIComponent(`${product.ad} hakkında bilgi`)}`}
                className="btn-outline text-sm justify-center w-full">
                <Mail size={15} />E-posta Gönder
              </a>
            </div>
          </div>
        </div>

        {/* Benzer ürünler */}
        {related && related.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-px bg-brand-red" />
              <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Benzer Ürünler</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
              {related.map((r: any) => (
                <Link key={r.id} href={`/urunler/${r.id}`}
                  className="product-card group bg-[#141414] border border-white/5 overflow-hidden hover:border-brand-red/30">
                  <div className="aspect-square bg-[#1A1A1A] relative overflow-hidden">
                    {r.fotograflar?.[0] ? (
                      <Image
                        src={r.fotograflar[0]}
                        alt={r.ad}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10 text-4xl">📦</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="font-display font-bold text-sm uppercase text-white group-hover:text-brand-red transition-colors truncate">{r.ad}</div>
                    {r.fiyat && (
                      <div className="font-display font-black text-sm text-brand-red mt-1">
                        {r.para_birimi === 'USD' ? '$' : r.para_birimi === 'EUR' ? '€' : '₺'}{r.fiyat.toLocaleString('tr-TR')}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-red group-hover:w-full transition-all duration-500" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
