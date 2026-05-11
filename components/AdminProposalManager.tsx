'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, Plus, Trash2, FileText, User, Calendar, Info, RefreshCw, Printer } from 'lucide-react'
import { LIGHT_PRODUCT_FIELDS } from '@/lib/product-queries'

interface ProposalItem {
  id: string
  ad: string
  marka: string
  kod: string
  gorsel: string
  miktar: number
  fiyat_doviz: number
  para_birimi: string
  tutar_tl: number
}

const VARSAYILAN_ACIKLAMALAR = [
  "Sipariş verebilmeniz için Firma kaşeniz, yetkilinizin ismi ve imzası KAŞE&İMZA yapılarak mail gönderilmelidir.",
  "Teklifimiz USD ve EURO bazında hazırlanmış olup teslimat tarihi için geçerli T.C. Merkez Bankası Efektif Satış kuru baz alınır.",
  "ÖNEMLİ NOT: PROJEDE OLUP DA FİYATLANDIRILMAYAN YADA GÖZDEN KAÇAN MALZEMELER AYRICA FİYATLANDIRILACAKTIR. KONTROL ETMEK VE EKSİKLERİ BULMAK TARAFINIZA AİTTİR.",
  "Kablo, Kablo Kanalı ve kullanılacak konnektör fiyatları kurulum esnasında eklendiğinde ayrıca fiyata eklenecektir.",
  "Fiyatlarımız 10 gün opsiyonludur.",
  "Tarafınızdan iletilen listeye göre teklif verilmiştir. Farkları bulmak ve kontrol etmek tarafınıza aittir sorumluluk kabul edilmemektedir.",
  "Şartname görülmeden fiyat verilmiştir. Şartname kaynaklı eksik ve ilave malzemeler için ayrıca fiyat verilecekir.",
  "Ürünlerimizi internet sitesinden görsellere bakarak özellik model ve teknik şartlarınıza uygun olduğunu görerek sipariş vermeniz gerekmektedir.",
  "Teklifin kabul olduğu anda ürünlerden bir veya birkaçının ithalatçı firmanın stoklarında olmaması durumunda yurtdışı tedarik süreci ve gümrükleme vb. gecikme ile tahmini tedarik süresi 6-8 haftadır.",
  "Siparişleriniz onay ile birlikte tedarik programına alınacaktır. Tahmini tedarik süresi ...... iş günüdür.",
  "Ödeme: Siparişte %50'si kalanı malzeme veya iş tesliminde Nakit olarak ödenecektir.",
  "Ürünler hazır olduğunda Kayseri içi teslimdir. Başka şehirlere teslimlerde kargo edilecektir. Kargo karşı ödemeli gönderilecektir."
]

