'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Trash2,
  Package,
  Pencil,
  X,
  Check,
  Search,
  Upload,
  Download,
  Star,
  Layers,
  Coins,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ImageIcon,
} from 'lucide-react'
import { PARA_BIRIMLERI } from '@/lib/kur'
import { createClient } from '@/lib/supabase'
import { KATEGORILER, KATEGORI_HIYERARSI } from '@/lib/categories'
import { compressImage } from './ImageCompressor'
import { LIGHT_PRODUCT_FIELDS } from '@/lib/product-queries'

interface FileEntry {
  file: File
  preview: string
  compressing: boolean
}

interface Product {
  id: string
  ad: string
  kategori: string
  fotograflar: string[]
  aciklama?: string
  fiyat?: number
  bayi_fiyati?: number
  stok_durumu?: string
  fiyat_guncelleme?: string
  para_birimi?: string
  bayi_para_birimi?: string
  stok_adedi?: number | null
  kritik_stok?: number | null
  marka?: string | null
  kullanim_alani?: string | null
  is_featured?: boolean
}

interface Props {
  onDeleted?: () => void
  refreshTrigger?: number
}

const ITEMS_PER_PAGE = 20

export default function AdminProductList({ onDeleted, refreshTrigger }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editAd, setEditAd] = useState('')
  const [editAciklama, setEditAciklama] = useState('')
  const [editKategori, setEditKategori] = useState('')
  const [editAltKategori, setEditAltKategori] = useState('')
  const [editUrunTipi, setEditUrunTipi] = useState('')
  const [editFiyat, setEditFiyat] = useState('')
  const [editBayiF, setEditBayiF] = useState('')
  const [editStok, setEditStok] = useState('stokta')
  const [editParaBirimi, setEditParaBirimi] = useState('USD')
  const [editBayiParaBirimi, setEditBayiParaBirimi] = useState('USD')
  const [editStokAdedi, setEditStokAdedi] = useState('0')
  const [editKritikStok, setEditKritikStok] = useState('5')
  const [editMarka, setEditMarka] = useState('')
  const [editKullanim, setEditKullanim] = useState('')
  const [editModelKodu, setEditModelKodu] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [existingMarkalar, setExistingMarkalar] = useState<string[]>([])
  const [existingAlanlar, setExistingAlanlar] = useState<string[]>([])
  const [showMarkaSuggestions, setShowMarkaSuggestions] = useState(false)
  const [showAlanSuggestions, setShowAlanSuggestions] = useState(false)
  const [editFotograflar, setEditFotograflar] = useState<string[]>([])
  const [newPhotos, setNewPhotos] = useState<FileEntry[]>([])
  const [uploadError, setUploadError] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  const loadProducts = async () => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase.from('urunler').select(LIGHT_PRODUCT_FIELDS, { count: 'exact' })
    if (searchQuery) {
      query = query.or(`ad.ilike.%${searchQuery}%,kategori.ilike.%${searchQuery}%,marka.ilike.%${searchQuery}%`)
    }
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1)
    if (!error && data) {
      setProducts(data)
      setTotalCount(count || 0)
    }
    setLoading(false)
  }

  const triggerRevalidate = async (path = '/') => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ path })
      })
    } catch {}
  }

  const toggleFeatured = async (product: Product) => {
    const supabase = createClient()
    const newValue = !product.is_featured
    const { error } = await supabase.from('urunler').update({ is_featured: newValue }).eq('id', product.id)
    if (!error) {
      setProducts(products.map(p => p.id === product.id ? { ...p, is_featured: newValue } : p))
      await triggerRevalidate('/')
    }
  }

  useEffect(() => {
    loadProducts()
  }, [currentPage, searchQuery, refreshTrigger])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(search)
      setCurrentPage(0)
    }, 450)
    return () => clearTimeout(timer)
  }, [search])

  const fetchMarkaSuggestions = async (val: string) => {
    if (val.length < 2) return
    const supabase = createClient()
    const { data } = await supabase.from('urunler').select('marka').ilike('marka', `%${val}%`).limit(10)
    if (data) setExistingMarkalar(Array.from(new Set(data.map((x: any) => x.marka).filter(Boolean))))
  }

  const fetchAlanSuggestions = async (val: string) => {
    if (val.length < 2) return
    const supabase = createClient()
    const { data } = await supabase.from('urunler').select('kullanim_alani').ilike('kullanim_alani', `%${val}%`).limit(10)
    if (data) setExistingAlanlar(Array.from(new Set(data.map((x: any) => x.kullanim_alani).filter(Boolean))))
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const openEdit = async (p: Product) => {
    setEditLoading(true)
    setEditProduct(p)
    const supabase = createClient()
    const { data: fullProduct } = await supabase.from('urunler')
      .select('id, ad, aciklama, kategori, alt_kategori, urun_tipi, fotograflar, fiyat, bayi_fiyati, para_birimi, bayi_para_birimi, stok_durumu, stok_adedi, kritik_stok, marka, kullanim_alani, model_kodu')
      .eq('id', p.id)
      .single()
    const prod = fullProduct || p
    setEditAd(prod.ad)
    setEditAciklama(prod.aciklama || '')
    setEditKategori(prod.kategori)
    setEditAltKategori((prod as any).alt_kategori || '')
    setEditUrunTipi((prod as any).urun_tipi || '')
    setEditFiyat(prod.fiyat?.toString() || '')
    setEditBayiF(prod.bayi_fiyati?.toString() || '')
    setEditStok(prod.stok_durumu || 'stokta')
    setEditParaBirimi(prod.para_birimi || 'USD')
    setEditBayiParaBirimi(prod.bayi_para_birimi || 'USD')
    setEditStokAdedi((prod.stok_adedi ?? 0).toString())
    setEditKritikStok((prod.kritik_stok ?? 5).toString())
    setEditMarka(prod.marka || '')
    setEditKullanim(prod.kullanim_alani || '')
    setEditModelKodu((prod as any).model_kodu || '')
    setEditFotograflar(prod.fotograflar || [])
    setNewPhotos([])
    setUploadError('')
    setSaveSuccess(false)
    setEditLoading(false)
  }

  const handleSave = async () => {
    if (!editProduct || !editAd || !editAciklama) return
    setSaving(true)
    const supabase = createClient()
    const fiyatDegisti = editFiyat !== editProduct.fiyat?.toString() || editBayiF !== editProduct.bayi_fiyati?.toString()
    const stokAdedi = Math.max(0, parseInt(editStokAdedi || '0'))
    const kritikStok = Math.max(0, parseInt(editKritikStok || '0'))
    const stokDurumu = editStok !== 'stokta' ? editStok : (stokAdedi <= 0 ? 'tukendi' : 'stokta')
    const yeniUrls: string[] = []
    for (const entry of newPhotos) {
      const path = `urunler/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
      const { error: uploadErr } = await supabase.storage.from('urun-fotograflari').upload(path, entry.file)
      if (!uploadErr) {
        const { data } = supabase.storage.from('urun-fotograflari').getPublicUrl(path)
        yeniUrls.push(data.publicUrl)
      }
    }
    const sonFotograflar = [...editFotograflar, ...yeniUrls]
    await supabase.from('urunler').update({
      ad: editAd.trim(),
      aciklama: editAciklama.trim(),
      kategori: editKategori,
      alt_kategori: editAltKategori || null,
      urun_tipi: editUrunTipi || null,
      fotograflar: sonFotograflar,
      fiyat: editFiyat ? parseFloat(editFiyat) : null,
      bayi_fiyati: editBayiF ? parseFloat(editBayiF) : null,
      stok_durumu: stokDurumu,
      stok_adedi: stokAdedi,
      kritik_stok: kritikStok,
      para_birimi: editParaBirimi,
      bayi_para_birimi: editBayiParaBirimi,
      marka: editMarka.trim() || null,
      kullanim_alani: editKullanim.trim() || null,
      model_kodu: editModelKodu.trim() || null,
      updated_at: new Date().toISOString(),
      ...(fiyatDegisti ? { fiyat_guncelleme: new Date().toISOString() } : {}),
    }).eq('id', editProduct.id)
    triggerRevalidate('/')
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => { setEditProduct(null); loadProducts() }, 700)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('urunler').delete().eq('id', id)
    setDeleting(null)
    triggerRevalidate('/')
    loadProducts()
    onDeleted?.()
  }

  const handleNewFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    const currentTotal = editFotograflar.length + newPhotos.length
    for (const file of selected.slice(0, 10 - currentTotal)) {
      const preview = URL.createObjectURL(file)
      setNewPhotos(p => [...p, { file, preview, compressing: true }])
      const compressed = await compressImage(file)
      setNewPhotos(p => p.map(entry => entry.preview === preview ? { ...entry, file: compressed, compressing: false } : entry))
    }
    e.target.value = ''
  }

  const removeExistingPhoto = (url: string) => {
    setEditFotograflar(p => p.filter(x => x !== url))
  }

  const removeNewPhoto = (preview: string) => {
    setNewPhotos(p => {
      const entry = p.find(x => x.preview === preview)
      if (entry) URL.revokeObjectURL(entry.preview)
      return p.filter(x => x.preview !== preview)
    })
  }

  const [importing, setImporting] = useState(false)

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const data = await file.arrayBuffer()
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(data, { type: 'array' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet)
      const upsertData = jsonData.map(row => ({
        ...(row['ID'] || row['ID (SİSTEM)'] ? { id: row['ID'] || row['ID (SİSTEM)'] } : {}),
        ad: row['ÜRÜN ADI'] || row['Ürün Adı'],
        kategori: row['KATEGORİ'] || row['Kategori'],
        marka: (row['MARKA'] || row['Marka']) !== '-' ? (row['MARKA'] || row['Marka']) : null,
        model_kodu: row['STOK KODU'] || row['Stok Kodu'] || row['MODEL KODU'] || null,
        fiyat: parseFloat(row['FİYAT'] || row['Fiyat']) || 0,
        para_birimi: row['PARA BİRİMİ'] || row['Para Birimi'] || 'TRY',
        bayi_fiyati: parseFloat(row['BAYİ FİYATI'] || row['Bayi Fiyatı']) || null,
        bayi_para_birimi: row['BAYİ PARA BİRİMİ'] || row['Bayi Para Birimi'] || 'TRY',
        stok_adedi: parseInt(row['STOK ADEDİ'] || row['Stok Adedi']) || 0,
        stok_durumu: (row['STOK DURUMU'] || row['Stok Durumu']) === 'Stokta' ? 'stokta' : (row['STOK DURUMU'] || row['Stok Durumu']) === 'Tükendi' ? 'tukendi' : 'siparise_gore',
        fiyat_guncelleme: new Date().toISOString()
      })).filter(item => item.ad && item.kategori)
      if (upsertData.length > 0) {
        const supabase = createClient()
        const { error } = await supabase.from('urunler').upsert(upsertData, { onConflict: 'id' })
        if (error) throw error
        alert(`${upsertData.length} ürün başarıyla güncellendi/eklendi!`)
        loadProducts()
      }
    } catch (err: any) {
      alert('Excel yüklenirken hata oluştu: ' + err.message)
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const exportToExcel = async () => {
    const supabase = createClient()
    const { data: allProducts } = await supabase.from('urunler').select('id, model_kodu, ad, kategori, marka, fiyat, para_birimi, bayi_fiyati, bayi_para_birimi, stok_adedi, stok_durumu, fiyat_guncelleme').order('ad')
    if (!allProducts) return

    const XLSX = await import('xlsx')

    const dataToExport = allProducts.map((p: Product) => ({
      'STOK KODU': (p as any).model_kodu || '-',
      'ÜRÜN ADI': p.ad,
      'KATEGORİ': p.kategori,
      'MARKA': p.marka || '-',
      'FİYAT': p.fiyat || 0,
      'PARA BİRİMİ': p.para_birimi || 'TRY',
      'BAYİ FİYATI': p.bayi_fiyati || 0,
      'BAYİ PARA BİRİMİ': p.bayi_para_birimi || 'TRY',
      'STOK ADEDİ': p.stok_adedi || 0,
      'STOK DURUMU': p.stok_durumu === 'stokta' ? 'Stokta' : p.stok_durumu === 'tukendi' ? 'Tükendi' : 'Siparişe Göre',
      'SON GÜNCELLEME': p.fiyat_guncelleme ? new Date(p.fiyat_guncelleme).toLocaleDateString('tr-TR') : '-',
      'ID (SİSTEM)': p.id,
    }))
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    worksheet['!cols'] = [
      { wch: 18 }, { wch: 60 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 38 },
    ]
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Akdağ Elektronik Ürün Listesi')
    const dateStr = new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')
    XLSX.writeFile(workbook, `Akdag_Elektronik_Fiyat_Listesi_${dateStr}.xlsx`)
  }

  return (
    <div className="space-y-4">
      {/* ── ÜST ARAÇ ÇUBUĞU (ARAMA & EXCEL ENTEGRASYONU) ─── */}
      <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Arama Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-red" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`${totalCount.toLocaleString('tr-TR')} ürün içinde ara...`}
            className="input-dark rounded-xl pl-10 pr-10"
          />
          {search && (
            <button 
              type="button"
              onClick={() => setSearch('')} 
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              title="Aramayı Temizle"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Excel Aksiyon Butonları */}
        <div className="flex items-center gap-2">
          {/* Excel Yükle */}
          <label className={`cursor-pointer bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-sky-500 dark:text-sky-400 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${importing ? 'opacity-50 pointer-events-none' : ''}`}>
            {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            <span>{importing ? 'Yükleniyor...' : 'Excel Yükle'}</span>
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} />
          </label>

          {/* Excel'e Aktar */}
          <button 
            type="button"
            onClick={exportToExcel} 
            className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <Download size={14} />
            <span>Excel İndir</span>
          </button>
        </div>
      </div>

      {/* ── ÜRÜN LİSTESİ ALANI ───────────────────────────── */}
      {loading ? (
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center space-y-3 shadow-sm">
          <Loader2 size={28} className="text-brand-red animate-spin" />
          <p className="font-display font-semibold text-xs tracking-widest uppercase text-white/40">
            Ürün Kataloğu Yükleniyor...
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-14 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-white/30">
            <Search size={24} />
          </div>
          <p className="font-display font-bold text-sm uppercase text-white/70 tracking-wider">
            {search ? `"${search}" için ürün bulunamadı` : 'Katalogda henüz ürün bulunmuyor'}
          </p>
          <p className="text-xs text-white/40 mt-1">
            {search ? 'Arama terimini değiştirebilir veya filtreyi temizleyebilirsiniz.' : 'Sol taraftaki formdan hemen yeni ürün ekleyebilirsiniz.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Ürün Kartları Listesi */}
          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1.5 custom-scrollbar">
            {products.map((product) => {
              const paraSimge = PARA_BIRIMLERI.find(p => p.value === product.para_birimi)?.symbol || ''
              const bayiParaSimge = PARA_BIRIMLERI.find(p => p.value === product.bayi_para_birimi)?.symbol || ''
              const modelKod = (product as any).model_kodu

              return (
                <div 
                  key={product.id} 
                  className="bg-[#141414] hover:bg-[#1A1A1A] border border-white/10 hover:border-white/20 rounded-xl p-3.5 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 group shadow-sm"
                >
                  {/* Sol Taraf: Görsel ve Ürün Bilgisi */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Görsel */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 relative overflow-hidden">
                      {product.fotograflar?.[0] ? (
                        <Image 
                          src={product.fotograflar[0]} 
                          alt={product.ad} 
                          fill 
                          sizes="64px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <Package size={22} />
                        </div>
                      )}
                    </div>

                    {/* Metin & Rozetler */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm sm:text-base uppercase text-white truncate tracking-wide">
                          {product.ad}
                        </span>
                        {product.is_featured && (
                          <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30 px-1.5 py-0.5 rounded">
                            Öne Çıkan
                          </span>
                        )}
                      </div>

                      {/* Etiketler (Marka, Model Kodu, Kategori) */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {product.marka && (
                          <span className="bg-white/5 text-white/80 border border-white/10 px-2 py-0.5 rounded text-[11px] font-medium">
                            {product.marka}
                          </span>
                        )}
                        {modelKod && (
                          <span className="font-mono text-[11px] text-white/60 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                            {modelKod}
                          </span>
                        )}
                        <span className="text-[11px] text-white/40 truncate">
                          {product.kategori}
                        </span>
                      </div>

                      {/* Fiyat ve Stok Durumu */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 pt-1 border-t border-white/5">
                        {product.fiyat !== undefined && product.fiyat !== null ? (
                          <span className="font-display font-bold text-xs text-brand-red">
                            {paraSimge} {product.fiyat.toLocaleString('tr-TR')} {product.para_birimi || 'TL'}
                          </span>
                        ) : null}

                        {product.bayi_fiyati ? (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-medium">
                            Bayi: {bayiParaSimge} {product.bayi_fiyati.toLocaleString('tr-TR')} {product.bayi_para_birimi || 'TL'}
                          </span>
                        ) : null}

                        {/* Stok Rozeti */}
                        {product.stok_durumu === 'stokta' ? (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Stokta ({product.stok_adedi ?? 0} Adet)
                          </span>
                        ) : product.stok_durumu === 'tukendi' ? (
                          <span className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Tükendi
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-500 flex items-center gap-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Siparişe Göre
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sağ Taraf: Aksiyon Butonları */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                    {/* Öne Çıkar Butonu */}
                    <button 
                      type="button"
                      onClick={() => toggleFeatured(product)} 
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                        product.is_featured 
                          ? 'border-amber-500/40 text-amber-500 bg-amber-500/15 shadow-sm' 
                          : 'border-white/10 text-white/30 hover:border-amber-500/40 hover:text-amber-500 hover:bg-amber-500/10'
                      }`} 
                      title={product.is_featured ? "Öne Çıkanlardan Kaldır" : "Öne Çıkar"}
                    >
                      <Star size={14} fill={product.is_featured ? "currentColor" : "none"} />
                    </button>

                    {/* Düzenle Butonu */}
                    <button 
                      type="button"
                      onClick={() => openEdit(product)} 
                      className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:border-brand-red/40 hover:text-brand-red flex items-center justify-center text-white/50 transition-all"
                      title="Ürünü Düzenle"
                    >
                      <Pencil size={14} />
                    </button>

                    {/* Sil Butonu */}
                    <button 
                      type="button"
                      onClick={() => handleDelete(product.id)} 
                      disabled={deleting === product.id} 
                      className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-rose-500/10 flex items-center justify-center text-white/40 hover:text-rose-500 hover:border-rose-500/30 transition-all disabled:opacity-40"
                      title="Ürünü Sil"
                    >
                      {deleting === product.id ? (
                        <Loader2 size={14} className="animate-spin text-rose-500" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sayfalama (Pagination) */}
          {totalPages > 1 && (
            <div className="bg-[#141414] border border-white/10 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="text-xs text-white/50 font-medium">
                Sayfa <span className="text-white font-bold">{currentPage + 1}</span> / {totalPages} — Toplam <span className="text-white font-bold">{totalCount}</span> Ürün
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  disabled={currentPage === 0 || loading} 
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} 
                  className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-20 disabled:pointer-events-none"
                >
                  <ChevronLeft size={14} />
                  <span>Önceki</span>
                </button>
                <button 
                  type="button"
                  disabled={currentPage >= totalPages - 1 || loading} 
                  onClick={() => setCurrentPage(prev => prev + 1)} 
                  className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-20 disabled:pointer-events-none"
                >
                  <span>Sonraki</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ÜRÜN DÜZENLE MODAL (EDIT MODAL) ──────────────── */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#1A1A1A] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-red/15 border border-brand-red/25 flex items-center justify-center text-brand-red">
                  <Pencil size={15} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white">Ürün Düzenle</h3>
                  <p className="text-xs text-white/50 truncate max-w-sm sm:max-w-md">{editProduct.ad}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditProduct(null)} 
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable İçerik */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
              {editLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <Loader2 size={32} className="text-brand-red animate-spin" />
                  <p className="font-display font-semibold text-xs uppercase text-white/40 tracking-widest">
                    Ürün Detayları Getiriliyor...
                  </p>
                </div>
              ) : (
                <>
                  {/* Ürün Adı */}
                  <div>
                    <label className="text-xs font-medium text-white/70 block mb-1.5">
                      Ürün Adı <span className="text-brand-red">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={editAd} 
                      onChange={e => setEditAd(e.target.value)} 
                      className="input-dark rounded-xl" 
                    />
                  </div>

                  {/* Kategori Hiyerarşisi */}
                  <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Layers size={13} className="text-brand-red" />
                      <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Kategori Hiyerarşisi</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-white/50 block mb-1">Ana Kategori</label>
                        <select 
                          value={editKategori} 
                          onChange={e => { setEditKategori(e.target.value); setEditAltKategori(''); setEditUrunTipi('') }} 
                          className="input-dark rounded-lg text-xs"
                        >
                          {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-white/50 block mb-1">Alt Kategori</label>
                        <select 
                          value={editAltKategori} 
                          onChange={e => { setEditAltKategori(e.target.value); setEditUrunTipi('') }} 
                          className="input-dark rounded-lg text-xs"
                        >
                          <option value="">— Yok / Seçiniz —</option>
                          {(KATEGORI_HIYERARSI.find(k => k.label === editKategori)?.altKategoriler || []).map(a => <option key={a.label} value={a.label}>{a.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-white/50 block mb-1">3. Seviye Tip</label>
                        <select 
                          value={editUrunTipi} 
                          onChange={e => setEditUrunTipi(e.target.value)} 
                          className="input-dark rounded-lg text-xs"
                        >
                          <option value="">— Yok / Seçiniz —</option>
                          {(KATEGORI_HIYERARSI.find(k => k.label === editKategori)?.altKategoriler.find(a => a.label === editAltKategori)?.detaylar || []).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Açıklama */}
                  <div>
                    <label className="text-xs font-medium text-white/70 block mb-1.5">
                      Ürün Açıklaması <span className="text-brand-red">*</span>
                    </label>
                    <textarea 
                      value={editAciklama} 
                      onChange={e => setEditAciklama(e.target.value)} 
                      rows={4} 
                      className="input-dark rounded-xl resize-none" 
                    />
                  </div>

                  {/* Fiyatlar Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-medium text-white/70 block mb-1.5">Satış Fiyatı</label>
                      <div className="flex">
                        <select 
                          value={editParaBirimi} 
                          onChange={e => setEditParaBirimi(e.target.value)} 
                          className="input-dark rounded-l-xl rounded-r-none border-r-0 w-24 flex-shrink-0 cursor-pointer text-xs"
                        >
                          {PARA_BIRIMLERI.map(p => <option key={p.value} value={p.value}>{p.symbol} {p.value}</option>)}
                        </select>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={editFiyat} 
                          onChange={e => setEditFiyat(e.target.value)} 
                          className="input-dark rounded-r-xl rounded-l-none text-sm" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-white/70 block mb-1.5">Bayi Fiyatı</label>
                      <div className="flex">
                        <select 
                          value={editBayiParaBirimi} 
                          onChange={e => setEditBayiParaBirimi(e.target.value)} 
                          className="input-dark rounded-l-xl rounded-r-none border-r-0 w-24 flex-shrink-0 cursor-pointer text-xs border-emerald-500/20"
                        >
                          {PARA_BIRIMLERI.map(p => <option key={p.value} value={p.value}>{p.symbol} {p.value}</option>)}
                        </select>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={editBayiF} 
                          onChange={e => setEditBayiF(e.target.value)} 
                          className="input-dark rounded-r-xl rounded-l-none text-sm border-emerald-500/20" 
                          placeholder="Opsiyonel" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stok & Durum */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-white/70 block mb-1.5">Stok Durumu</label>
                      <select 
                        value={editStok} 
                        onChange={e => setEditStok(e.target.value)} 
                        className="input-dark rounded-xl cursor-pointer text-xs"
                      >
                        <option value="stokta">Stokta Var</option>
                        <option value="tukendi">Tükendi</option>
                        <option value="siparise_gore">Siparişe Göre Temin</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-white/70 block mb-1.5">Stok Adedi</label>
                      <input 
                        type="number" 
                        value={editStokAdedi} 
                        onChange={e => setEditStokAdedi(e.target.value)} 
                        className="input-dark rounded-xl text-sm" 
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-white/70 block mb-1.5">Kritik Eşik</label>
                      <input 
                        type="number" 
                        value={editKritikStok} 
                        onChange={e => setEditKritikStok(e.target.value)} 
                        className="input-dark rounded-xl text-sm" 
                      />
                    </div>
                  </div>

                  {/* Model Kodu, Marka, Alan */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-white/70 block mb-1.5">Model / Stok Kodu</label>
                      <input 
                        type="text" 
                        value={editModelKodu} 
                        onChange={e => setEditModelKodu(e.target.value)} 
                        className="input-dark rounded-xl font-mono text-sm" 
                        placeholder="Örn: M7CL-48" 
                      />
                    </div>

                    <div className="relative">
                      <label className="text-xs font-medium text-white/70 block mb-1.5">Marka</label>
                      <input 
                        type="text" 
                        value={editMarka} 
                        onChange={e => { setEditMarka(e.target.value); fetchMarkaSuggestions(e.target.value) }} 
                        onFocus={() => setShowMarkaSuggestions(true)} 
                        onBlur={() => setTimeout(() => setShowMarkaSuggestions(false), 200)} 
                        className="input-dark rounded-xl text-sm" 
                      />
                      {showMarkaSuggestions && existingMarkalar.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-[#141414] border border-white/10 rounded-xl max-h-32 overflow-y-auto shadow-2xl py-1">
                          {existingMarkalar.filter(m => m.toLowerCase().includes(editMarka.toLowerCase())).map(m => (
                            <button key={m} type="button" onClick={() => setEditMarka(m)} className="w-full text-left px-3 py-1.5 text-xs text-white/70 hover:bg-white/10">{m}</button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <label className="text-xs font-medium text-white/70 block mb-1.5">Kullanım Alanı</label>
                      <input 
                        type="text" 
                        value={editKullanim} 
                        onChange={e => { setEditKullanim(e.target.value); fetchAlanSuggestions(e.target.value) }} 
                        onFocus={() => setShowAlanSuggestions(true)} 
                        onBlur={() => setTimeout(() => setShowAlanSuggestions(false), 200)} 
                        className="input-dark rounded-xl text-sm" 
                      />
                      {showAlanSuggestions && existingAlanlar.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-[#141414] border border-white/10 rounded-xl max-h-32 overflow-y-auto shadow-2xl py-1">
                          {existingAlanlar.filter(a => a.toLowerCase().includes(editKullanim.toLowerCase())).map(a => (
                            <button key={a} type="button" onClick={() => setEditKullanim(a)} className="w-full text-left px-3 py-1.5 text-xs text-white/70 hover:bg-white/10">{a}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fotoğraflar Yönetimi */}
                  <div className="space-y-2.5 pt-1">
                    <label className="text-xs font-medium text-white/70 block">
                      Ürün Fotoğrafları <span className="text-white/40">({editFotograflar.length + newPhotos.length}/10)</span>
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {/* Mevcut Kayıtlı Fotoğraflar */}
                      {editFotograflar.map((url, i) => (
                        <div key={i} className="aspect-square relative group bg-white/5 rounded-xl border border-white/10 overflow-hidden shadow-sm">
                          <Image src={url} alt="" fill sizes="90px" className="object-cover" />
                          <button 
                            type="button"
                            onClick={() => removeExistingPhoto(url)} 
                            className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            title="Fotoğrafı Kaldır"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}

                      {/* Yeni Eklenen Fotoğraflar */}
                      {newPhotos.map((p, i) => (
                        <div key={i} className="aspect-square relative group bg-white/5 rounded-xl border border-white/10 overflow-hidden shadow-sm">
                          <Image src={p.preview} alt="" fill sizes="90px" className={`object-cover ${p.compressing ? 'opacity-30' : ''}`} />
                          {p.compressing ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                              <Loader2 size={16} className="animate-spin text-brand-red" />
                            </div>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => removeNewPhoto(p.preview)} 
                              className="absolute top-1 right-1 w-5 h-5 bg-brand-red text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                              title="Fotoğrafı Kaldır"
                            >
                              <X size={11} />
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Fotoğraf Ekleme Butonu */}
                      {editFotograflar.length + newPhotos.length < 10 && (
                        <label className="aspect-square flex flex-col items-center justify-center gap-1 border-2 border-dashed border-white/15 hover:border-brand-red/50 rounded-xl cursor-pointer transition-colors bg-white/5">
                          <Upload size={16} className="text-white/40" />
                          <span className="font-display font-bold text-[9px] uppercase tracking-wider text-white/50">Ekle</span>
                          <input type="file" multiple accept="image/*" className="hidden" onChange={handleNewFiles} />
                        </label>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Sticky Footer */}
            <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-white/10 bg-[#1A1A1A] flex-shrink-0">
              <button 
                type="button"
                onClick={() => setEditProduct(null)} 
                className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >
                İptal
              </button>
              <button 
                type="button"
                onClick={handleSave} 
                disabled={saving || !editAd || !editAciklama || newPhotos.some(n => n.compressing)} 
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 transition-all shadow-md ${
                  saveSuccess 
                    ? '!bg-emerald-600' 
                    : 'bg-brand-red hover:bg-brand-red-dark active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-brand-red/20'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check size={15} />
                    <span>Kaydedildi!</span>
                  </>
                ) : (
                  <span>Değişiklikleri Kaydet</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
