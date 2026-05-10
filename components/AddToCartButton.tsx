'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Check, MessageCircle } from 'lucide-react'
import { addToCart } from '@/lib/cart'
import { dovizToTL, type KurData } from '@/lib/kur'
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
}

export default function AddToCartButton({ urun }: Props) {
  const [added, setAdded] = useState(false)
  const [kur, setKur] = useState<KurData>({ USD: 32.5, EUR: 35.2, guncelleme: null })
  const [isBayi, setIsBayi] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch('/api/kur').then(r => r.json()).then(setKur).catch(() => {})
    
    // Bayi kontrolü
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }: any) => {
      const session = data.session
      if (session?.user) {
        supabase.from('bayiler').select('onaylandi').eq('user_id', session.user.id).maybeSingle()
          .then(({ data: bayi }: any) => {
            setIsBayi(!!bayi?.onaylandi)
            setChecking(false)
          })
      } else {
        setChecking(false)
      }
    })
  }, [])

  const handleAdd = () => {
    if (!isBayi) return
    
    const pb = urun.para_birimi || 'TRY'
    const bayiPb = urun.bayi_para_birimi || pb

    // Sepette TL cinsinden tutuyoruz (ödeme TL ile)
    const fiyatTL = dovizToTL(urun.fiyat, pb, kur)
    const bayiFiyatTL = urun.bayi_fiyati ? dovizToTL(urun.bayi_fiyati, bayiPb, kur) : null

    addToCart({
      id: urun.id,
      ad: urun.ad,
      kategori: urun.kategori,
      fotograf: urun.fotograflar?.[0] || '',
      fiyat: fiyatTL,                    // TL karşılığı
      fiyat_doviz: urun.fiyat,           // Orijinal döviz fiyatı
      para_birimi: pb,
      bayi_fiyati: bayiFiyatTL,          // TL karşılığı
      bayi_fiyat_doviz: urun.bayi_fiyati || null,
      bayi_para_birimi: bayiPb,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (checking) return <div className="h-10 w-full bg-white/5 animate-pulse" />

  if (!isBayi) {
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
