'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { FileText, Plus, Trash2, Download, Printer, Calculator, User, Hash, Calendar, Percent, Save, Link as LinkIcon, Loader2, Check } from 'lucide-react'
import { getCart } from '@/lib/cart'

interface CartItem {
  id: string
  ad: string
  fiyat: number
  bayi_fiyati?: number | null
  adet: number
  fotograf: string
  kategori: string
}

interface ProposalSettings {
  logo_url?: string
  firma_adi?: string
  adres?: string
  telefon?: string
  email?: string
  web_sitesi?: string
  varsayilan_kar_orani?: number
  teklif_notu?: string
}

export default function BayiTeklifOlusturucu({ bayiId }: { bayiId: string }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [settings, setSettings] = useState<ProposalSettings | null>(null)
  const [margins, setMargins] = useState<Record<string, number>>({})
  const [globalMargin, setGlobalMargin] = useState(20)
  const [customerName, setCustomerName] = useState('')
  const [proposalNo, setProposalNo] = useState(`TEK-${Math.floor(1000 + Math.random() * 9000)}`)
  const [isSaving, setIsSaving] = useState(false)
  const [savedLink, setSavedLink] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      // Sepeti getir
      const cart = getCart()
      setItems(cart)

      // Ayarları getir
      const { data } = await supabase
        .from('bayi_teklif_ayarlari')
        .select('logo_url, firma_adi, adres, telefon, email, web_sitesi, varsayilan_kar_orani, teklif_notu')
        .eq('bayi_id', bayiId)
        .maybeSingle()

      if (data) {
        setSettings(data)
        setGlobalMargin(Number(data.varsayilan_kar_orani) || 20)
      }
    }
    loadData()
  }, [bayiId])

  const calculateItemPrice = (item: CartItem) => {
    const basePrice = item.bayi_fiyati || item.fiyat
    const margin = margins[item.id] !== undefined ? margins[item.id] : globalMargin
    return basePrice * (1 + margin / 100)
  }

  const subtotal = items.reduce((sum, item) => sum + calculateItemPrice(item) * item.adet, 0)
  const tax = subtotal * 0.20
  const total = subtotal + tax

  const handleSaveProposal = async () => {
    if (!customerName) {
      alert('Lütfen müşteri adını giriniz.')
      return
    }

    setIsSaving(true)
    try {
      const { data, error } = await supabase
        .from('teklifler')
        .insert({
          bayi_id: bayiId,
          teklif_no: proposalNo,
          musteri_adi: customerName,
          ara_toplam: subtotal,
          kdv: tax,
          genel_toplam: total,
          ozel_not: settings?.teklif_notu,
          urunler: items.map(i => ({
            ad: i.ad,
            adet: i.adet,
            birim_fiyat: calculateItemPrice(i),
            toplam_fiyat: calculateItemPrice(i) * i.adet
          }))
        })
        .select('id')
        .single()

      if (error) throw error

      const link = `${window.location.origin}/teklif/${data.id}`
      setSavedLink(link)
    } catch (err: any) {
      alert(`Kaydetme hatası: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const copyLink = () => {
    if (savedLink) {
      navigator.clipboard.writeText(savedLink)
      alert('Teklif linki kopyalandı!')
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 border border-white/5 bg-[#141414]">
        <FileText size={48} className="text-white/10 mx-auto mb-4" />
        <h3 className="font-display font-bold text-white uppercase tracking-widest mb-2">Sepetiniz Boş</h3>
        <p className="font-body text-white/40 text-sm mb-6">Teklif oluşturmak için önce sepete ürün eklemelisiniz.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Kontroller (Sol Panel) */}
      <div className="xl:col-span-4 space-y-6 no-print">
        <div className="bg-[#141414] border border-white/5 p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Calculator size={18} className="text-brand-red" />
            <h3 className="font-display font-bold text-white uppercase tracking-widest text-sm">Teklif Kontrolleri</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 font-display font-bold text-[10px] uppercase tracking-widest text-white/30 mb-2">
                <User size={12} /> Müşteri Adı / Ünvanı
              </label>
              <input 
                type="text" 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="input-dark text-sm" 
                placeholder="Örn: Ahmet Yılmaz / ABC Ltd. Şti." 
              />
            </div>

            <div>
              <label className="flex items-center gap-2 font-display font-bold text-[10px] uppercase tracking-widest text-white/30 mb-2">
                <Percent size={12} /> Genel Kâr Marjı (%)
              </label>
              <input 
                type="number" 
                value={globalMargin}
                onChange={e => setGlobalMargin(Number(e.target.value))}
                className="input-dark text-sm" 
              />
              <p className="text-[10px] text-white/20 mt-1 italic">Ürün bazlı kâr girilmemişse bu oran kullanılır.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 space-y-3">
             <button onClick={() => window.print()} className="btn-primary w-full justify-center">
                <Printer size={16} /> Yazdır / PDF Olarak Kaydet
             </button>
             
             {!savedLink ? (
               <button 
                onClick={handleSaveProposal} 
                disabled={isSaving}
                className="btn-outline w-full justify-center border-white/20 text-white/80 hover:bg-white hover:text-black"
               >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Teklifi Kaydet ve Paylaş
               </button>
             ) : (
               <div className="space-y-2">
                 <button onClick={copyLink} className="btn-outline w-full justify-center border-green-500/50 text-green-400 bg-green-500/5">
                    <Check size={16} /> Linki Kopyala
                 </button>
                 <a href={savedLink} target="_blank" rel="noreferrer" className="block text-center text-[10px] text-white/30 hover:text-white underline">Teklifi Web'de Görüntüle</a>
               </div>
             )}
          </div>
        </div>

        {/* Ürün Bazlı Kâr Ayarları */}
        <div className="bg-[#141414] border border-white/5 p-6">
          <h4 className="font-display font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 mb-4">Ürün Bazlı Kâr Oranları</h4>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {items.map(item => (
              <div key={item.id} className="bg-black/40 p-3 border border-white/5 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-[10px] text-white uppercase truncate">{item.ad}</div>
                  <div className="text-[9px] text-white/30">{item.bayi_fiyati || item.fiyat} ₺ (Alış)</div>
                </div>
                <div className="w-16">
                  <input 
                    type="number" 
                    placeholder={`%${globalMargin}`}
                    value={margins[item.id] || ''}
                    onChange={e => setMargins({ ...margins, [item.id]: Number(e.target.value) })}
                    className="bg-transparent border-b border-white/10 text-right text-xs text-brand-red font-bold w-full focus:border-brand-red outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Önizleme (Sağ Panel) */}
      <div className="xl:col-span-8 bg-white text-black p-8 sm:p-16 shadow-2xl min-h-[1123px] proposal-preview">
        {/* Teklif Başlığı */}
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12 pb-10 border-b-2 border-gray-100">
          <div className="max-w-[250px]">
            {settings?.logo_url ? (
              <div className="relative w-48 h-20 mb-4">
                <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain object-left" />
              </div>
            ) : (
              <div className="text-2xl font-black uppercase tracking-tighter mb-2">{settings?.firma_adi || 'FİRMA ADI'}</div>
            )}
            <div className="text-xs text-gray-500 space-y-1 font-sans">
              <p>{settings?.adres}</p>
              <p>{settings?.telefon}</p>
              <p>{settings?.email}</p>
              <p className="font-bold text-gray-700">{settings?.web_sitesi}</p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="font-display font-black text-4xl uppercase tracking-tighter text-gray-900 mb-4">TEKLİF FORMU</h2>
            <div className="space-y-2">
               <div className="flex justify-end items-center gap-3">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Teklif No</span>
                 <span className="text-sm font-black font-mono">{proposalNo}</span>
               </div>
               <div className="flex justify-end items-center gap-3">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tarih</span>
                 <span className="text-sm font-bold">{new Date().toLocaleDateString('tr-TR')}</span>
               </div>
               <div className="flex justify-end items-center gap-3">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Geçerlilik</span>
                 <span className="text-sm font-bold">7 Gün</span>
               </div>
            </div>
          </div>
        </div>

        {/* Müşteri Bilgisi */}
        <div className="mb-12">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3">SAYIN / TO:</div>
          <div className="text-xl font-bold uppercase border-l-4 border-black pl-4 py-1">
            {customerName || '......................................................'}
          </div>
        </div>

        {/* Ürün Tablosu */}
        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-2 border-black text-left">
              <th className="py-4 text-[10px] font-black uppercase tracking-widest">Açıklama</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-center">Adet</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-right">Birim Fiyat</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-right">Toplam</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => {
              const unitPrice = calculateItemPrice(item)
              return (
                <tr key={idx}>
                  <td className="py-4">
                    <div className="font-bold text-sm uppercase">{item.ad}</div>
                    <div className="text-[10px] text-gray-400 uppercase">{item.kategori}</div>
                  </td>
                  <td className="py-4 text-center font-bold text-sm">{item.adet}</td>
                  <td className="py-4 text-right font-bold text-sm">{unitPrice.toLocaleString('tr-TR')} ₺</td>
                  <td className="py-4 text-right font-black text-sm">{(unitPrice * item.adet).toLocaleString('tr-TR')} ₺</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Toplamlar */}
        <div className="flex justify-end mb-12">
          <div className="w-full max-w-[300px] space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Ara Toplam</span>
              <span className="font-bold">{subtotal.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">KDV (%20)</span>
              <span className="font-bold">{tax.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex justify-between items-center bg-black text-white p-4">
              <span className="font-black uppercase tracking-[0.2em] text-[10px]">GENEL TOPLAM</span>
              <span className="text-xl font-black">{total.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>
        </div>

        {/* Notlar & İmza */}
        <div className="grid grid-cols-2 gap-10 pt-10 border-t border-gray-100">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">NOTLAR:</div>
            <p className="text-xs text-gray-600 leading-relaxed font-sans italic whitespace-pre-line">
              {settings?.teklif_notu || 'Teklifimiz 7 gün süreyle geçerlidir. Fiyatlarımıza KDV dahildir.'}
            </p>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-10">KAŞE / İMZA:</div>
            <div className="w-32 h-px bg-gray-200 mb-2" />
            <div className="text-[10px] font-bold uppercase tracking-widest">{settings?.firma_adi}</div>
          </div>
        </div>

        {/* Footer (Sadece baskıda) */}
        <div className="mt-20 text-[9px] text-gray-300 text-center uppercase tracking-[0.5em] border-t border-gray-50 pt-4 hidden print:block">
          AKDAĞ ELEKTRONİK B2B SİSTEMİ ÜZERİNDEN OLUŞTURULMUŞTUR
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; background: white !important; }
          .proposal-preview, .proposal-preview * { visibility: visible; }
          .proposal-preview { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; margin: 0 !important; }
          .no-print { display: none !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  )
}
