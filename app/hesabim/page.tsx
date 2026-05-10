'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Package, Truck, Clock, CheckCircle, XCircle, LogOut, Store, Upload, Check, AlertCircle, Loader2, FileText } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface Siparis {
  id: string
  siparis_no: string
  toplam_tutar: number
  durum: string
  odeme_durumu: string
  odeme_tipi: string
  created_at: string
  kargo_takip_no?: string
  teslimat_tipi?: string
  dekont_url?: string
  urunler: any[]
}

const DURUM_MAP: Record<string, { label: string, color: string, icon: React.ElementType }> = {
  beklemede:     { label: 'Sipariş Alındı', color: 'text-yellow-400', icon: Clock },
  onaylandi:     { label: 'Onaylandı',      color: 'text-blue-400',   icon: CheckCircle },
  hazirlaniyor:  { label: 'Hazırlanıyor',   color: 'text-purple-400', icon: Package },
  kargolandi:    { label: 'Kargolandı',     color: 'text-brand-red',  icon: Truck },
  teslim_edildi: { label: 'Teslim Edildi',  color: 'text-green-400',  icon: CheckCircle },
  iptal:         { label: 'İptal Edildi',   color: 'text-red-400',    icon: XCircle },
  tamamlandi:    { label: 'Tamamlandı',     color: 'text-green-400',  icon: CheckCircle },
}

export default function HesabimPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [siparisler, setSiparisler] = useState<Siparis[]>([])
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  
  const supabase = useRef(createClient()).current

  useEffect(() => {
    loadUserAndOrders()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUserAndOrders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/bayi')
      return
    }

    setUser(session.user)

    const { data } = await supabase
      .from('siparisler')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    setSiparisler(data || [])
    setLoading(false)
  }

  const handleReceiptUpload = async (siparisId: string, file: File) => {
    if (!file) return
    
    setUploadingId(siparisId)
    const fileExt = file.name.split('.').pop()
    const filePath = `dekontlar/${siparisId}_${Date.now()}.${fileExt}`

    try {
      // 1. Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('siparis-dekontlari')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('siparis-dekontlari')
        .getPublicUrl(filePath)

      // 3. Update order record
      const { error: updateError } = await supabase
        .from('siparisler')
        .update({ 
          dekont_url: publicUrl,
          notlar: `[Sistem: Dekont yüklendi] ${new Date().toLocaleString('tr-TR')}` 
        })
        .eq('id', siparisId)

      if (updateError) throw updateError

      // 4. Notify Admin
      await fetch('/api/dekont-bildirim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siparis_id: siparisId,
          siparis_no: siparisler.find(s => s.id === siparisId)?.siparis_no,
          dekont_url: publicUrl,
          ad_soyad: user?.user_metadata?.full_name || user?.email
        })
      }).catch(err => console.error('Bildirim hatası:', err))

      // Refresh data
      await loadUserAndOrders()
    } catch (err: any) {
      alert(`Dekont yüklenemedi: ${err.message}`)
    } finally {
      setUploadingId(null)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-24 bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-brand-red rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-12 pb-24 bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
          <div>
            <h1 className="font-display font-black text-3xl uppercase text-white tracking-widest">Hesabım</h1>
            <p className="font-body text-white/40 text-sm mt-1">{user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/30 hover:text-brand-red font-display font-semibold text-xs tracking-widest uppercase transition-colors"
          >
            <LogOut size={14} /> Çıkış Yap
          </button>
        </div>

        <h2 className="font-display font-bold text-lg uppercase tracking-widest text-white mb-6 flex items-center gap-3">
          <div className="w-6 h-px bg-brand-red" />
          Siparişlerim ({siparisler.length})
        </h2>

        {siparisler.length === 0 ? (
          <div className="border border-white/5 bg-[#141414] p-12 text-center">
            <Package size={40} className="text-white/10 mx-auto mb-3" />
            <p className="font-display font-semibold text-sm uppercase text-white/20 tracking-widest mb-6">
              Henüz siparişiniz bulunmuyor
            </p>
            <Link href="/urunler" className="btn-primary text-sm inline-flex">Alışverişe Başla</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {siparisler.map((s) => {
              const durum = DURUM_MAP[s.durum] || DURUM_MAP.beklemede
              const DurumIcon = durum.icon
              const urunAdedi = Array.isArray(s.urunler) ? s.urunler.reduce((sum, u) => sum + u.adet, 0) : 0
              const isHavale = s.odeme_tipi === 'havale'
              const needsReceipt = isHavale && !s.dekont_url && s.odeme_durumu !== 'odendi'

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
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3 min-w-[200px]">
                      <div className={`flex items-center gap-2 font-display font-bold text-xs uppercase tracking-widest px-3 py-1.5 border border-current/20 ${durum.color} bg-current/5 w-full md:w-auto justify-center`}>
                        <DurumIcon size={14} />
                        {durum.label}
                      </div>
                      
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
                        <div className="flex items-center gap-2 text-green-400 text-[10px] font-display font-bold uppercase tracking-widest">
                          <CheckCircle size={12} /> Dekont Yüklendi
                          <a href={s.dekont_url} target="_blank" rel="noreferrer" className="ml-2 text-white/30 hover:text-white transition-colors">
                            <FileText size={12} />
                          </a>
                        </div>
                      )}

                      {s.kargo_takip_no && (
                        <div className="flex items-center gap-2 text-brand-red text-xs font-body bg-brand-red/10 px-3 py-1.5 border border-brand-red/20">
                          <Truck size={12} /> 
                          <span className="font-display font-bold tracking-widest">{s.kargo_takip_no}</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
