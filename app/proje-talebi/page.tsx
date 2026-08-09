'use client'

import { useState, useRef } from 'react'
import {
  School, Moon, Mic2, Dumbbell, HeartPulse, Building2,
  Upload, X, FileText, CheckCircle2, Phone, Mail, User,
  MapPin, Ruler, Users, MessageSquare, Loader2, ChevronRight
} from 'lucide-react'

const MEKAN_TIPLERI = [
  { id: 'okul',       label: 'Okul / Eğitim',      icon: School,    desc: 'Derslik, spor salonu, konferans' },
  { id: 'cami',       label: 'Cami ve İbadet Alanları', icon: Moon, desc: 'Cami, mescit ve diğer ibadet alanları' },
  { id: 'konferans',  label: 'Konferans Salonu',     icon: Mic2,      desc: 'Toplantı, seminer, fuar' },
  { id: 'spor',       label: 'Spor Tesisi',          icon: Dumbbell,  desc: 'Spor salonu, stadyum, arena' },
  { id: 'hastane',    label: 'Sağlık / Hastane',     icon: HeartPulse,desc: 'Hastane, klinik, sağlık merkezi' },
  { id: 'diger',      label: 'Diğer',                icon: Building2, desc: 'AVM, otel, kültür merkezi...' },
]

interface FormData {
  ad_soyad: string
  telefon: string
  email: string
  firma: string
  mekan_tipi: string
  mekan_adi: string
  sehir: string
  alan_m2: string
  kapasite: string
  mesaj: string
}

const INITIAL: FormData = {
  ad_soyad: '', telefon: '', email: '', firma: '',
  mekan_tipi: '', mekan_adi: '', sehir: '',
  alan_m2: '', kapasite: '', mesaj: ''
}

