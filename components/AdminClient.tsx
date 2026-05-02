'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import AdminAddProduct from './AdminAddProduct'
import AdminProductList from './AdminProductList'
import AdminLoginForm from './AdminLoginForm'
import AdminBayiYonetim from './AdminBayiYonetim'
import AdminSiparisler from './AdminSiparisler'
import { LogOut, Package, Users, FileText, ShoppingBag } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

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
}

type Tab = 'siparisler' | 'urunler' | 'bayiler' | 'basvurular'

export default function AdminClient() {
  const [user, setUser] = useState<User | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('siparisler')
  const [bekleyenSiparis, setBekleyenSiparis] = useState(0)
  const supabase = useRef(createClient()).current

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session) { loadProducts(); loadBekleyenSiparis() }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session) { loadProducts(); loadBekleyenSiparis() }
      else setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProducts = async () => {
    const { data } = await supabase.from('urunler').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
  }

  const loadBekleyenSiparis = async () => {
    const { count } = await supabase.from('siparisler').select('*', { count: 'exact', head: true }).eq('durum', 'beklemede')
    setBekleyenSiparis(count || 0)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProducts([])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-brand-red rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="w-full max-w-md px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-brand-red flex items-center justify-center font-display font-black text-white text-2xl"
                style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
                AD
              </div>
              <div className="font-display leading-none text-left">
                <div className="text-white font-black text-2xl tracking-wide uppercase">AKDAĞ</div>
                <div className="text-white/30 text-xs tracking-[0.3em] uppercase">ELEKTRONİK</div>
              </div>
            </div>
            <h1 className="font-display font-black text-2xl uppercase text-white tracking-widest">Admin Girişi</h1>
            <p className="font-body text-white/30 text-sm mt-2">Yönetim paneline erişmek için giriş yapın.</p>
          </div>
          <div className="bg-[#141414] border border-white/8 p-8">
            <AdminLoginForm onSuccess={() => {
              supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) { setUser(session.user); loadProducts(); loadBekleyenSiparis() }
              })
            }} />
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'siparisler' as Tab, label: 'Siparişler', icon: ShoppingBag, badge: bekleyenSiparis },
    { id: 'urunler'   as Tab, label: 'Ürünler',    icon: Package },
    { id: 'bayiler'   as Tab, label: 'Bayiler',     icon: Users },
    { id: 'basvurular'as Tab, label: 'Başvurular',  icon: FileText },
  ]

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-[#0A0A0A] border-b border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-px bg-brand-red" />
              <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Yönetim Paneli</span>
            </div>
            <h1 className="font-display font-black text-4xl uppercase text-white">ADMİN PANELİ</h1>
            <p className="font-body text-white/30 text-sm mt-1">{user.email}</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-white/30 hover:text-brand-red font-display font-semibold text-xs tracking-widest uppercase transition-colors">
            <LogOut size={14} />Çıkış
          </button>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="bg-[#0A0A0A] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 font-display font-semibold text-xs tracking-widest uppercase border-b-2 transition-all duration-200 whitespace-nowrap relative flex-shrink-0 ${
                  activeTab === tab.id ? 'border-brand-red text-white' : 'border-transparent text-white/30 hover:text-white/60'
                }`}>
                <Icon size={14} />
                {tab.label}
                {tab.badge ? (
                  <span className="w-4 h-4 bg-brand-red text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {/* İçerik */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        {activeTab === 'siparisler' && <AdminSiparisler />}

        {activeTab === 'urunler' && (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-white mb-6 red-line">Yeni Ürün Ekle</h2>
              <AdminAddProduct onAdded={loadProducts} />
            </div>
            <div className="lg:col-span-2">
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-white mb-6 red-line">
                Mevcut Ürünler ({products.length})
              </h2>
              <AdminProductList products={products} onDeleted={loadProducts} />
            </div>
          </div>
        )}

        {(activeTab === 'bayiler' || activeTab === 'basvurular') && (
          <AdminBayiYonetim activeTab={activeTab} />
        )}
      </div>
    </div>
  )
}
