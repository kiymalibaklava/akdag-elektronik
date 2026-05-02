'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { getCart, removeFromCart, updateQty, clearCart, getCartTotal, type CartItem } from '@/lib/cart'
import Image from 'next/image'
import Link from 'next/link'
import {
  Trash2, Plus, Minus, ShoppingCart, ArrowRight,
  Phone, Package, CreditCard, Truck, Lock, AlertCircle
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface Bayi { onaylandi: boolean; firma_adi: string; id: string }
type OdemeYontemi = 'kredi_karti' | 'havale' | 'whatsapp'

export default function SepetPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [bayi, setBayi] = useState<Bayi | null>(null)
  const [notlar, setNotlar] = useState('')
  const [adSoyad, setAdSoyad] = useState('')
  const [email, setEmail] = useState('')
  const [telefon, setTelefon] = useState('')
  const [odemeYontemi, setOdemeYontemi] = useState<OdemeYontemi>('kredi_karti')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paytrToken, setPaytrToken] = useState<string | null>(null)
  const supabase = useRef(createClient()).current

  useEffect(() => {
    setCart(getCart())
    const handler = () => setCart(getCart())
    window.addEventListener('cart-updated', handler)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        setEmail(session.user.email || '')
        const { data } = await supabase
          .from('bayiler').select('onaylandi, firma_adi, id')
          .eq('user_id', session.user.id).maybeSingle()
        setBayi(data)
      }
    })

    return () => window.removeEventListener('cart-updated', handler)
  }, [])

  const isBayi = !!bayi?.onaylandi
  const total = getCartTotal(isBayi)

  // Yeni API'yi kullanarak sipariş oluştur
  const createOrder = async (odeme_tipi: string) => {
    const orderItems = cart.map(item => ({
      urun_id: item.id,
      ad: item.ad,
      fiyat: isBayi && item.bayi_fiyati ? item.bayi_fiyati : item.fiyat,
      adet: item.adet,
      fotograf: item.fotograf,
    }))

    const res = await fetch('/api/siparis-olustur', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user?.id || null,
        bayi_id: bayi?.id || null,
        urunler: orderItems,
        toplam_tutar: total,
        ad_soyad: adSoyad,
        email,
        telefon,
        notlar,
        odeme_tipi,
        is_bayi: isBayi,
        bayi_adi: bayi?.firma_adi || null,
      }),
    })

    const data = await res.json()
    return { siparis_no: data.siparis_no, id: data.id, error: data.error }
  }

  // Kredi kartı ile ödeme
  const handleKrediKarti = async () => {
    if (!adSoyad || !email || !telefon) { setError('Ad soyad, e-posta ve telefon zorunludur.'); return }
    setLoading(true); setError('')

    const { siparis_no, error: orderErr } = await createOrder('kredi_karti')
    if (orderErr || !siparis_no) { setError('Sipariş oluşturulamadı.'); setLoading(false); return }

    // PayTR token al
    const res = await fetch('/api/paytr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siparis_no,
        tutar: total.toString(),
        ad_soyad: adSoyad,
        email,
        telefon,
        user_ip: '127.0.0.1',
        urunler: cart.map(i => ({
          ad: i.ad,
          fiyat: isBayi && i.bayi_fiyati ? i.bayi_fiyati : i.fiyat,
          adet: i.adet,
        })),
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error || 'Ödeme başlatılamadı.'); return }

    clearCart()
    setPaytrToken(data.token)
  }

  // Havale ile sipariş
  const handleHavale = async () => {
    if (!adSoyad || !email || !telefon) { setError('Ad soyad, e-posta ve telefon zorunludur.'); return }
    setLoading(true); setError('')

    const { siparis_no, error: orderErr } = await createOrder('havale')
    setLoading(false)

    if (orderErr) { setError('Sipariş oluşturulamadı.'); return }

    clearCart()
    window.location.href = `/odeme/basarili?siparis=${siparis_no}&yontem=havale`
  }

  // WhatsApp ile sipariş
  const handleWhatsapp = async () => {
    setLoading(true)
    const { siparis_no } = await createOrder('whatsapp')
    setLoading(false)

    const mesaj = [
      `*Yeni Sipariş — Akdağ Elektronik*`,
      siparis_no ? `Sipariş No: ${siparis_no}` : '',
      bayi ? `Bayi: ${bayi.firma_adi}` : adSoyad ? `Müşteri: ${adSoyad}` : '',
      ``,
      ...cart.map(i => {
        const p = isBayi && i.bayi_fiyati ? i.bayi_fiyati : i.fiyat
        return `• ${i.ad} ×${i.adet} — ${(p * i.adet).toLocaleString('tr-TR')} ₺`
      }),
      ``,
      `*Toplam: ${total.toLocaleString('tr-TR')} ₺*`,
      notlar ? `\nNot: ${notlar}` : '',
    ].filter(Boolean).join('\n')

    clearCart()
    window.open(`https://wa.me/903522316915?text=${encodeURIComponent(mesaj)}`, '_blank')
    window.location.href = '/odeme/basarili'
  }

  const handleSubmit = () => {
    setError('')
    if (odemeYontemi === 'kredi_karti') handleKrediKarti()
    else if (odemeYontemi === 'havale') handleHavale()
    else handleWhatsapp()
  }

  // PayTR iframe
  if (paytrToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <Lock size={14} className="text-green-400" />
            <span className="font-display font-semibold text-xs tracking-widest uppercase text-green-400">Güvenli Ödeme — PayTR</span>
          </div>
          <iframe
            src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
            frameBorder="0"
            scrolling="no"
            style={{ width: '100%', height: '600px' }}
          />
          <p className="font-body text-white/20 text-xs text-center mt-4">256-bit SSL ile korunmaktadır</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-8 pb-24">
      <div className="bg-[#0A0A0A] border-b border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-px bg-brand-red" />
            <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">{cart.length} ürün</span>
          </div>
          <h1 className="font-display font-black text-5xl uppercase text-white">SEPETİM</h1>
          {isBayi && (
            <div className="inline-flex items-center gap-2 mt-3 bg-green-500/10 border border-green-500/20 px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="font-display font-semibold text-xs tracking-widest uppercase text-green-400">
                Bayi Fiyatları — {bayi?.firma_adi}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        {cart.length === 0 ? (
          <div className="text-center py-24 border border-white/5 bg-[#141414]">
            <ShoppingCart size={48} className="text-white/10 mx-auto mb-4" />
            <p className="font-display font-bold text-xl uppercase text-white/20 tracking-widest mb-3">Sepetiniz Boş</p>
            <Link href="/urunler" className="btn-primary text-sm inline-flex mt-4">
              Ürünleri İncele <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Sol: Ürünler + Müşteri bilgileri */}
            <div className="lg:col-span-3 space-y-1">
              {cart.map(item => {
                const aktifFiyat = isBayi && item.bayi_fiyati ? item.bayi_fiyati : item.fiyat
                return (
                  <div key={item.id} className="flex gap-4 bg-[#141414] border border-white/5 p-4 hover:border-white/10 transition-colors">
                    <div className="w-20 h-20 bg-[#1A1A1A] border border-white/5 flex-shrink-0 overflow-hidden">
                      {item.fotograf
                        ? <Image src={item.fotograf} alt={item.ad} width={80} height={80} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-white/10" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-sm uppercase text-white tracking-wide truncate">{item.ad}</div>
                      <div className="font-display text-xs text-brand-red/50 tracking-widest uppercase mt-0.5">{item.kategori}</div>
                      {isBayi && item.bayi_fiyati ? (
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="font-display font-black text-base text-brand-red">{item.bayi_fiyati.toLocaleString('tr-TR')} ₺</span>
                          <span className="font-body text-white/20 text-xs line-through">{item.fiyat.toLocaleString('tr-TR')} ₺</span>
                        </div>
                      ) : (
                        <div className="font-display font-black text-base text-white mt-1.5">{item.fiyat.toLocaleString('tr-TR')} ₺</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button onClick={() => removeFromCart(item.id)} className="text-white/15 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateQty(item.id, item.adet - 1)}
                          className="w-6 h-6 border border-white/10 flex items-center justify-center text-white/40 hover:border-brand-red hover:text-brand-red transition-all">
                          <Minus size={10} />
                        </button>
                        <span className="font-display font-bold text-sm text-white w-5 text-center">{item.adet}</span>
                        <button onClick={() => updateQty(item.id, item.adet + 1)}
                          className="w-6 h-6 border border-white/10 flex items-center justify-center text-white/40 hover:border-brand-red hover:text-brand-red transition-all">
                          <Plus size={10} />
                        </button>
                      </div>
                      <div className="font-display font-black text-sm text-white">
                        {(aktifFiyat * item.adet).toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="flex justify-between items-center pt-2">
                <button onClick={clearCart} className="font-body text-white/20 hover:text-red-500 text-xs transition-colors">Sepeti Temizle</button>
                <Link href="/urunler" className="font-body text-white/30 hover:text-white text-xs transition-colors">← Alışverişe Devam</Link>
              </div>

              {/* Müşteri bilgileri */}
              <div className="bg-[#141414] border border-white/5 p-5 space-y-4 mt-2">
                <h3 className="font-display font-bold text-sm uppercase tracking-widest text-white">İletişim Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/30 block mb-1.5">Ad Soyad *</label>
                    <input type="text" value={adSoyad} onChange={e => setAdSoyad(e.target.value)} className="input-dark" placeholder="Ad Soyad" />
                  </div>
                  <div>
                    <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/30 block mb-1.5">Telefon *</label>
                    <input type="tel" value={telefon} onChange={e => setTelefon(e.target.value)} className="input-dark" placeholder="+90 5xx xxx xx xx" />
                  </div>
                </div>
                <div>
                  <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/30 block mb-1.5">E-posta *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-dark" placeholder="email@ornek.com" />
                </div>
                <div>
                  <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/30 block mb-1.5">Sipariş Notu</label>
                  <textarea value={notlar} onChange={e => setNotlar(e.target.value)} rows={2} className="input-dark resize-none" placeholder="Teslimat veya özel istekleriniz..." />
                </div>
              </div>
            </div>

            {/* Sağ: Özet + Ödeme */}
            <div className="lg:col-span-2">
              <div className="bg-[#141414] border border-white/8 p-6 sticky top-24 space-y-5"
                style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)' }}>
                <h2 className="font-display font-black text-lg uppercase text-white border-b border-white/5 pb-4">Sipariş Özeti</h2>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {cart.map(item => {
                    const p = isBayi && item.bayi_fiyati ? item.bayi_fiyati : item.fiyat
                    return (
                      <div key={item.id} className="flex justify-between text-xs font-body text-white/40">
                        <span className="truncate flex-1 mr-2">{item.ad} ×{item.adet}</span>
                        <span className="flex-shrink-0">{(p * item.adet).toLocaleString('tr-TR')} ₺</span>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                  <span className="font-display font-bold text-sm uppercase text-white">Toplam</span>
                  <span className="font-display font-black text-2xl text-brand-red">{total.toLocaleString('tr-TR')} ₺</span>
                </div>
                {isBayi && (
                  <div className="text-xs font-body text-green-400/70 -mt-3 text-right">Bayi indirimi uygulandı</div>
                )}

                {/* Ödeme yöntemi */}
                <div className="space-y-2">
                  <p className="font-display font-semibold text-xs tracking-widest uppercase text-white/30">Ödeme Yöntemi</p>
                  {[
                    { id: 'kredi_karti' as const, icon: CreditCard, label: 'Kredi / Banka Kartı', sub: 'PayTR güvencesiyle' },
                    { id: 'havale' as const, icon: Truck, label: 'Havale / EFT', sub: 'Sipariş sonrası ödeme' },
                    { id: 'whatsapp' as const, icon: Phone, label: 'WhatsApp ile Sipariş', sub: 'Hızlı ve kolay' },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setOdemeYontemi(opt.id)}
                      className={`w-full flex items-center gap-3 p-3 border transition-all duration-200 text-left ${
                        odemeYontemi === opt.id ? 'border-brand-red bg-brand-red/5' : 'border-white/8 hover:border-white/20'
                      }`}>
                      <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${odemeYontemi === opt.id ? 'text-brand-red' : 'text-white/30'}`}>
                        <opt.icon size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="font-display font-bold text-xs uppercase tracking-wide text-white">{opt.label}</div>
                        <div className="font-body text-white/25 text-xs">{opt.sub}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${odemeYontemi === opt.id ? 'border-brand-red bg-brand-red' : 'border-white/20'}`} />
                    </button>
                  ))}
                </div>

                {/* Havale bilgisi */}
                {odemeYontemi === 'havale' && (
                  <div className="bg-[#1A1A1A] border border-white/8 p-4 text-xs font-body space-y-1">
                    <p className="font-display font-bold text-xs uppercase tracking-widest text-white/50 mb-2">Banka Bilgileri</p>
                    <p className="text-white/50">Banka: <span className="text-white">Ziraat Bankası</span></p>
                    <p className="text-white/50">IBAN: <span className="text-white">TR00 0000 0000 0000 0000 0000 00</span></p>
                    <p className="text-white/50">Hesap Adı: <span className="text-white">Akdağ Elektronik</span></p>
                    <p className="text-yellow-400/70 mt-2">⚠ Açıklama: Sipariş numaranızı yazın</p>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 bg-brand-red/10 border border-brand-red/30 p-3 text-brand-red text-xs font-body">
                    <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <button onClick={handleSubmit} disabled={loading}
                  className="btn-primary w-full justify-center text-sm disabled:opacity-40">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : odemeYontemi === 'kredi_karti' ? <Lock size={14} />
                    : odemeYontemi === 'whatsapp' ? <Phone size={14} />
                    : <Truck size={14} />
                  }
                  {loading ? 'Hazırlanıyor...'
                    : odemeYontemi === 'kredi_karti' ? 'Güvenli Ödeme Yap'
                    : odemeYontemi === 'whatsapp' ? "WhatsApp'a Gönder"
                    : 'Sipariş Ver'
                  }
                </button>

                <div className="flex items-center justify-center gap-2 text-white/15 text-xs font-body">
                  <Lock size={10} />256-bit SSL ile korunmaktadır
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
