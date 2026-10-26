/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { 
  FileText, Plus, Trash2, Printer, Calculator, User, Hash, Calendar, 
  Percent, Save, Link as LinkIcon, Loader2, Check, Search, Palette, 
  Tag, Sparkles, Building2, MapPin, Phone, Mail, Globe, Upload, 
  Share2, ExternalLink, ChevronDown, ChevronUp, RefreshCw, SlidersHorizontal,
  DollarSign, Eye, Edit3, AlertCircle, CheckCircle2
} from 'lucide-react'
import { getCart } from '@/lib/cart'
import { getKurClient } from '@/lib/kur-client'
import { LIGHT_PRODUCT_FIELDS } from '@/lib/product-queries'
import { dovizToTL } from '@/lib/kur'

interface CartItem {
  id: string
  slug?: string
  ad: string
  fiyat: number
  bayi_fiyati?: number | null
  adet: number
  fotograf: string
  kategori: string
  marka?: string
  model_kodu?: string
  para_birimi?: string
}

interface ProposalSettings {
  id?: string
  logo_url?: string
  firma_adi?: string
  adres?: string
  telefon?: string
  email?: string
  web_sitesi?: string
  varsayilan_kar_orani?: number
  teklif_notu?: string
}

const getProductPriceInTl = (p: any, kurData: any) => {
  const basePrice = p.bayi_fiyati || p.fiyat || 0
  const paraBirimi = p.bayi_fiyati ? (p.bayi_para_birimi || p.para_birimi || 'TRY') : (p.para_birimi || 'TRY')
  return dovizToTL(basePrice, paraBirimi, kurData)
}

const THEME_COLORS: Record<string, { hex: string; label: string }> = {
  black: { hex: '#000000', label: 'Kurumsal Siyah' },
  red:   { hex: '#c00000', label: 'Akdağ Kırmızı' },
  blue:  { hex: '#1e3a8a', label: 'Kral Mavi' },
  green: { hex: '#064e3b', label: 'Zümrüt Yeşil' },
  amber: { hex: '#78350f', label: 'Bronz Amber' }
}

