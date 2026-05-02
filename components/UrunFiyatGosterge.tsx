'use client'

import { useEffect, useState } from 'react'
import { dovizToTL, formatFiyat, type KurData } from '@/lib/kur'
import { Clock } from 'lucide-react'

interface Props {
  fiyat?: number
  bayiFiyati?: number
  paraBirimi: string
  bayiParaBirimi: string
  fiyatGuncelleme?: string
  isBayi?: boolean
}

export default function UrunFiyatGosterge({
  fiyat, bayiFiyati, paraBirimi, bayiParaBirimi, fiyatGuncelleme, isBayi = false
}: Props) {
  const [kur, setKur] = useState<KurData>({ USD: 32.5, EUR: 35.2, guncelleme: null })

  useEffect(() => {
    fetch('/api/kur').then(r => r.json()).then(setKur).catch(() => {})
  }, [])

  if (!fiyat) return null

  const fiyatTL = dovizToTL(fiyat, paraBirimi, kur)
  const bayiFiyatTL = bayiFiyati ? dovizToTL(bayiFiyati, bayiParaBirimi, kur) : null
  const gosterBayiFiyat = isBayi && bayiFiyatTL && bayiFiyatTL < fiyatTL

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
              ≈ <span className="font-semibold">{bayiFiyatTL.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</span>
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
              ≈ <span className="font-semibold">{fiyatTL.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</span>
              <span className="text-white/20 text-xs ml-1">(güncel kur ile)</span>
            </div>
          )}
        </>
      )}

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
