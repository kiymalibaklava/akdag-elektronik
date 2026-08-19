'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { LogOut, Package, Phone, Clock, CheckCircle, XCircle, Search, X, RotateCcw, FileText, Settings, LayoutDashboard, Box, ChevronDown, ChevronUp, User as UserIcon, Truck, Info, MapPin, Building2, Check, Loader2, Upload, ExternalLink, Save, RefreshCw } from 'lucide-react'
import { ProductCard } from './ProductGrid'
import type { User } from '@supabase/supabase-js'
import { addManyToCart } from '@/lib/cart'
import { TUM_KATEGORILER } from '@/lib/categories'
import { LIGHT_PRODUCT_FIELDS } from '@/lib/product-queries'
import BayiTeklifAyarlari from './BayiTeklifAyarlari'
import BayiTeklifOlusturucu from './BayiTeklifOlusturucu'

const KATEGORILER = TUM_KATEGORILER

const DURUM_MAP: Record<string, { label: string, color: string, icon: React.ElementType }> = {
  beklemede:     { label: 'Sipariş Alındı', color: 'text-yellow-400', icon: Clock },
  onaylandi:     { label: 'Onaylandı',      color: 'text-blue-400',   icon: CheckCircle },
  hazirlaniyor:  { label: 'Hazırlanıyor',   color: 'text-purple-400', icon: Package },
  kargolandi:    { label: 'Kargolandı',     color: 'text-brand-red',  icon: Truck },
  teslim_edildi: { label: 'Teslim Edildi',  color: 'text-green-400',  icon: CheckCircle },
  iptal:         { label: 'İptal Edildi',   color: 'text-red-400',    icon: XCircle },
  tamamlandi:    { label: 'Tamamlandı',     color: 'text-green-400',  icon: CheckCircle },
}

interface Bayi {
  id: string
  firma_adi: string
  yetkili_adi: string
  onaylandi: boolean
  sehir: string
  telefon?: string
}

interface Urun {
  id: string
  ad: string
  aciklama: string
  kategori: string
  fotograflar: string[]
  fiyat: number
  bayi_fiyati: number | null
  stok_durumu: string
  fiyat_guncelleme: string | null
  stok_adedi?: number | null
  kritik_stok?: number | null
  marka?: string | null
  kullanim_alani?: string | null
}

interface Siparis {
  id: string
  siparis_no: string
  created_at: string
  toplam_tutar: number
  durum: string
  kargo_takip_no?: string
  odeme_durumu?: string
  odeme_tipi?: string
  teslimat_tipi?: string
  dekont_url?: string
  teslimat_adresi?: string
  fatura_tipi?: string
  firma_unvani?: string
  vergi_no?: string
  vergi_dairesi?: string
  dolar_kuru?: number
  urunler: Array<{
    urun_id?: string
    ad: string
    adet: number
    fiyat: number
    fotograf?: string
  }>
}

