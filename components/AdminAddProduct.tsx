'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Upload, Plus, X, Check, AlertCircle, Tag } from 'lucide-react'
import { PARA_BIRIMLERI } from '@/lib/kur'
import { compressImage, formatFileSize } from './ImageCompressor'

const KATEGORILER = [
  'Ses Sistemleri','Işık Sistemleri','Görüntü Sistemleri',
  'Okul Saat Sistemleri','Simultune Sistemleri','Aksesuarlar',
]

interface FileEntry {
  file: File
  preview: string
  originalSize: number
  compressedSize?: number
  compressing: boolean
}

interface Props { onAdded?: () => void }

export default function AdminAddProduct({ onAdded }: Props) {
  const [ad, setAd] = useState('')
  const [aciklama, setAciklama] = useState('')
  const [kategori, setKategori] = useState(KATEGORILER[0])
  const [fiyat, setFiyat] = useState('')
  const [bayi_fiyati, setBayiF] = useState('')
  const [stok, setStok] = useState('stokta')
  const [paraBirimi, setParaBirimi] = useState('USD')
  const [bayiParaBirimi, setBayiParaBirimi] = useState('USD')
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    for (const file of selected.slice(0, 10 - entries.length)) {
      if (file.size > 20 * 1024 * 1024) { setError(`"${file.name}" max 20MB.`); continue }
      const preview = URL.createObjectURL(file)
      setEntries(p => [...p, { file, preview, originalSize: file.size, compressing: true }])
      const compressed = await compressImage(file)
      setEntries(p => p.map(e => e.preview === preview
        ? { ...e, file: compressed, compressedSize: compressed.size, compressing: false }
        : e))
    }
    e.target.value = ''
  }

  const removeFile = (preview: string) => {
    setEntries(p => { const e = p.find(x => x.preview === preview); if (e) URL.revokeObjectURL(e.preview); return p.filter(x => x.preview !== preview) })
  }

  const handleSubmit = async () => {
    if (!ad.trim() || !aciklama.trim()) { setError('Ürün adı ve açıklama zorunludur.'); return }
    if (!fiyat || isNaN(parseFloat(fiyat))) { setError('Geçerli bir fiyat girin.'); return }
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

    const { error: insertErr } = await supabase.from('urunler').insert({
      ad: ad.trim(), aciklama: aciklama.trim(), kategori, fotograflar,
      fiyat: parseFloat(fiyat),
      bayi_fiyati: bayi_fiyati ? parseFloat(bayi_fiyati) : null,
      stok_durumu: stok,
    })

    setLoading(false)
    if (insertErr) { setError(`Eklenemedi: ${insertErr.message}`); return }
    setSuccess(true)
    setAd(''); setAciklama(''); setKategori(KATEGORILER[0])
    setFiyat(''); setBayiF(''); setStok('stokta'); setParaBirimi('USD'); setBayiParaBirimi('USD')
    setEntries([])
    setTimeout(() => setSuccess(false), 3000)
    onAdded?.()
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Ürün Adı *</label>
        <input type="text" value={ad} onChange={e => setAd(e.target.value)} className="input-dark" placeholder="JBL PRX915 Aktif Hoparlör" />
      </div>

      <div>
        <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Kategori</label>
        <select value={kategori} onChange={e => setKategori(e.target.value)} className="input-dark appearance-none cursor-pointer">
          {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div>
        <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Açıklama *</label>
        <textarea value={aciklama} onChange={e => setAciklama(e.target.value)} rows={3} className="input-dark resize-none" placeholder="Ürün özellikleri..." />
      </div>

      {/* Fiyat bölümü */}
      <div className="border border-white/5 bg-[#1A1A1A] p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Tag size={13} className="text-brand-red" />
          <span className="font-display font-semibold text-xs tracking-widest uppercase text-white/50">Fiyatlandırma</span>
        </div>

        <div>
          <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-1.5">Normal Fiyat *</label>
          <div className="flex gap-2">
            <select value={paraBirimi} onChange={e => setParaBirimi(e.target.value)} className="input-dark appearance-none cursor-pointer w-32 flex-shrink-0">
              {PARA_BIRIMLERI.map(p => <option key={p.value} value={p.value}>{p.symbol} {p.value}</option>)}
            </select>
            <input type="number" min="0" step="0.01" value={fiyat} onChange={e => setFiyat(e.target.value)} className="input-dark flex-1" placeholder="0.00" />
          </div>
        </div>

        <div>
          <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-1.5">
            Bayi Fiyatı (₺)
            <span className="ml-1 text-white/20 normal-case tracking-normal font-body font-normal text-xs">— Sadece bayiler görür</span>
          </label>
          <div className="flex gap-2">
            <select value={bayiParaBirimi} onChange={e => setBayiParaBirimi(e.target.value)} className="input-dark appearance-none cursor-pointer w-32 flex-shrink-0">
              {PARA_BIRIMLERI.map(p => <option key={p.value} value={p.value}>{p.symbol} {p.value}</option>)}
            </select>
            <input type="number" min="0" step="0.01" value={bayi_fiyati} onChange={e => setBayiF(e.target.value)} className="input-dark flex-1" placeholder="Boş bırakılabilir" />
          </div>
        </div>

        <div>
          <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-1.5">Stok Durumu</label>
          <select value={stok} onChange={e => setStok(e.target.value)} className="input-dark appearance-none cursor-pointer">
            <option value="stokta">Stokta</option>
            <option value="tukendi">Tükendi</option>
            <option value="siparise_gore">Siparişe Göre</option>
          </select>
        </div>
      </div>

      {/* Fotoğraflar */}
      <div>
        <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">
          Fotoğraflar <span className="text-white/20 normal-case tracking-normal font-body font-normal text-xs">(max 10, otomatik sıkıştırılır)</span>
        </label>
        {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {entries.map(entry => (
              <div key={entry.preview} className="relative aspect-square bg-[#1A1A1A] border border-white/5 overflow-hidden">
                <img src={entry.preview} alt="" className="w-full h-full object-cover" />
                {entry.compressing ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                ) : entry.compressedSize && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 text-center">
                    <span className="text-[9px] text-white/40">{formatFileSize(entry.originalSize)} → {formatFileSize(entry.compressedSize)}</span>
                  </div>
                )}
                <button onClick={() => removeFile(entry.preview)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/70 flex items-center justify-center text-white hover:bg-brand-red transition-colors">
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
        {entries.length < 10 && (
          <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-white/15 p-5 cursor-pointer hover:border-brand-red/40 transition-colors">
            <Upload size={18} className="text-white/20" />
            <span className="font-body text-white/25 text-xs text-center">Fotoğraf ekle</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
          </label>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-brand-red/10 border border-brand-red/30 p-3 text-brand-red text-xs font-body">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <button onClick={handleSubmit} disabled={loading || !ad || !aciklama || !fiyat || entries.some(e => e.compressing)}
        className={`btn-primary w-full justify-center text-sm disabled:opacity-40 ${success ? '!bg-green-600' : ''}`}>
        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : success ? <Check size={15} /> : <Plus size={15} />}
        {loading ? 'Ekleniyor...' : success ? 'Eklendi!' : 'Ürün Ekle'}
      </button>
    </div>
  )
}
