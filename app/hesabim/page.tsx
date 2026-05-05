'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Package, Truck, Clock, CheckCircle, XCircle, ChevronRight, LogOut, Store } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface Siparis {
  id: string
  siparis_no: string
  toplam_tutar: number
  durum: string
  odeme_durumu: string
  created_at: string
  kargo_takip_no?: string
  teslimat_tipi?: string
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
  
  const supabase = useRef(createClient()).current

  useEffect(() => {
    loadUserAndOrders()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUserAndOrders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/bayi') // Giriş yapmamışsa bayi veya genel giriş sayfasına
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
        
        {/* Başlık ve Çıkış */}
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

        {/* Siparişler Listesi */}
        {siparisler.length === 0 ? (
          <div className="border border-white/5 bg-[#141414] p-12 text-center">
            <Package size={40} className="text-white/10 mx-auto mb-3" />
            <p className="font-display font-semibold text-sm uppercase text-white/20 tracking-widest mb-6">
              Henüz siparişiniz bulunmuyor
            </p>
            <Link href="/urunler" className="btn-primary text-sm inline-flex">
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {siparisler.map((s) => {
              const durum = DURUM_MAP[s.durum] || DURUM_MAP.beklemede
              const DurumIcon = durum.icon
              const urunAdedi = Array.isArray(s.urunler) ? s.urunler.reduce((sum, u) => sum + u.adet, 0) : 0

              return (
                <div key={s.id} className="bg-[#141414] border border-white/5 p-6 hover:border-white/10 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    
                    {/* Sipariş Bilgi */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-display font-black text-lg text-white uppercase tracking-wider">
                          {s.siparis_no || 'AKD-SİPARİŞ'}
                        </span>
                        <span className="font-body text-white/30 text-xs">
                          {new Date(s.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="font-body text-white/40 text-sm">
                        {urunAdedi} Ürün • <span className="font-display font-bold text-white">{Number(s.toplam_tutar).toLocaleString('tr-TR')} ₺</span>
                      </div>
                    </div>

                    {/* Durum ve Kargo */}
                    <div className="flex flex-col items-start md:items-end gap-3">
                      <div className={`flex items-center gap-2 font-display font-bold text-xs uppercase tracking-widest px-3 py-1.5 border border-current/20 ${durum.color} bg-current/5`}>
                        <DurumIcon size={14} />
                        {durum.label}
                      </div>
                      
                      {/* Kargo Bilgisi / Depo */}
                      {s.teslimat_tipi === 'depo' ? (
                        <div className="flex items-center gap-2 text-orange-400 text-xs font-body bg-orange-400/10 px-3 py-1.5 border border-orange-400/20">
                          <Store size={12} /> Mağazadan Teslim Alınacak
                        </div>
                      ) : (
                        s.kargo_takip_no && (
                          <div className="flex items-center gap-2 text-brand-red text-xs font-body bg-brand-red/10 px-3 py-1.5 border border-brand-red/20">
                            <Truck size={12} /> 
                            Takip No: <span className="font-display font-bold tracking-widest">{s.kargo_takip_no}</span>
                            <a 
                              href={`https://www.google.com/search?q=${s.kargo_takip_no}+kargo+takip`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-2 underline hover:text-white transition-colors"
                            >
                              Sorgula
                            </a>
                          </div>
                        )
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