export default function BayiPanel({ user }: { user: User }) {
  const [bayi, setBayi] = useState<Bayi | null>(null)
  const [urunler, setUrunler] = useState<Urun[]>([])
  const [loading, setLoading] = useState(true)
  const [siparisler, setSiparisler] = useState<Siparis[]>([])
  const [counts, setCounts] = useState({ totalHarcama: 0, bekleyen: 0, tamamlanan: 0, toplamSiparis: 0 })
  const [repeatMsg, setRepeatMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'proposals' | 'settings' | 'profile'>('dashboard')
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])
  
  // Profil States
  const [firmaAdi, setFirmaAdi] = useState('')
  const [yetkiliAdi, setYetkiliAdi] = useState('')
  const [telefon, setTelefon] = useState('')
  const [sehir, setSehir] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const supabase = useRef(createClient()).current

  const toggleOrder = (id: string) => {
    setExpandedOrders(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id])
  }

  useEffect(() => {
    const load = async () => {
      // Bayi bilgilerini çek
      const { data: bayiData } = await supabase
        .from('bayiler')
        .select('id, firma_adi, yetkili_adi, telefon, sehir, onaylandi')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (bayiData) {
        setBayi(bayiData)
        setFirmaAdi(bayiData.firma_adi || '')
        setYetkiliAdi(bayiData.yetkili_adi || '')
        setTelefon(bayiData.telefon || '')
        setSehir(bayiData.sehir || '')
      }

      // Bayinin tüm sipariş istatistikleri için verileri çek (sadece tutar ve durum)
      const { data: allOrdersData } = await supabase
        .from('siparisler')
        .select('toplam_tutar, durum')
        .eq('user_id', user.id)

      const allOrders: any[] = allOrdersData || []
      const totalHarcama = allOrders
        .filter(o => o.durum !== 'iptal')
        .reduce((sum, o) => sum + (Number(o.toplam_tutar) || 0), 0)
        
      const beklemedeCount = allOrders.filter(o => ['beklemede', 'hazirlaniyor', 'onaylandi'].includes(o.durum)).length
      const tamamlananCount = allOrders.filter(o => ['teslim_edildi', 'tamamlandi'].includes(o.durum)).length
      
      setCounts({ 
        totalHarcama, 
        bekleyen: beklemedeCount, 
        tamamlanan: tamamlananCount,
        toplamSiparis: allOrders.length
      })

      // Siparişlerin tüm detaylarını çek
      const { data: siparisData } = await supabase
        .from('siparisler')
        .select('id, siparis_no, created_at, toplam_tutar, durum, urunler, kargo_takip_no, odeme_durumu, odeme_tipi, teslimat_tipi, dekont_url, teslimat_adresi, fatura_tipi, firma_unvani, vergi_no, vergi_dairesi, dolar_kuru')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setSiparisler((siparisData || []) as Siparis[])
      
      setLoading(false)
    }
    load()
  }, [user.id, supabase])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bayi) return
    setSavingProfile(true)
    setSaveSuccess(false)
    try {
      const { error } = await supabase
        .from('bayiler')
        .update({ firma_adi: firmaAdi, yetkili_adi: yetkiliAdi, telefon: telefon, sehir: sehir })
        .eq('id', bayi.id)
      if (error) throw error
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      setBayi({ ...bayi, firma_adi: firmaAdi, yetkili_adi: yetkiliAdi, telefon, sehir })
    } catch (err: any) {
      alert(`Güncelleme hatası: ${err.message}`)
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { alert('Şifreler eşleşmiyor.'); return }
    if (newPassword.length < 6) { alert('Şifre en az 6 karakter olmalıdır.'); return }
    setSavingPassword(true)
    setPasswordSuccess(false)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err: any) {
      alert(`Şifre güncelleme hatası: ${err.message}`)
    } finally {
      setSavingPassword(false)
    }
  }

  const handleReceiptUpload = async (siparisId: string, file: File) => {
    if (!file) return
    setUploadingId(siparisId)
    const fileExt = file.name.split('.').pop()
    const filePath = `dekontlar/${siparisId}_${Date.now()}.${fileExt}`
    try {
      const { error: uploadError } = await supabase.storage.from('siparis-dekontlari').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('siparis-dekontlari').getPublicUrl(filePath)
      const { error: updateError } = await supabase
        .from('siparisler')
        .update({ dekont_url: publicUrl, notlar: `[Sistem: Dekont yüklendi] ${new Date().toLocaleString('tr-TR')}` })
        .eq('id', siparisId)
      if (updateError) throw updateError
      
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await fetch('/api/dekont-bildirim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({ siparis_id: siparisId, siparis_no: siparisler.find(s => s.id === siparisId)?.siparis_no, dekont_url: publicUrl, ad_soyad: user.user_metadata?.full_name || user.email })
        }).catch(err => console.error('Bildirim hatası:', err))
      }
      
      // Update local state instead of full reload to be fast
      setSiparisler(prev => prev.map(s => s.id === siparisId ? { ...s, dekont_url: publicUrl } : s))
    } catch (err: any) {
      alert(`Dekont yüklenemedi: ${err.message}`)
    } finally {
      setUploadingId(null)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-brand-red rounded-full animate-spin" />
        </div>
    )
  }



  const recentCount = urunler.filter(u =>
    u.fiyat_guncelleme && (Date.now() - new Date(u.fiyat_guncelleme).getTime()) < 7 * 24 * 60 * 60 * 1000
  ).length

  const handleRepeatOrder = async (siparis: Siparis) => {
    if (!siparis.urunler || !Array.isArray(siparis.urunler) || siparis.urunler.length === 0) {
      setRepeatMsg('Hata: Sipariş içeriği bulunamadı.')
      return
    }

    addManyToCart(
      siparis.urunler.map((u: any, i: number) => ({
        id: u.urun_id || `${siparis.id}-${i}`,
        ad: u.ad,
        kategori: 'Tekrar Sipariş',
        fotograf: u.fotograf || '',
        fiyat: u.fiyat,
        bayi_fiyati: u.fiyat,
        adet: Math.max(1, u.adet || 1),
      }))
    )
    setRepeatMsg(`${siparis.siparis_no} sepete eklendi.`)
    setTimeout(() => setRepeatMsg(''), 3000)
  }

  return (
    <div className="min-h-screen pb-24 bg-[#0A0A0A]">
      {/* Header */}
      <div className="bg-[#0A0A0A] border-b border-white/5 py-10 no-print">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle size={16} className="text-green-400" />
              <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-green-400">Bayi Erişimi</span>
            </div>
            <h1 className="font-display font-black text-3xl uppercase text-white">
              {bayi?.firma_adi || user.user_metadata?.firma_adi || 'Bayi Paneli'}
            </h1>
            <p className="font-body text-white/30 text-sm mt-1">{user.email}</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-white/30 hover:text-brand-red font-display font-semibold text-xs tracking-widest uppercase transition-colors">
            <LogOut size={14} />Çıkış
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#0A0A0A] border-b border-white/5 sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {[
              { id: 'dashboard', label: 'Özet', icon: LayoutDashboard },
              { id: 'orders', label: 'Siparişlerim', icon: Clock },
              { id: 'proposals', label: 'Teklif Hazırla', icon: FileText },
              { id: 'settings', label: 'Teklif Ayarları', icon: Settings },
              { id: 'profile', label: 'Profil & Şifre', icon: UserIcon },
            ].map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-5 font-display font-bold text-[10px] tracking-[0.2em] uppercase transition-all relative ${
                    active ? 'text-brand-red' : 'text-white/40 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                  {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            {/* İstatistikler */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { val: counts.bekleyen, label: 'Bekleyen Sipariş', color: 'border-l-yellow-500' },
                { val: counts.tamamlanan, label: 'Teslim Alınan', color: 'border-l-green-500' },
                { val: counts.toplamSiparis, label: 'Toplam Sipariş', color: 'border-l-blue-500' },
                { val: counts.totalHarcama.toLocaleString('tr-TR') + ' ₺', label: 'Toplam Harcama', color: 'border-l-brand-red' },
              ].map(s => (
                <div key={s.label} className={`bg-[#141414] border border-white/5 p-4 border-l-2 ${s.color}`}>
                  <div className="font-display font-black text-xl md:text-2xl text-white truncate">{s.val}</div>
                  <div className="font-body text-white/30 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="font-display font-bold text-xl uppercase tracking-wide text-white mb-4 red-line">Son Siparişler</h2>
                {siparisler.length === 0 ? (
                  <div className="border border-white/5 bg-[#141414] p-6 text-white/35 text-sm">Henüz siparişiniz bulunmuyor.</div>
                ) : (
                  <div className="space-y-2">
                    {siparisler.slice(0, 5).map((s) => {
                      const durum = DURUM_MAP[s.durum] || DURUM_MAP.beklemede
                      return (
                        <div key={s.id} className="border border-white/5 bg-[#141414] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                               <div className="font-display font-bold text-white">{s.siparis_no}</div>
                               <div className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 border ${durum.color} bg-current/5 border-current/20`}>
                                 {durum.label}
                               </div>
                            </div>
                            <div className="font-body text-xs text-white/35">{new Date(s.created_at).toLocaleDateString('tr-TR')} • {s.toplam_tutar?.toLocaleString('tr-TR')} ₺</div>
                          </div>
                          <button onClick={() => { setActiveTab('orders'); if(!expandedOrders.includes(s.id)) setExpandedOrders(p => [...p, s.id]) }} className="btn-outline text-[10px] px-4 py-2">Detay</button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <h2 className="font-display font-bold text-xl uppercase tracking-wide text-white mb-4 red-line">Hızlı İşlemler</h2>
                <Link href="/bayi/hizli-siparis" className="block p-6 bg-brand-red/5 border border-brand-red/20 hover:bg-brand-red/10 transition-all group">
                   <div className="font-display font-black text-brand-red group-hover:translate-x-1 transition-transform uppercase tracking-widest text-sm mb-1">HIZLI SİPARİŞ →</div>
                   <p className="text-white/40 text-xs">Excel veya stok kodu ile hızlıca sepeti doldur.</p>
                </Link>
                <button onClick={() => setActiveTab('proposals')} className="w-full text-left p-6 bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                   <div className="font-display font-black text-white group-hover:translate-x-1 transition-transform uppercase tracking-widest text-sm mb-1">TEKLİF OLUŞTUR →</div>
                   <p className="text-white/40 text-xs">Müşterine kendi logunla profesyonel teklif yap.</p>
                </button>
              </div>
            </div>
          </div>
        )}



        {activeTab === 'orders' && (
          <div className="space-y-4">
            {siparisler.length === 0 ? (
              <div className="border border-white/5 bg-[#141414] p-12 text-center">
                <Package size={40} className="text-white/10 mx-auto mb-3" />
                <p className="font-display font-semibold text-sm uppercase text-white/20 tracking-widest mb-6">
                  Henüz siparişiniz bulunmuyor
                </p>
                <Link href="/urunler" className="btn-primary text-sm inline-flex">Alışverişe Başla</Link>
              </div>
            ) : (
              siparisler.map((s) => {
                const durum = DURUM_MAP[s.durum] || DURUM_MAP.beklemede
                const DurumIcon = durum.icon
                const urunAdedi = Array.isArray(s.urunler) ? s.urunler.reduce((sum, u) => sum + u.adet, 0) : 0
                const isHavale = s.odeme_tipi === 'havale'
                const needsReceipt = isHavale && !s.dekont_url && s.odeme_durumu !== 'odendi'
                const isExpanded = expandedOrders.includes(s.id)

                return (
                  <div key={s.id} className="bg-[#141414] border border-white/5 p-6 hover:border-white/10 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-display font-black text-lg text-white uppercase tracking-wider">{s.siparis_no}</span>
                          <span className="font-body text-white/30 text-xs">
                            {new Date(s.created_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <div className="font-body text-white/40 text-sm">
                          {urunAdedi} Ürün • <span className="font-display font-bold text-white">{Number(s.toplam_tutar).toLocaleString('tr-TR')} ₺</span>
                          <span className="ml-2 px-1.5 py-0.5 bg-white/5 text-[10px] uppercase tracking-tighter text-white/30 border border-white/5">
                            {s.odeme_tipi === 'kart' ? 'Kredi Kartı' : 'Havale/EFT'}
                          </span>
                        </div>
                        {s.teslimat_tipi === 'kargo' && s.teslimat_adresi && (
                          <div className="flex items-start gap-2 mt-2 text-white/25 text-[10px] font-body leading-relaxed max-w-sm">
                            <Truck size={10} className="mt-0.5 flex-shrink-0" />
                            <span>Teslimat: {s.teslimat_adresi}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-3 min-w-[200px]">
                        <div className={`flex items-center gap-2 font-display font-bold text-xs uppercase tracking-widest px-3 py-1.5 border border-current/20 ${durum.color} bg-current/5 w-full md:w-auto justify-center`}>
                          <DurumIcon size={14} />
                          {durum.label}
                        </div>
                        
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <button onClick={(e) => { e.stopPropagation(); handleRepeatOrder(s) }} className="btn-outline text-[10px] flex-1 md:flex-none justify-center">
                            <RotateCcw size={12} className="mr-1" /> Tekrarla
                          </button>
                          <button 
                            onClick={() => toggleOrder(s.id)}
                            className="text-[10px] font-display font-bold uppercase tracking-widest text-white/40 hover:text-brand-red transition-colors flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 border border-white/5 flex-1 md:flex-none"
                          >
                            <Package size={12} /> {isExpanded ? 'Gizle' : 'Detay'}
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Ürün Detayları */}
                    {isExpanded && (
                      <div className="mt-8 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                        
                        {/* Üst Bilgi Kartları */}
                        <div className="grid md:grid-cols-3 gap-4 mb-8">
                          <div className="bg-white/5 border border-white/5 p-4">
                             <div className="flex items-center gap-2 mb-3 text-brand-red">
                                <Info size={14} />
                                <span className="font-display font-bold text-[10px] uppercase tracking-widest">Sipariş Özeti</span>
                             </div>
                             <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                   <span className="text-white/30">Toplam Tutar:</span>
                                   <span className="text-white font-bold">{Number(s.toplam_tutar).toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                   <span className="text-white/30">Dolar Karşılığı:</span>
                                   <span className="text-white font-bold">
                                     $ {s.dolar_kuru ? (s.toplam_tutar / s.dolar_kuru).toFixed(2) : (s.toplam_tutar / 32.5).toFixed(2)}
                                     {!s.dolar_kuru && <span className="text-[8px] text-white/20 ml-1">(Tahmini)</span>}
                                   </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                   <span className="text-white/30">Ödeme:</span>
                                   <span className="text-white uppercase">{s.odeme_tipi === 'kart' ? 'Kredi Kartı' : 'Havale/EFT'}</span>
                                </div>
                             </div>
                          </div>

                          <div className="bg-white/5 border border-white/5 p-4">
                             <div className="flex items-center gap-2 mb-3 text-blue-400">
                                <MapPin size={14} />
                                <span className="font-display font-bold text-[10px] uppercase tracking-widest">Teslimat & Konum</span>
                             </div>
                             <div className="text-xs text-white/60 leading-relaxed font-body">
                                {s.teslimat_tipi === 'kargo' ? (
                                  <>
                                    <div className="text-white font-bold mb-1">Adrese Kargo</div>
                                    {s.teslimat_adresi}
                                  </>
                                ) : (
                                  <>
                                    <div className="text-white font-bold mb-1">Mağazadan Teslimat</div>
                                    <div className="text-[10px]">Cumhuriyet Mah. Sur Cad. No:17/A, Melikgazi / Kayseri</div>
                                  </>
                                )}
                             </div>
                          </div>

                          <div className="bg-white/5 border border-white/5 p-4">
                             <div className="flex items-center gap-2 mb-3 text-green-400">
                                <Building2 size={14} />
                                <span className="font-display font-bold text-[10px] uppercase tracking-widest">Fatura Bilgisi</span>
                             </div>
                             <div className="text-xs text-white/60 space-y-1 font-body">
                                {s.fatura_tipi === 'kurumsal' ? (
                                  <>
                                    <div className="text-white font-bold uppercase truncate">{s.firma_unvani}</div>
                                    <div>{s.vergi_dairesi} / {s.vergi_no}</div>
                                  </>
                                ) : (
                                  <div className="italic">Bireysel Fatura</div>
                                )}
                             </div>
                          </div>
                        </div>

                        <div className="font-display font-bold text-[10px] uppercase tracking-widest text-white/20 mb-4 ml-1">Satın Alınan Ürünler</div>
                        <div className="space-y-3">
                          {Array.isArray(s.urunler) && s.urunler.map((u, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-black/20 p-3 border border-white/5 group hover:border-white/10 transition-colors">
                              <div className="w-12 h-12 bg-black border border-white/5 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                                {u.fotograf ? (
                                  <img src={u.fotograf} alt={u.ad} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                  <Package size={20} className="text-white/10" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-display font-bold text-sm text-white uppercase truncate">{u.ad}</div>
                                <div className="font-body text-white/30 text-xs">
                                  {u.adet} Adet × {Number(u.fiyat).toLocaleString('tr-TR')} ₺
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-display font-bold text-sm text-brand-red">
                                  {(u.adet * u.fiyat).toLocaleString('tr-TR')} ₺
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                          <div className="flex gap-4 w-full md:w-auto">
                            {needsReceipt && (
                              <div className="w-full md:w-auto">
                                <label className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-brand-red/30 bg-brand-red/5 text-brand-red font-display font-bold text-[10px] uppercase tracking-widest cursor-pointer hover:bg-brand-red hover:text-white transition-all ${uploadingId === s.id ? 'opacity-50 pointer-events-none' : ''}`}>
                                  {uploadingId === s.id ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                  {uploadingId === s.id ? 'YÜKLENİYOR' : 'DEKONT YÜKLE'}
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*,.pdf" 
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) handleReceiptUpload(s.id, file)
                                    }}
                                  />
                                </label>
                              </div>
                            )}

                            {s.dekont_url && (
                              <div className="flex items-center justify-center flex-1 md:flex-none gap-2 text-green-400 text-[10px] font-display font-bold uppercase tracking-widest px-3 py-2 bg-green-400/5 border border-green-400/10">
                                <CheckCircle size={12} /> Dekont Yüklendi
                                <a href={s.dekont_url} target="_blank" rel="noreferrer" className="ml-2 text-white/30 hover:text-white transition-colors">
                                  <FileText size={12} />
                                </a>
                              </div>
                            )}
                          </div>

                          {s.kargo_takip_no && (
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(s.kargo_takip_no + ' kargo takip sorgula')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-full md:w-auto gap-2 text-brand-red text-xs font-body bg-brand-red/10 px-4 py-2 border border-brand-red/20 hover:bg-brand-red hover:text-white transition-all"
                            >
                              <Truck size={14} />
                              <span className="font-display font-bold tracking-widest">TAKİP NO: {s.kargo_takip_no}</span>
                              <ExternalLink size={11} className="ml-1" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'proposals' && (
          bayi?.id ? <BayiTeklifOlusturucu bayiId={bayi.id} /> : <div className="p-10 text-center text-white/30">Bayi bilgileri yükleniyor...</div>
        )}
        {activeTab === 'settings' && (
          bayi?.id ? <BayiTeklifAyarlari bayiId={bayi.id} /> : <div className="p-10 text-center text-white/30">Bayi bilgileri yükleniyor...</div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="font-display font-bold text-lg uppercase tracking-widest text-white mb-6 flex items-center gap-3">
              <div className="w-6 h-px bg-brand-red" />
              Profil Bilgileriniz
            </h2>

            <div className="bg-[#141414] border border-white/5 p-8 max-w-2xl">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 font-display font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">
                      <Building2 size={12} className="text-brand-red" /> Firma Adı
                    </label>
                    <input 
                      type="text" 
                      value={firmaAdi}
                      onChange={(e) => setFirmaAdi(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 p-3 text-sm text-white font-body focus:border-brand-red outline-none transition-all"
                      placeholder="Firma ünvanınızı yazın"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 font-display font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">
                      <UserIcon size={12} className="text-brand-red" /> Yetkili Kişi
                    </label>
                    <input 
                      type="text" 
                      value={yetkiliAdi}
                      onChange={(e) => setYetkiliAdi(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 p-3 text-sm text-white font-body focus:border-brand-red outline-none transition-all"
                      placeholder="Ad soyad"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 font-display font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">
                      <Phone size={12} className="text-brand-red" /> Telefon
                    </label>
                    <input 
                      type="tel" 
                      value={telefon}
                      onChange={(e) => setTelefon(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 p-3 text-sm text-white font-body focus:border-brand-red outline-none transition-all"
                      placeholder="05xx xxx xx xx"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 font-display font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">
                      <MapPin size={12} className="text-brand-red" /> Şehir
                    </label>
                    <input 
                      type="text" 
                      value={sehir}
                      onChange={(e) => setSehir(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 p-3 text-sm text-white font-body focus:border-brand-red outline-none transition-all"
                      placeholder="Kayseri, İstanbul vb."
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[10px] text-white/20 font-body">
                    * Bayi durumunuz: <span className={bayi?.onaylandi ? 'text-green-500 font-bold' : 'text-yellow-500 font-bold'}>
                      {bayi?.onaylandi ? 'ONAYLI BAYİ' : 'ONAY BEKLİYOR'}
                    </span>
                  </div>
                  <button 
                    type="submit" 
                    disabled={savingProfile}
                    className={`flex items-center gap-3 px-8 py-3 font-display font-black text-xs uppercase tracking-[0.2em] transition-all ${saveSuccess ? 'bg-green-600 text-white' : 'bg-brand-red text-white hover:bg-white hover:text-black disabled:opacity-50'}`}
                  >
                    {savingProfile ? <Loader2 size={14} className="animate-spin" /> : saveSuccess ? <Check size={14} /> : <Save size={14} />}
                    {savingProfile ? 'KAYDEDİLİYOR...' : saveSuccess ? 'KAYDEDİLDİ' : 'GÜNCELLE'}
                  </button>
                </div>

              </form>
            </div>

            {/* Şifre Güncelleme */}
            <div className="bg-[#141414] border border-white/5 p-8 max-w-2xl mt-6">
              <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                <div className="w-4 h-px bg-brand-red" />
                Şifre Değiştir
              </h3>
              
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-display font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2 block">Yeni Şifre</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 p-3 text-sm text-white font-body focus:border-brand-red outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="font-display font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2 block">Şifre Tekrar</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 p-3 text-sm text-white font-body focus:border-brand-red outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={savingPassword || !newPassword}
                    className={`flex items-center gap-3 px-8 py-3 font-display font-black text-xs uppercase tracking-[0.2em] transition-all ${passwordSuccess ? 'bg-green-600 text-white' : 'bg-white/5 text-white hover:bg-brand-red disabled:opacity-50'}`}
                  >
                    {savingPassword ? <Loader2 size={14} className="animate-spin" /> : passwordSuccess ? <Check size={14} /> : <RefreshCw size={14} />}
                    {savingPassword ? 'GÜNCELLENİYOR...' : passwordSuccess ? 'ŞİFRE GÜNCELLENDİ' : 'ŞİFREYİ GÜNCELLE'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}