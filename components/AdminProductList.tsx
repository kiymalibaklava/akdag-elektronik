'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Trash2, Package, Pencil, X, Check, Search } from 'lucide-react'
import { PARA_BIRIMLERI } from '@/lib/kur'
import { createClient } from '@/lib/supabase'
import { KATEGORILER, KATEGORI_HIYERARSI } from '@/lib/categories'

interface Product {
  id: string
  ad: string
  kategori: string
  fotograflar: string[]
  aciklama: string
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
}

interface Props {
  products: Product[]
  onDeleted?: () => void
}

export default function AdminProductList({ products, onDeleted }: Props) {
  const [search, setSearch] = useState('')
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
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [existingMarkalar, setExistingMarkalar] = useState<string[]>([])
  const [existingAlanlar, setExistingAlanlar] = useState<string[]>([])
  const [showMarkaSuggestions, setShowMarkaSuggestions] = useState(false)
  const [showAlanSuggestions, setShowAlanSuggestions] = useState(false)

  useEffect(() => {
    const fetchExisting = async () => {
      const supabase = createClient()
      const { data: m } = await supabase.from('urunler').select('marka').not('marka', 'is', null)
      const { data: a } = await supabase.from('urunler').select('kullanim_alani').not('kullanim_alani', 'is', null)
      if (m) setExistingMarkalar(Array.from(new Set(m.map((x: any) => x.marka).filter(Boolean))))
      if (a) setExistingAlanlar(Array.from(new Set(a.map((x: any) => x.kullanim_alani).filter(Boolean))))
    }
    fetchExisting()
  }, [])

  const filtered = products.filter(p =>
    !search || p.ad.toLowerCase().includes(search.toLowerCase()) || p.kategori.toLowerCase().includes(search.toLowerCase())
  )

  const openEdit = (p: Product) => {
    setEditProduct(p)
    setEditAd(p.ad)
    setEditAciklama(p.aciklama)
    setEditKategori(p.kategori)
    setEditAltKategori((p as any).alt_kategori || '')
    setEditUrunTipi((p as any).urun_tipi || '')
    setEditFiyat(p.fiyat?.toString() || '')
    setEditBayiF(p.bayi_fiyati?.toString() || '')
    setEditStok(p.stok_durumu || 'stokta')
    setEditParaBirimi(p.para_birimi || 'USD')
    setEditBayiParaBirimi(p.bayi_para_birimi || 'USD')
    setEditStokAdedi((p.stok_adedi ?? 0).toString())
    setEditKritikStok((p.kritik_stok ?? 5).toString())
    setEditMarka(p.marka || '')
    setEditKullanim(p.kullanim_alani || '')
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    if (!editProduct || !editAd || !editAciklama) return
    setSaving(true)
    const supabase = createClient()
    const fiyatDegisti = editFiyat !== editProduct.fiyat?.toString() || editBayiF !== editProduct.bayi_fiyati?.toString()

    const stokAdedi = Math.max(0, parseInt(editStokAdedi || '0'))
    const kritikStok = Math.max(0, parseInt(editKritikStok || '0'))
    const stokDurumu = stokAdedi <= 0 ? 'tukendi' : editStok

    await supabase.from('urunler').update({
      ad: editAd.trim(),
      aciklama: editAciklama.trim(),
      kategori: editKategori,
      alt_kategori: editAltKategori || null,
      urun_tipi: editUrunTipi || null,
      fiyat: editFiyat ? parseFloat(editFiyat) : null,
      bayi_fiyati: editBayiF ? parseFloat(editBayiF) : null,
      stok_durumu: stokDurumu,
      stok_adedi: stokAdedi,
      kritik_stok: kritikStok,
      para_birimi: editParaBirimi,
      bayi_para_birimi: editBayiParaBirimi,
      marka: editMarka.trim() || null,
      kullanim_alani: editKullanim.trim() || null,
      updated_at: new Date().toISOString(),
      ...(fiyatDegisti ? { fiyat_guncelleme: new Date().toISOString() } : {}),
    }).eq('id', editProduct.id)

    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => { setEditProduct(null); onDeleted?.() }, 800)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('urunler').delete().eq('id', id)
    setDeleting(null)
    onDeleted?.()
  }

  return (
    <>
      {/* Arama */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-red" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`${products.length} ürün içinde ara...`}
          className="input-dark pl-10 pr-10"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-white/5 bg-[#141414] p-10 text-center">
          {search ? (
            <p className="font-body text-white/20 text-sm">
              "<span className="text-white/40">{search}</span>" için ürün bulunamadı.
            </p>
          ) : (
            <>
              <Package size={40} className="text-white/10 mx-auto mb-3" />
              <p className="font-display font-semibold text-sm uppercase text-white/20 tracking-widest">Henüz ürün yok</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(product => (
            <div key={product.id}
              className="flex items-center gap-4 bg-[#141414] border border-white/5 p-4 hover:border-white/10 transition-colors">
              <div className="w-14 h-14 bg-[#1A1A1A] border border-white/5 flex-shrink-0 overflow-hidden">
                {product.fotograflar?.[0]
                  ? <Image src={product.fotograflar[0]} alt={product.ad} width={56} height={56} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Package size={18} className="text-white/10" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-sm uppercase text-white tracking-wide truncate">{product.ad}</div>
                <div className="font-display font-semibold text-xs tracking-widest text-brand-red/50 uppercase mt-0.5">{product.kategori}</div>
                <div className="flex items-center gap-4 mt-1">
                  {product.fiyat && (
                    <span className="font-body text-white/40 text-xs">
                      {PARA_BIRIMLERI.find(p => p.value === product.para_birimi)?.symbol || ''} {product.fiyat.toLocaleString('tr-TR')} {product.para_birimi || 'TL'}
                      {product.bayi_fiyati && (
                        <span className="text-green-400/60 ml-1">
                          / Bayi: {PARA_BIRIMLERI.find(p => p.value === product.bayi_para_birimi)?.symbol || ''} {product.bayi_fiyati.toLocaleString('tr-TR')} {product.bayi_para_birimi || 'TL'}
                        </span>
                      )}
                    </span>
                  )}
                  {product.fiyat_guncelleme && (
                    <span className="font-body text-white/20 text-xs">
                      Fiyat: {new Date(product.fiyat_guncelleme).toLocaleDateString('tr-TR')}
                    </span>
                  )}
                  {product.stok_durumu === 'tukendi' && (
                    <span className="font-display font-semibold text-xs text-red-400/60 uppercase tracking-widest">Tükendi</span>
                  )}
                  {typeof product.stok_adedi === 'number' && (
                    <span className={`font-body text-xs ${product.kritik_stok !== null && product.kritik_stok !== undefined && product.stok_adedi <= product.kritik_stok ? 'text-yellow-400' : 'text-white/30'}`}>
                      Stok: {product.stok_adedi}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit(product)}
                  className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/20 hover:border-brand-red/40 hover:text-brand-red transition-all"
                  title="Düzenle">
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(product.id)} disabled={deleting === product.id}
                  className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/20 hover:border-red-500/40 hover:text-red-500 transition-all disabled:opacity-40"
                  title="Sil">
                  {deleting === product.id
                    ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    : <Trash2 size={13} />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Düzenleme Modalı */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#141414] border border-white/10 w-full max-w-lg flex flex-col"
            style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)', maxHeight: 'calc(100vh - 80px)' }}>
            <div className="flex items-center justify-between p-6 border-b border-white/5 flex-shrink-0">
              <div>
                <div className="font-display font-black text-lg uppercase text-white">Ürün Düzenle</div>
                <div className="font-body text-white/30 text-xs mt-0.5 truncate max-w-xs">{editProduct.ad}</div>
              </div>
              <button onClick={() => setEditProduct(null)} className="text-white/20 hover:text-white transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Ürün Adı *</label>
                <input type="text" value={editAd} onChange={e => setEditAd(e.target.value)} className="input-dark" />
              </div>

              <div className="border border-white/5 bg-[#1A1A1A] p-3 space-y-2">
                <span className="font-display font-semibold text-xs tracking-widest uppercase text-white/40">Kategori Hiyerarşisi</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-display font-semibold text-[10px] tracking-widest uppercase text-brand-red/60 block mb-1">Ana</label>
                    <select value={editKategori} onChange={e => { setEditKategori(e.target.value); setEditAltKategori(''); setEditUrunTipi('') }} className="input-dark appearance-none cursor-pointer text-sm">
                      {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-display font-semibold text-[10px] tracking-widest uppercase text-brand-red/60 block mb-1">Alt</label>
                    <select value={editAltKategori} onChange={e => { setEditAltKategori(e.target.value); setEditUrunTipi('') }} className="input-dark appearance-none cursor-pointer text-sm">
                      <option value="">—</option>
                      {(KATEGORI_HIYERARSI.find(k => k.label === editKategori)?.altKategoriler || []).map(a => <option key={a.label} value={a.label}>{a.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-display font-semibold text-[10px] tracking-widest uppercase text-brand-red/60 block mb-1">Tip</label>
                    <select value={editUrunTipi} onChange={e => setEditUrunTipi(e.target.value)} className="input-dark appearance-none cursor-pointer text-sm">
                      <option value="">—</option>
                      {(KATEGORI_HIYERARSI.find(k => k.label === editKategori)?.altKategoriler.find(a => a.label === editAltKategori)?.detaylar || []).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Açıklama *</label>
                <textarea value={editAciklama} onChange={e => setEditAciklama(e.target.value)} rows={4} className="input-dark resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Marka</label>
                  <input 
                    type="text" 
                    value={editMarka} 
                    onChange={e => setEditMarka(e.target.value)} 
                    onFocus={() => setShowMarkaSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowMarkaSuggestions(false), 200)}
                    className="input-dark" 
                  />
                  {showMarkaSuggestions && existingMarkalar.filter(m => m.toLowerCase().includes(editMarka.toLowerCase())).length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-[#1A1A1A] border border-white/10 max-h-40 overflow-y-auto shadow-2xl">
                      {existingMarkalar.filter(m => m.toLowerCase().includes(editMarka.toLowerCase())).map(m => (
                        <button
                          key={m}
                          onClick={() => { setEditMarka(m); setShowMarkaSuggestions(false) }}
                          className="w-full text-left px-4 py-2 text-xs text-white/70 hover:bg-brand-red/10 hover:text-white transition-colors border-b border-white/5 last:border-0"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Kullanım Alanı</label>
                  <input 
                    type="text" 
                    value={editKullanim} 
                    onChange={e => setEditKullanim(e.target.value)} 
                    onFocus={() => setShowAlanSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowAlanSuggestions(false), 200)}
                    className="input-dark" 
                  />
                  {showAlanSuggestions && existingAlanlar.filter(a => a.toLowerCase().includes(editKullanim.toLowerCase())).length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-[#1A1A1A] border border-white/10 max-h-40 overflow-y-auto shadow-2xl">
                      {existingAlanlar.filter(a => a.toLowerCase().includes(editKullanim.toLowerCase())).map(a => (
                        <button
                          key={a}
                          onClick={() => { setEditKullanim(a); setShowAlanSuggestions(false) }}
                          className="w-full text-left px-4 py-2 text-xs text-white/70 hover:bg-brand-red/10 hover:text-white transition-colors border-b border-white/5 last:border-0"
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Fiyat bölümü */}
              <div className="border border-white/5 bg-[#1A1A1A] p-4 space-y-3">
                <span className="font-display font-semibold text-xs tracking-widest uppercase text-white/40">Fiyatlandırma</span>
                <div>
                  <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/30 block mb-1.5">Normal Fiyat</label>
                  <div className="flex gap-2">
                    <select value={editParaBirimi} onChange={e => setEditParaBirimi(e.target.value)} className="input-dark appearance-none cursor-pointer w-28 flex-shrink-0">
                      {PARA_BIRIMLERI.map(p => <option key={p.value} value={p.value}>{p.symbol} {p.value}</option>)}
                    </select>
                    <input type="number" min="0" step="0.01" value={editFiyat} onChange={e => setEditFiyat(e.target.value)} className="input-dark flex-1" placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/30 block mb-1.5">
                    Bayi Fiyatı (₺)
                    <span className="ml-1 text-white/15 normal-case tracking-normal font-body font-normal text-xs">— Sadece bayiler görür</span>
                  </label>
                  <div className="flex gap-2">
                    <select value={editBayiParaBirimi} onChange={e => setEditBayiParaBirimi(e.target.value)} className="input-dark appearance-none cursor-pointer w-28 flex-shrink-0">
                      {PARA_BIRIMLERI.map(p => <option key={p.value} value={p.value}>{p.symbol} {p.value}</option>)}
                    </select>
                    <input type="number" min="0" step="0.01" value={editBayiF} onChange={e => setEditBayiF(e.target.value)} className="input-dark flex-1" placeholder="Boş bırakılabilir" />
                  </div>
                </div>
                {editProduct.fiyat_guncelleme && (
                  <p className="font-body text-white/20 text-xs">
                    Son fiyat güncelleme: {new Date(editProduct.fiyat_guncelleme).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
                <p className="font-body text-white/15 text-xs">Fiyat değiştirilirse tarih otomatik güncellenir.</p>
              </div>

              <div>
                <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Stok Durumu</label>
                <select value={editStok} onChange={e => setEditStok(e.target.value)} className="input-dark appearance-none cursor-pointer">
                  <option value="stokta">Stokta</option>
                  <option value="tukendi">Tükendi</option>
                  <option value="siparise_gore">Siparişe Göre</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Stok Adedi</label>
                  <input type="number" min="0" value={editStokAdedi} onChange={(e) => setEditStokAdedi(e.target.value)} className="input-dark" />
                </div>
                <div>
                  <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Kritik Seviye</label>
                  <input type="number" min="0" value={editKritikStok} onChange={(e) => setEditKritikStok(e.target.value)} className="input-dark" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6 pt-3 border-t border-white/5 flex-shrink-0 bg-[#141414]">
              <button onClick={handleSave} disabled={saving || !editAd || !editAciklama}
                className={`btn-primary flex-1 justify-center text-sm disabled:opacity-40 ${saveSuccess ? '!bg-green-600' : ''}`}>
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : saveSuccess ? <Check size={15} /> : null}
                {saving ? 'Kaydediliyor...' : saveSuccess ? 'Kaydedildi!' : 'Kaydet'}
              </button>
              <button onClick={() => setEditProduct(null)} className="btn-outline text-sm px-5">İptal</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
