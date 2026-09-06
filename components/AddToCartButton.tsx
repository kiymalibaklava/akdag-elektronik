'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Check, MessageCircle } from 'lucide-react'
import { addToCart } from '@/lib/cart'
import { dovizToTL, type KurData } from '@/lib/kur'
import { getKurClient } from '@/lib/kur-client'
import { createClient } from '@/lib/supabase'

interface Props {
  urun: {
    id: string
    ad: string
    kategori: string
    fotograflar: string[]
    fiyat: number
    bayi_fiyati?: number | null
    para_birimi?: string
    bayi_para_birimi?: string
  }
  isBayi: boolean
}

export default function AddToCartButton({ urun, isBayi }: Props) {
  const [added, setAdded] = useState(false)
  const [kur, setKur] = useState<KurData>({ USD: 32.5, EUR: 35.2, guncelleme: null })
  const [isBayiAuth, setIsBayiAuth] = useState(isBayi)
  const [liveBayiFiyati, setLiveBayiFiyati] = useState<number | null | undefined>(urun.bayi_fiyati)
  const [liveBayiPb, setLiveBayiPb] = useState<string | undefined>(urun.bayi_para_birimi)

  useEffect(() => {
    getKurClient().then(setKur).catch(() => {})

    // İstemci taraflı bayi kontrolü
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }: { data: any }) => {
      if (session?.user) {
        supabase.from('bayiler').select('onaylandi').eq('user_id', session.user.id).maybeSingle()
          .then(async ({ data }: { data: any }) => {
            if (data?.onaylandi) {
              setIsBayiAuth(true)
              if (!urun.bayi_fiyati) {
                const { data: p } = await supabase.from('urunler').select('bayi_fiyati, bayi_para_birimi').eq('id', urun.id).maybeSingle()
                if (p?.bayi_fiyati) {
                  setLiveBayiFiyati(p.bayi_fiyati)
                  if (p.bayi_para_birimi) setLiveBayiPb(p.bayi_para_birimi)
                }
              }
            }
          })
      }
    })
  }, [isBayi, urun.id, urun.bayi_fiyati])

  const activeIsBayi = isBayi || isBayiAuth

  const handleAdd = () => {
    if (!activeIsBayi) return
    
    const pb = urun.para_birimi || 'TRY'
    const effectiveBayiFiyati = liveBayiFiyati ?? urun.bayi_fiyati
    const effectiveBayiPb = liveBayiPb || urun.bayi_para_birimi || pb

    // Sepette TL cinsinden tutuyoruz (ödeme TL ile)
    const fiyatTL = dovizToTL(urun.fiyat, pb, kur)
    const bayiFiyatTL = effectiveBayiFiyati ? dovizToTL(effectiveBayiFiyati, effectiveBayiPb, kur) : null

    addToCart({
      id: urun.id,
      ad: urun.ad,
      kategori: urun.kategori,
      fotograf: urun.fotograflar?.[0] || '',
      fiyat: fiyatTL,                    // TL karşılığı
      fiyat_doviz: urun.fiyat,           // Orijinal döviz fiyatı
      para_birimi: pb,
      bayi_fiyati: bayiFiyatTL,          // TL karşılığı
      bayi_fiyat_doviz: effectiveBayiFiyati || null,
      bayi_para_birimi: effectiveBayiPb,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!activeIsBayi) {
    return (
      <a
        href={`https://wa.me/905323934370?text=${encodeURIComponent(`Merhaba, ${urun.ad} ürünü hakkında bilgi almak ve sipariş vermek istiyorum.`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-outline text-sm w-full justify-center gap-2"
      >
        <MessageCircle size={15} />
        Bilgi Al & Sipariş Ver
      </a>
    )
  }

  return (
    <button
      onClick={handleAdd}
      className={`btn-primary text-sm w-full justify-center transition-all duration-300 ${added ? '!bg-green-600' : ''}`}
    >
      {added ? <Check size={15} /> : <ShoppingCart size={15} />}
      {added ? 'Sepete Eklendi!' : 'Sepete Ekle'}
    </button>
  )
}
