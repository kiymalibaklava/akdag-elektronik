'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import {
  School, Moon, Mic2, Dumbbell, HeartPulse, Building2,
  Phone, Mail, MapPin, Ruler, Users, FileText, Download,
  Eye, CheckCircle, Clock, XCircle, ChevronDown, ExternalLink, Loader2
} from 'lucide-react'

const MEKAN_ETIKETLER: Record<string, { label: string; icon: any }> = {
  okul:      { label: 'Okul / Eğitim',     icon: School },
  cami:      { label: 'Cami ve İbadet Alanları', icon: Moon },
  konferans: { label: 'Konferans Salonu',   icon: Mic2 },
  spor:      { label: 'Spor Tesisi',        icon: Dumbbell },
  hastane:   { label: 'Sağlık / Hastane',   icon: HeartPulse },
  diger:     { label: 'Diğer',              icon: Building2 },
}

const DURUM_CONF: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  yeni:        { label: 'Yeni',        icon: Clock,         color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  inceleniyor: { label: 'İnceleniyor', icon: Eye,           color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20' },
  tamamlandi:  { label: 'Tamamlandı',  icon: CheckCircle,   color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20' },
  iptal:       { label: 'İptal',       icon: XCircle,       color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20' },
}

interface ProjeTalebi {
  id: string
  ad_soyad: string
  telefon: string
  email: string
  firma?: string
  mekan_tipi: string
  mekan_adi: string
  sehir: string
  alan_m2?: string
  kapasite?: string
  mesaj?: string
  dosyalar: string[]
  durum: string
  created_at: string
}

export default function AdminProjeTalepleri() {
  const [talepler, setTalepler] = useState<ProjeTalebi[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ProjeTalebi | null>(null)
  const [durumGuncelleniyor, setDurumGuncelleniyor] = useState<string | null>(null)
  const [filtre, setFiltre] = useState<string>('hepsi')
  const supabase = useRef(createClient()).current

  useEffect(() => { loadTalepler() }, [])

  const loadTalepler = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }

    const res = await fetch('/api/admin/proje-talepleri', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
    if (res.ok) {
      const data = await res.json()
      setTalepler(data || [])
    }
    setLoading(false)
  }

  const handleDurumGuncelle = async (id: string, durum: string) => {
    setDurumGuncelleniyor(id)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setDurumGuncelleniyor(null); return }

    const res = await fetch('/api/admin/proje-talepleri', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ id, durum })
    })
    if (res.ok) {
      setTalepler(prev => prev.map(t => t.id === id ? { ...t, durum } : t))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, durum } : null)
    }
    setDurumGuncelleniyor(null)
  }

  const filtreliTalepler = filtre === 'hepsi' ? talepler : talepler.filter(t => t.durum === filtre)
  const yeniSayisi = talepler.filter(t => t.durum === 'yeni').length

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-6 h-px bg-brand-red" />
            <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Proje Talepleri</span>
          </div>
          <h2 className="font-display font-black text-2xl uppercase text-white">
            Sistem Kurulum Talepleri
            {yeniSayisi > 0 && (
              <span className="ml-3 inline-flex items-center justify-center w-7 h-7 bg-brand-red text-white text-xs font-black rounded-full">
                {yeniSayisi}
              </span>
            )}
          </h2>
        </div>
        <button onClick={loadTalepler} className="text-white/30 hover:text-white transition-colors text-xs font-display uppercase tracking-widest">
          Yenile
        </button>
      </div>

      {/* Filtre */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'hepsi', label: `Tümü (${talepler.length})` },
          { id: 'yeni', label: `Yeni (${talepler.filter(t => t.durum === 'yeni').length})` },
          { id: 'inceleniyor', label: 'İnceleniyor' },
          { id: 'tamamlandi', label: 'Tamamlandı' },
          { id: 'iptal', label: 'İptal' },
        ].map(f => (
          <button key={f.id} onClick={() => setFiltre(f.id)}
            className={`px-4 py-2 text-[10px] font-display font-bold uppercase tracking-widest border transition-all ${
              filtre === f.id ? 'border-brand-red text-brand-red bg-brand-red/10' : 'border-white/10 text-white/40 hover:border-white/30'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 size={24} className="text-brand-red animate-spin" />
        </div>
      ) : filtreliTalepler.length === 0 ? (
        <div className="py-20 text-center text-white/20 font-body">
          {filtre === 'hepsi' ? 'Henüz proje talebi yok.' : 'Bu filtrede talep bulunamadı.'}
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Liste */}
          <div className="lg:col-span-2 space-y-2">
            {filtreliTalepler.map(t => {
              const mekan = MEKAN_ETIKETLER[t.mekan_tipi] || { label: t.mekan_tipi, icon: Building2 }
              const MekanIcon = mekan.icon
              const durum = DURUM_CONF[t.durum] || DURUM_CONF.yeni
              const DurumIcon = durum.icon
              const isActive = selected?.id === t.id

              return (
                <div key={t.id}
                  onClick={() => setSelected(t)}
                  className={`p-4 border cursor-pointer transition-all ${
                    isActive ? 'border-brand-red bg-brand-red/5' : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                  }`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <MekanIcon size={14} className="text-brand-red flex-shrink-0" />
                      <span className="font-display font-bold text-xs text-white uppercase">{mekan.label}</span>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 border flex items-center gap-1 flex-shrink-0 ${durum.bg} ${durum.color}`}>
                      <DurumIcon size={9} />{durum.label}
                    </span>
                  </div>
                  <div className="font-display font-black text-sm text-white">{t.mekan_adi}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin size={10} className="text-white/30" />
                    <span className="font-body text-xs text-white/40">{t.sehir}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <span className="font-body text-xs text-white/50">{t.ad_soyad}</span>
                    <span className="font-body text-[10px] text-white/20">
                      {new Date(t.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Detay */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-[#141414] border border-white/5 p-6 space-y-6 sticky top-6">
                {/* Durum & Aksiyon */}
                <div className="flex items-center justify-between">
                  <div className={`text-xs font-bold px-3 py-1.5 border flex items-center gap-1.5 ${DURUM_CONF[selected.durum]?.bg} ${DURUM_CONF[selected.durum]?.color}`}>
                    {(() => { const D = DURUM_CONF[selected.durum]?.icon; return D ? <D size={12} /> : null })()}
                    {DURUM_CONF[selected.durum]?.label}
                  </div>
                  <div className="flex gap-2">
                    {Object.entries(DURUM_CONF).filter(([k]) => k !== selected.durum).map(([key, conf]) => {
                      const Icon = conf.icon
                      return (
                        <button key={key}
                          onClick={() => handleDurumGuncelle(selected.id, key)}
                          disabled={durumGuncelleniyor === selected.id}
                          className={`text-[9px] font-bold uppercase px-2.5 py-1.5 border transition-all flex items-center gap-1 ${conf.bg} ${conf.color} hover:opacity-80`}>
                          {durumGuncelleniyor === selected.id ? <Loader2 size={9} className="animate-spin" /> : <Icon size={9} />}
                          {conf.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Mekan Tipi */}
                {(() => {
                  const m = MEKAN_ETIKETLER[selected.mekan_tipi] || { label: selected.mekan_tipi, icon: Building2 }
                  const Icon = m.icon
                  return (
                    <div className="flex items-center gap-3 p-4 bg-brand-red/10 border border-brand-red/20">
                      <Icon size={20} className="text-brand-red" />
                      <span className="font-display font-black text-sm text-white uppercase">{m.label}</span>
                    </div>
                  )
                })()}

                {/* Mekan Bilgileri */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Mekan Bilgileri</div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: MapPin, label: 'Mekan Adı', val: selected.mekan_adi },
                      { icon: MapPin, label: 'Şehir', val: selected.sehir },
                      ...(selected.alan_m2 ? [{ icon: Ruler, label: 'Alan', val: selected.alan_m2 }] : []),
                      ...(selected.kapasite ? [{ icon: Users, label: 'Kapasite', val: selected.kapasite }] : []),
                    ].map(({ icon: Icon, label, val }) => (
                      <div key={label} className="bg-white/[0.03] p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon size={11} className="text-brand-red" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">{label}</span>
                        </div>
                        <div className="font-body text-sm text-white">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* İletişim */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">İletişim Bilgileri</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-black text-sm text-white">{selected.ad_soyad}</span>
                      {selected.firma && <span className="text-white/30 font-body text-xs">— {selected.firma}</span>}
                    </div>
                    <a href={`tel:${selected.telefon}`}
                      className="flex items-center gap-2 text-brand-red hover:text-brand-red/80 transition-colors group">
                      <Phone size={14} />
                      <span className="font-display font-black text-base">{selected.telefon}</span>
                      <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <a href={`mailto:${selected.email}`}
                      className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
                      <Mail size={13} />
                      {selected.email}
                    </a>
                  </div>
                </div>

                {/* Notlar */}
                {selected.mesaj && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Notlar / İstekler</div>
                    <div className="bg-white/[0.03] p-4 font-body text-sm text-white/70 leading-relaxed whitespace-pre-line">
                      {selected.mesaj}
                    </div>
                  </div>
                )}

                {/* Dosyalar */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
                    Yüklenen Dosyalar ({selected.dosyalar?.length || 0})
                  </div>
                  {selected.dosyalar?.length ? (
                    <div className="space-y-2">
                      {selected.dosyalar.map((url, i) => {
                        const filename = url.split('/').pop()?.split('?')[0] || `Dosya ${i + 1}`
                        const isPDF = filename.toLowerCase().endsWith('.pdf')
                        const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(filename)
                        return (
                          <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/5 group">
                            <FileText size={14} className="text-brand-red flex-shrink-0" />
                            <span className="font-body text-xs text-white/60 flex-1 truncate">{filename}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {isImage && (
                                <a href={url} target="_blank" rel="noopener noreferrer"
                                  className="text-white/40 hover:text-white p-1 transition-colors" title="Görüntüle">
                                  <Eye size={13} />
                                </a>
                              )}
                              <a href={url} download target="_blank" rel="noopener noreferrer"
                                className="text-white/40 hover:text-brand-red p-1 transition-colors" title="İndir">
                                <Download size={13} />
                              </a>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-white/20 text-xs font-body">Dosya yüklenmedi</div>
                  )}
                </div>

                <div className="text-[10px] text-white/20 font-body border-t border-white/5 pt-3">
                  Talep tarihi: {new Date(selected.created_at).toLocaleString('tr-TR')}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-white/20 font-body border border-dashed border-white/5">
                Detayları görmek için sol taraftan bir talep seçin
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