export default function AdminProposalManager() {
  const [items, setItems] = useState<ProposalItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [proposalDate, setProposalDate] = useState(new Date().toISOString().split('T')[0])
  const [customNote, setCustomNote] = useState('')
  const [notes, setNotes] = useState(VARSAYILAN_ACIKLAMALAR)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [kur, setKur] = useState({ USD: 33.5, EUR: 36.2 })
  const [showHistory, setShowHistory] = useState(false)
  const [pastProposals, setPastProposals] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchKur()
    loadHistory()
  }, [])

  const fetchKur = async () => {
    try {
      const res = await fetch('/api/kur')
      if (res.ok) {
        const data = await res.json()
        setKur({ USD: data.USD, EUR: data.EUR })
      }
    } catch {}
  }

  const loadHistory = async () => {
    const { data } = await supabase.from('teklifler').select('*').order('created_at', { ascending: false })
    setPastProposals(data || [])
  }

  const handleSaveProposal = async () => {
    if (!customerName || items.length === 0) {
      alert('Müşteri adı ve en az bir ürün gereklidir.')
      return
    }
    setIsSaving(true)
    const totals = calculateTotal()
    try {
      await supabase.from('teklifler').insert([{
        teklif_no: `AK-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
        musteri_adi: customerName,
        tarih: proposalDate,
        ozel_not: customNote,
        urunler: items,
        ara_toplam: totals.araToplam,
        kdv: totals.kdv,
        genel_toplam: totals.genelToplam,
        kur_usd: kur.USD,
        kur_eur: kur.EUR
      }])
      alert('Teklif kaydedildi.')
      loadHistory()
    } catch {
      alert('Hata oluştu.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    const { data } = await supabase.from('urunler').select(LIGHT_PRODUCT_FIELDS).ilike('ad', `%${query}%`).limit(5)
    setSearchResults(data || [])
  }

  const addItem = (product: any) => {
    const birim = product.para_birimi || 'USD'
    const price = product.fiyat_doviz || product.fiyat || 0
    const kur_val = birim === 'USD' ? kur.USD : birim === 'EUR' ? kur.EUR : 1
    setItems([...items, {
      id: product.id,
      ad: product.ad,
      marka: product.marka || '',
      kod: product.model_kodu || product.slug || '',
      gorsel: product.fotograflar?.[0] || '',
      miktar: 1,
      fiyat_doviz: price,
      para_birimi: birim,
      tutar_tl: price * kur_val
    }])
    setSearchQuery(''); setSearchResults([])
  }

  const addManualItem = () => {
    setItems([...items, {
      id: `manual-${Date.now()}`,
      ad: 'Hizmet/İşçilik Tanımı',
      marka: '-',
      kod: 'SERVİS',
      gorsel: 'https://via.placeholder.com/150?text=Servis',
      miktar: 1,
      fiyat_doviz: 0,
      para_birimi: 'TRY',
      tutar_tl: 0
    }])
  }

  const updateManualItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    const item = newItems[index]
    if (field === 'ad') item.ad = value
    if (field === 'fiyat_doviz') item.fiyat_doviz = parseFloat(value) || 0
    if (field === 'para_birimi') item.para_birimi = value
    const k = item.para_birimi === 'USD' ? kur.USD : item.para_birimi === 'EUR' ? kur.EUR : 1
    item.tutar_tl = item.fiyat_doviz * k
    setItems(newItems)
  }

  const calculateTotal = () => {
    const araToplam = items.reduce((s, i) => s + (i.fiyat_doviz * i.miktar * (i.para_birimi === 'USD' ? kur.USD : i.para_birimi === 'EUR' ? kur.EUR : 1)), 0)
    return { araToplam, kdv: araToplam * 0.20, genelToplam: araToplam * 1.20 }
  }

  const totals = calculateTotal()

  return (
    <div className="proposal-container">
      
      {/* UI EKRANI (YAZDIRIRKEN GİZLİ) */}
      <div className="no-print space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#141414] p-8 border border-white/5 rounded-sm">
              <h3 className="text-brand-red font-display font-bold text-sm uppercase mb-6 flex items-center gap-2"><User size={16}/> Bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-brand-red" placeholder="Müşteri Adı"/>
                <input type="date" value={proposalDate} onChange={e => setProposalDate(e.target.value)} className="bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-brand-red"/>
              </div>
              <div className="mt-8 flex gap-4">
                <div className="flex-1 relative">
                  <input type="text" value={searchQuery} onChange={e => handleSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-white outline-none focus:border-brand-red" placeholder="Ürün Ara..."/>
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18}/>
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-[#1A1A1A] border border-white/10 z-50">
                      {searchResults.map(p => (
                        <button key={p.id} onClick={() => addItem(p)} className="w-full p-4 hover:bg-white/5 text-left border-b border-white/5 flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5"><img src={p.fotograflar?.[0]} className="w-full h-full object-cover"/></div>
                          <span className="text-sm font-bold text-white">{p.ad}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={addManualItem} className="bg-white/5 px-6 border border-white/10 text-white text-xs font-bold uppercase hover:bg-white/10 transition-colors">Serbest Kalem</button>
              </div>
              <textarea value={customNote} onChange={e => setCustomNote(e.target.value)} className="w-full mt-6 bg-white/5 border border-white/10 p-4 text-white text-sm outline-none focus:border-brand-red" placeholder="Özel Not (Hitap vb.)" rows={2}/>
            </div>

            <div className="bg-[#141414] p-8 border border-white/5 rounded-sm">
              <h3 className="text-brand-red font-display font-bold text-sm uppercase mb-6 flex items-center gap-2"><FileText size={16}/> Liste</h3>
              {items.length === 0 ? <div className="text-center py-10 text-white/20">Ürün eklenmedi.</div> : (
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5">
                      <div className="w-12 h-12 flex-shrink-0 bg-white/5"><img src={item.gorsel} className="w-full h-full object-cover"/></div>
                      <div className="flex-1 min-w-0">
                        {item.id.toString().startsWith('manual') ? (
                          <input value={item.ad} onChange={e => updateManualItem(idx, 'ad', e.target.value)} className="w-full bg-white/5 border border-white/10 text-white text-xs p-1 outline-none"/>
                        ) : <div className="text-xs font-bold text-white truncate">{item.ad}</div>}
                        <div className="text-[10px] text-white/40">{item.marka} | {item.kod}</div>
                      </div>
                      <input type="number" value={item.miktar} onChange={e => {const n=[...items]; n[idx].miktar=Number(e.target.value); setItems(n)}} className="w-16 bg-white/5 border border-white/10 text-white text-xs p-1"/>
                      <div className="flex gap-1 items-center">
                        {item.id.toString().startsWith('manual') ? (
                          <input type="number" value={item.fiyat_doviz} onChange={e => updateManualItem(idx, 'fiyat_doviz', e.target.value)} className="w-20 bg-white/5 border border-white/10 text-white text-xs p-1"/>
                        ) : <span className="text-xs text-white">{item.fiyat_doviz}</span>}
                        <span className="text-[10px] text-white/40">{item.para_birimi}</span>
                      </div>
                      <button onClick={() => setItems(items.filter((_,i)=>i!==idx))} className="text-white/20 hover:text-brand-red transition-colors"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-brand-red/10 p-8 border border-brand-red/20 rounded-sm">
              <h3 className="text-brand-red font-display font-bold text-sm uppercase mb-6">Özet</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-white/60"><span>Ara Toplam</span><span>{totals.araToplam.toLocaleString()} ₺</span></div>
                <div className="flex justify-between text-white/60"><span>KDV (%20)</span><span>{totals.kdv.toLocaleString()} ₺</span></div>
                <div className="flex justify-between text-white font-black text-lg pt-3 border-t border-white/10"><span>TOPLAM</span><span>{totals.genelToplam.toLocaleString()} ₺</span></div>
              </div>
              <button onClick={() => window.print()} disabled={items.length===0} className="w-full mt-8 bg-brand-red text-white py-4 font-bold text-xs uppercase tracking-widest hover:bg-brand-red/80 flex items-center justify-center gap-2"><Printer size={16}/> YAZDIR / PDF</button>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button onClick={handleSaveProposal} className="bg-white/5 border border-white/10 text-white py-3 text-[10px] uppercase font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"><RefreshCw size={12}/> KAYDET</button>
                <button onClick={() => setShowHistory(true)} className="bg-white/5 border border-white/10 text-white py-3 text-[10px] uppercase font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"><FileText size={12}/> ARŞİV</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ARŞİV MODAL */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 no-print">
          <div className="bg-[#1A1A1A] border border-white/10 w-full max-w-2xl max-h-[70vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 flex justify-between items-center text-white font-bold uppercase tracking-widest text-xs">Arşivdeki Teklifler <button onClick={()=>setShowHistory(false)}>Kapat</button></div>
            <div className="p-6 overflow-y-auto grid grid-cols-1 gap-4">
              {pastProposals.map(p => (
                <button key={p.id} onClick={()=>{setCustomerName(p.musteri_adi); setItems(p.urunler); setProposalDate(p.tarih); setCustomNote(p.ozel_not); setKur({USD:p.kur_usd, EUR:p.kur_eur}); setShowHistory(false)}} className="p-4 bg-white/5 border border-white/5 hover:border-brand-red/50 text-left transition-all">
                  <div className="flex justify-between items-start text-[10px] text-brand-red font-black mb-1"><span>{p.teklif_no}</span><span>{p.tarih}</span></div>
                  <div className="text-white font-bold">{p.musteri_adi}</div>
                  <div className="text-right text-white font-black text-xs mt-2">{p.genel_toplam?.toLocaleString()} ₺</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PDF TASARIMI (SADECE YAZDIRILIRKEN GÖRÜNÜR) */}
      <div id="print-area" className="hidden print:block bg-white text-black p-10 font-sans leading-tight">
        <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
          <div className="flex items-center gap-6">
            <img src="/logo.png" alt="Akdağ Elektronik" className="h-16 w-auto object-contain" />
            <div>
              <h1 className="font-black text-2xl leading-none tracking-tighter">AKDAĞ ELEKTRONİK</h1>
              <p className="text-[9px] font-bold tracking-[0.3em] mt-1 uppercase opacity-50">SES VE IŞIK SİSTEMLERİ</p>
            </div>
          </div>
          <div className="text-right text-[9px] font-bold leading-relaxed opacity-60">
            <p>Cumhuriyet Mh. Sur Cd. No: 17/A Melikgazi / KAYSERİ</p>
            <p>TEL : (352) 231 69 15 - (532) 393 43 70</p>
            <p>akdagelektronik.com</p>
          </div>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div className="max-w-[70%]">
            <span className="text-[8px] font-bold uppercase opacity-40 block mb-1">Sayın / Kurum</span>
            <h2 className="text-xl font-black uppercase mb-4">{customerName || '-----------------'}</h2>
            {customNote && <div className="p-3 bg-black/[0.03] border-l-2 border-black/20 italic text-[10px] text-black/70 leading-relaxed">{customNote}</div>}
          </div>
          <div className="text-right text-[9px] font-bold">
            <h3 className="text-2xl font-black opacity-10 uppercase mb-2">FİYAT TEKLİFİ</h3>
            <p>Tarih: {new Date(proposalDate).toLocaleDateString('tr-TR')}</p>
          </div>
        </div>

        <table className="w-full border-collapse mb-8 text-[9px]">
          <thead>
            <tr className="bg-black text-white text-left uppercase font-bold">
              <th className="p-3 border border-black w-12">Görsel</th>
              <th className="p-3 border border-black w-16">Miktar</th>
              <th className="p-3 border border-black w-40">Marka / Kod</th>
              <th className="p-3 border border-black">Açıklama</th>
              <th className="p-3 border border-black text-right w-20">Birim ($/€)</th>
              <th className="p-3 border border-black text-right w-24">Birim (TL)</th>
              <th className="p-3 border border-black text-right w-24">Toplam (TL)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i,idx) => {
              const k = i.para_birimi==='USD' ? kur.USD : i.para_birimi==='EUR' ? kur.EUR : 1
              const birim_tl = i.fiyat_doviz * k
              return (
                <tr key={idx} className="border-b border-black/10">
                  <td className="p-2 border border-black/10 text-center"><img src={i.gorsel} className="w-10 h-10 object-contain mx-auto"/></td>
                  <td className="p-2 border border-black/10 font-bold text-center">{i.amount || i.miktar} Adet</td>
                  <td className="p-2 border border-black/10 font-bold uppercase">{i.marka}<br/><span className="text-[7px] opacity-40">{i.kod}</span></td>
                  <td className="p-2 border border-black/10">{i.ad}</td>
                  <td className="p-2 border border-black/10 text-right font-medium">{i.fiyat_doviz.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {i.para_birimi === 'USD' ? '$' : i.para_birimi === 'EUR' ? '€' : '₺'}</td>
                  <td className="p-2 border border-black/10 text-right">{birim_tl.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                  <td className="p-2 border border-black/10 text-right font-black">{(birim_tl * (i.amount || i.miktar)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="flex justify-between items-start gap-10 mb-10">
          <div className="w-1/3 p-3 bg-black/[0.02] border-l-2 border-black text-[9px]">
            <span className="font-bold uppercase opacity-40 block mb-1">Kur Değerleri</span>
            <div className="font-black">USD: {kur.USD} ₺ | EUR: {kur.EUR} ₺</div>
          </div>
          <div className="w-1/2 space-y-2 text-[10px]">
            <div className="flex justify-between border-b border-black/5 pb-1"><span>Ara Toplam (KDV Hariç)</span><span className="font-bold">{totals.araToplam.toLocaleString()} ₺</span></div>
            <div className="flex justify-between border-b border-black/5 pb-1"><span>%20 KDV</span><span className="font-bold">{totals.kdv.toLocaleString()} ₺</span></div>
            <div className="flex justify-between bg-black text-white p-3 font-bold"><span>GENEL TOPLAM</span><span className="text-lg font-black">{totals.genelToplam.toLocaleString()} ₺</span></div>
          </div>
        </div>

        <div className="border-t border-black pt-6">
          <h4 className="text-[9px] font-black uppercase mb-3">Teklif Şartları ve Açıklamalar</h4>
          <div className="grid grid-cols-2 gap-x-10 gap-y-1 text-[8px] leading-tight text-black/70">
            {notes.map((n,i)=>(<div key={i} className="flex gap-2"><span>{i+1}.</span><span>{n}</span></div>))}
          </div>
        </div>

        <div className="mt-12 flex justify-end"><div className="text-center w-40"><div className="border border-black/10 h-16 mb-2 flex items-center justify-center text-[8px] italic opacity-20">Kaşe / İmza</div><p className="text-[9px] font-bold uppercase">Akdağ Elektronik</p></div></div>
      </div>

      <style jsx global>{`
        @media print {
          /* Herşeyi gizle */
          body * { visibility: hidden; }
          /* Sadece print-area'yı göster */
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: block !important;
            background: white !important;
          }
          .no-print, nav, footer, header { display: none !important; }
        }
      `}</style>
    </div>
  )
}
