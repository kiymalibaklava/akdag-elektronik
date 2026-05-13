'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { getKurClient } from '@/lib/kur-client'
import { Search, Plus, Trash2, FileText, User, Calendar, Info, RefreshCw, Printer, Download } from 'lucide-react'
import { LIGHT_PRODUCT_FIELDS } from '@/lib/product-queries'
import * as XLSX from 'xlsx'

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
  const [proposalDate, setProposalDate] = useState('') // Başta boş, useEffect ile dolacak
  const [customNote, setCustomNote] = useState('')
  const [notes, setNotes] = useState(VARSAYILAN_ACIKLAMALAR)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [kur, setKur] = useState({ USD: 33.5, EUR: 36.2 })
  const [showHistory, setShowHistory] = useState(false)
  const [pastProposals, setPastProposals] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [archiveSearch, setArchiveSearch] = useState('')
  const [currentProposalId, setCurrentProposalId] = useState<string | null>(null)
  const [currentProposalNo, setCurrentProposalNo] = useState<string | null>(null)

  const supabase = useRef(createClient()).current

  useEffect(() => {
    fetchKur()
    loadHistory()
    setProposalDate(new Date().toISOString().split('T')[0]) // İstemci tarafında set et
  }, [])

  const fetchKur = async () => {
    try {
      const data = await getKurClient()
      setKur({ USD: data.USD, EUR: data.EUR })
    } catch {}
  }


  const loadHistory = async () => {
    const { data, error } = await supabase
      .from('teklifler')
      .select('id, teklif_no, musteri_adi, tarih, genel_toplam, kur_usd, kur_eur, ozel_not, urunler, created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (error) {
      console.error("TEKLİF ARŞİVİ YÜKLEME HATASI (403 mü?):", error)
    }
    setPastProposals(data || [])
  }

  const handleSaveProposal = async (isNewVersion: boolean = false) => {
    if (!customerName || items.length === 0) {
      alert('Müşteri adı ve en az bir ürün gereklidir.')
      return
    }
    setIsSaving(true)
    const totals = calculateTotal()
    
    let nextProposalNo = currentProposalNo || `AK-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`
    
    // Eğer yeni bir versiyon isteniyorsa numara üret
    if (isNewVersion && currentProposalNo) {
      const baseNo = currentProposalNo.split('-V')[0]
      const currentV = currentProposalNo.includes('-V') ? parseInt(currentProposalNo.split('-V')[1]) : 1
      nextProposalNo = `${baseNo}-V${currentV + 1}`
    }

    try {
      const payload = {
        teklif_no: nextProposalNo,
        musteri_adi: customerName,
        tarih: proposalDate,
        ozel_not: customNote,
        urunler: items,
        ara_toplam: totals.araToplam,
        kdv: totals.kdv,
        genel_toplam: totals.genelToplam,
        kur_usd: kur.USD,
        kur_eur: kur.EUR
      }

      let result;
      if (isNewVersion || !currentProposalId) {
        // Yeni kayıt (Insert)
        result = await supabase.from('teklifler').insert([payload]).select('id, teklif_no').single()
      } else {
        // Mevcut kaydı güncelle (Update)
        result = await supabase.from('teklifler').update(payload).eq('id', currentProposalId).select('id, teklif_no').single()
      }

      if (result.error) throw result.error
      
      alert(isNewVersion ? 'Yeni versiyon kaydedildi.' : currentProposalId ? 'Teklif güncellendi.' : 'Teklif kaydedildi.')
      
      if (result.data) {
        setCurrentProposalId(result.data.id)
        setCurrentProposalNo(result.data.teklif_no)
      }
      loadHistory()
    } catch (err: any) {
      alert('Hata oluştu: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProposal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Bu teklif kalıcı olarak silinecek. Emin misiniz?')) return
    const { error } = await supabase.from('teklifler').delete().eq('id', id)
    if (!error) {
      setPastProposals(prev => prev.filter(p => p.id !== id))
      if (currentProposalId === id) {
        setCurrentProposalId(null)
        setCurrentProposalNo(null)
      }
    } else {
      alert('Silme hatası: ' + error.message)
    }
  }

  const handleNewProposal = () => {
    setItems([])
    setCustomerName('')
    setProposalDate(new Date().toISOString().split('T')[0])
    setCustomNote('')
    setCurrentProposalId(null)
    setCurrentProposalNo(null)
    fetchKur()
  }

  const exportToExcel = () => {
    if (items.length === 0) return
    
    const data = items.map(i => {
      const k = i.para_birimi === 'USD' ? kur.USD : i.para_birimi === 'EUR' ? kur.EUR : 1
      const birimTl = i.fiyat_doviz * k
      return {
        'Marka': i.marka,
        'Kod': i.kod,
        'Ürün Adı': i.ad,
        'Miktar': i.miktar,
        'Birim Fiyat (Döviz)': i.fiyat_doviz,
        'Para Birimi': i.para_birimi,
        'Birim Fiyat (TL)': birimTl,
        'Toplam (TL)': birimTl * i.miktar
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teklif")
    
    // Sütun genişliklerini ayarla
    worksheet['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 50 }, { wch: 10 }, 
      { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 }
    ]

    XLSX.writeFile(workbook, `${customerName || 'Teklif'}_${new Date().toISOString().split('T')[0]}.xlsx`)
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Müşteri Adı</label>
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-brand-red" placeholder="Müşteri Adı"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Teklif Tarihi</label>
                  <input type="date" value={proposalDate} onChange={e => setProposalDate(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-brand-red"/>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Dolar Kuru ($)</label>
                  <input type="number" step="0.01" value={kur.USD} onChange={e => setKur({...kur, USD: parseFloat(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 p-3 text-white text-sm outline-none focus:border-brand-red"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Euro Kuru (€)</label>
                  <input type="number" step="0.01" value={kur.EUR} onChange={e => setKur({...kur, EUR: parseFloat(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 p-3 text-white text-sm outline-none focus:border-brand-red"/>
                </div>
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
                <button onClick={addManualItem} className="bg-brand-red/10 px-6 border border-brand-red/20 text-brand-red text-[10px] font-bold uppercase hover:bg-brand-red/20 transition-colors whitespace-nowrap">
                  + Serbest Kalem
                </button>
              </div>
              <textarea value={customNote} onChange={e => setCustomNote(e.target.value)} className="w-full mt-6 bg-white/5 border border-white/10 p-4 text-white text-sm outline-none focus:border-brand-red" placeholder="Özel Not (Hitap vb.)" rows={2}/>
            </div>

            <div className="bg-[#141414] p-8 border border-white/5 rounded-sm">
              <h3 className="text-brand-red font-display font-bold text-sm uppercase mb-6 flex items-center gap-2"><FileText size={16}/> Liste</h3>
              {items.length === 0 ? <div className="text-center py-10 text-white/20">Ürün eklenmedi.</div> : (
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5">
                      <div className="w-12 h-12 flex-shrink-0 bg-white/5"><img src={item.gorsel} className="w-full h-full object-cover"/></div>
                      <div className="flex-1 min-w-0">
                        {item.id?.toString().startsWith('manual') ? (
                          <input value={item.ad} onChange={e => updateManualItem(idx, 'ad', e.target.value)} className="w-full bg-white/5 border border-white/10 text-white text-xs p-1 outline-none"/>
                        ) : <div className="text-xs font-bold text-white truncate">{item.ad}</div>}
                        <div className="text-[10px] text-white/40">{item.marka} | {item.kod}</div>
                      </div>
                      <input type="number" value={item.miktar} onChange={e => {const n=[...items]; n[idx].miktar=Number(e.target.value); setItems(n)}} className="w-16 bg-white/5 border border-white/10 text-white text-xs p-1"/>
                      <div className="flex gap-1 items-center">
                        <input 
                          type="number" 
                          value={item.fiyat_doviz} 
                          onChange={e => updateManualItem(idx, 'fiyat_doviz', e.target.value)} 
                          className="w-20 bg-white/5 border border-white/10 text-white text-xs p-1 outline-none focus:border-brand-red"
                          step="0.01"
                        />
                        <select 
                          value={item.para_birimi}
                          onChange={e => updateManualItem(idx, 'para_birimi', e.target.value)}
                          className="bg-[#1A1A1A] border border-white/10 text-[10px] text-white px-1 outline-none"
                        >
                          <option value="TRY">₺</option>
                          <option value="USD">$</option>
                          <option value="EUR">€</option>
                        </select>
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
              <button onClick={() => window.print()} disabled={items.length===0} className="w-full mt-8 bg-brand-red text-white py-4 font-bold text-xs uppercase tracking-widest hover:bg-brand-red/80 flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"><Printer size={16}/> YAZDIR / PDF</button>
              
              <button 
                onClick={exportToExcel} 
                disabled={items.length===0} 
                className="w-full mt-2 bg-green-600/20 border border-green-600/30 text-green-500 py-3 text-[10px] uppercase font-bold hover:bg-green-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Download size={14}/> Excel&apos;e Aktar
              </button>

              {/* Kaydet Butonları */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() => handleSaveProposal(false)}
                  disabled={isSaving || !customerName || items.length === 0}
                  className="bg-white/5 border border-white/10 text-white py-3 text-[10px] uppercase font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isSaving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <RefreshCw size={12}/>}
                  {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                {currentProposalNo ? (
                  <button
                    onClick={() => handleSaveProposal(true)}
                    disabled={isSaving}
                    className="bg-brand-red/20 border border-brand-red/30 text-brand-red py-3 text-[10px] uppercase font-bold hover:bg-brand-red/30 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    <Plus size={12}/> Yeni Versiyon
                  </button>
                ) : (
                  <button onClick={() => setShowHistory(true)} className="bg-white/5 border border-white/10 text-white py-3 text-[10px] uppercase font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <FileText size={12}/> Arşiv
                  </button>
                )}
              </div>

              {/* Arşiv (Yeni Versiyon varken) */}
              {currentProposalNo && (
                <button onClick={() => setShowHistory(true)} className="w-full mt-2 bg-white/5 border border-white/10 text-white py-2 text-[10px] uppercase font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <FileText size={12}/> Arşiv
                </button>
              )}


            </div>
          </div>
        </div>
      </div>

      {/* ARŞİV MODAL */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 no-print">
          <div className="bg-[#1A1A1A] border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col rounded-sm">
            {/* Modal Başlık */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-white font-black text-sm uppercase tracking-widest">Teklif Arşivi</h3>
                <p className="text-white/30 text-[10px] mt-0.5">{pastProposals.length} teklif</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { handleNewProposal(); setShowHistory(false) }}
                  className="bg-brand-red/20 border border-brand-red/30 text-brand-red px-4 py-2 text-[10px] uppercase font-bold hover:bg-brand-red/30 transition-all"
                >
                  + Yeni Teklif
                </button>
                <button onClick={() => setShowHistory(false)} className="text-white/40 hover:text-white transition-colors text-[10px] uppercase font-bold px-3 py-2">
                  Kapat
                </button>
              </div>
            </div>

            {/* Arama */}
            <div className="px-5 pt-4 pb-2">
              <input
                type="text"
                value={archiveSearch}
                onChange={(e) => setArchiveSearch(e.target.value)}
                placeholder="Müşteri adı veya teklif no ile ara..."
                className="w-full bg-white/5 border border-white/10 p-3 text-white text-xs outline-none focus:border-brand-red placeholder:text-white/20"
              />
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2">
              {(() => {
                const filtered = pastProposals.filter(p =>
                  p.musteri_adi?.toLowerCase().includes(archiveSearch.toLowerCase()) ||
                  p.teklif_no?.toLowerCase().includes(archiveSearch.toLowerCase())
                )
                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 text-white/20 text-xs">
                      {archiveSearch ? 'Aramayla eşleşen teklif bulunamadı.' : 'Henüz kaydedilmiş teklif yok.'}
                    </div>
                  )
                }
                return filtered.map(p => (
                  <div
                    key={p.id}
                    className={`relative group p-4 border transition-all cursor-pointer hover:border-brand-red/50 ${
                      currentProposalId === p.id
                        ? 'bg-brand-red/10 border-brand-red/40'
                        : 'bg-white/[0.02] border-white/5'
                    }`}
                    onClick={() => {
                      setCustomerName(p.musteri_adi)
                      // Ürünleri normalize et (Bayi vs Admin formatı farkı)
                      const normalizedItems = (p.urunler || []).map((u: any) => {
                        const birimFiyat = u.fiyat_doviz || u.birim_fiyat || 0
                        const paraBirimi = u.para_birimi || 'TRY'
                        const adet = u.miktar || u.adet || 1
                        const kur = paraBirimi === 'USD' ? (p.kur_usd || 33) : paraBirimi === 'EUR' ? (p.kur_eur || 36) : 1
                        
                        return {
                          id: u.id || u.urun_id || `legacy-${Math.random()}`,
                          ad: u.ad,
                          marka: u.marka || '-',
                          kod: u.kod || u.model_kodu || '-',
                          gorsel: u.gorsel || u.fotograf || 'https://via.placeholder.com/150',
                          miktar: adet,
                          fiyat_doviz: birimFiyat,
                          para_birimi: paraBirimi,
                          tutar_tl: u.tutar_tl || (birimFiyat * adet * kur) || 0
                        }
                      })
                      setItems(normalizedItems)
                      setProposalDate(p.tarih || p.created_at?.split('T')[0])
                      setCustomNote(p.ozel_not || '')
                      setKur({ USD: p.kur_usd || 33, EUR: p.kur_eur || 36 })
                      setCurrentProposalId(p.id)
                      setCurrentProposalNo(p.teklif_no)
                      setShowHistory(false)
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-brand-red font-black text-[11px]">{p.teklif_no}</span>
                        {p.teklif_no?.includes('-V') && (
                          <span className="bg-brand-red/20 text-brand-red text-[9px] font-bold px-1.5 py-0.5">
                            REV {p.teklif_no.split('-V')[1]}
                          </span>
                        )}
                        {currentProposalId === p.id && (
                          <span className="bg-white/10 text-white/60 text-[9px] font-bold px-1.5 py-0.5">AÇIK</span>
                        )}
                      </div>
                      <button
                        onClick={e => handleDeleteProposal(p.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-brand-red transition-all p-1"
                        title="Teklifi sil"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-white font-bold text-sm">{p.musteri_adi}</div>
                        <div className="text-white/30 text-[10px] mt-0.5">
                          {new Date(p.tarih || p.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {' • '}{p.urunler?.length || 0} kalem
                        </div>
                      </div>
                      <div className="text-white font-black text-sm">
                        {p.genel_toplam?.toLocaleString('tr-TR', { minimumFractionDigits: 0 })} ₺
                      </div>
                    </div>
                  </div>
                ))
              })()}
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
          <div className="text-right text-[10px] font-bold">
            <h3 className="text-3xl font-black text-black/20 uppercase mb-1 tracking-tighter">FİYAT TEKLİFİ</h3>
            <p className="opacity-60">Tarih: {new Date(proposalDate).toLocaleDateString('tr-TR')}</p>
          </div>
        </div>

        <table className="w-full border-collapse mb-8 text-[9px] border border-black/20">
          <thead>
            <tr className="bg-[#f2f2f2] text-black text-left uppercase font-black" style={{ WebkitPrintColorAdjust: 'exact' }}>
              <th className="p-3 border border-black/20 w-10">Görsel</th>
              <th className="p-3 border border-black/20 w-14 text-center">Miktar</th>
              <th className="p-3 border border-black/20 w-28">Marka</th>
              <th className="p-3 border border-black/20">Ürün Açıklaması</th>
              <th className="p-3 border border-black/20 text-right w-20">Birim ($/€)</th>
              <th className="p-3 border border-black/20 text-right w-22">Birim (TL)</th>
              <th className="p-3 border border-black/20 text-right w-24">Toplam (TL)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i,idx) => {
              const k = i.para_birimi==='USD' ? kur.USD : i.para_birimi==='EUR' ? kur.EUR : 1
              const birim_tl = i.fiyat_doviz * k
              return (
                <tr key={idx} className="border-b border-black/10">
                  <td className="p-2 border border-black/10 text-center align-top">
                    <img src={i.gorsel} className="w-9 h-9 object-contain mx-auto" />
                  </td>
                  <td className="p-2 border border-black/10 font-bold text-center align-top">{i.miktar} Adet</td>
                  <td className="p-2 border border-black/10 align-top">
                    <div className="font-black text-[8px] uppercase leading-tight">{i.marka}</div>
                    {i.kod && <div className="text-[6.5px] text-black/40 font-semibold mt-0.5 leading-tight tracking-wide">{i.kod}</div>}
                  </td>
                  <td className="p-2 border border-black/10 align-top">
                    <div className="text-[9px] leading-snug font-medium">{i.ad}</div>
                  </td>
                  <td className="p-2 border border-black/10 text-right font-medium align-top">{i.fiyat_doviz.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {i.para_birimi === 'USD' ? '$' : i.para_birimi === 'EUR' ? '€' : '₺'}</td>
                  <td className="p-2 border border-black/10 text-right align-top">{birim_tl.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                  <td className="p-2 border border-black/10 text-right font-black align-top">{(birim_tl * i.miktar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
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
