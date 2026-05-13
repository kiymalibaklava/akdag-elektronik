'use client'

import { useEffect, useState } from 'react'
import { dovizToTL, formatFiyat, type KurData } from '@/lib/kur'
import { getKurClient } from '@/lib/kur-client'
import { Clock, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface Props {
  fiyat?: number
  bayiFiyati?: number
  paraBirimi: string
  bayiParaBirimi: string
  fiyatGuncelleme?: string
  isBayi?: boolean
  urunAdi?: string
}

export default function UrunFiyatGosterge({
  fiyat, bayiFiyati, paraBirimi, bayiParaBirimi, fiyatGuncelleme, isBayi = false, urunAdi = ''
}: Props) {
  const [kur, setKur] = useState<KurData>({ USD: 32.5, EUR: 35.2, guncelleme: null })
  const [isBayiAuth, setIsBayiAuth] = useState(isBayi)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    getKurClient().then(setKur).catch(() => {})
    
    // İstemci taraflı bayi kontrolü (Server-side bazen session kaçırabiliyor)
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      if (session?.user) {
        supabase.from('bayiler').select('onaylandi').eq('user_id', session.user.id).maybeSingle()
          .then(({ data }: { data: any }) => {
            if (data?.onaylandi) setIsBayiAuth(true)
            setAuthChecked(true)
          })
      } else {
        setAuthChecked(true)
      }
    })
  }, [isBayi])

  const activeIsBayi = isBayi || isBayiAuth

  if (!fiyat) return null

  const fiyatTL = dovizToTL(fiyat, paraBirimi, kur)
  const bayiFiyatTL = bayiFiyati ? dovizToTL(bayiFiyati, bayiParaBirimi, kur) : null
  const gosterBayiFiyat = activeIsBayi && bayiFiyatTL && bayiFiyatTL < fiyatTL

  // Fiyat gizli — WhatsApp butonu
  if (!activeIsBayi) {
    return (
      <div className="mb-6 space-y-3">
        <div className="bg-[#1A1A1A] border border-white/5 p-4">
          <div className="font-display font-bold text-xs uppercase tracking-widest text-white/30 mb-3">Fiyat Bilgisi</div>
          <p className="font-body text-white/40 text-sm mb-4">Fiyatlarımızı görmek için bayi girişi yapın veya WhatsApp üzerinden iletişime geçin.</p>
          <a
            href={`https://wa.me/905323934370?text=${encodeURIComponent(`Merhaba, ${urunAdi} ürünü hakkında fiyat bilgisi almak istiyorum.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 font-display font-bold text-sm uppercase tracking-widest transition-colors w-full"
          >
            <MessageCircle size={16} />
            Fiyat İçin İletişime Geçiniz
          </a>
        </div>
      </div>
    )
  }

  const indirimYuzde = gosterBayiFiyat && bayiFiyatTL
    ? Math.round((1 - bayiFiyatTL / fiyatTL) * 100)
    : 0

  return (
    <div className="mb-6 space-y-2">
      {gosterBayiFiyat && bayiFiyati ? (
        <>
          {/* Üstü çizili normal fiyat */}
          <div className="flex items-center gap-2">
            <span className="font-body text-white/30 text-lg line-through">
              {formatFiyat(fiyat, paraBirimi)}
            </span>
            <span className="font-display font-black text-xs bg-brand-red/10 text-brand-red px-2 py-0.5">
              %{indirimYuzde} BAYİ İNDİRİMİ
            </span>
          </div>
          {/* Bayi fiyatı */}
          <div className="font-display font-black text-4xl text-brand-red">
            {formatFiyat(bayiFiyati, bayiParaBirimi)}
          </div>
          {/* TL karşılığı */}
          {bayiParaBirimi !== 'TRY' && bayiFiyatTL && (
            <div className="font-body text-white/40 text-sm">
              ≈ <span className="font-semibold">{bayiFiyatTL.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</span>
              <span className="text-white/20 text-xs ml-1">(güncel kur ile)</span>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="font-display font-black text-4xl text-white">
            {formatFiyat(fiyat, paraBirimi)}
          </div>
          {paraBirimi !== 'TRY' && (
            <div className="font-body text-white/40 text-sm">
              ≈ <span className="font-semibold">{fiyatTL.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</span>
              <span className="text-white/20 text-xs ml-1">(güncel kur ile)</span>
            </div>
          )}
        </>
      )}

      {/* KDV Bilgisi */}
      <div className="font-body text-white/30 text-xs mt-1 mb-2">
        * Fiyatlandırmalara KDV dahildir
      </div>

      {/* Kur notu */}
      {paraBirimi !== 'TRY' && (
        <div className="inline-flex items-center gap-1.5 bg-white/3 border border-white/8 px-3 py-1.5 text-xs font-body text-white/30">
          <Clock size={11} className="text-brand-red/50" />
          Ödeme TL olarak yapılır • Kur: 1 {paraBirimi === 'USD' ? '$' : '€'} = {(paraBirimi === 'USD' ? kur.USD : kur.EUR).toFixed(2)} ₺
        </div>
      )}

      {/* Fiyat güncelleme tarihi */}
      {fiyatGuncelleme && (
        <div className="font-body text-white/15 text-xs">
          Fiyat güncelleme: {new Date(fiyatGuncelleme).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      )}
    </div>
  )
}
