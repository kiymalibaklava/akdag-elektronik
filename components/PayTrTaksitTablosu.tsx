'use client'

import { useState, useEffect } from 'react'
import { CreditCard, X, ShieldCheck, Loader2 } from 'lucide-react'
import { dovizToTL, type KurData } from '@/lib/kur'
import { getKurClient } from '@/lib/kur-client'
import { createClient } from '@/lib/supabase'

interface Props {
  urunId?: string
  fiyat?: number
  bayiFiyati?: number | null
  paraBirimi?: string
  bayiParaBirimi?: string
  urunAdi?: string
  tutarTL?: number
  isBayi?: boolean
  compact?: boolean
  className?: string
}

export default function PayTrTaksitTablosu({
  urunId,
  fiyat,
  bayiFiyati,
  paraBirimi = 'TRY',
  bayiParaBirimi,
  urunAdi = '',
  tutarTL,
  isBayi = false,
  compact = false,
  className = '',
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isBayiAuth, setIsBayiAuth] = useState(isBayi)
  const [kur, setKur] = useState<KurData>({ USD: 32.5, EUR: 35.2, guncelleme: null })
  const [liveBayiFiyati, setLiveBayiFiyati] = useState<number | null | undefined>(bayiFiyati)
  const [liveBayiPb, setLiveBayiPb] = useState<string | undefined>(bayiParaBirimi)

  useEffect(() => {
    getKurClient().then(setKur).catch(() => {})

    if (isBayi) {
      setIsBayiAuth(true)
      return
    }

    // İstemci taraflı oturum & onaylı bayi kontrolü
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }: { data: any }) => {
      if (session?.user) {
        supabase
          .from('bayiler')
          .select('onaylandi')
          .eq('user_id', session.user.id)
          .maybeSingle()
          .then(async ({ data }: { data: any }) => {
            if (data?.onaylandi) {
              setIsBayiAuth(true)
              if (urunId && !bayiFiyati) {
                const { data: p } = await supabase
                  .from('urunler')
                  .select('bayi_fiyati, bayi_para_birimi')
                  .eq('id', urunId)
                  .maybeSingle()
                if (p?.bayi_fiyati) {
                  setLiveBayiFiyati(p.bayi_fiyati)
                  if (p.bayi_para_birimi) setLiveBayiPb(p.bayi_para_birimi)
                }
              }
            }
          })
      }
    })
  }, [isBayi, urunId, bayiFiyati])

  // Hesaplama: Bayi fiyatı varsa bayi fiyatını, yoksa standart fiyatı TL'ye çevir
  const calculateAmount = (): number => {
    if (tutarTL && tutarTL > 0) return Math.ceil(tutarTL)
    if (!fiyat) return 0

    const pb = paraBirimi || 'TRY'
    const effectiveBayiFiyati = liveBayiFiyati ?? bayiFiyati
    const effectiveBayiPb = liveBayiPb || bayiParaBirimi || pb

    if (effectiveBayiFiyati) {
      return Math.ceil(dovizToTL(effectiveBayiFiyati, effectiveBayiPb, kur))
    }
    return Math.ceil(dovizToTL(fiyat, pb, kur))
  }

  const amount = calculateAmount()

  // Modal açıldığında PayTR script'ini yükle
  useEffect(() => {
    if (!isOpen || !amount || amount <= 0) return
    setLoading(true)

    // Önceki script'i temizle
    const oldScript = document.getElementById('paytr-taksit-script')
    if (oldScript) oldScript.remove()

    // İçeriği temizle
    const container = document.getElementById('paytr_taksit_tablosu')
    if (container) container.innerHTML = ''

    const script = document.createElement('script')
    script.id = 'paytr-taksit-script'
    script.src = `https://www.paytr.com/odeme/taksit-tablosu/v2?token=dc8c5cea28b2a8b15031c9fcd623b7450fffd15e02c7f3d20e04432802668efd&merchant_id=749416&amount=${amount}&taksit=0&tumu=0`
    script.async = true
    script.onload = () => {
      setLoading(false)
    }
    script.onerror = () => {
      setLoading(false)
    }

    document.body.appendChild(script)

    return () => {
      const s = document.getElementById('paytr-taksit-script')
      if (s) s.remove()
    }
  }, [isOpen, amount])

  // ESC tuşuyla modalı kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // YALNIZCA ONAYLI BAYİLER GÖREBİLİR — Ziyaretçilere tamamen kapalı
  if (!isBayiAuth || !amount || amount <= 0) {
    return null
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          #paytr_taksit_tablosu {
            clear: both;
            font-size: 12px;
            max-width: 100%;
            text-align: center;
            font-family: inherit;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 12px;
            padding: 8px 0;
          }
          #paytr_taksit_tablosu::before,
          #paytr_taksit_tablosu::after {
            display: none;
          }
          .taksit-tablosu-wrapper {
            margin: 0;
            width: 250px;
            padding: 14px;
            cursor: default;
            text-align: center;
            display: flex;
            flex-direction: column;
            border: 1px solid #e5e7eb;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }
          .taksit-tablosu-wrapper:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .taksit-logo {
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
          }
          .taksit-logo img {
            max-height: 28px;
            object-fit: contain;
          }
          .taksit-baslik {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 6px;
            margin-bottom: 6px;
          }
          .taksit-tutari-text {
            width: 50%;
            color: #888888;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .taksit-tutar-wrapper {
            display: flex;
            justify-content: space-between;
            background-color: #f9fafb;
            margin-bottom: 4px;
            border-radius: 4px;
            padding: 5px 8px;
            transition: background-color 0.15s ease;
          }
          .taksit-tutar-wrapper:hover {
            background-color: #f3f4f6;
          }
          .taksit-tutari {
            width: 50%;
            padding: 3px 0;
            color: #374151;
            font-size: 12px;
            border: none;
          }
          .taksit-tutari:last-child {
            font-weight: 700;
            color: #111827;
          }
          @media all and (max-width: 600px) {
            .taksit-tablosu-wrapper {
              width: 100%;
              max-width: 320px;
            }
          }
        `
      }} />

      {/* Buton */}
      {compact ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-brand-red font-display uppercase tracking-wider transition-colors ${className}`}
        >
          <CreditCard size={13} className="text-brand-red" />
          <span>Taksit Seçeneklerini Gör</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`w-full btn-outline justify-center gap-2 text-xs py-2.5 group border-white/10 hover:border-brand-red/40 hover:bg-brand-red/5 transition-all text-white/70 hover:text-white ${className}`}
        >
          <CreditCard size={14} className="text-brand-red group-hover:scale-110 transition-transform" />
          <span>Taksit Seçenekleri (PayTR)</span>
          <span className="text-[10px] text-white/40 group-hover:text-white/60 ml-0.5">· 3-6 Taksit</span>
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
        >
          <div className="bg-[#141414] border border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl rounded-sm overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0F0F0F]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red flex-shrink-0">
                  <CreditCard size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-sm sm:text-base uppercase text-white tracking-wide">
                      Taksit Seçenekleri
                    </h3>
                    <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 font-display font-semibold uppercase">
                      Bayi Özel
                    </span>
                  </div>
                  <p className="font-body text-white/40 text-xs truncate max-w-md mt-0.5">
                    {urunAdi || 'Bayi Taksitli Satış Tablosu'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] uppercase font-display tracking-widest text-white/40">Bayi Peşin / Tek Çekim</div>
                  <div className="font-display font-black text-brand-red text-base">
                    {amount.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-white/40 hover:text-white p-2 hover:bg-white/5 rounded transition-colors"
                  aria-label="Kapat"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content - PayTR Table Container */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white min-h-[360px] relative">
              {loading && (
                <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center gap-3">
                  <Loader2 size={32} className="text-brand-red animate-spin" />
                  <span className="font-display text-xs uppercase tracking-widest text-gray-600 font-bold">
                    PayTR Taksit Oranları Hesaplanıyor...
                  </span>
                </div>
              )}
              <div id="paytr_taksit_tablosu" />
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-white/10 bg-[#0F0F0F] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-green-400 flex-shrink-0" />
                <span>Belirtilen taksit oranları ve vade farkları PayTR Sanal POS altyapısı tarafından güncel olarak yansıtılmaktadır.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn-outline text-xs py-1.5 px-4 self-end sm:self-auto"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
