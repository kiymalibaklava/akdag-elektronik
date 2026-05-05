'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
// HATA BURADAYDI: 'lucide-center' yerine 'lucide-react' olmalı
import { LogOut, Package, Phone, Clock, CheckCircle, XCircle, Search, X, RotateCcw } from 'lucide-react'
import { ProductCard } from './ProductGrid'
import type { User } from '@supabase/supabase-js'
import { addManyToCart } from '@/lib/cart'
import { TUM_KATEGORILER } from '@/lib/categories'

const KATEGORILER = TUM_KATEGORILER

interface Bayi {
  id: string
  firma_adi: string
  yetkili_adi: string
  onaylandi: boolean
  sehir: string
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
  urunler: Array<{
    urun_id?: string
    ad: string
    adet: number
    fiyat: number
    fotograf?: string
  }>
}

export default function BayiPanel({ user }: { user: User }) {
  const [bayi, setBayi] = useState<Bayi | null | undefined>(undefined)
  const [urunler, setUrunler] = useState<Urun[]>([])
  const [loading, setLoading] = useState(true)
  const [kategori, setKategori] = useState('Tümü')
  const [search, setSearch] = useState('')
  const [siparisler, setSiparisler] = useState<Siparis[]>([])
  const [repeatMsg, setRepeatMsg] = useState('')
  const supabase = useRef(createClient()).current

  useEffect(() => {
    const load = async () => {
      const { data: bayiData } = await supabase
        .from('bayiler').select('*').eq('user_id', user.id).maybeSingle()
      setBayi(bayiData ?? null)

      if (bayiData?.onaylandi) {
        const { data } = await supabase
          .from('urunler').select('*').order('created_at', { ascending: false })
        setUrunler(data || [])

        const { data: siparisData } = await supabase
          .from('siparisler')
          .select('id, siparis_no, created_at, toplam_tutar, durum, urunler')
          .eq('bayi_id', bayiData.id)
          .order('created_at', { ascending: false })
          .limit(25)
        setSiparisler((siparisData || []) as Siparis[])
      }
      setLoading(false)
    }
    load()
  }, [user.id, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (loading || bayi === undefined) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/10 border-t-brand-red rounded-full animate-spin" /></div>
  }

  if (bayi === null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <XCircle size={48} className="text-brand-red/40 mx-auto mb-4" />
          <h2 className="font-display font-black text-2xl uppercase text-white mb-3">Bayi Kaydı Bulunamadı</h2>
          <p className="font-body text-white/40 text-sm mb-2"><strong className="text-white">{user.email}</strong> ile kayıtlı bayi profili yok.</p>
          <p className="font-body text-white/30 text-sm mb-8">Başvurunuz onaylandıktan sonra giriş yapabilirsiniz.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/bayi/basvuru" className="btn-primary text-sm">Başvuru Yap</Link>
            <button onClick={handleLogout} className="btn-outline text-sm"><LogOut size={13} />Çıkış</button>
          </div>
        </div>
      </div>
    )
  }

  if (!bayi.onaylandi) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-6">
            <Clock size={36} className="text-yellow-500" />
          </div>
          <h2 className="font-display font-black text-2xl uppercase text-white mb-3">Başvurunuz İnceleniyor</h2>
          <p className="font-body text-white/40 text-sm leading-relaxed mb-6">
            <strong className="text-white">{bayi.firma_adi}</strong> adına yaptığınız başvuru inceleme aşamasındadır.
          </p>
          <div className="bg-[#141414] border border-yellow-500/20 p-4 text-left mb-6">
            <div className="font-display font-semibold text-xs uppercase tracking-widest text-yellow-500/60 mb-3">Başvuru Bilgileri</div>
            <div className="space-y-1 text-sm font-body text-white/50">
              <div>Firma: <span className="text-white">{bayi.firma_adi}</span></div>
              <div>Yetkili: <span className="text-white">{bayi.yetkili_adi}</span></div>
              <div>Şehir: <span className="text-white">{bayi.sehir}</span></div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <a href="tel:+903522316915" className="btn-primary text-sm"><Phone size={14} />Bilgi Al</a>
            <button onClick={handleLogout} className="btn-outline text-sm"><LogOut size={14} />Çıkış</button>
          </div>
        </div>
      </div>
    )
  }

  const filtered = urunler.filter(u => {
    const katMatch = kategori === 'Tümü' || u.kategori === kategori
    const searchMatch = !search || u.ad.toLowerCase().includes(search.toLowerCase())
    return katMatch && searchMatch
  })

  const recentCount = urunler.filter(u =>
    u.fiyat_guncelleme && (Date.now() - new Date(u.fiyat_guncelleme).getTime()) < 7 * 24 * 60 * 60 * 1000
  ).length

  const handleRepeatOrder = (siparis: Siparis) => {
    if (!Array.isArray(siparis.urunler) || siparis.urunler.length === 0) return
    addManyToCart(
      siparis.urunler.map((u, i) => ({
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
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-[#0A0A0A] border-b border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle size={16} className="text-green-400" />
              <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-green-400">Onaylı Bayi</span>
            </div>
            <h1 className="font-display font-black text-3xl uppercase text-white">{bayi.firma_adi}</h1>
            <p className="font-body text-white/30 text-sm mt-1">{user.email} • {bayi.sehir}</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-white/30 hover:text-brand-red font-display font-semibold text-xs tracking-widest uppercase transition-colors">
            <LogOut size={14} />Çıkış
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { val: urunler.length, label: 'Toplam Ürün', color: 'border-l-brand-red' },
            { val: urunler.filter(u => u.bayi_fiyati).length, label: 'Bayi Fiyatlı', color: 'border-l-green-500' },
            { val: recentCount, label: 'Son 7 Gün Güncellendi', color: 'border-l-yellow-500' },
            { val: urunler.filter(u => u.stok_durumu === 'tukendi').length, label: 'Tükenen Ürün', color: 'border-l-red-500' },
          ].map(s => (
            <div key={s.label} className={`bg-[#141414] border border-white/5 p-4 border-l-2 ${s.color}`}>
              <div className="font-display font-black text-2xl text-white">{s.val}</div>
              <div className="font-body text-white/30 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Arama + Filtre */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-red" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ürün ara..."
              className="input-dark pl-10 pr-10"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {KATEGORILER.map(k => (
              <button key={k} onClick={() => setKategori(k)}
                className={`font-display font-semibold text-xs tracking-widest uppercase px-3 py-2 border transition-all duration-200 ${
                  kategori === k ? 'bg-brand-red border-brand-red text-white' : 'border-white/10 text-white/40 hover:border-brand-red/40 hover:text-white'
                }`}>
                {k === 'Tümü' ? 'Tümü' : k.replace(' Sistemleri', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Sonuç sayısı */}
        <div className="font-body text-white/30 text-sm mb-6">
          {filtered.length} ürün
          {search && <span> — "<span className="text-white">{search}</span>"</span>}
        </div>
        {repeatMsg && (
          <div className="mb-6 border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-300 text-sm font-body">
            {repeatMsg}
          </div>
        )}

        {/* Ürün grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 border border-white/5 bg-[#141414]">
            <Package size={40} className="text-white/10 mx-auto mb-3" />
            <p className="font-display font-semibold text-sm uppercase text-white/20 tracking-widest">Ürün Bulunamadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
            {filtered.map(u => (
              <ProductCard 
                key={u.id} 
                product={{ 
                  ...u, 
                  bayi_fiyati: u.bayi_fiyati ?? undefined,
                  fiyat_guncelleme: u.fiyat_guncelleme ?? undefined 
                }} 
                isBayi={true} 
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 border border-brand-red/20 bg-[#141414] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-display font-black text-xl uppercase text-white mb-1">Sipariş vermek ister misiniz?</div>
            <p className="font-body text-white/40 text-sm">Bayi özel fiyatlarınızla sipariş için bizi arayın.</p>
          </div>
          <a href="tel:+903522316915" className="btn-primary text-sm flex-shrink-0">
            <Phone size={15} />+90 352 231 69 15
          </a>
        </div>

        <div className="mt-10">
          <h2 className="font-display font-bold text-xl uppercase tracking-wide text-white mb-4 red-line">Sipariş Geçmişi</h2>
          {siparisler.length === 0 ? (
            <div className="border border-white/5 bg-[#141414] p-6 text-white/35 text-sm">Henüz bayi siparişi bulunmuyor.</div>
          ) : (
            <div className="space-y-2">
              {siparisler.map((s) => (
                <div key={s.id} className="border border-white/5 bg-[#141414] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="font-display font-bold text-white">{s.siparis_no}</div>
                    <div className="font-body text-xs text-white/35">
                      {new Date(s.created_at).toLocaleDateString('tr-TR')} • {s.urunler?.length || 0} kalem • {s.toplam_tutar?.toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-xs text-white/35 uppercase">{s.durum}</span>
                    <button type="button" className="btn-outline text-xs" onClick={() => handleRepeatOrder(s)}>
                      <RotateCcw size={12} />
                      Tekrar Sepete Ekle
                    </button>
                    <Link href="/sepet" className="btn-primary text-xs">Sepete Git</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}