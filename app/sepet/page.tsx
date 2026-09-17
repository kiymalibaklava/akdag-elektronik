'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  getCart,
  updateQty,
  removeFromCart,
  clearCart,
  pullCartFromSupabase,
  type CartItem,
} from '@/lib/cart'
import { dovizToTL, type KurData } from '@/lib/kur'
import { getKurClient } from '@/lib/kur-client'
import { 
  ArrowLeft, Trash2, Minus, Plus, CreditCard, Building2, Loader2, MapPin, Truck, Store, 
  Info, Briefcase, User as UserIcon, ShieldCheck
} from 'lucide-react'
import type { Session, User } from '@supabase/supabase-js'
import PayTrTaksitTablosu from '@/components/PayTrTaksitTablosu'

interface BayiRow {
  id: string
  firma_adi: string
  onaylandi: boolean
}

export default function SepetPage() {
  const router = useRouter()
  const [authChecking, setAuthChecking] = useState(true)
  const [items, setItems] = useState<CartItem[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [bayi, setBayi] = useState<BayiRow | null>(null)
  const [adSoyad, setAdSoyad] = useState('')
  const [email, setEmail] = useState('')
  const [telefon, setTelefon] = useState('')
  const [notlar, setNotlar] = useState('')
  const [teslimat, setTeslimat] = useState<'kargo' | 'depo'>('kargo')
  const [teslimatAdresi, setTeslimatAdresi] = useState('')
  
  const [faturaTipi, setFaturaTipi] = useState<'bireysel' | 'kurumsal'>('bireysel')
  const [firmaUnvani, setFirmaUnvani] = useState('')
  const [vergiDairesi, setVergiDairesi] = useState('')
  const [vergiNo, setVergiNo] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [payToken, setPayToken] = useState<string | null>(null)
  const [kur, setKur] = useState<KurData>({ USD: 32.5, EUR: 35.2, guncelleme: null })
  const [payTrWarning, setPayTrWarning] = useState(false)
  
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

  useEffect(() => {
    getKurClient()
      .then((data: KurData) => {
        setKur(data)
      })
      .catch(() => {})
    // #9 — Form verilerini localStorage'dan yükle
    try {
      const saved = localStorage.getItem('akdag_sepet_form')
      if (saved) {
        const d = JSON.parse(saved)
        if (d.adSoyad) setAdSoyad(d.adSoyad)
        if (d.email) setEmail(d.email)
        if (d.telefon) setTelefon(d.telefon)
        if (d.teslimatAdresi) setTeslimatAdresi(d.teslimatAdresi)
        if (d.notlar) setNotlar(d.notlar)
        if (d.faturaTipi) setFaturaTipi(d.faturaTipi)
        if (d.firmaUnvani) setFirmaUnvani(d.firmaUnvani)
        if (d.vergiDairesi) setVergiDairesi(d.vergiDairesi)
        if (d.vergiNo) setVergiNo(d.vergiNo)
      }
    } catch {}
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (!u) {
        router.replace('/bayi')
        return
      }

      setEmail(prev => prev || u.email || '')

      supabase
        .from('bayiler')
        .select('id, firma_adi, onaylandi, telefon, yetkili_adi, sehir')
        .eq('user_id', u.id)
        .maybeSingle()
        .then((res: { data: any | null }) => {
          if (!res.data?.onaylandi) {
            router.replace('/bayi')
            return
          }
          setBayi(res.data)
          setAuthChecking(false)
          setTelefon(prev => prev || res.data.telefon || '')
          setAdSoyad(prev => prev || res.data.yetkili_adi || u.user_metadata?.full_name || '')
          setFaturaTipi('kurumsal')
          setFirmaUnvani(prev => prev || res.data.firma_adi || '')

          // Diğer cihazlardan eklenen güncel sepeti çek
          pullCartFromSupabase().then(() => refreshCart())
        })
    })
  }, [supabase, router, refreshCart])

  // Farklı cihazdan eklenen ürünlerin anlık güncellenmesi için pencere odaklandığında eşitle
  useEffect(() => {
    const onFocus = () => {
      pullCartFromSupabase().then(() => refreshCart())
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refreshCart])

  // #9 — Form verilerini her değişiklikte localStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem('akdag_sepet_form', JSON.stringify({
        adSoyad, email, telefon, teslimatAdresi, notlar,
        faturaTipi, firmaUnvani, vergiDairesi, vergiNo
      }))
    } catch {}
  }, [adSoyad, email, telefon, teslimatAdresi, notlar, faturaTipi, firmaUnvani, vergiDairesi, vergiNo])

  const isBayi = !!(bayi?.onaylandi)

  const livePrice = (i: CartItem): number => {
    const pb = isBayi && i.bayi_fiyat_doviz ? (i.bayi_para_birimi || i.para_birimi || 'TRY') : (i.para_birimi || 'TRY')
    const doviz = isBayi && i.bayi_fiyat_doviz ? i.bayi_fiyat_doviz : (i.fiyat_doviz || null)
    if (doviz && pb !== 'TRY') return dovizToTL(doviz, pb, kur)
    return Math.ceil(isBayi && i.bayi_fiyati ? i.bayi_fiyati : i.fiyat)
  }

  const liveTotal = (): number => Math.ceil(items.reduce((sum, i) => sum + livePrice(i) * i.adet, 0))
  const total = liveTotal()

  const submitOrder = async () => {
    setError('')
    if (!isBayi) {
      setError('Sitemiz yalnızca yetkili bayilerimize toptan satış yapmaktadır. Sipariş vermek için lütfen Bayi Girişi yapınız.')
      return
    }
    if (!items.length) { setError('Sepetiniz boş.'); return }
    if (!adSoyad.trim() || !email.trim()) { setError('Ad soyad ve e-posta zorunludur.'); return }
    if (!telefon.trim()) { setError('Telefon numarası zorunludur.'); return }
    if (teslimat === 'kargo' && !teslimatAdresi.trim()) {
      setError('Lütfen kargo teslimat adresi giriniz.')
      return
    }
    if (faturaTipi === 'kurumsal' && (!firmaUnvani.trim() || !vergiNo.trim())) {
      setError('Kurumsal fatura için firma ünvanı ve vergi no zorunludur.'); return
    }

    const urunler = items.map((i) => ({
      urun_id: i.id, ad: i.ad, adet: i.adet, fiyat: livePrice(i), fotograf: i.fotograf,
    }))

    setBusy(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session?.access_token) {
        reqHeaders['Authorization'] = `Bearer ${session.access_token}`
      }

      const res = await fetch('/api/siparis-olustur', {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify({
          user_id: user?.id ?? null,
          bayi_id: isBayi ? bayi?.id ?? null : null,
          urunler,
          toplam_tutar: total,
          ad_soyad: adSoyad.trim(),
          email: email.trim(),
          telefon: telefon.trim() || null,
          notlar: notlar.trim() || null,
          odeme_tipi: 'kart',
          teslimat_tipi: teslimat,
          is_bayi: isBayi,
          bayi_adi: isBayi ? bayi?.firma_adi : null,
          fatura_tipi: faturaTipi,
          firma_unvani: faturaTipi === 'kurumsal' ? firmaUnvani : null,
          vergi_dairesi: faturaTipi === 'kurumsal' ? vergiDairesi : null,
          vergi_no: faturaTipi === 'kurumsal' ? vergiNo : null,
          teslimat_adresi: teslimat === 'kargo' ? teslimatAdresi : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Sipariş oluşturulamadı.'); setBusy(false); return }

      // PayTR token isteği (Sepet silinmez, ödeme başarıyla tamamlandığında /odeme/basarili sayfasında temizlenir)
      const payRes = await fetch('/api/paytr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siparis_no: data.siparis_no,
          tutar: total,
          ad_soyad: adSoyad.trim(),
          email: email.trim(),
          telefon: telefon.trim(),
          urunler: items.map((i) => ({ ad: i.ad, fiyat: livePrice(i), adet: i.adet })),
        }),
      })
      const payData = await payRes.json()
      if (!payRes.ok || !payData.token) {
        setError(payData.error || 'Ödeme başlatılamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.')
        setBusy(false)
        return
      }

      setPayToken(payData.token)
      setBusy(false)
    } catch {
      setError('Bağlantı hatası oluştu. Lütfen tekrar deneyin.')
      setBusy(false)
    }
  }

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/10 border-t-brand-red rounded-full animate-spin" />
          <span className="font-display font-bold text-xs uppercase tracking-widest text-white/40">Bayi Yetkisi Doğrulanıyor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-8 pb-24">
      {/* Header */}
      <div className="bg-[#0A0A0A] border-b border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <Link href="/urunler" className="inline-flex items-center gap-2 font-body text-white/35 hover:text-brand-red text-sm mb-6 transition-colors">
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
        {isBayi && (
          <div className="mb-6 flex items-center gap-2 text-green-400/90 text-sm font-body border border-green-500/20 bg-green-500/5 px-4 py-3">
            <Building2 size={16} />
            Onaylı bayi fiyatları uygulanıyor ({bayi?.firma_adi})
          </div>
        )}

        {!items.length ? (
          <div className="text-center py-20 border border-white/5 bg-[#141414]">
            <p className="font-body text-white/40 mb-6">Sepetiniz boş.</p>
            <Link href="/urunler" className="btn-primary text-sm">Ürünleri incele</Link>
          </div>
        ) : null}

        {items.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Sol: Ürün Listesi - Sağdaki form doldurulurken sayfayla birlikte aşağı kayarak ekranda kalır */}
            <div className="lg:col-span-2">
              <div className="space-y-3 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.id} className="flex gap-4 bg-[#141414] border border-white/5 p-4 items-center">
                  <div className="relative w-20 h-20 bg-black/40 flex-shrink-0 overflow-hidden">
                    {i.fotograf ? <Image src={i.fotograf} alt="" fill className="object-cover" sizes="80px" /> : <div className="w-full h-full bg-white/5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-white text-sm uppercase tracking-wide truncate">{i.ad}</div>
                    <div className="font-body text-white/30 text-xs mt-1">{i.kategori}</div>
                    <div className="font-display text-brand-red text-sm mt-2">
                      {Math.ceil(livePrice(i) * i.adet).toLocaleString('tr-TR')} ₺
                      <span className="text-white/25 font-body text-xs ml-2">({Math.ceil(livePrice(i)).toLocaleString('tr-TR')} ₺ × {i.adet})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button type="button" className="w-10 h-10 sm:w-8 sm:h-8 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors" onClick={() => { updateQty(i.id, i.adet - 1); refreshCart() }}><Minus size={14} /></button>
                    <span className="w-6 text-center font-body text-sm text-white/70">{i.adet}</span>
                    <button type="button" className="w-10 h-10 sm:w-8 sm:h-8 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors" onClick={() => { updateQty(i.id, i.adet + 1); refreshCart() }}><Plus size={14} /></button>
                    <button type="button" className="ml-1 sm:ml-2 text-white/25 hover:text-brand-red p-3 sm:p-2 transition-colors" onClick={() => { removeFromCart(i.id); refreshCart() }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#141414] border border-white/5 p-6">
                <div className="flex justify-between items-baseline mb-4 border-b border-white/5 pb-4">
                  <span className="font-display text-xs tracking-widest uppercase text-white/50">Toplam <span className="text-white/30">(KDV Dahil)</span></span>
                  <span className="font-display font-black text-2xl text-brand-red">{Math.ceil(total).toLocaleString('tr-TR')} ₺</span>
                </div>

                {isBayi && total > 0 && (
                  <div className="mb-6 pb-4 border-b border-white/5 flex items-center justify-between">
                    <span className="font-display text-[11px] uppercase tracking-wider text-white/40">Taksit İmkanı</span>
                    <PayTrTaksitTablosu
                      tutarTL={total}
                      urunAdi={`Sepet Toplamı (${items.length} Ürün)`}
                      isBayi={isBayi}
                      compact
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Ad Soyad *</label>
                    <input className="input-dark" value={adSoyad} onChange={(e) => setAdSoyad(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">E-posta *</label>
                      <input type="email" className="input-dark" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                      <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Telefon *</label>
                      <input className="input-dark" value={telefon} onChange={(e) => setTelefon(e.target.value)} />
                    </div>
                  </div>

                  <div className="bg-[#0A0A0A] border border-white/5 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="font-display font-bold text-xs tracking-widest uppercase text-white/60">Fatura Tipi</div>
                      <div className="flex bg-[#141414] p-0.5 border border-white/5">
                        <button onClick={() => setFaturaTipi('bireysel')} className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-display font-bold uppercase transition-all ${faturaTipi === 'bireysel' ? 'bg-brand-red text-white' : 'text-white/30 hover:text-white'}`}>
                          <UserIcon size={12} /> Bireysel
                        </button>
                        <button onClick={() => setFaturaTipi('kurumsal')} className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-display font-bold uppercase transition-all ${faturaTipi === 'kurumsal' ? 'bg-brand-red text-white' : 'text-white/30 hover:text-white'}`}>
                          <Briefcase size={12} /> Kurumsal
                        </button>
                      </div>
                    </div>
                    {faturaTipi === 'kurumsal' && (
                      <div className="space-y-3">
                        <input className="input-dark text-sm py-2" value={firmaUnvani} onChange={e => setFirmaUnvani(e.target.value)} placeholder="Firma Ünvanı *" />
                        <div className="grid grid-cols-2 gap-2">
                          <input className="input-dark text-sm py-2" value={vergiDairesi} onChange={e => setVergiDairesi(e.target.value)} placeholder="V. Dairesi" />
                          <input className="input-dark text-sm py-2" value={vergiNo} onChange={e => setVergiNo(e.target.value)} placeholder="V. No *" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Sipariş notu</label>
                    <textarea className="input-dark resize-none text-sm" rows={2} value={notlar} onChange={(e) => setNotlar(e.target.value)} />
                  </div>

                  <div className="border border-white/5 bg-[#0F0F0F] p-4 space-y-3">
                    <div className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 mb-1">Teslimat Yöntemi</div>
                    <label className={`flex items-start gap-3 p-3 border cursor-pointer transition-all duration-200 ${teslimat === 'kargo' ? 'border-brand-red/40 bg-brand-red/5' : 'border-white/5 hover:border-white/10'}`}>
                      <input type="radio" name="teslimat" value="kargo" checked={teslimat === 'kargo'} onChange={() => setTeslimat('kargo')} className="mt-1 accent-[#DA291C]" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Truck size={14} className={teslimat === 'kargo' ? 'text-brand-red' : 'text-white/30'} />
                          <span className="font-display font-bold text-sm uppercase text-white">Adrese Kargo</span>
                        </div>
                      </div>
                    </label>
                    {teslimat === 'kargo' && (
                      <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <label className="text-[10px] font-display font-bold uppercase text-white/30 tracking-widest block px-1">Teslimat Adresi *</label>
                        <textarea 
                          className="input-dark text-xs min-h-[80px] resize-none" 
                          placeholder="Mahalle, Sokak, No, İlçe, İl..." 
                          value={teslimatAdresi} 
                          onChange={e => setTeslimatAdresi(e.target.value)}
                        />
                      </div>
                    )}
                    <label className={`flex items-start gap-3 p-3 border cursor-pointer transition-all duration-200 ${teslimat === 'depo' ? 'border-brand-red/40 bg-brand-red/5' : 'border-white/5 hover:border-white/10'}`}>
                      <input type="radio" name="teslimat" value="depo" checked={teslimat === 'depo'} onChange={() => setTeslimat('depo')} className="mt-1 accent-[#DA291C]" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Store size={14} className={teslimat === 'depo' ? 'text-brand-red' : 'text-white/30'} />
                          <span className="font-display font-bold text-sm uppercase text-white">Depodan Teslim Al</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {error && <div className="mt-4 bg-brand-red/10 border border-brand-red/30 p-3 text-brand-red text-xs font-body">{error}</div>}

                {/* #4 — PayTR kapatılma uyardısı */}
                {payTrWarning && (
                  <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 p-3 text-yellow-400 text-xs font-body">
                    ⚠️ Ödeme tamamlanmadı. Siparişiniz <strong>beklemede</strong> olarak kaydedildi. Ödemeyi tamamlamak için tekrar &quot;Ödeme Yap&quot; butonuna tıklayabilirsiniz.
                  </div>
                )}

                {/* Sadece Bayilere Toptan Satış Kontrolü */}
                {!isBayi ? (
                  <div className="mt-6 p-4 border border-brand-red/30 bg-brand-red/5 space-y-3">
                    <div className="flex items-center gap-2 text-brand-red font-display font-bold text-xs uppercase tracking-wider">
                      <Info size={16} /> Yalnızca Bayilere Toptan Satış
                    </div>
                    <p className="text-white/60 text-xs font-body leading-relaxed">
                      Sitemiz yalnızca yetkili bayilerimize toptan satış hizmeti vermektedir. Siparişinizi tamamlamak için lütfen bayi girişi yapınız veya bayilik başvurusunda bulununuz.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <Link href="/bayi" className="btn-primary text-xs flex-1 justify-center py-2.5">
                        Bayi Girişi Yap
                      </Link>
                      <Link href="/bayi/basvuru" className="btn-outline text-xs flex-1 justify-center py-2.5">
                        Bayilik Başvurusu
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={submitOrder}
                      className="btn-primary w-full justify-center text-base py-4 font-display font-black tracking-wider uppercase disabled:opacity-40 shadow-lg shadow-brand-red/20 hover:shadow-brand-red/40 transition-all"
                    >
                      {busy ? (
                        <>
                          <Loader2 size={18} className="animate-spin mr-2" />
                          Ödeme Başlatılıyor...
                        </>
                      ) : (
                        <>
                          <CreditCard size={18} className="mr-2" />
                          Ödeme Yap
                        </>
                      )}
                    </button>
                    <div className="flex items-center justify-center gap-2 text-white/40 text-xs font-body">
                      <ShieldCheck size={14} className="text-green-400" />
                      256-Bit SSL &amp; 3D Secure ile Güvenli Ödeme
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PayTR Güvenli Ödeme Modalı */}
      {payToken && (
        <div className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#0F0F0F] border border-white/10 w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl rounded-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-5 py-3.5 border-b border-white/10 bg-[#141414]">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="font-display text-xs tracking-widest uppercase text-white font-bold">
                  Güvenli Ödeme Ekranı (PayTR)
                </span>
              </div>
              <button
                type="button"
                className="text-white/50 hover:text-white text-xs font-display uppercase tracking-wider border border-white/10 hover:border-brand-red/40 px-3 py-1.5 transition-all"
                onClick={() => {
                  setPayToken(null)
                  setPayTrWarning(true)
                }}
              >
                Pencereyi Kapat
              </button>
            </div>
            <div className="p-0 flex-1 bg-white overflow-y-auto">
              <iframe
                title="PayTR Güvenli Ödeme"
                src={`https://www.paytr.com/odeme/guvenli/${payToken}`}
                className="w-full min-h-[600px] sm:min-h-[660px] border-0"
              />
            </div>
            <div className="px-5 py-2.5 border-t border-white/10 bg-[#141414] flex items-center justify-between text-[11px] text-white/40">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-green-400" />
                <span>256-Bit SSL &amp; 3D Secure Güvencesi</span>
              </div>
              <span className="text-yellow-400/80">İşleminiz tamamlanana kadar sayfayı kapatmayınız</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
