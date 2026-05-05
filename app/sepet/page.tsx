'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  getCart,
  updateQty,
  removeFromCart,
  clearCart,
  type CartItem,
} from '@/lib/cart'
import { dovizToTL, type KurData } from '@/lib/kur'
import { ArrowLeft, Trash2, Minus, Plus, CreditCard, Building2, Loader2, MapPin, Truck, Store } from 'lucide-react'
import type { Session, User } from '@supabase/supabase-js'

interface BayiRow {
  id: string
  firma_adi: string
  onaylandi: boolean
}

export default function SepetPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [bayi, setBayi] = useState<BayiRow | null>(null)
  const [adSoyad, setAdSoyad] = useState('')
  const [email, setEmail] = useState('')
  const [telefon, setTelefon] = useState('')
  const [notlar, setNotlar] = useState('')
  const [teslimat, setTeslimat] = useState<'kargo' | 'depo'>('kargo')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [doneNo, setDoneNo] = useState('')
  const [payToken, setPayToken] = useState<string | null>(null)
  const [kur, setKur] = useState<KurData>({ USD: 32.5, EUR: 35.2, guncelleme: null })
  const [kurLoaded, setKurLoaded] = useState(false)
  const supabase = useRef(createClient()).current

  const refreshCart = useCallback(() => {
    setItems(getCart())
  }, [])

  useEffect(() => {
    refreshCart()
    const onUpd = () => refreshCart()
    window.addEventListener('cart-updated', onUpd)
    return () => window.removeEventListener('cart-updated', onUpd)
  }, [refreshCart])

  // Anlık kur çek — sepetteki tüm fiyatlar buna göre hesaplanacak
  useEffect(() => {
    fetch('/api/kur')
      .then(r => r.json())
      .then((data: KurData) => {
        setKur(data)
        setKurLoaded(true)
      })
      .catch(() => setKurLoaded(true))
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        supabase
          .from('bayiler')
          .select('id, firma_adi, onaylandi')
          .eq('user_id', u.id)
          .maybeSingle()
          .then((res: { data: BayiRow | null }) => setBayi(res.data))
      }
    })
  }, [supabase])

  const isBayi = !!(bayi?.onaylandi)

  // Anlık kur ile birim fiyat hesapla (döviz varsa dövizden, yoksa saklanan TL'den)
  const livePrice = (i: CartItem): number => {
    const pb = isBayi && i.bayi_fiyat_doviz ? (i.bayi_para_birimi || i.para_birimi || 'TRY') : (i.para_birimi || 'TRY')
    const doviz = isBayi && i.bayi_fiyat_doviz ? i.bayi_fiyat_doviz : (i.fiyat_doviz || null)

    if (doviz && pb !== 'TRY') {
      return dovizToTL(doviz, pb, kur)
    }
    // Bayi TL fiyatı veya normal TL fiyatı
    return Math.ceil(isBayi && i.bayi_fiyati ? i.bayi_fiyati : i.fiyat)
  }

  const liveTotal = (): number => {
    return Math.ceil(items.reduce((sum, i) => sum + livePrice(i) * i.adet, 0))
  }

  const total = liveTotal()

  const submitOrder = async (odeme_tipi: 'havale' | 'kart') => {
    setError('')
    if (!items.length) {
      setError('Sepetiniz boş.')
      return
    }
    if (!adSoyad.trim() || !email.trim()) {
      setError('Ad soyad ve e-posta zorunludur.')
      return
    }

    const urunler = items.map((i) => ({
      urun_id: i.id,
      ad: i.ad,
      adet: i.adet,
      fiyat: livePrice(i),
      fotograf: i.fotograf,
    }))

    setBusy(true)
    try {
      const res = await fetch('/api/siparis-olustur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id ?? null,
          bayi_id: isBayi ? bayi?.id ?? null : null,
          urunler,
          toplam_tutar: total,
          ad_soyad: adSoyad.trim(),
          email: email.trim(),
          telefon: telefon.trim() || null,
          notlar: notlar.trim() || null,
          odeme_tipi,
          teslimat_tipi: teslimat,
          is_bayi: isBayi,
          bayi_adi: isBayi ? bayi?.firma_adi : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Sipariş oluşturulamadı.')
        setBusy(false)
        return
      }

      clearCart()
      refreshCart()

      if (odeme_tipi === 'havale') {
        setDoneNo(data.siparis_no)
        setBusy(false)
        return
      }

      const payRes = await fetch('/api/paytr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siparis_no: data.siparis_no,
          tutar: total,
          ad_soyad: adSoyad.trim(),
          email: email.trim(),
          telefon: telefon.trim(),
          urunler: items.map((i) => ({
            ad: i.ad,
            fiyat: livePrice(i),
            adet: i.adet,
          })),
        }),
      })
      const payData = await payRes.json()
      if (!payRes.ok) {
        setError(payData.error || 'Ödeme başlatılamadı. Sipariş kaydı oluştu; lütfen bizimle iletişime geçin.')
        setBusy(false)
        return
      }
      setPayToken(payData.token)
      setBusy(false)
    } catch {
      setError('Bağlantı hatası.')
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen pt-8 pb-24">
      <div className="bg-[#0A0A0A] border-b border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            href="/urunler"
            className="inline-flex items-center gap-2 font-body text-white/35 hover:text-brand-red text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Ürünlere dön
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-px bg-brand-red" />
            <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Alışveriş</span>
          </div>
          <h1 className="font-display font-black text-4xl md:text-6xl uppercase text-white">Sepet</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12">
        {doneNo && (
          <div className="mb-10 bg-green-500/10 border border-green-500/20 p-6 text-center">
            <p className="font-display font-bold text-green-400 uppercase tracking-widest text-sm mb-2">Sipariş alındı</p>
            <p className="font-body text-white/60 text-sm mb-4">
              Sipariş numaranız: <strong className="text-white">{doneNo}</strong>
            </p>
            <Link href="/urunler" className="btn-primary text-sm inline-flex">
              Alışverişe devam
            </Link>
          </div>
        )}

        {isBayi && (
          <div className="mb-6 flex items-center gap-2 text-green-400/90 text-sm font-body border border-green-500/20 bg-green-500/5 px-4 py-3">
            <Building2 size={16} />
            Onaylı bayi fiyatları uygulanıyor ({bayi?.firma_adi})
          </div>
        )}

        {!items.length && !doneNo ? (
          <div className="text-center py-20 border border-white/5 bg-[#141414]">
            <p className="font-body text-white/40 mb-6">Sepetiniz boş.</p>
            <Link href="/urunler" className="btn-primary text-sm">
              Ürünleri incele
            </Link>
          </div>
        ) : null}

        {items.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-3">
              {items.map((i) => (
                <div
                  key={i.id}
                  className="flex gap-4 bg-[#141414] border border-white/5 p-4 items-center"
                >
                  <div className="relative w-20 h-20 bg-black/40 flex-shrink-0 overflow-hidden">
                    {i.fotograf ? (
                      <Image src={i.fotograf} alt="" fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="w-full h-full bg-white/5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-white text-sm uppercase tracking-wide truncate">{i.ad}</div>
                    <div className="font-body text-white/30 text-xs mt-1">{i.kategori}</div>
                    <div className="font-display text-brand-red text-sm mt-2">
                      {Math.ceil(livePrice(i) * i.adet).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                      <span className="text-white/25 font-body text-xs ml-2">
                        ({Math.ceil(livePrice(i)).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺ × {i.adet})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/50 hover:text-white"
                      onClick={() => {
                        updateQty(i.id, i.adet - 1)
                        refreshCart()
                      }}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-body text-sm text-white/70">{i.adet}</span>
                    <button
                      type="button"
                      className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/50 hover:text-white"
                      onClick={() => {
                        updateQty(i.id, i.adet + 1)
                        refreshCart()
                      }}
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      type="button"
                      className="ml-2 text-white/25 hover:text-brand-red p-2"
                      onClick={() => {
                        removeFromCart(i.id)
                        refreshCart()
                      }}
                      aria-label="Kaldır"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="bg-[#141414] border border-white/5 p-6">
                <div className="flex justify-between items-baseline mb-6 border-b border-white/5 pb-4">
                  <span className="font-display text-xs tracking-widest uppercase text-white/50">Toplam <span className="text-white/30">(KDV Dahil)</span></span>
                  <span className="font-display font-black text-2xl text-brand-red">{Math.ceil(total).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">
                      Ad soyad
                    </label>
                    <input className="input-dark" value={adSoyad} onChange={(e) => setAdSoyad(e.target.value)} />
                  </div>
                  <div>
                    <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">
                      E-posta
                    </label>
                    <input type="email" className="input-dark" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">
                      Telefon
                    </label>
                    <input className="input-dark" value={telefon} onChange={(e) => setTelefon(e.target.value)} />
                  </div>
                  <div>
                    <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">
                      Sipariş notu
                    </label>
                    <textarea className="input-dark resize-none text-sm" rows={3} value={notlar} onChange={(e) => setNotlar(e.target.value)} />
                  </div>

                  {/* Teslimat Yöntemi */}
                  <div className="border border-white/5 bg-[#0F0F0F] p-4 space-y-3">
                    <div className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 mb-1">Teslimat Yöntemi</div>
                    
                    <label className={`flex items-start gap-3 p-3 border cursor-pointer transition-all duration-200 ${teslimat === 'kargo' ? 'border-brand-red/40 bg-brand-red/5' : 'border-white/5 hover:border-white/10'}`}>
                      <input type="radio" name="teslimat" value="kargo" checked={teslimat === 'kargo'} onChange={() => setTeslimat('kargo')} className="mt-1 accent-[#DA291C]" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Truck size={14} className={teslimat === 'kargo' ? 'text-brand-red' : 'text-white/30'} />
                          <span className="font-display font-bold text-sm uppercase text-white">Adrese Kargo</span>
                        </div>
                        <p className="font-body text-white/30 text-xs mt-1">Siparişiniz adresinize kargo ile gönderilir.</p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 border cursor-pointer transition-all duration-200 ${teslimat === 'depo' ? 'border-brand-red/40 bg-brand-red/5' : 'border-white/5 hover:border-white/10'}`}>
                      <input type="radio" name="teslimat" value="depo" checked={teslimat === 'depo'} onChange={() => setTeslimat('depo')} className="mt-1 accent-[#DA291C]" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Store size={14} className={teslimat === 'depo' ? 'text-brand-red' : 'text-white/30'} />
                          <span className="font-display font-bold text-sm uppercase text-white">Depodan Teslim Al</span>
                          <span className="font-display font-black text-[10px] bg-green-600/20 text-green-400 px-1.5 py-0.5 tracking-wider uppercase">Ücretsiz</span>
                        </div>
                        <p className="font-body text-white/30 text-xs mt-1">Siparişinizi mağazamızdan teslim alın.</p>
                      </div>
                    </label>

                    {teslimat === 'depo' && (
                      <div className="bg-brand-red/5 border border-brand-red/20 p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin size={13} className="text-brand-red shrink-0 mt-0.5" />
                          <span className="font-body text-white/50 text-xs">Cumhuriyet Mah. Sur Cad. No:17/A, Melikgazi / Kayseri</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Store size={13} className="text-green-400 shrink-0 mt-0.5" />
                          <span className="font-body text-green-400/80 text-xs font-semibold">Ürününüz 1 saat içinde depoda hazır edilecektir.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="mt-4 bg-brand-red/10 border border-brand-red/30 p-3 text-brand-red text-sm font-body">{error}</div>
                )}

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => submitOrder('havale')}
                    className="btn-outline w-full justify-center text-sm disabled:opacity-40"
                  >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <Building2 size={15} />}
                    Havale / EFT ile sipariş
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => submitOrder('kart')}
                    className="btn-primary w-full justify-center text-sm disabled:opacity-40"
                  >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={15} />}
                    Kredi kartı ile öde (PayTR)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {payToken && (
        <div className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-white/10 w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
              <span className="font-display text-xs tracking-widest uppercase text-white/60">Güvenli ödeme</span>
              <button
                type="button"
                className="text-white/40 hover:text-white text-sm font-body"
                onClick={() => setPayToken(null)}
              >
                Kapat
              </button>
            </div>
            <iframe
              title="PayTR"
              src={`https://www.paytr.com/odeme/guvenli/${payToken}`}
              className="w-full flex-1 min-h-[560px] bg-white"
            />
          </div>
        </div>
      )}
    </div>
  )
}
