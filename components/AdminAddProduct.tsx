'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Upload,
  Plus,
  X,
  Check,
  AlertCircle,
  Tag,
  ChevronRight,
  Sparkles,
  Package,
  Layers,
  Coins,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { PARA_BIRIMLERI } from '@/lib/kur'
import imageCompression from 'browser-image-compression'
import { formatFileSize } from './ImageCompressor'
import { NEW_KATEGORI_HIYERARSI, type CategoryNode } from '@/lib/categories'

interface FileEntry {
  file: File
  preview: string
  originalSize: number
  compressedSize?: number
  compressing: boolean
}

interface Props { 
  onAdded?: () => void;
  initialData?: {
    ad?: string;
    kod?: string;
    fiyat?: string;
    paraBirimi?: string;
    stokAdedi?: string;
    taslakId?: string;
    aciklama?: string;
  }
}

export default function AdminAddProduct({ onAdded, initialData }: Props) {
  const [ad, setAd] = useState(initialData?.ad || '')
  const [aciklama, setAciklama] = useState(initialData?.aciklama || '')
  
  // 3 seviyeli kategori state
  const [anaCat, setAnaCat] = useState<CategoryNode | null>(NEW_KATEGORI_HIYERARSI[0])
  const [altCat, setAltCat] = useState<CategoryNode | null>(null)
  const [detayCat, setDetayCat] = useState<CategoryNode | null>(null)

  const [fiyat, setFiyat] = useState(initialData?.fiyat || '')
  const [bayi_fiyati, setBayiF] = useState('')
  const [stok, setStok] = useState('stokta')
  const [paraBirimi, setParaBirimi] = useState(initialData?.paraBirimi || 'USD')
  const [bayiParaBirimi, setBayiParaBirimi] = useState('USD')
  const [marka, setMarka] = useState('')
  const [modelKodu, setModelKodu] = useState(initialData?.kod || '')
  const [kullanimAlani, setKullanimAlani] = useState('')
  const [stokAdedi, setStokAdedi] = useState(initialData?.stokAdedi || '0')
  const [kritikStok, setKritikStok] = useState('5')
  const [taslakId] = useState(initialData?.taslakId || null)
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [existingMarkalar, setExistingMarkalar] = useState<string[]>([])
  const [existingAlanlar, setExistingAlanlar] = useState<string[]>([])
  const [showMarkaSuggestions, setShowMarkaSuggestions] = useState(false)
  const [showAlanSuggestions, setShowAlanSuggestions] = useState(false)
  const [suggestedImages, setSuggestedImages] = useState<string[]>([])
  const [isScraping, setIsScraping] = useState(false)

  const fetchSuggestedImages = async () => {
    const query = `${marka} ${modelKodu} ${ad}`.trim()
    if (!query || query.length < 3) return
    setIsScraping(true)
    setSuggestedImages([])
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/scrape-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ query })
      })
      const data = await res.json()
      if (data.images) setSuggestedImages(data.images)
    } catch (e) {
      console.error(e)
    }
    setIsScraping(false)
  }

  const addSuggestedImage = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], `suggested-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
      const preview = URL.createObjectURL(file);
      setEntries(p => [...p, { file, preview, originalSize: file.size, compressing: false }]);
      setSuggestedImages(p => p.filter(i => i !== url));
    } catch (e) {
      console.error('Failed to add image', e);
      alert('Görsel eklenirken hata oluştu (CORS kısıtlaması olabilir). Lütfen resmi manuel indirip yükleyin.');
    }
  }

  // Önerileri kullanıcı yazdıkça (on-demand) çekiyoruz
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

  // Hiyerarşi seçenekleri
  const altKategoriler = anaCat?.children || []
  const detaylar = altCat?.children || []

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    for (const file of selected.slice(0, 10 - entries.length)) {
      if (file.size > 20 * 1024 * 1024) { setError(`"${file.name}" max 20MB.`); continue }
      const preview = URL.createObjectURL(file)
      setEntries(p => [...p, { file, preview, originalSize: file.size, compressing: true }])
      
      try {
        const options = {
          maxSizeMB: 0.4,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
          fileType: 'image/webp',
          initialQuality: 0.8
        }
        const compressedBlob = await imageCompression(file, options)
        const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, ".webp"), { type: 'image/webp' })
        
        setEntries(p => p.map(entry => entry.preview === preview
          ? { ...entry, file: compressedFile, compressedSize: compressedFile.size, compressing: false }
          : entry))
      } catch (error) {
        console.error("Compression error:", error)
        setEntries(p => p.map(entry => entry.preview === preview
          ? { ...entry, compressing: false }
          : entry))
      }
    }
    e.target.value = ''
  }

  const removeFile = (preview: string) => {
    setEntries(p => { 
      const e = p.find(x => x.preview === preview); 
      if (e) URL.revokeObjectURL(e.preview); 
      return p.filter(x => x.preview !== preview) 
    })
  }

  const handleSubmit = async () => {
    if (!ad.trim() || !aciklama.trim()) { setError('Ürün adı ve açıklama zorunludur.'); return }
    if (!fiyat || isNaN(parseFloat(fiyat))) { setError('Geçerli bir fiyat girin.'); return }
    if (!anaCat) { setError('En az bir ana kategori seçmelisiniz.'); return }
    
    setLoading(true); setError('')

    const supabase = createClient()
    const fotograflar: string[] = []
    for (const entry of entries) {
      const path = `urunler/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
      const { error: uploadErr } = await supabase.storage.from('urun-fotograflari').upload(path, entry.file)
      if (!uploadErr) {
        const { data } = supabase.storage.from('urun-fotograflari').getPublicUrl(path)
        fotograflar.push(data.publicUrl)
      }
    }

    const stokAdetNum = Math.max(0, parseInt(stokAdedi || '0'))
    const kritikStokNum = Math.max(0, parseInt(kritikStok || '0'))
    const stokDurumu = stok !== 'stokta' ? stok : (stokAdetNum <= 0 ? 'tukendi' : 'stokta')

    const generateSlug = (text: string) => {
      const trMap: { [key: string]: string } = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
      }
      return text
        .replace(/[çğıöşüÇĞİÖŞÜ]/g, match => trMap[match])
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    const payload: any = {
      ad: ad.trim(),
      slug: generateSlug(ad.trim()),
      aciklama: aciklama.trim(),
      kategori: anaCat.name,
      alt_kategori: altCat?.name || null,
      urun_tipi: detayCat?.name || null,
      fiyat: parseFloat(fiyat),
      bayi_fiyati: bayi_fiyati ? parseFloat(bayi_fiyati) : null,
      stok_durumu: stokDurumu,
      stok_adedi: stokAdetNum,
      kritik_stok: kritikStokNum,
      para_birimi: paraBirimi,
      bayi_para_birimi: bayiParaBirimi,
      marka: marka.trim() || null,
      model_kodu: modelKodu.trim() || null,
      kullanim_alani: kullanimAlani.trim() || null,
    }

    let existingUrun: any = null
    if (modelKodu.trim()) {
      const { data } = await supabase
        .from('urunler')
        .select('id, fotograflar')
        .eq('model_kodu', modelKodu.trim())
        .maybeSingle()
      existingUrun = data
    }

    let dbErr = null

    if (existingUrun) {
      if (fotograflar.length === 0 && existingUrun.fotograflar) {
        payload.fotograflar = existingUrun.fotograflar
      } else {
        payload.fotograflar = fotograflar
      }
      payload.updated_at = new Date().toISOString()
      
      const { error } = await supabase
        .from('urunler')
        .update(payload)
        .eq('id', existingUrun.id)
      dbErr = error
    } else {
      payload.fotograflar = fotograflar
      const { error } = await supabase
        .from('urunler')
        .insert(payload)
      dbErr = error
    }

    if (!dbErr && taslakId) {
      await supabase.from('wolvox_taslak').delete().eq('id', taslakId)
    }

    if (!dbErr) {
      const { data: { session } } = await supabase.auth.getSession()
      const revalidateHeaders = {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
      }
      fetch('/api/revalidate', { method: 'POST', headers: revalidateHeaders, body: JSON.stringify({ path: '/' }) }).catch(() => {})
      if (existingUrun?.id) {
        fetch('/api/revalidate', { method: 'POST', headers: revalidateHeaders, body: JSON.stringify({ path: `/urun/${existingUrun.id}` }) }).catch(() => {})
      }
    }

    setLoading(false)
    if (dbErr) { setError(`Kaydedilemedi: ${dbErr.message}`); return }
    setSuccess(true)
    setAd(''); setAciklama(''); setAnaCat(NEW_KATEGORI_HIYERARSI[0]); setAltCat(null); setDetayCat(null)
    setFiyat(''); setBayiF(''); setStok('stokta'); setParaBirimi('USD'); setBayiParaBirimi('USD')
    setMarka(''); setKullanimAlani(''); setStokAdedi('0'); setKritikStok('5')
    setEntries([])
    setTimeout(() => setSuccess(false), 3000)
    onAdded?.()
  }

  return (
    <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      
      {/* ── BÖLÜM 1: TEMEL BİLGİLER ────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
          <div className="w-7 h-7 rounded-lg bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red">
            <Package size={15} />
          </div>
          <div>
            <h3 className="text-xs font-display font-bold uppercase tracking-wider text-white">Temel Bilgiler</h3>
            <p className="text-[11px] text-white/40">Ürünün başlığı, açıklaması ve tanımlayıcı kodları</p>
          </div>
        </div>

        {/* Ürün Adı */}
        <div>
          <label className="text-xs font-medium text-white/70 block mb-1.5">
            Ürün Adı <span className="text-brand-red">*</span>
          </label>
          <input
            type="text"
            value={ad}
            onChange={e => setAd(e.target.value)}
            className="input-dark rounded-xl"
            placeholder="Örn: JBL PRX915 Aktif Hoparlör Kabin"
          />
        </div>

        {/* Açıklama */}
        <div>
          <label className="text-xs font-medium text-white/70 block mb-1.5">
            Ürün Açıklaması <span className="text-brand-red">*</span>
          </label>
          <textarea
            value={aciklama}
            onChange={e => setAciklama(e.target.value)}
            rows={3}
            className="input-dark rounded-xl resize-none"
            placeholder="Ürün özellikleri, teknik detaylar ve kullanım avantajları..."
          />
        </div>

        {/* Marka, Model Kodu, Kullanım Alanı */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Marka */}
          <div className="relative">
            <label className="text-xs font-medium text-white/70 block mb-1.5">Marka</label>
            <input 
              type="text" 
              value={marka} 
              onChange={(e) => { setMarka(e.target.value); fetchMarkaSuggestions(e.target.value) }} 
              onFocus={() => setShowMarkaSuggestions(true)}
              onBlur={() => setTimeout(() => setShowMarkaSuggestions(false), 200)}
              className="input-dark rounded-xl"
              placeholder="Örn: JBL" 
            />
            {showMarkaSuggestions && existingMarkalar.filter(m => m.toLowerCase().includes(marka.toLowerCase())).length > 0 && (
              <div className="absolute z-30 left-0 right-0 mt-1 bg-[#141414] border border-white/10 rounded-xl max-h-40 overflow-y-auto shadow-2xl custom-scrollbar py-1">
                {existingMarkalar.filter(m => m.toLowerCase().includes(marka.toLowerCase())).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMarka(m); setShowMarkaSuggestions(false) }}
                    className="w-full text-left px-3.5 py-2 text-xs text-white/80 hover:bg-brand-red/15 hover:text-brand-red transition-colors"
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Model Kodu */}
          <div>
            <label className="text-xs font-medium text-white/70 block mb-1.5">Model / Stok Kodu</label>
            <input 
              type="text" 
              value={modelKodu} 
              onChange={e => setModelKodu(e.target.value)} 
              className="input-dark rounded-xl font-mono" 
              placeholder="Örn: PRX915-EU" 
            />
          </div>

          {/* Kullanım Alanı */}
          <div className="relative">
            <label className="text-xs font-medium text-white/70 block mb-1.5">Kullanım Alanı</label>
            <input 
              type="text" 
              value={kullanimAlani} 
              onChange={(e) => { setKullanimAlani(e.target.value); fetchAlanSuggestions(e.target.value) }} 
              onFocus={() => setShowAlanSuggestions(true)}
              onBlur={() => setTimeout(() => setShowAlanSuggestions(false), 200)}
              className="input-dark rounded-xl" 
              placeholder="Örn: Konser & Sahne" 
            />
            {showAlanSuggestions && existingAlanlar.filter(a => a.toLowerCase().includes(kullanimAlani.toLowerCase())).length > 0 && (
              <div className="absolute z-30 left-0 right-0 mt-1 bg-[#141414] border border-white/10 rounded-xl max-h-40 overflow-y-auto shadow-2xl custom-scrollbar py-1">
                {existingAlanlar.filter(a => a.toLowerCase().includes(kullanimAlani.toLowerCase())).map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => { setKullanimAlani(a); setShowAlanSuggestions(false) }}
                    className="w-full text-left px-3.5 py-2 text-xs text-white/80 hover:bg-brand-red/15 hover:text-brand-red transition-colors"
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BÖLÜM 2: KATEGORİ HİYERARŞİSİ ───────────────── */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-brand-red">
              <Layers size={13} />
            </div>
            <span className="text-xs font-display font-bold uppercase tracking-wider text-white">Kategori Hiyerarşisi</span>
          </div>
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">3 Seviyeli Ağaç</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Ana Kategori */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-1">
              Ana Kategori
            </label>
            <select
              value={anaCat?.slug || ''}
              onChange={e => { 
                const found = NEW_KATEGORI_HIYERARSI.find(k => k.slug === e.target.value)
                setAnaCat(found || null)
                setAltCat(null)
                setDetayCat(null)
              }}
              className="input-dark rounded-lg cursor-pointer text-xs"
            >
              <option value="">Seçiniz...</option>
              {NEW_KATEGORI_HIYERARSI.map(k => (
                <option key={k.slug} value={k.slug}>{k.name}</option>
              ))}
            </select>
          </div>

          {/* Alt Kategori */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-1">
              Alt Kategori
            </label>
            <select
              value={altCat?.slug || ''}
              onChange={e => { 
                const found = altKategoriler.find(a => a.slug === e.target.value)
                setAltCat(found || null)
                setDetayCat(null)
              }}
              className="input-dark rounded-lg cursor-pointer text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!anaCat || altKategoriler.length === 0}
            >
              <option value="">{altKategoriler.length === 0 ? 'Alt Kategori Yok' : 'Seçiniz...'}</option>
              {altKategoriler.map(a => (
                <option key={a.slug} value={a.slug}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* 3. Seviye / Detay */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-1">
              3. Seviye (Tip)
            </label>
            <select
              value={detayCat?.slug || ''}
              onChange={e => { 
                const found = detaylar.find(d => d.slug === e.target.value)
                setDetayCat(found || null)
              }}
              className="input-dark rounded-lg cursor-pointer text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!altCat || detaylar.length === 0}
            >
              <option value="">{detaylar.length === 0 ? 'Tip Yok' : 'Seçiniz...'}</option>
              {detaylar.map(d => (
                <option key={d.slug} value={d.slug}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Seçim Breadcrumb Özeti */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] bg-[#141414] border border-white/5 px-3 py-2 rounded-lg text-white/70">
          <span className="text-white/40">Konum:</span>
          <span className="font-medium text-white">{anaCat?.name || 'Seçilmedi'}</span>
          <ChevronRight size={12} className="text-white/30" />
          <span className={altCat ? 'text-white/80' : 'text-white/30'}>{altCat?.name || '—'}</span>
          <ChevronRight size={12} className="text-white/30" />
          <span className={detayCat ? 'text-brand-red font-semibold' : 'text-white/30'}>{detayCat?.name || '—'}</span>
        </div>
      </div>

      {/* ── BÖLÜM 3: FİYAT & ENVANTER ─────────────────────── */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
          <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-brand-red">
            <Coins size={13} />
          </div>
          <span className="text-xs font-display font-bold uppercase tracking-wider text-white">Fiyatlandırma & Stok</span>
        </div>

        {/* Fiyatlar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Normal Fiyat */}
          <div>
            <label className="text-xs font-medium text-white/70 block mb-1.5">
              Normal Fiyat <span className="text-brand-red">*</span>
            </label>
            <div className="flex">
              <select 
                value={paraBirimi} 
                onChange={e => setParaBirimi(e.target.value)} 
                className="input-dark rounded-l-xl rounded-r-none border-r-0 w-28 flex-shrink-0 cursor-pointer text-xs"
              >
                {PARA_BIRIMLERI.map(p => <option key={p.value} value={p.value}>{p.symbol} {p.value}</option>)}
              </select>
              <input 
                type="number" 
                min="0" 
                step="0.01" 
                value={fiyat} 
                onChange={e => setFiyat(e.target.value)} 
                className="input-dark rounded-r-xl rounded-l-none text-sm" 
                placeholder="0.00" 
              />
            </div>
          </div>

          {/* Bayi Fiyatı */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-white/70">Bayi Fiyatı</label>
              <span className="text-[10px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-medium">
                Sadece Bayiler
              </span>
            </div>
            <div className="flex">
              <select 
                value={bayiParaBirimi} 
                onChange={e => setBayiParaBirimi(e.target.value)} 
                className="input-dark rounded-l-xl rounded-r-none border-r-0 w-28 flex-shrink-0 cursor-pointer text-xs border-emerald-500/20"
              >
                {PARA_BIRIMLERI.map(p => <option key={p.value} value={p.value}>{p.symbol} {p.value}</option>)}
              </select>
              <input 
                type="number" 
                min="0" 
                step="0.01" 
                value={bayi_fiyati} 
                onChange={e => setBayiF(e.target.value)} 
                className="input-dark rounded-r-xl rounded-l-none text-sm border-emerald-500/20" 
                placeholder="Boş bırakılabilir" 
              />
            </div>
          </div>
        </div>

        {/* Stok Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Stok Durumu */}
          <div>
            <label className="text-xs font-medium text-white/70 block mb-1.5">Stok Durumu</label>
            <select 
              value={stok} 
              onChange={e => setStok(e.target.value)} 
              className="input-dark rounded-xl cursor-pointer text-xs"
            >
              <option value="stokta">Stokta Var</option>
              <option value="tukendi">Tükendi</option>
              <option value="siparise_gore">Siparişe Göre Temin</option>
            </select>
          </div>

          {/* Stok Adedi */}
          <div>
            <label className="text-xs font-medium text-white/70 block mb-1.5">Mevcut Adet</label>
            <input 
              type="number" 
              min="0" 
              value={stokAdedi} 
              onChange={(e) => setStokAdedi(e.target.value)} 
              className="input-dark rounded-xl text-sm" 
            />
          </div>

          {/* Kritik Stok */}
          <div>
            <label className="text-xs font-medium text-white/70 block mb-1.5">Kritik Eşik Seviyesi</label>
            <input 
              type="number" 
              min="0" 
              value={kritikStok} 
              onChange={(e) => setKritikStok(e.target.value)} 
              className="input-dark rounded-xl text-sm" 
            />
          </div>
        </div>
      </div>

      {/* ── BÖLÜM 4: GÖRSELLER & GALERİ ──────────────────── */}
      <div className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red">
              <ImageIcon size={15} />
            </div>
            <div>
              <h3 className="text-xs font-display font-bold uppercase tracking-wider text-white">
                Ürün Fotoğrafları <span className="text-white/40 normal-case font-body font-normal text-[11px]">({entries.length}/10)</span>
              </h3>
              <p className="text-[11px] text-white/40">Görseller otomatik olarak WebP formatına optimize edilir</p>
            </div>
          </div>

          <button 
            type="button"
            onClick={fetchSuggestedImages} 
            disabled={isScraping || (!marka && !modelKodu && !ad)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            {isScraping ? <Loader2 size={13} className="animate-spin text-brand-red" /> : <Sparkles size={13} className="text-amber-500" />}
            <span>{isScraping ? 'Görseller Taranıyor...' : 'Görsel Önerisi Bul'}</span>
          </button>
        </div>

        {/* Önerilen Görseller Kutusu */}
        {suggestedImages.length > 0 && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-500 flex items-center gap-1.5">
                <Sparkles size={13} /> Web Üzerinden Bulunan Görseller
              </span>
              <span className="text-[10px] text-amber-500/80">Eklemek için görsele tıklayın</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {suggestedImages.map((img, i) => (
                <button 
                  key={i} 
                  type="button"
                  onClick={() => addSuggestedImage(img)} 
                  className="group relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-amber-500 transition-all bg-[#141414]"
                  title="Ürüne Ekle"
                >
                  <img src={img} alt="Öneri" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Plus size={16} className="text-white bg-amber-500 rounded-full p-0.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Yüklenen Fotoğraflar Galerisi */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {entries.map((entry, index) => (
              <div 
                key={entry.preview} 
                className="relative aspect-square rounded-xl bg-[#141414] border border-white/10 overflow-hidden group shadow-sm"
              >
                <img src={entry.preview} alt="" className="w-full h-full object-cover" />
                
                {index === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded border border-white/20">
                    Kapak
                  </span>
                )}

                {entry.compressing ? (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-1 p-2">
                    <Loader2 size={16} className="animate-spin text-brand-red" />
                    <span className="text-[9px] text-white/70 font-mono">WebP Hazırlanıyor</span>
                  </div>
                ) : (
                  entry.compressedSize && (
                    <div className="absolute top-1.5 left-1.5 text-[9px] font-mono bg-black/70 backdrop-blur-sm text-emerald-400 px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatFileSize(entry.compressedSize)}
                    </div>
                  )
                )}

                <button 
                  type="button"
                  onClick={() => removeFile(entry.preview)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                  title="Fotoğrafı Kaldır"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Yükleme Dropzone */}
        {entries.length < 10 && (
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/15 hover:border-brand-red/50 bg-[#1A1A1A]/40 hover:bg-brand-red/5 rounded-xl p-5 cursor-pointer transition-all">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
              <Upload size={18} />
            </div>
            <div className="text-center">
              <span className="text-xs font-medium text-white/80 block">Fotoğraf yüklemek için tıklayın veya sürükleyin</span>
              <span className="text-[11px] text-white/40 block mt-0.5">JPG, PNG, WebP desteklenir (Maks. 20MB)</span>
            </div>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
          </label>
        )}
      </div>

      {/* ── BİLDİRİMLER (HATA / BAŞARI) ──────────────────── */}
      {error && (
        <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-rose-500 text-xs">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <CheckCircle2 size={16} />
          <span>Ürün başarıyla sisteme eklendi ve yayına alındı.</span>
        </div>
      )}

      {/* ── SUBMIT BUTONU ─────────────────────────────────── */}
      <button 
        type="button"
        onClick={handleSubmit} 
        disabled={loading || !ad || !aciklama || !fiyat || entries.some(e => e.compressing)}
        className={`w-full py-3.5 px-6 rounded-xl font-display font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md ${
          success 
            ? '!bg-emerald-600 text-white' 
            : 'bg-brand-red hover:bg-brand-red-dark text-white active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed shadow-brand-red/20'
        }`}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Katalog Güncelleniyor...</span>
          </>
        ) : success ? (
          <>
            <Check size={16} />
            <span>Başarıyla Eklendi!</span>
          </>
        ) : (
          <>
            <Plus size={16} />
            <span>Ürünü Kataloğa Ekle</span>
          </>
        )}
      </button>
    </div>
  )
}