export default function ProjeTalebiPage() {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof FormData, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const valid = Array.from(incoming).filter(f =>
      f.size <= 20 * 1024 * 1024 &&
      (f.type.startsWith('image/') || f.type === 'application/pdf' ||
       f.type.includes('word') || f.type.includes('dwg') || f.name.endsWith('.dwg'))
    )
    setFiles(prev => {
      const combined = [...prev, ...valid]
      return combined.slice(0, 10)
    })
  }

  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.ad_soyad || !form.telefon || !form.email || !form.mekan_tipi || !form.mekan_adi || !form.sehir) {
      setError('Lütfen zorunlu alanları doldurun.')
      return
    }
    setSubmitting(true)
    setError('')

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => formData.append(key, value))
      
      files.forEach(file => {
        formData.append('dosyalar', file)
      })

      const res = await fetch('/api/proje-talebi', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) throw new Error('Gönderim başarısız')
      setSuccess(true)
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin veya bizi arayın.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-green-400" />
          </div>
          <h1 className="font-display font-black text-3xl uppercase text-[var(--foreground)] mb-3">Talebiniz Alındı</h1>
          <p className="font-body text-[var(--silver-text)] mb-8">
            Proje talebiniz ekibimize ulaştı. En kısa sürede sizi arayarak detayları görüşeceğiz.
          </p>
          <a href="/" className="btn-primary inline-flex gap-2">
            Ana Sayfaya Dön <ChevronRight size={16} />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-8 pb-24">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Başlık */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-brand-red" />
            <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Ücretsiz Keşif & Teklif</span>
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase text-[var(--foreground)] leading-tight mb-4">
            Sistem Kurulum<br />Talebi
          </h1>
          <p className="font-body text-[var(--silver-text)] text-base max-w-xl">
            Mekan bilgilerinizi ve varsa teknik belgelerinizi paylaşın. Uzman ekibimiz sizinle iletişime geçerek
            <strong className="text-[var(--foreground)]"> ses, ışık ve görüntü sistemi</strong> için ücretsiz keşif ve teklif hazırlasın.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* BÖLÜM 1: Mekan Tipi */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-8">
            <h2 className="font-display font-black text-sm uppercase tracking-widest text-[var(--foreground)] mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-[10px] font-black">1</span>
              Mekan Tipi
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MEKAN_TIPLERI.map(m => {
                const Icon = m.icon
                const active = form.mekan_tipi === m.id
                return (
                  <button
                    key={m.id} type="button"
                    onClick={() => set('mekan_tipi', m.id)}
                    className={`p-4 border text-left transition-all group ${
                      active
                        ? 'border-brand-red bg-brand-red/10'
                        : 'border-[var(--card-border)] hover:border-brand-red/40 bg-[var(--card-bg)]'
                    }`}
                  >
                    <Icon size={22} className={active ? 'text-brand-red mb-2' : 'text-[var(--silver-text)] mb-2 group-hover:text-brand-red/70 transition-colors'} />
                    <div className={`font-display font-bold text-xs uppercase tracking-wider ${active ? 'text-brand-red' : 'text-[var(--foreground)]'}`}>{m.label}</div>
                    <div className="font-body text-[10px] text-[var(--silver-text)] mt-0.5">{m.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* BÖLÜM 2: Mekan Bilgileri */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-8">
            <h2 className="font-display font-black text-sm uppercase tracking-widest text-[var(--foreground)] mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-[10px] font-black">2</span>
              Mekan Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-display font-semibold text-[10px] uppercase tracking-widest text-[var(--silver-text)] flex items-center gap-1.5">
                  <MapPin size={11} className="text-brand-red" /> Mekan Adı *
                </label>
                <input
                  type="text" required value={form.mekan_adi} onChange={e => set('mekan_adi', e.target.value)}
                  placeholder="Atatürk İlkokulu, Merkez Camii..." className="input-dark w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="font-display font-semibold text-[10px] uppercase tracking-widest text-[var(--silver-text)] flex items-center gap-1.5">
                  <MapPin size={11} className="text-brand-red" /> Şehir *
                </label>
                <input
                  type="text" required value={form.sehir} onChange={e => set('sehir', e.target.value)}
                  placeholder="İstanbul, Ankara..." className="input-dark w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="font-display font-semibold text-[10px] uppercase tracking-widest text-[var(--silver-text)] flex items-center gap-1.5">
                  <Ruler size={11} className="text-brand-red" /> Yaklaşık Alan (m²)
                </label>
                <input
                  type="text" value={form.alan_m2} onChange={e => set('alan_m2', e.target.value)}
                  placeholder="500 m²" className="input-dark w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="font-display font-semibold text-[10px] uppercase tracking-widest text-[var(--silver-text)] flex items-center gap-1.5">
                  <Users size={11} className="text-brand-red" /> Kapasite / Kişi Sayısı
                </label>
                <input
                  type="text" value={form.kapasite} onChange={e => set('kapasite', e.target.value)}
                  placeholder="200 kişi" className="input-dark w-full"
                />
              </div>
            </div>
          </div>

          {/* BÖLÜM 3: Dosya Yükleme */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-8">
            <h2 className="font-display font-black text-sm uppercase tracking-widest text-[var(--foreground)] mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-[10px] font-black">3</span>
              Proje Dosyaları <span className="text-white/30 font-semibold tracking-normal normal-case ml-2 text-xs">(İsteğe Bağlı)</span>
            </h2>
            <p className="font-body text-[var(--silver-text)] text-xs mb-3">
              Krokiler, mimari planlar, teknik şartname veya fotoğraflar yükleyebilirsiniz. (PDF, JPG, PNG, DWG - Maks 20MB)
            </p>
            <div className="bg-brand-red/5 border border-brand-red/20 p-3 mb-5 rounded-sm">
              <p className="font-body text-brand-red/90 text-xs leading-relaxed">
                <strong className="font-display uppercase tracking-widest text-[10px]">İpucu: </strong> 
                Dosya yüklemek <strong>zorunlu değildir</strong>. Ancak projenizle ilgili detaylı görseller veya kat planları paylaşmanız, uzmanlarımızın size çok daha <strong>profesyonel, doğru ve nokta atışı bir teklif</strong> sunmasını sağlayacaktır.
              </p>
            </div>

            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-sm p-10 text-center cursor-pointer transition-all ${
                dragging ? 'border-brand-red bg-brand-red/5' : 'border-[var(--card-border)] hover:border-brand-red/40'
              }`}
            >
              <Upload size={28} className="mx-auto mb-3 text-[var(--silver-text)]" />
              <p className="font-display font-bold text-sm text-[var(--foreground)]">Dosyaları buraya sürükleyin</p>
              <p className="font-body text-[var(--silver-text)] text-xs mt-1">veya tıklayarak seçin</p>
              <input ref={fileInputRef} type="file" multiple className="hidden"
                accept="image/*,.pdf,.doc,.docx,.dwg"
                onChange={e => handleFiles(e.target.files)} />
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[var(--card-bg)] border border-[var(--card-border)]">
                    <FileText size={16} className="text-brand-red flex-shrink-0" />
                    <span className="font-body text-sm text-[var(--foreground)] flex-1 truncate">{f.name}</span>
                    <span className="font-body text-[10px] text-[var(--silver-text)]">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-[var(--silver-text)] hover:text-brand-red transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BÖLÜM 4: İletişim Bilgileri */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-8">
            <h2 className="font-display font-black text-sm uppercase tracking-widest text-[var(--foreground)] mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-[10px] font-black">4</span>
              İletişim Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-display font-semibold text-[10px] uppercase tracking-widest text-[var(--silver-text)] flex items-center gap-1.5">
                  <User size={11} className="text-brand-red" /> Ad Soyad *
                </label>
                <input type="text" required value={form.ad_soyad} onChange={e => set('ad_soyad', e.target.value)}
                  placeholder="Ahmet Yılmaz" className="input-dark w-full" />
              </div>
              <div className="space-y-1">
                <label className="font-display font-semibold text-[10px] uppercase tracking-widest text-[var(--silver-text)] flex items-center gap-1.5">
                  <Building2 size={11} className="text-brand-red" /> Kurum / Firma
                </label>
                <input type="text" value={form.firma} onChange={e => set('firma', e.target.value)}
                  placeholder="ABC Okulu, Merkez Camii Yaptırma Derneği..." className="input-dark w-full" />
              </div>
              <div className="space-y-1">
                <label className="font-display font-semibold text-[10px] uppercase tracking-widest text-[var(--silver-text)] flex items-center gap-1.5">
                  <Phone size={11} className="text-brand-red" /> Telefon *
                </label>
                <input type="tel" required value={form.telefon} onChange={e => set('telefon', e.target.value)}
                  placeholder="0532 000 00 00" className="input-dark w-full" />
              </div>
              <div className="space-y-1">
                <label className="font-display font-semibold text-[10px] uppercase tracking-widest text-[var(--silver-text)] flex items-center gap-1.5">
                  <Mail size={11} className="text-brand-red" /> E-posta *
                </label>
                <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="ornek@mail.com" className="input-dark w-full" />
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <label className="font-display font-semibold text-[10px] uppercase tracking-widest text-[var(--silver-text)] flex items-center gap-1.5">
                <MessageSquare size={11} className="text-brand-red" /> Notlar / İstekler
              </label>
              <textarea
                value={form.mesaj} onChange={e => set('mesaj', e.target.value)} rows={4}
                placeholder="Hangi sistem ihtiyaçlarınız var? Özel istekleriniz varsa buraya yazın..."
                className="input-dark w-full resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 border border-red-500/20 bg-red-500/10 text-red-400 font-body text-sm">
              {error}
            </div>
          )}

          <button
            type="submit" disabled={submitting || !form.mekan_tipi}
            className="btn-primary w-full justify-center text-sm py-4 disabled:opacity-40"
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> Gönderiliyor...</>
            ) : (
              <><ChevronRight size={16} /> Talebi Gönder</>
            )}
          </button>

          <p className="text-center font-body text-[var(--silver-text)] text-xs">
            Formunuzu gönderdikten sonra ekibimiz en kısa sürede sizi arayacaktır.
          </p>
        </form>
      </div>
    </div>
  )
}
