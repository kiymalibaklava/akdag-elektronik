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
import { getKurClient } from '@/lib/kur-client'
import { 
  ArrowLeft, Trash2, Minus, Plus, CreditCard, Building2, Loader2, MapPin, Truck, Store, 
  Info, Briefcase, User as UserIcon, Copy, Check, ExternalLink 
} from 'lucide-react'
import type { Session, User } from '@supabase/supabase-js'
import { BANK_ACCOUNTS } from '@/lib/bank-accounts'

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
  const [teslimatAdresi, setTeslimatAdresi] = useState('')
  
  const [faturaTipi, setFaturaTipi] = useState<'bireysel' | 'kurumsal'>('bireysel')
  const [firmaUnvani, setFirmaUnvani] = useState('')
  const [vergiDairesi, setVergiDairesi] = useState('')
  const [vergiNo, setVergiNo] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [doneNo, setDoneNo] = useState('')
  const [payToken, setPayToken] = useState<string | null>(null)
  const [kur, setKur] = useState<KurData>({ USD: 32.5, EUR: 35.2, guncelleme: null })
  const [copiedIban, setCopiedIban] = useState<string | null>(null)
  
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
          .then((res: { data: BayiRow | null }) => {
            setBayi(res.data)
            if (res.data?.onaylandi) {
              setFaturaTipi('kurumsal')
              setFirmaUnvani(res.data.firma_adi)
            }
          })
      }
    })
  }, [supabase])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIban(text)
    setTimeout(() => setCopiedIban(null), 2000)
  }

  const isBayi = !!(bayi?.onaylandi)

  const livePrice = (i: CartItem): number => {
    const pb = isBayi && i.bayi_fiyat_doviz ? (i.bayi_para_birimi || i.para_birimi || 'TRY') : (i.para_birimi || 'TRY')
    const doviz = isBayi && i.bayi_fiyat_doviz ? i.bayi_fiyat_doviz : (i.fiyat_doviz || null)
    if (doviz && pb !== 'TRY') return dovizToTL(doviz, pb, kur)
    return Math.ceil(isBayi && i.bayi_fiyati ? i.bayi_fiyati : i.fiyat)
  }

  const liveTotal = (): number => Math.ceil(items.reduce((sum, i) => sum + livePrice(i) * i.adet, 0))
  const total = liveTotal()

  const submitOrder = async (odeme_tipi: 'havale' | 'kart') => {
    setError('')
    if (!items.length) { setError('Sepetiniz boş.'); return }
    if (!adSoyad.trim() || !email.trim()) { setError('Ad soyad ve e-posta zorunludur.'); return }
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
          fatura_tipi: faturaTipi,
          firma_unvani: faturaTipi === 'kurumsal' ? firmaUnvani : null,
          vergi_dairesi: faturaTipi === 'kurumsal' ? vergiDairesi : null,
          vergi_no: faturaTipi === 'kurumsal' ? vergiNo : null,
          teslimat_adresi: teslimat === 'kargo' ? teslimatAdresi : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Sipariş oluşturulamadı.'); setBusy(false); return }
      clearCart(); refreshCart()
      if (odeme_tipi === 'havale') { setDoneNo(data.siparis_no); setBusy(false); return }
      const payRes = await fetch('/api/paytr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siparis_no: data.siparis_no, tutar: total, ad_soyad: adSoyad.trim(), email: email.trim(), telefon: telefon.trim(),
          urunler: items.map((i) => ({ ad: i.ad, fiyat: livePrice(i), adet: i.adet })),
        }),
      })
      const payData = await payRes.json()
      if (!payRes.ok) { setError(payData.error || 'Ödeme başlatılamadı.'); setBusy(false); return }
      setPayToken(payData.token); setBusy(false)
    } catch { setError('Bağlantı hatası.'); setBusy(false) }
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
        {doneNo && (
          <div className="mb-10 bg-[#141414] border border-green-500/20 p-8 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
             <div className="font-display font-black text-2xl text-white uppercase tracking-widest mb-4">SİPARİŞİNİZ ALINDI!</div>
             <p className="font-body text-white/60 text-sm mb-8">
               Sipariş No: <span className="text-brand-red font-bold tracking-widest">{doneNo}</span>
             </p>
             
             {/* Havale Bilgileri Kartı - Direkt Sayfada */}
             <div className="max-w-2xl mx-auto space-y-4 mb-10">
                <div className="flex items-center gap-2 text-white/40 font-display font-bold text-xs uppercase mb-2 justify-center">
                   <Info size={14} className="text-brand-red" /> Lütfen Ödemeyi Aşağıdaki Hesaplara Yapınız
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                   {BANK_ACCOUNTS.map(bank => (
                      <div key={bank.iban} className="bg-white/5 border border-white/5 p-5 text-left group hover:border-brand-red/30 transition-all">
                         <div className="flex justify-between items-start mb-4">
                            <span className="font-display font-black text-sm text-white uppercase tracking-wider">{bank.bankName}</span>
                            <Building2 size={16} className="text-white/10 group-hover:text-brand-red/40 transition-colors" />
                         </div>
                         <div className="space-y-3">
                            <div>
                               <div className="text-[10px] text-white/30 uppercase font-display font-bold tracking-widest mb-1">Hesap Sahibi</div>
                               <div className="text-xs text-white/80 font-body">{bank.accountHolder}</div>
                            </div>
                            <div>
                               <div className="text-[10px] text-white/30 uppercase font-display font-bold tracking-widest mb-1">IBAN</div>
                               <div className="flex items-center justify-between bg-black/40 p-2 border border-white/5">
                                  <code className="text-[11px] text-brand-red font-bold">{bank.iban}</code>
                                  <button 
                                    onClick={() => copyToClipboard(bank.iban)}
                                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 transition-all"
                                    title="IBAN Kopyala"
                                  >
                                    {copiedIban === bank.iban ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="bg-brand-red/10 border border-brand-red/20 p-4 mt-6">
                   <p className="text-white/80 text-xs leading-relaxed font-body">
                     ⚠️ <strong>ÖNEMLİ:</strong> Ödeme yaparken açıklama kısmına sadece <strong className="text-brand-red">{doneNo}</strong> yazınız. 
                     Ödemeyi yaptıktan sonra "Hesabım" sayfasından dekont yükleyerek onay sürecini hızlandırabilirsiniz.
                   </p>
                </div>
             </div>

             <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <Link href="/hesabim" className="btn-outline text-sm w-full md:w-auto">
                   <ExternalLink size={14} /> Dekont Yükle / Hesabım
                </Link>
                <Link href="/urunler" className="btn-primary text-sm w-full md:w-auto">Alışverişe Devam Et</Link>
             </div>
          </div>
        )}

        {isBayi && !doneNo && (
          <div className="mb-6 flex items-center gap-2 text-green-400/90 text-sm font-body border border-green-500/20 bg-green-500/5 px-4 py-3">
            <Building2 size={16} />
            Onaylı bayi fiyatları uygulanıyor ({bayi?.firma_adi})
          </div>
        )}

        {!items.length && !doneNo ? (
          <div className="text-center py-20 border border-white/5 bg-[#141414]">
            <p className="font-body text-white/40 mb-6">Sepetiniz boş.</p>
            <Link href="/urunler" className="btn-primary text-sm">Ürünleri incele</Link>
          </div>
        ) : null}

        {items.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-3">
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
                    <button type="button" className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/50 hover:text-white" onClick={() => { updateQty(i.id, i.adet - 1); refreshCart() }}><Minus size={14} /></button>
                    <span className="w-6 text-center font-body text-sm text-white/70">{i.adet}</span>
                    <button type="button" className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/50 hover:text-white" onClick={() => { updateQty(i.id, i.adet + 1); refreshCart() }}><Plus size={14} /></button>
                    <button type="button" className="ml-2 text-white/25 hover:text-brand-red p-2" onClick={() => { removeFromCart(i.id); refreshCart() }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="bg-[#141414] border border-white/5 p-6">
                <div className="flex justify-between items-baseline mb-6 border-b border-white/5 pb-4">
                  <span className="font-display text-xs tracking-widest uppercase text-white/50">Toplam <span className="text-white/30">(KDV Dahil)</span></span>
                  <span className="font-display font-black text-2xl text-brand-red">{Math.ceil(total).toLocaleString('tr-TR')} ₺</span>
                </div>

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

                <div className="mt-6 space-y-3">
                  <button type="button" disabled={busy} onClick={() => submitOrder('havale')} className="btn-outline w-full justify-center text-sm disabled:opacity-40"><Building2 size={15} /> Havale / EFT</button>
                  <button type="button" disabled={busy} onClick={() => submitOrder('kart')} className="btn-primary w-full justify-center text-sm disabled:opacity-40"><CreditCard size={15} /> Kredi kartı (PayTR)</button>
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
              <button type="button" className="text-white/40 hover:text-white text-sm font-body" onClick={() => setPayToken(null)}>Kapat</button>
            </div>
            <iframe title="PayTR" src={`https://www.paytr.com/odeme/guvenli/${payToken}`} className="w-full flex-1 min-h-[560px] bg-white" />
          </div>
        </div>
      )}
    </div>
  )
}
