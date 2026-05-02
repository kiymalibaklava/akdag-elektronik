'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Package, Clock, CheckCircle, XCircle, Truck,
  RefreshCw, Search, X, ChevronDown, ChevronUp, Phone, Mail
} from 'lucide-react'

interface SiparisUrun {
  urun_id: string
  ad: string
  fiyat: number
  adet: number
  fotograf: string
}

interface Siparis {
  id: string
  siparis_no: string
  ad_soyad: string
  email: string
  telefon: string
  urunler: SiparisUrun[]
  toplam_tutar: number
  durum: string
  odeme_tipi: string
  odeme_durumu: string
  notlar: string
  created_at: string
  updated_at: string
}

const DURUM_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  beklemede:     { label: 'Beklemede',     color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
  onaylandi:     { label: 'Onaylandı',     color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',   icon: CheckCircle },
  hazirlaniyor:  { label: 'Hazırlanıyor',  color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: Package },
  teslim_edildi: { label: 'Teslim Edildi', color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20', icon: Truck },
  iptal:         { label: 'İptal',         color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',     icon: XCircle },
}

const ODEME_TIPI: Record<string, string> = {
  kredi_karti: 'Kredi Kartı',
  havale: 'Havale/EFT',
  whatsapp: 'WhatsApp',
}

export default function AdminSiparisler() {
  const [siparisler, setSiparisler] = useState<Siparis[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDurum, setFilterDurum] = useState('hepsi')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const supabase = useRef(createClient()).current

  useEffect(() => { loadSiparisler() }, [])

  const loadSiparisler = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('siparisler')
      .select('*')
      .order('created_at', { ascending: false })
    setSiparisler(data || [])
    setLoading(false)
  }

  const updateDurum = async (id: string, durum: string) => {
    setUpdatingId(id)
    await supabase.from('siparisler').update({
      durum,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    await loadSiparisler()
    setUpdatingId(null)
  }

  const filtered = siparisler.filter(s => {
    const durumMatch = filterDurum === 'hepsi' || s.durum === filterDurum
    const searchMatch = !search ||
      s.siparis_no?.toLowerCase().includes(search.toLowerCase()) ||
      s.ad_soyad?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.telefon?.includes(search)
    return durumMatch && searchMatch
  })

  // İstatistikler
  const stats = {
    toplam: siparisler.length,
    beklemede: siparisler.filter(s => s.durum === 'beklemede').length,
    bugun: siparisler.filter(s => {
      const d = new Date(s.created_at)
      const now = new Date()
      return d.toDateString() === now.toDateString()
    }).length,
    gelir: siparisler
      .filter(s => s.durum === 'teslim_edildi')
      .reduce((sum, s) => sum + (s.toplam_tutar || 0), 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/10 border-t-brand-red rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { val: stats.toplam,  label: 'Toplam Sipariş',  color: 'border-l-brand-red' },
          { val: stats.beklemede, label: 'Bekleyen',      color: 'border-l-yellow-500' },
          { val: stats.bugun,   label: 'Bugün',           color: 'border-l-blue-500' },
          { val: `${stats.gelir.toLocaleString('tr-TR')} ₺`, label: 'Teslim Geliri', color: 'border-l-green-500' },
        ].map(s => (
          <div key={s.label} className={`bg-[#141414] border border-white/5 p-4 border-l-2 ${s.color}`}>
            <div className="font-display font-black text-2xl text-white">{s.val}</div>
            <div className="font-body text-white/30 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtreler */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-red" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Sipariş no, müşteri adı, e-posta..."
            className="input-dark pl-10 pr-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { id: 'hepsi', label: 'Tümü' },
            ...Object.entries(DURUM_CONFIG).map(([id, c]) => ({ id, label: c.label })),
          ].map(f => (
            <button key={f.id} onClick={() => setFilterDurum(f.id)}
              className={`font-display font-semibold text-xs tracking-widest uppercase px-3 py-2 border transition-all duration-200 ${
                filterDurum === f.id ? 'bg-brand-red border-brand-red text-white' : 'border-white/10 text-white/40 hover:border-white/30'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={loadSiparisler} className="flex items-center gap-2 text-white/30 hover:text-white text-xs font-display uppercase tracking-widest transition-colors px-3">
          <RefreshCw size={12} />Yenile
        </button>
      </div>

      <div className="font-body text-white/30 text-sm mb-4">{filtered.length} sipariş</div>

      {/* Sipariş listesi */}
      {filtered.length === 0 ? (
        <div className="border border-white/5 bg-[#141414] p-12 text-center">
          <Package size={40} className="text-white/10 mx-auto mb-3" />
          <p className="font-display font-semibold text-sm uppercase text-white/20 tracking-widest">
            {search || filterDurum !== 'hepsi' ? 'Sonuç bulunamadı' : 'Henüz sipariş yok'}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(siparis => {
            const cfg = DURUM_CONFIG[siparis.durum] || DURUM_CONFIG.beklemede
            const Icon = cfg.icon
            const expanded = expandedId === siparis.id

            return (
              <div key={siparis.id} className="bg-[#141414] border border-white/5 overflow-hidden hover:border-white/10 transition-colors">
                {/* Ana satır */}
                <div className="flex items-center gap-4 p-4">
                  {/* Durum ikonu */}
                  <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 border ${cfg.bg}`}>
                    <Icon size={15} className={cfg.color} />
                  </div>

                  {/* Bilgiler */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-display font-black text-sm text-white tracking-wide">
                        {siparis.siparis_no || 'AKD-?'}
                      </span>
                      <span className={`font-display font-semibold text-xs tracking-widest uppercase px-2 py-0.5 border ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="font-body text-white/20 text-xs">
                        {ODEME_TIPI[siparis.odeme_tipi] || siparis.odeme_tipi}
                      </span>
                      {siparis.odeme_durumu === 'odendi' && (
                        <span className="font-display font-semibold text-xs tracking-widest uppercase px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400">
                          Ödendi
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-0.5 flex-wrap">
                      <span className="font-body text-white/50 text-sm">
                        {siparis.ad_soyad || 'Misafir'}
                      </span>
                      {siparis.telefon && (
                        <a href={`tel:${siparis.telefon}`} className="font-body text-white/30 text-xs hover:text-brand-red transition-colors flex items-center gap-1">
                          <Phone size={10} />{siparis.telefon}
                        </a>
                      )}
                      <span className="font-body text-white/20 text-xs">
                        {new Date(siparis.created_at).toLocaleDateString('tr-TR', {
                          day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Tutar */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-display font-black text-lg text-brand-red">
                      {siparis.toplam_tutar?.toLocaleString('tr-TR')} ₺
                    </div>
                    <div className="font-body text-white/20 text-xs">
                      {Array.isArray(siparis.urunler) ? siparis.urunler.reduce((s, u) => s + u.adet, 0) : 0} ürün
                    </div>
                  </div>

                  {/* Detay toggle */}
                  <button onClick={() => setExpandedId(expanded ? null : siparis.id)}
                    className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/30 hover:border-brand-red/40 hover:text-brand-red transition-all flex-shrink-0">
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {/* Detay panel */}
                {expanded && (
                  <div className="border-t border-white/5 p-5 space-y-5 bg-[#111111]">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Müşteri bilgileri */}
                      <div>
                        <h4 className="font-display font-bold text-xs uppercase tracking-widest text-white/40 mb-3">Müşteri Bilgileri</h4>
                        <div className="space-y-1.5 text-sm font-body">
                          <div className="flex gap-2"><span className="text-white/30 w-16">Ad:</span><span className="text-white/70">{siparis.ad_soyad || '—'}</span></div>
                          <div className="flex gap-2"><span className="text-white/30 w-16">E-posta:</span>
                            <a href={`mailto:${siparis.email}`} className="text-brand-red/70 hover:text-brand-red">{siparis.email || '—'}</a>
                          </div>
                          <div className="flex gap-2"><span className="text-white/30 w-16">Tel:</span>
                            <a href={`tel:${siparis.telefon}`} className="text-white/70 hover:text-brand-red">{siparis.telefon || '—'}</a>
                          </div>
                          {siparis.notlar && (
                            <div className="flex gap-2"><span className="text-white/30 w-16">Not:</span><span className="text-white/50 italic">{siparis.notlar}</span></div>
                          )}
                        </div>
                      </div>

                      {/* Ürünler */}
                      <div>
                        <h4 className="font-display font-bold text-xs uppercase tracking-widest text-white/40 mb-3">Sipariş Kalemleri</h4>
                        <div className="space-y-2">
                          {Array.isArray(siparis.urunler) && siparis.urunler.map((u, i) => (
                            <div key={i} className="flex items-center gap-3">
                              {u.fotograf && (
                                <img src={u.fotograf} alt={u.ad} className="w-10 h-10 object-cover bg-[#1A1A1A] flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-display font-bold text-xs uppercase text-white truncate">{u.ad}</div>
                                <div className="font-body text-white/30 text-xs">×{u.adet} — {u.fiyat?.toLocaleString('tr-TR')} ₺/adet</div>
                              </div>
                              <div className="font-display font-black text-sm text-white flex-shrink-0">
                                {((u.fiyat || 0) * u.adet).toLocaleString('tr-TR')} ₺
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between pt-2 border-t border-white/5">
                            <span className="font-display font-bold text-xs uppercase text-white/40">Toplam</span>
                            <span className="font-display font-black text-base text-brand-red">{siparis.toplam_tutar?.toLocaleString('tr-TR')} ₺</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Durum güncelleme */}
                    <div className="border-t border-white/5 pt-4">
                      <h4 className="font-display font-bold text-xs uppercase tracking-widest text-white/40 mb-3">Durum Güncelle</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(DURUM_CONFIG).map(([durum, cfg]) => {
                          const BtnIcon = cfg.icon
                          const isActive = siparis.durum === durum
                          return (
                            <button
                              key={durum}
                              onClick={() => !isActive && updateDurum(siparis.id, durum)}
                              disabled={isActive || updatingId === siparis.id}
                              className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-display font-semibold uppercase tracking-widest transition-all disabled:cursor-not-allowed ${
                                isActive
                                  ? `${cfg.bg} ${cfg.color} cursor-default`
                                  : 'border-white/10 text-white/30 hover:border-white/30 hover:text-white'
                              }`}
                            >
                              {updatingId === siparis.id
                                ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                : <BtnIcon size={11} />
                              }
                              {cfg.label}
                            </button>
                          )
                        })}
                      </div>

                      {/* İletişim butonları */}
                      <div className="flex gap-2 mt-3">
                        {siparis.telefon && (
                          <a href={`https://wa.me/${siparis.telefon.replace(/\D/g, '')}?text=${encodeURIComponent(`Merhaba ${siparis.ad_soyad}, ${siparis.siparis_no} numaralı siparişiniz hakkında bilgi vermek istiyoruz.`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-display font-semibold uppercase tracking-widest hover:bg-[#25D366]/20 transition-colors">
                            <Phone size={11} />WhatsApp
                          </a>
                        )}
                        {siparis.email && (
                          <a href={`mailto:${siparis.email}?subject=Siparişiniz Hakkında - ${siparis.siparis_no}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-white/30 text-xs font-display font-semibold uppercase tracking-widest hover:border-brand-red/40 hover:text-brand-red transition-all">
                            <Mail size={11} />E-posta
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