export default function BayiTeklifOlusturucu({ bayiId }: { bayiId: string }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [settings, setSettings] = useState<ProposalSettings | null>(null)
  
  // Fiyatlandırma durumları: Her ürün için direkt satış fiyatı veya kâr oranı
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({})
  const [margins, setMargins] = useState<Record<string, number>>({})
  const [globalMargin, setGlobalMargin] = useState(20)

  // Teklif temel bilgileri
  const [customerName, setCustomerName] = useState('')
  const [proposalNo, setProposalNo] = useState(`TEK-${Math.floor(1000 + Math.random() * 9000)}`)
  const [proposalDate, setProposalDate] = useState(new Date().toISOString().split('T')[0])
  const [proposalNote, setProposalNote] = useState('')
  
  // Kaydetme ve Paylaşma
  const [isSaving, setIsSaving] = useState(false)
  const [savedLink, setSavedLink] = useState<string | null>(null)
  const [savedProposalId, setSavedProposalId] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [kur, setKur] = useState<{ USD: number; EUR: number }>({ USD: 34.0, EUR: 37.0 })

  // Firma Bilgileri & Antet Düzenleme (Açılır/Kapanır)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsForm, setSettingsForm] = useState<ProposalSettings>({
    logo_url: '',
    firma_adi: '',
    adres: '',
    telefon: '',
    email: '',
    web_sitesi: '',
    varsayilan_kar_orani: 20,
    teklif_notu: ''
  })
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false)

  // Ürün Arama Durumları
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearchingProduct, setIsSearchingProduct] = useState(false)

  // Manuel Kalem Ekleme Durumları
  const [customAd, setCustomAd] = useState('')
  const [customKategori, setCustomKategori] = useState('')
  const [customFiyat, setCustomFiyat] = useState('')
  const [customAdet, setCustomAdet] = useState(1)
  const [isCustomItemOpen, setIsCustomItemOpen] = useState(false)

  // Görünüm & Tasarım Durumları
  const [themeColor, setThemeColor] = useState('black')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [isKdvExcluded, setIsKdvExcluded] = useState(false)
  const [activeMobileView, setActiveMobileView] = useState<'editor' | 'preview'>('editor')

  const supabase = useRef(createClient()).current

  // 1. Veri Yükleme
  useEffect(() => {
    async function loadData() {
      // Döviz kurlarını getir
      try {
        const kurData = await getKurClient()
        if (kurData) {
          setKur({ USD: kurData.USD, EUR: kurData.EUR })
        }
      } catch (err) {
        console.error('Kurlar çekilirken hata oluştu:', err)
      }

      // Sepeti getir
      const cart = getCart()
      const itemIds = cart.map(i => i.id)
      if (itemIds.length > 0) {
        const { data: dbProducts } = await supabase
          .from('urunler')
          .select('id, marka, model_kodu, fotograflar, para_birimi, bayi_fiyati, fiyat')
          .in('id', itemIds)

        if (dbProducts) {
          const enrichedCart = cart.map(item => {
            const match = dbProducts.find((p: any) => p.id === item.id)
            return {
              ...item,
              marka: match?.marka || (item.ad ? item.ad.trim().split(' ')[0] : 'Akdağ'),
              model_kodu: match?.model_kodu || '',
              fotograf: match?.fotograflar?.[0] || item.fotograf,
              para_birimi: match?.para_birimi || 'TRY'
            }
          })
          setItems(enrichedCart)
        } else {
          setItems(cart)
        }
      } else {
        setItems([])
      }

      // Bayi teklif ayarlarını getir
      try {
        const { data } = await supabase
          .from('bayi_teklif_ayarlari')
          .select('id, logo_url, firma_adi, adres, telefon, email, web_sitesi, varsayilan_kar_orani, teklif_notu')
          .eq('bayi_id', bayiId)
          .maybeSingle()

        if (data) {
          setSettings(data)
          setSettingsForm(data)
          const defMargin = Number(data.varsayilan_kar_orani) || 20
          setGlobalMargin(defMargin)
          if (data.teklif_notu) {
            setProposalNote(data.teklif_notu)
          }
        }
      } catch (err) {
        console.error('Bayi teklif ayarları yüklenemedi:', err)
      }
    }
    loadData()
  }, [bayiId, supabase])

  // Arama Gecikmesi (Debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Ürün Arama İşlemi
  useEffect(() => {
    if (debouncedSearchQuery.length < 2) {
      setSearchResults([])
      return
    }
    const runSearch = async () => {
      setIsSearchingProduct(true)
      try {
        const { data } = await supabase
          .from('urunler')
          .select(LIGHT_PRODUCT_FIELDS)
          .ilike('ad', `%${debouncedSearchQuery}%`)
          .limit(6)
        setSearchResults(data || [])
      } catch (err) {
        console.error('Ürün arama hatası:', err)
      } finally {
        setIsSearchingProduct(false)
      }
    }
    runSearch()
  }, [debouncedSearchQuery, supabase])

  // Firma Ayarlarını Kaydetme (Antet & Logo Güncelleme)
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSavingSettings(true)
    setSettingsSaveSuccess(false)
    try {
      const payload = {
        bayi_id: bayiId,
        logo_url: settingsForm.logo_url || '',
        firma_adi: settingsForm.firma_adi || '',
        adres: settingsForm.adres || '',
        telefon: settingsForm.telefon || '',
        email: settingsForm.email || '',
        web_sitesi: settingsForm.web_sitesi || '',
        varsayilan_kar_orani: Number(settingsForm.varsayilan_kar_orani) || 20,
        teklif_notu: settingsForm.teklif_notu || '',
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('bayi_teklif_ayarlari')
        .upsert(payload)

      if (error) throw error

      setSettings(payload)
      setSettingsSaveSuccess(true)
      setTimeout(() => setSettingsSaveSuccess(false), 2500)
    } catch (err: any) {
      alert(`Ayarlar kaydedilemedi: ${err.message}`)
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Logo Yükleme İşlemi
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo boyutu 2MB\'dan küçük olmalıdır.')
      return
    }

    setIsUploadingLogo(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${bayiId}_${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('bayi-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('bayi-assets')
        .getPublicUrl(filePath)

      const updated = { ...settingsForm, logo_url: publicUrl }
      setSettingsForm(updated)
      setSettings(updated)

      // Otomatik olarak veritabanına kaydet
      await supabase.from('bayi_teklif_ayarlari').upsert({
        bayi_id: bayiId,
        ...updated,
        updated_at: new Date().toISOString()
      })
    } catch (err: any) {
      alert(`Logo yükleme hatası: ${err.message}`)
    } finally {
      setIsUploadingLogo(false)
    }
  }

  // ==========================================
  // FİYATLANDIRMA HESAPLAMA & DİREKT FİYAT / KÂR
  // ==========================================

  // Ürünün Alış Fiyatı (Bayi Maliyeti)
  const getItemBasePrice = (item: CartItem): number => {
    if (item.model_kodu === 'MANUEL') {
      return item.fiyat || 0
    }
    return item.bayi_fiyati || item.fiyat || 0
  }

  // Ürünün Birim Satış Fiyatı (Müşteriye Sunulan Fiyat)
  const getItemUnitPrice = (item: CartItem): number => {
    // 1. Direkt fiyat girilmişse öncelikli olarak onu kullan
    if (customPrices[item.id] !== undefined && !isNaN(customPrices[item.id])) {
      return customPrices[item.id]
    }
    const base = getItemBasePrice(item)
    if (item.model_kodu === 'MANUEL') {
      return base
    }
    // 2. Kâr oranına göre hesapla (özel kâr veya genel kâr)
    const margin = margins[item.id] !== undefined ? margins[item.id] : globalMargin
    return Math.round(base * (1 + margin / 100) * 100) / 100
  }

  // Ürünün Kâr Oranı (%)
  const getItemMargin = (item: CartItem): number => {
    if (margins[item.id] !== undefined) {
      return margins[item.id]
    }
    const base = getItemBasePrice(item)
    if (customPrices[item.id] !== undefined && base > 0) {
      return Math.round(((customPrices[item.id] - base) / base) * 1000) / 10
    }
    return globalMargin
  }

  // Direkt Satış Fiyatı Değiştiğinde (Fiyat kutusuna yazılınca)
  const handleDirectPriceChange = (id: string, valueStr: string) => {
    const val = parseFloat(valueStr)
    const item = items.find(i => i.id === id)
    if (!item) return

    if (isNaN(val) || val < 0) {
      setCustomPrices(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      return
    }

    setCustomPrices(prev => ({ ...prev, [id]: val }))

    // İlgili kâr oranını da eşzamanlı olarak güncelle
    const base = getItemBasePrice(item)
    if (base > 0) {
      const impliedMargin = Math.round(((val - base) / base) * 1000) / 10
      setMargins(prev => ({ ...prev, [id]: impliedMargin }))
    }
  }

  // Kâr Oranı Değiştiğinde (% kutusuna yazılınca)
  const handleMarginChange = (id: string, valueStr: string) => {
    const val = parseFloat(valueStr)
    const item = items.find(i => i.id === id)
    if (!item) return

    if (isNaN(val)) {
      setMargins(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      return
    }

    setMargins(prev => ({ ...prev, [id]: val }))

    // Direkt satış fiyatını da eşzamanlı olarak güncelle
    const base = getItemBasePrice(item)
    const calculatedPrice = Math.round(base * (1 + val / 100) * 100) / 100
    setCustomPrices(prev => ({ ...prev, [id]: calculatedPrice }))
  }

  // Tüm Ürünlere Genel Kâr Oranını Uygula
  const handleApplyGlobalMargin = () => {
    const newMargins: Record<string, number> = {}
    const newPrices: Record<string, number> = {}

    items.forEach(item => {
      if (item.model_kodu !== 'MANUEL') {
        const base = getItemBasePrice(item)
        newMargins[item.id] = globalMargin
        newPrices[item.id] = Math.round(base * (1 + globalMargin / 100) * 100) / 100
      }
    })

    setMargins(newMargins)
    setCustomPrices(newPrices)
  }

  // Toplam Hesaplamaları
  const totalCost = items.reduce((sum, item) => sum + getItemBasePrice(item) * item.adet, 0)
  const rawSubtotal = items.reduce((sum, item) => sum + getItemUnitPrice(item) * item.adet, 0)
  const discountAmount = rawSubtotal * (discountPercent / 100)
  const subtotal = Math.max(0, rawSubtotal - discountAmount)
  const tax = isKdvExcluded ? 0 : subtotal * 0.20
  const total = subtotal + tax
  const grossProfit = Math.max(0, subtotal - totalCost)
  const effectiveMargin = totalCost > 0 ? Math.round((grossProfit / totalCost) * 1000) / 10 : 0

  // Teklifi Veritabanına Kaydet & Paylaşım Linki Üret
  const handleSaveProposal = async () => {
    if (items.length === 0) {
      alert('Lütfen teklife en az bir ürün veya hizmet kalemi ekleyiniz.')
      return
    }
    if (!customerName.trim()) {
      alert('Lütfen müşteri adını giriniz.')
      return
    }

    setIsSaving(true)
    
    // Metadata JSON
    const metadataString = JSON.stringify({
      teklif_notu: proposalNote || settings?.teklif_notu || '',
      iskonto_orani: discountPercent,
      tema_rengi: themeColor
    })

    try {
      const enrichedUrunler = items.map(i => {
        const unitPrice = getItemUnitPrice(i)
        return {
          id: i.id,
          slug: i.slug || '',
          ad: i.ad,
          marka: i.marka || (i.ad ? i.ad.trim().split(' ')[0] : 'Akdağ'),
          kod: i.model_kodu || '',
          gorsel: i.fotograf || '',
          miktar: i.adet,
          fiyat_doviz: unitPrice,
          para_birimi: 'TRY', // Bayi teklifleri daima TL tabanlıdır
          tutar_tl: unitPrice * i.adet
        }
      })

      const { data, error } = await supabase
        .from('teklifler')
        .insert({
          bayi_id: bayiId,
          teklif_no: proposalNo,
          musteri_adi: customerName.trim(),
          tarih: proposalDate,
          ara_toplam: subtotal,
          kdv: tax,
          genel_toplam: total,
          kur_usd: kur.USD,
          kur_eur: kur.EUR,
          ozel_not: metadataString,
          urunler: enrichedUrunler
        })
        .select('id')
        .single()

      if (error) throw error

      const link = `${window.location.origin}/teklif/${data.id}`
      setSavedLink(link)
      setSavedProposalId(data.id)
    } catch (err: any) {
      alert(`Kaydetme hatası: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Linki Kopyala
  const copyLink = () => {
    if (savedLink) {
      navigator.clipboard.writeText(savedLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  // WhatsApp Paylaşım URL'i
  const getWhatsAppUrl = () => {
    if (!savedLink) return ''
    const firm = settings?.firma_adi || 'Firmamız'
    const msg = `Sayın *${customerName || 'Müşterimiz'}*,\n\n${firm} tarafından adınıza özel olarak hazırlanan fiyat teklifiniz hazırdır.\n\nTeklifi incelemek ve onaylamak için aşağıdaki bağlantıya tıklayabilirsiniz:\n🔗 ${savedLink}\n\nTeklif No: *${proposalNo}*\nToplam Tutar: *${total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺*`
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`
  }

  // Profesyonel Yazdırma & PDF Çıktısı İşlemi
  const handlePrint = () => {
    setActiveMobileView('preview')
    setTimeout(() => {
      window.print()
    }, 120)
  }

  // Arama Sonucundan Ürün Ekleme
  const handleAddProductFromSearch = (p: any) => {
    const priceInTl = getProductPriceInTl(p, kur)
    const existingIndex = items.findIndex(item => item.id === p.id)

    if (existingIndex > -1) {
      const updated = [...items]
      updated[existingIndex].adet += 1
      setItems(updated)
    } else {
      const newItem: CartItem = {
        id: p.id,
        slug: p.slug || '',
        ad: p.ad,
        fiyat: priceInTl,
        bayi_fiyati: priceInTl,
        adet: 1,
        fotograf: p.fotograflar?.[0] || '',
        kategori: p.kategori || '',
        marka: p.marka || (p.ad ? p.ad.trim().split(' ')[0] : 'Akdağ'),
        model_kodu: p.model_kodu || '',
        para_birimi: 'TRY'
      }
      setItems(prev => [...prev, newItem])
      // Varsayılan kâr ve direkt fiyatı hazırla
      const initialPrice = Math.round(priceInTl * (1 + globalMargin / 100) * 100) / 100
      setCustomPrices(prev => ({ ...prev, [p.id]: initialPrice }))
      setMargins(prev => ({ ...prev, [p.id]: globalMargin }))
    }
    
    setSearchQuery('')
    setSearchResults([])
  }

  // Manuel Kalem Ekleme
  const handleAddCustomItem = () => {
    if (!customAd.trim()) {
      alert('Lütfen açıklama / hizmet adı yazınız.')
      return
    }
    const unitPrice = parseFloat(customFiyat)
    if (isNaN(unitPrice) || unitPrice < 0) {
      alert('Lütfen geçerli bir birim fiyat yazınız.')
      return
    }

    const customId = `custom-${Date.now()}`
    const customItem: CartItem = {
      id: customId,
      ad: customAd.trim(),
      fiyat: unitPrice,
      bayi_fiyati: unitPrice,
      adet: Math.max(1, customAdet),
      fotograf: '',
      kategori: customKategori.trim() || 'Hizmet / Montaj',
      marka: 'Özel Kalem',
      model_kodu: 'MANUEL',
      para_birimi: 'TRY'
    }

    setItems(prev => [...prev, customItem])
    setCustomPrices(prev => ({ ...prev, [customId]: unitPrice }))
    setMargins(prev => ({ ...prev, [customId]: 0 }))

    // Formu sıfırla
    setCustomAd('')
    setCustomKategori('')
    setCustomFiyat('')
    setCustomAdet(1)
    setIsCustomItemOpen(false)
  }

  const themeHex = THEME_COLORS[themeColor]?.hex || '#000000'

  return (
    <div className="space-y-6">

      {/* ========================================================
          1. ÜST BİLGİ & ANTET BARI (Kompakt / Açılır-Kapanır Panel)
          ======================================================== */}
      <div className="bg-[#141414] border border-white/10 rounded-sm overflow-hidden no-print">
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-white/[0.03] to-transparent">
          <div className="flex items-center gap-4 min-w-0">
            {/* Logo Küçük Görsel */}
            <div className="w-14 h-14 bg-black border border-white/10 rounded flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 size={24} className="text-white/20" />
              )}
            </div>

            {/* Firma Kısa Bilgisi */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-white text-base uppercase tracking-wider truncate">
                  {settings?.firma_adi || 'FİRMA ADINIZ BELİRTİLMEMİŞ'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red font-bold uppercase tracking-widest flex-shrink-0">
                  Antetli Teklif
                </span>
              </div>
              <p className="text-xs text-white/40 truncate max-w-xl mt-0.5">
                {settings?.adres ? `${settings.adres} • ` : ''}{settings?.telefon || 'İletişim bilgisi girilmedi'}
              </p>
            </div>
          </div>

          {/* Antet Düzenleme Aç/Kapat Butonu */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all border ${
                isSettingsOpen 
                  ? 'bg-brand-red text-white border-brand-red' 
                  : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
              }`}
            >
              <Edit3 size={14} />
              <span>{isSettingsOpen ? 'Antet Panelini Kapat' : 'Logo & Firma Bilgilerini Düzenle'}</span>
              {isSettingsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Genişletilmiş Firma Bilgileri & Logo Formu */}
        {isSettingsOpen && (
          <form onSubmit={handleSaveSettings} className="p-6 border-t border-white/10 bg-black/40 space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              
              {/* Logo Yükleme Alanı */}
              <div className="md:col-span-1 space-y-3">
                <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-white/50">
                  Teklif Logosu
                </label>
                <div className="relative group w-full h-32 bg-black border-2 border-dashed border-white/20 hover:border-brand-red rounded flex flex-col items-center justify-center p-2 transition-all">
                  {settingsForm.logo_url ? (
                    <img src={settingsForm.logo_url} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center">
                      <Building2 size={28} className="mx-auto text-white/20 mb-1" />
                      <span className="text-[10px] text-white/40">Logo Seçilmedi</span>
                    </div>
                  )}

                  {isUploadingLogo && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <Loader2 size={20} className="animate-spin text-brand-red" />
                    </div>
                  )}

                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-[11px] font-bold gap-1">
                    <Upload size={18} />
                    <span>Logoyu Değiştir</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={isUploadingLogo} />
                  </label>
                </div>
                <p className="text-[9px] text-white/30 text-center">PNG veya JPG (Maks. 2MB)</p>
              </div>

              {/* Firma İletişim Form Alanları */}
              <div className="md:col-span-3 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-white/50 mb-1">
                      Firma Ünvanı / Başlık
                    </label>
                    <input
                      type="text"
                      value={settingsForm.firma_adi || ''}
                      onChange={e => setSettingsForm({ ...settingsForm, firma_adi: e.target.value })}
                      placeholder="Örn: Akdağ Elektronik & Bilişim Ltd."
                      className="input-dark text-xs py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-white/50 mb-1">
                      Telefon Numarası
                    </label>
                    <input
                      type="text"
                      value={settingsForm.telefon || ''}
                      onChange={e => setSettingsForm({ ...settingsForm, telefon: e.target.value })}
                      placeholder="Örn: 0352 231 69 15"
                      className="input-dark text-xs py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-white/50 mb-1">
                      E-Posta Adresi
                    </label>
                    <input
                      type="email"
                      value={settingsForm.email || ''}
                      onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      placeholder="Örn: info@firmam.com"
                      className="input-dark text-xs py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-white/50 mb-1">
                      Web Sitesi
                    </label>
                    <input
                      type="text"
                      value={settingsForm.web_sitesi || ''}
                      onChange={e => setSettingsForm({ ...settingsForm, web_sitesi: e.target.value })}
                      placeholder="Örn: www.firmam.com"
                      className="input-dark text-xs py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-white/50 mb-1">
                    Açık Adres (Teklif Alt Bilgisinde Yer Alır)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.adres || ''}
                    onChange={e => setSettingsForm({ ...settingsForm, adres: e.target.value })}
                    placeholder="Örn: Cumhuriyet Mah. Sur Cad. No:17 Melikgazi / Kayseri"
                    className="input-dark text-xs py-2"
                  />
                </div>
              </div>
            </div>

            {/* Antet Ayarlarını Kaydet Butonu */}
            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 text-xs font-bold text-white/60 hover:text-white uppercase transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isSavingSettings}
                className={`btn-primary text-xs py-2 px-6 font-bold uppercase tracking-wider flex items-center gap-2 ${
                  settingsSaveSuccess ? 'bg-green-600 hover:bg-green-500' : ''
                }`}
              >
                {isSavingSettings ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : settingsSaveSuccess ? (
                  <>
                    <Check size={14} />
                    <span>Antet Bilgileri Güncellendi</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Antet Bilgilerini Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================
          2. ANA TEKLİF YÖNETİM ÇUBUĞU (Toolbar: Müşteri, No, Kaydet)
          ======================================================== */}
      <div className="bg-[#141414] border border-white/10 p-5 rounded-sm no-print space-y-4 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Müşteri Adı Input */}
          <div className="md:col-span-5">
            <label className="flex items-center gap-1.5 text-[10px] font-display font-bold uppercase tracking-widest text-white/50 mb-1.5">
              <User size={12} className="text-brand-red" />
              <span>Müşteri / Kurum Adı *</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Örn: Ahmet Yılmaz / ABC Bilişim Sanayi"
              className="input-dark text-sm font-semibold py-2.5"
            />
          </div>

          {/* Teklif No & Tarih */}
          <div className="md:col-span-3 grid grid-cols-2 gap-2">
            <div>
              <label className="flex items-center gap-1 text-[10px] font-display font-bold uppercase tracking-widest text-white/50 mb-1.5">
                <Hash size={11} className="text-brand-red" />
                <span>Teklif No</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={proposalNo}
                  onChange={e => setProposalNo(e.target.value)}
                  className="input-dark text-xs font-mono font-bold py-2.5 pr-7"
                />
                <button
                  type="button"
                  onClick={() => setProposalNo(`TEK-${Math.floor(1000 + Math.random() * 9000)}`)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                  title="Yeni Numara Üret"
                >
                  <RefreshCw size={12} />
                </button>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1 text-[10px] font-display font-bold uppercase tracking-widest text-white/50 mb-1.5">
                <Calendar size={11} className="text-brand-red" />
                <span>Tarih</span>
              </label>
              <input
                type="date"
                value={proposalDate}
                onChange={e => setProposalDate(e.target.value)}
                className="input-dark text-xs py-2.5"
              />
            </div>
          </div>

          {/* Aksiyon Butonları: Kaydet, Yazdır */}
          <div className="md:col-span-4 flex items-end gap-2 pt-2 md:pt-0">
            <button
              onClick={handleSaveProposal}
              disabled={isSaving}
              className="flex-1 btn-primary py-2.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Teklifi Kaydet & Link Üret</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              title="Yazdır veya PDF olarak kaydet"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">Yazdır / PDF</span>
            </button>
          </div>
        </div>

        {/* Kaydedilmiş Link Paylaşım Bildirimi (Varsa) */}
        {savedLink && (
          <div className="p-3.5 bg-green-500/10 border border-green-500/30 rounded flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-green-400 font-bold">
              <CheckCircle2 size={16} />
              <span>Teklif başarıyla kaydedildi ve yayınlandı!</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={copyLink}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 transition-all"
              >
                {copiedLink ? <Check size={13} className="text-green-400" /> : <LinkIcon size={13} />}
                <span>{copiedLink ? 'Kopyalandı!' : 'Linki Kopyala'}</span>
              </button>

              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 transition-all"
              >
                <Share2 size={13} />
                <span>WhatsApp ile Gönder</span>
              </a>

              <a
                href={`/teklif/${savedProposalId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 rounded font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 transition-all border border-white/10"
              >
                <ExternalLink size={13} />
                <span>Webde Gör</span>
              </a>
            </div>
          </div>
        )}

        {/* Mobil Ekran Görünüm Seçici (Düzenleyici vs Canlı Önizleme) */}
        <div className="flex xl:hidden border-t border-white/10 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveMobileView('editor')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeMobileView === 'editor'
                ? 'bg-brand-red text-white'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Teklif Düzenleyici</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileView('preview')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeMobileView === 'preview'
                ? 'bg-brand-red text-white'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <Eye size={14} />
            <span>A4 Önizleme & Çıktı</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          3. ÇİFT PANEL: SOL (DÜZENLEYİCİ) & SAĞ (CANLI A4 ÖNİZLEME)
          ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start print:!block print:!w-full print:!m-0 print:!p-0">
        
        {/* SOL PANEL: TEKLİF DÜZENLEYİCİ */}
        <div className={`xl:col-span-5 space-y-6 no-print ${
          activeMobileView === 'preview' ? 'hidden xl:block' : 'block'
        }`}>

          {/* Hızlı Ürün Arama & Ekleme */}
          <div className="bg-[#141414] border border-white/10 p-5 rounded-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Search size={16} className="text-brand-red" />
                <h3 className="font-display font-bold uppercase tracking-widest text-xs">Katalogdan Ürün Ekle</h3>
              </div>
              <span className="text-[10px] text-white/40 font-mono">Dolar: {kur.USD}₺ • Euro: {kur.EUR}₺</span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Ürün adı, marka veya model kodu ile arayın..."
                className="input-dark text-xs py-2.5 pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />

              {isSearchingProduct && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 size={14} className="animate-spin text-brand-red" />
                </div>
              )}

              {/* Arama Sonuç Dropdown */}
              {searchQuery.length >= 2 && searchResults.length === 0 && !isSearchingProduct && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-[#1A1A1A] border border-white/10 p-4 text-xs text-white/40 text-center z-50 rounded shadow-xl">
                  Aramanızla eşleşen ürün bulunamadı.
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-[#1A1A1A] border border-white/15 shadow-2xl max-h-[320px] overflow-y-auto z-50 divide-y divide-white/5 rounded">
                  {searchResults.map((p: any) => {
                    const priceInTl = getProductPriceInTl(p, kur)
                    return (
                      <div key={p.id} className="p-3 hover:bg-white/5 flex items-center justify-between gap-3 text-xs transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 rounded">
                            {p.fotograflar?.[0] ? (
                              <img src={p.fotograflar[0]} className="w-full h-full object-contain p-0.5" alt="" />
                            ) : (
                              <span className="text-[8px] text-white/20">—</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white uppercase truncate">{p.ad}</div>
                            <div className="text-[10px] text-white/40 truncate">
                              <span className="text-brand-red font-semibold">{p.marka || 'Akdağ'}</span> {p.model_kodu && `| ${p.model_kodu}`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-right">
                            <div className="font-bold text-white text-xs">{priceInTl.toLocaleString('tr-TR')} ₺</div>
                            <div className="text-[9px] text-white/30">Bayi Alış</div>
                          </div>
                          <button
                            onClick={() => handleAddProductFromSearch(p)}
                            className="bg-brand-red hover:bg-white text-white hover:text-black p-2 rounded transition-all"
                            title="Teklife Ekle"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Manuel Hizmet / Kalem Ekleme Butonu */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsCustomItemOpen(!isCustomItemOpen)}
                className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles size={14} className="text-brand-red" />
                <span>{isCustomItemOpen ? 'Özel Kalem Formunu Gizle' : '+ Özel Kalem / Hizmet / Montaj Ekle'}</span>
              </button>
            </div>

            {/* Manuel Kalem Ekleme Alanı */}
            {isCustomItemOpen && (
              <div className="p-4 bg-black/50 border border-white/10 rounded space-y-3 mt-2 animate-in fade-in duration-200">
                <div>
                  <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-white/40 mb-1">
                    Açıklama / Hizmet Adı *
                  </label>
                  <input
                    type="text"
                    value={customAd}
                    onChange={e => setCustomAd(e.target.value)}
                    placeholder="Örn: Ses Sistemi Montajı, Kablolama ve Kurulum"
                    className="input-dark text-xs py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-white/40 mb-1">
                      Birim Fiyat (TL) *
                    </label>
                    <input
                      type="number"
                      value={customFiyat}
                      onChange={e => setCustomFiyat(e.target.value)}
                      placeholder="0.00"
                      className="input-dark text-xs py-2 text-right font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-white/40 mb-1">
                      Miktar (Adet)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={customAdet}
                      onChange={e => setCustomAdet(parseInt(e.target.value) || 1)}
                      className="input-dark text-xs py-2 text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-white/40 mb-1">
                    Kategori / Not (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={customKategori}
                    onChange={e => setCustomKategori(e.target.value)}
                    placeholder="Örn: İşçilik, Saha Desteği, Altyapı"
                    className="input-dark text-xs py-2"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="btn-primary w-full py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Kalemi Teklife Ekle</span>
                </button>
              </div>
            )}
          </div>

          {/* ========================================================
              DİREKT FİYAT VE KÂR AYARLI ÜRÜN LİSTESİ (ÇİFT YÖNLÜ)
              ======================================================== */}
          <div className="bg-[#141414] border border-white/10 p-5 rounded-sm space-y-4">
            
            {/* Başlık ve Toplu Kâr Kontrolü */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calculator size={16} className="text-brand-red" />
                <h4 className="font-display font-bold text-xs uppercase tracking-widest text-white">
                  Teklif Kalemleri ({items.length})
                </h4>
              </div>

              {items.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-black/60 border border-white/10 px-2 py-1 rounded">
                    <span className="text-[10px] text-white/40 font-bold">Genel Kâr:</span>
                    <input
                      type="number"
                      value={globalMargin}
                      onChange={e => setGlobalMargin(Number(e.target.value))}
                      className="w-12 bg-transparent text-right text-xs font-bold text-brand-red outline-none"
                    />
                    <span className="text-[10px] text-brand-red font-bold">%</span>
                  </div>

                  <button
                    onClick={handleApplyGlobalMargin}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
                    title="Tüm katalog ürünlerine bu kâr oranını uygula"
                  >
                    Tümüne Uygula
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Teklifteki tüm ürünleri temizlemek istediğinize emin misiniz?')) {
                        setItems([])
                        setCustomPrices({})
                        setMargins({})
                      }
                    }}
                    className="text-white/30 hover:text-brand-red p-1 transition-colors"
                    title="Listeyi Temizle"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Ürün Listesi */}
            {items.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-white/10 rounded">
                <FileText size={32} className="mx-auto text-white/20 mb-2" />
                <p className="text-xs text-white/40 font-semibold">Teklifinizde henüz ürün bulunmuyor.</p>
                <p className="text-[11px] text-white/25 mt-1">
                  Yukarıdaki arama çubuğundan ürün ekleyebilir veya özel kalem oluşturabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {items.map((item) => {
                  const basePrice = getItemBasePrice(item)
                  const unitPrice = getItemUnitPrice(item)
                  const itemMargin = getItemMargin(item)
                  const rowTotal = unitPrice * item.adet
                  const profitPerUnit = unitPrice - basePrice
                  const isManual = item.model_kodu === 'MANUEL'

                  return (
                    <div
                      key={item.id}
                      className="bg-black/50 border border-white/10 hover:border-white/20 p-3.5 rounded transition-all space-y-3"
                    >
                      {/* Üst Kısım: Ürün Adı, Marka, Sil Butonu */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 bg-black border border-white/10 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                            {item.fotograf ? (
                              <img src={item.fotograf} alt={item.ad} className="w-full h-full object-contain p-0.5" />
                            ) : (
                              <FileText size={16} className="text-white/20" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-display font-bold text-xs text-white uppercase truncate">
                              {item.ad}
                            </div>
                            <div className="text-[10px] text-white/40 truncate">
                              <span className="text-brand-red">{item.marka || 'Akdağ'}</span> {item.model_kodu && `| ${item.model_kodu}`}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setItems(items.filter(i => i.id !== item.id))}
                          className="text-white/30 hover:text-brand-red p-1 transition-colors flex-shrink-0"
                          title="Ürünü Tekliften Çıkar"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Alt Kısım: Alış, DİREKT SATIŞ FİYATI, KÂR %, ADET, SATIR TOPLAMI */}
                      <div className="grid grid-cols-12 gap-2 pt-2 border-t border-white/5 items-center">
                        
                        {/* 1. Alış Maliyeti */}
                        <div className="col-span-3">
                          <span className="text-[9px] uppercase font-bold text-white/30 block mb-0.5">Alış (Maliyet)</span>
                          <span className="text-xs font-mono font-bold text-white/60">
                            {basePrice.toLocaleString('tr-TR')} ₺
                          </span>
                        </div>

                        {/* 2. DİREKT BİRİM SATIŞ FİYATI (Kullanıcı Direkt Yazabilir!) */}
                        <div className="col-span-4">
                          <label className="text-[9px] uppercase font-bold text-brand-red block mb-0.5">
                            Birim Satış (₺) *
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={customPrices[item.id] !== undefined ? customPrices[item.id] : unitPrice}
                            onChange={e => handleDirectPriceChange(item.id, e.target.value)}
                            className="w-full bg-white/10 border border-white/20 focus:border-brand-red text-white text-xs font-bold px-2 py-1.5 rounded outline-none text-right font-mono"
                            placeholder="0"
                          />
                        </div>

                        {/* 3. KÂR MARJI (%) (Kullanıcı % Olarak da Yazabilir!) */}
                        <div className="col-span-2">
                          <label className="text-[9px] uppercase font-bold text-white/40 block mb-0.5">
                            % Kâr
                          </label>
                          <input
                            type="number"
                            step="any"
                            disabled={isManual}
                            value={isManual ? 0 : itemMargin}
                            onChange={e => handleMarginChange(item.id, e.target.value)}
                            className="w-full bg-white/5 border border-white/15 focus:border-brand-red text-brand-red text-xs font-bold px-1.5 py-1.5 rounded outline-none text-center font-mono disabled:opacity-40"
                            placeholder="%"
                          />
                        </div>

                        {/* 4. Miktar (Adet) */}
                        <div className="col-span-3">
                          <label className="text-[9px] uppercase font-bold text-white/40 block mb-0.5 text-center">
                            Adet
                          </label>
                          <div className="flex items-center justify-center bg-white/5 border border-white/10 rounded">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...items]
                                const idx = updated.findIndex(i => i.id === item.id)
                                if (updated[idx].adet > 1) {
                                  updated[idx].adet -= 1
                                  setItems(updated)
                                }
                              }}
                              className="px-2 py-1 text-white/60 hover:text-white text-xs font-bold"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-white px-1 font-mono min-w-[20px] text-center">
                              {item.adet}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...items]
                                const idx = updated.findIndex(i => i.id === item.id)
                                updated[idx].adet += 1
                                setItems(updated)
                              }}
                              className="px-2 py-1 text-white/60 hover:text-white text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Satır Bilgi Çubuğu: Kâr Miktarı & Satır Toplamı */}
                      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-white/5 text-white/50">
                        <div className="flex items-center gap-1">
                          <span>Birim Kâr:</span>
                          <span className={profitPerUnit >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                            {profitPerUnit >= 0 ? '+' : ''}{profitPerUnit.toLocaleString('tr-TR')} ₺
                          </span>
                        </div>
                        <div>
                          <span>Kalem Toplamı: </span>
                          <span className="font-bold text-white font-mono text-xs">
                            {rowTotal.toLocaleString('tr-TR')} ₺
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Bayi Kârlılık Özeti (Sadece Bayi Panelinde Görünür, Yazdırmada Gizlidir) */}
            {items.length > 0 && (
              <div className="p-3 bg-gradient-to-r from-brand-red/10 via-black to-white/5 border border-white/10 rounded text-xs space-y-1.5">
                <div className="flex justify-between text-white/60 text-[11px]">
                  <span>Toplam Maliyetiniz (Alış):</span>
                  <span className="font-mono">{totalCost.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between text-white/60 text-[11px]">
                  <span>Toplam Teklif Tutarı (Satış):</span>
                  <span className="font-mono text-white font-bold">{subtotal.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between text-green-400 font-bold pt-1 border-t border-white/10">
                  <span>Tahmini Brüt Kârınız:</span>
                  <span className="font-mono">+{grossProfit.toLocaleString('tr-TR')} ₺ (%{effectiveMargin})</span>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================
              TASARIM, İSKONTO VE KDV SEÇENEKLERİ
              ======================================================== */}
          <div className="bg-[#141414] border border-white/10 p-5 rounded-sm space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Palette size={16} className="text-brand-red" />
              <h4 className="font-display font-bold uppercase tracking-widest text-xs">Teklif Stili & Koşulları</h4>
            </div>

            {/* Renk Paleti */}
            <div>
              <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-white/40 mb-2">
                Kurumsal Renk Vurgusu
              </label>
              <div className="flex items-center gap-3">
                {Object.keys(THEME_COLORS).map(colorKey => {
                  const c = THEME_COLORS[colorKey]
                  const isSelected = themeColor === colorKey
                  return (
                    <button
                      key={colorKey}
                      type="button"
                      onClick={() => setThemeColor(colorKey)}
                      className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                        isSelected ? 'border-white scale-110 shadow-lg ring-2 ring-brand-red' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    >
                      {isSelected && <Check size={12} className="text-white drop-shadow" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* İskonto / İndirim Slider */}
            <div className="pt-2 border-t border-white/5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-display font-bold uppercase tracking-widest text-white/40">
                  Genel İskonto Oranı
                </span>
                <span className="text-xs font-bold text-brand-red">%{discountPercent} İndirim</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={discountPercent}
                onChange={e => setDiscountPercent(Number(e.target.value))}
                className="w-full accent-brand-red bg-white/10 h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* KDV Seçeneği */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isKdvExcluded}
                  onChange={e => setIsKdvExcluded(e.target.checked)}
                  className="w-4 h-4 accent-brand-red rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-white/80">KDV Hariç Teklif Oluştur</span>
              </label>
              <span className="text-[10px] text-white/40 uppercase font-mono">
                {isKdvExcluded ? 'KDV %0' : 'KDV %20 Dahil'}
              </span>
            </div>

            {/* Özel Teklif Notu */}
            <div className="pt-2 border-t border-white/5">
              <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-white/40 mb-1">
                Teklife Özel Not (Şartlar, Opsiyon vb.)
              </label>
              <textarea
                value={proposalNote}
                onChange={e => setProposalNote(e.target.value)}
                placeholder="Örn: Teklifimiz 7 gün süreyle geçerlidir. Fiyatlarımıza KDV dahildir..."
                className="input-dark text-xs py-2 min-h-[60px] resize-none"
              />
            </div>
          </div>
        </div>

        {/* ========================================================
            SAĞ PANEL: CANLI A4 ÖNİZLEME (YAZDIRMA VE PDF ÇIKTISI)
            ======================================================== */}
        <div className={`bayi-preview-column print:!block print:!w-full print:!static print:!p-0 print:!m-0 xl:col-span-7 ${
          activeMobileView === 'editor' ? 'hidden xl:block' : 'block'
        }`}>
          
          <div 
            id="print-area" 
            className="bg-white text-black p-6 sm:p-12 shadow-2xl rounded-sm proposal-preview min-h-[1050px] flex flex-col justify-between print:!min-h-0 print:!shadow-none print:!p-0 print:!m-0 print:!border-none print:!w-full print:!block print:!visible"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            <div>
              {/* TEKLİF BAŞLIĞI / ANTET (Kompakt & Kurumsal) */}
              <div 
                className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 mb-8 border-b-2" 
                style={{ borderBottomColor: themeHex }}
              >
                {/* Sol: Bayi Logosu & İletişim Bilgileri */}
                <div className="max-w-[340px] space-y-2">
                  {settings?.logo_url ? (
                    <div className="h-14 max-w-[220px] mb-2 flex items-center">
                      <img 
                        src={settings.logo_url} 
                        alt="Firma Logosu" 
                        className="max-h-full max-w-full object-contain object-left" 
                      />
                    </div>
                  ) : (
                    <div className="text-xl font-black uppercase tracking-tight text-gray-900 leading-tight">
                      {settings?.firma_adi || 'FİRMA ADI'}
                    </div>
                  )}

                  <div className="text-[11px] text-gray-600 space-y-0.5 leading-snug">
                    {settings?.firma_adi && settings.logo_url && (
                      <p className="font-bold text-gray-900">{settings.firma_adi}</p>
                    )}
                    {settings?.adres && (
                      <p className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                        <span>{settings.adres}</span>
                      </p>
                    )}
                    {settings?.telefon && (
                      <p className="flex items-center gap-1.5">
                        <Phone size={11} className="text-gray-400 flex-shrink-0" />
                        <span>{settings.telefon}</span>
                      </p>
                    )}
                    {settings?.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail size={11} className="text-gray-400 flex-shrink-0" />
                        <span>{settings.email}</span>
                      </p>
                    )}
                    {settings?.web_sitesi && (
                      <p className="flex items-center gap-1.5 font-bold text-gray-800">
                        <Globe size={11} className="text-gray-400 flex-shrink-0" />
                        <span>{settings.web_sitesi}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Sağ: Teklif Formu Meta Tablosu */}
                <div className="text-right flex flex-col items-end">
                  <h2 
                    className="font-black text-2xl uppercase tracking-tighter mb-3"
                    style={{ color: themeHex }}
                  >
                    FİYAT TEKLİF FORMU
                  </h2>

                  <table className="border-collapse text-xs" style={{ minWidth: '180px' }}>
                    <tbody>
                      <tr>
                        <td className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-left py-1 pr-4">
                          Teklif No:
                        </td>
                        <td className="font-black font-mono text-gray-900 text-right py-1">
                          {proposalNo}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-left py-1 pr-4">
                          Tarih:
                        </td>
                        <td className="font-bold text-gray-900 text-right py-1">
                          {new Date(proposalDate).toLocaleDateString('tr-TR')}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-left py-1 pr-4">
                          Geçerlilik:
                        </td>
                        <td className="font-bold text-gray-700 text-right py-1">
                          7 Gün
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MÜŞTERİ BİLGİ ALANI */}
              <div className="mb-8 p-4 bg-gray-50 border-l-4 rounded-r" style={{ borderLeftColor: themeHex }}>
                <div className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 mb-1">
                  SAYIN / KURUM (ALICI):
                </div>
                <div className="text-lg font-black uppercase text-gray-900">
                  {customerName || '....................................................................'}
                </div>
              </div>

              {/* ÜRÜN & HİZMET TABLOSU */}
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 text-left" style={{ borderBottomColor: themeHex }}>
                      <th className="py-2.5 px-2 text-[10px] font-black uppercase tracking-wider text-gray-500 w-12 text-center">Görsel</th>
                      <th className="py-2.5 px-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Ürün / Açıklama</th>
                      <th className="py-2.5 px-2 text-[10px] font-black uppercase tracking-wider text-gray-500 text-center w-16">Adet</th>
                      <th className="py-2.5 px-3 text-[10px] font-black uppercase tracking-wider text-gray-500 text-right w-28">Birim Fiyat</th>
                      <th className="py-2.5 px-3 text-[10px] font-black uppercase tracking-wider text-gray-500 text-right w-28">Toplam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs text-gray-400 italic">
                          Teklif kalemleri burada listelenecektir. Lütfen sol panelden ürün veya kalem ekleyiniz.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, idx) => {
                        const unitPrice = getItemUnitPrice(item)
                        const rowTotal = unitPrice * item.adet

                        return (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                            <td className="py-2.5 px-2 text-center align-middle">
                              <div className="w-9 h-9 mx-auto rounded border border-gray-200 overflow-hidden bg-white flex items-center justify-center">
                                {item.fotograf ? (
                                  <img src={item.fotograf} alt={item.ad} className="w-full h-full object-contain p-0.5" />
                                ) : (
                                  <FileText size={14} className="text-gray-300" />
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <div className="font-bold text-gray-900 uppercase">{item.ad}</div>
                              <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                                {item.model_kodu === 'MANUEL' ? item.kategori : `${item.marka || 'Akdağ'} ${item.model_kodu ? `| ${item.model_kodu}` : ''}`}
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-center font-bold text-gray-900 align-middle">
                              {item.adet}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-gray-800 align-middle font-mono">
                              {unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                            </td>
                            <td className="py-2.5 px-3 text-right font-black text-gray-900 align-middle font-mono">
                              {rowTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* FİNANSAL TOPLAMLAR TABLOSU */}
              <div className="flex justify-end mb-8">
                <div className="w-full max-w-[320px] space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Ara Toplam</span>
                    <span className="font-mono font-bold text-gray-800">
                      {rawSubtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                    </span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-red-600 font-bold">
                      <span className="uppercase tracking-wider text-[10px]">İskonto (%{discountPercent})</span>
                      <span className="font-mono">
                        -{discountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                      </span>
                    </div>
                  )}

                  {!isKdvExcluded && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">KDV (%20)</span>
                      <span className="font-mono font-bold text-gray-800">
                        {tax.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                      </span>
                    </div>
                  )}

                  <div 
                    className="flex justify-between items-center p-3 text-white font-bold rounded"
                    style={{ backgroundColor: themeHex }}
                  >
                    <span className="uppercase tracking-widest text-[11px] font-black">
                      {isKdvExcluded ? 'GENEL TOPLAM (KDV HARİÇ)' : 'GENEL TOPLAM'}
                    </span>
                    <span className="text-base font-black font-mono">
                      {total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* NOTLAR VE KAŞE / İMZA ALANI */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-200 mt-6 items-end">
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  TEKLİF ŞARTLARI & NOTLAR:
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed italic whitespace-pre-line">
                  {proposalNote || (
                    `• Teklifimiz 7 gün süreyle geçerlidir.\n• Fiyatlarımıza KDV ${isKdvExcluded ? 'dahil değildir' : 'dahildir'}.\n• Onaylanan teklif için kaşeli nüsha gerekmektedir.`
                  )}
                </p>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-8">
                  ONAY / KAŞE & İMZA:
                </div>
                <div className="w-36 h-px bg-gray-300 mb-1" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-700">
                  {settings?.firma_adi || 'YETKİLİ İMZA'}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================
          4. YAZDIRMA & PDF ÇIKTISI GARANTİLİ STYLESHEET
          ======================================================== */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Koyu tema ve dış layout taşıyıcılarını sıfırla */
          html, body, #__next, main, .min-h-screen, .max-w-7xl {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            box-shadow: none !important;
          }

          /* Sayfadaki arayüz araçlarını, menüleri ve butonları gizle */
          .no-print,
          nav,
          footer,
          header,
          aside,
          button,
          input,
          textarea,
          [aria-label="WhatsApp ile iletişim"] {
            display: none !important;
          }

          /* Ebeveyn taşıyıcı sınırlamalarını kaldır */
          .grid,
          .bayi-preview-column,
          .proposal-preview {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Sadece print-area içeriğini görünür yap */
          body * {
            visibility: hidden;
          }

          #print-area,
          #print-area * {
            visibility: visible !important;
          }

          #print-area {
            position: relative !important;
            display: block !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0.8cm 1cm !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #1A1A1A !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
          }

          /* Tablo ve hücre düzeni */
          #print-area table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
          }

          #print-area thead {
            display: table-header-group !important;
          }

          #print-area tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }

          #print-area th, 
          #print-area td {
            color: #1A1A1A !important;
          }

          #print-area [style*="color: white"],
          #print-area [style*="color:white"],
          #print-area [style*="color: rgb(255, 255, 255)"],
          #print-area [style*="color:rgb(255,255,255)"] {
            color: #ffffff !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          @page {
            size: A4 portrait;
            margin: 0.8cm 1cm;
          }
        }
      `}} />
    </div>
  )
}
