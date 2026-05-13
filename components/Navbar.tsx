'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, Phone, Heart, GitCompare, ChevronRight, ChevronDown, Speaker, Lightbulb, Monitor, Box, Plug, Briefcase } from 'lucide-react'
import AdLogo from './AdLogo'
import CartIcon from './CartIcon'
import KurGostergesi from './KurGostergesi'
import ProductSearch from './ProductSearch'
import { NEW_KATEGORI_HIYERARSI, type CategoryNode } from '@/lib/categories'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { pullCartFromSupabase, setCartUserId } from '@/lib/cart'

const navLinks = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/urunler', label: 'Ürünler', hasMega: true },
  { href: '/hakkimizda', label: 'Hakkımızda' },
  { href: '/iletisim', label: 'İletişim' },
]

const KATEGORI_IKONLARI = [Speaker, Lightbulb, Monitor, Box, Plug, Briefcase]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [activeAna, setActiveAna] = useState(0)
  const [activeAlt, setActiveAlt] = useState(0)
  const [mobileKatOpen, setMobileKatOpen] = useState(false)
  const [mobileAnaIdx, setMobileAnaIdx] = useState<number | null>(null)
  const [mobileAltIdx, setMobileAltIdx] = useState<number | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const megaRef = useRef<HTMLDivElement>(null)
  const supabase = useRef(createClient()).current

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      setUser(data.session?.user ?? null)
      setCartUserId(data.session?.user?.id ?? null)
      if (data.session?.user) pullCartFromSupabase()
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: any, session: any) => {
      setUser(session?.user ?? null)
      setCartUserId(session?.user?.id ?? null)
      if (session?.user) pullCartFromSupabase()
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMegaOpen(false)
    setOpen(false)
  }, [pathname])

  const openMega = useCallback(() => {
    if (megaTimer.current) clearTimeout(megaTimer.current)
    setMegaOpen(true)
    setActiveAna(0)
    setActiveAlt(0)
  }, [])

  const closeMega = useCallback(() => {
    megaTimer.current = setTimeout(() => setMegaOpen(false), 180)
  }, [])

  const cancelClose = useCallback(() => {
    if (megaTimer.current) clearTimeout(megaTimer.current)
  }, [])

  const ana = NEW_KATEGORI_HIYERARSI[activeAna]
  const alt = ana?.children?.[activeAlt]

  return (
    <>
      {/* Top bar */}
      <div className="bg-brand-red text-white text-[10px] sm:text-xs font-body tracking-wider z-[60] relative">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
          <span className="opacity-80 hidden sm:block uppercase font-bold tracking-[0.2em]">Kayseri'nin Ses ve Işık Sistemleri Uzmanı</span>
          <a href="tel:+903522316915" className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity">
            <Phone size={11} />
            +90 352 231 69 15
          </a>
        </div>
      </div>

      {/* Kur bar */}
      <div className="bg-[#0A0A0A] border-b border-white/5 py-1.5 px-6">
        <div className="max-w-7xl mx-auto flex justify-center md:justify-end">
          <KurGostergesi />
        </div>
      </div>

      {/* Main nav */}
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0F0F0F]/95 backdrop-blur-md border-b border-white/5 shadow-2xl' : 'bg-[#0F0F0F]'
        }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <AdLogo size={40} />
            <div className="font-display leading-none">
              <div className="text-white font-bold text-xl tracking-wide uppercase">AKDAĞ</div>
              <div className="text-brand-gray-light text-[10px] tracking-[0.3em] uppercase">ELEKTRONİK</div>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={link.hasMega ? openMega : undefined}
                onMouseLeave={link.hasMega ? closeMega : undefined}
              >
                <Link
                  href={link.href}
                  className={`font-display font-semibold text-xs tracking-widest uppercase transition-colors duration-200 relative group flex items-center gap-1.5 ${pathname.startsWith(link.href) && (link.href !== '/' || pathname === '/') ? 'text-brand-red' : 'text-white/70 hover:text-white'
                    }`}
                >
                  {link.label}
                  {link.hasMega && (
                    <ChevronDown size={12} className={`transition-transform duration-300 ${megaOpen ? 'rotate-180' : ''}`} />
                  )}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-red transition-all duration-300 ${pathname.startsWith(link.href) && (link.href !== '/' || pathname === '/') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                </Link>
              </div>
            ))}
          </div>

          {/* Right Area */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/favoriler" className="text-white/50 hover:text-white transition-colors duration-200">
              <Heart size={16} />
            </Link>
            <Link href="/karsilastir" className="text-white/50 hover:text-white transition-colors duration-200">
              <GitCompare size={16} />
            </Link>
            <Link
              href="/urunler"
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-200 text-xs"
            >
              <Search size={16} />
              <span className="font-display uppercase font-bold tracking-widest">Arama</span>
            </Link>
            <CartIcon />
            {user && (
              <Link href="/bayi/hizli-siparis" className="text-white/50 hover:text-brand-red transition-colors duration-200 text-xs flex items-center gap-1.5 group">
                <Box size={16} className="group-hover:animate-pulse" />
                <span className="font-display uppercase font-bold tracking-widest hidden lg:block">Hızlı Sipariş</span>
              </Link>
            )}
            <Link
              href={user ? "/hesabim" : "/bayi"}
              className="font-display font-bold text-xs tracking-widest uppercase px-5 py-2.5 bg-brand-red text-white hover:bg-brand-red-dark transition-all duration-200 flex items-center gap-2"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              {user ? "HESABIM" : "BAYİ GİRİŞİ"}
            </Link>
          </div>

          {/* Hamburger */}
          <button className="md:hidden text-white p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* MEGA MENU — Desktop */}
        <div
          ref={megaRef}
          onMouseEnter={cancelClose}
          onMouseLeave={closeMega}
          className={`hidden md:block absolute left-0 right-0 top-full transition-all duration-300 origin-top ${megaOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
        >
          <div className="bg-[#0F0F0F]/[0.98] backdrop-blur-xl border-b border-white/5 shadow-2xl">
            <div className="h-[2px] bg-gradient-to-r from-transparent via-brand-red to-transparent opacity-50" />
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-12 min-h-[420px]">

                {/* Ana Kategoriler (SOL) */}
                <div className="col-span-3 border-r border-white/5 py-6">
                  <div className="px-6 mb-5">
                    <span className="font-display font-black text-[9px] tracking-[0.4em] uppercase text-white/20">ANA KATEGORİLER</span>
                  </div>
                  {NEW_KATEGORI_HIYERARSI.map((kat, i) => {
                    const Icon = KATEGORI_IKONLARI[i] || Box
                    const isActive = i === activeAna
                    return (
                      <button
                        key={kat.slug}
                        onMouseEnter={() => { setActiveAna(i); setActiveAlt(0) }}
                        className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all duration-200 group relative ${isActive ? 'bg-brand-red/5 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02]'
                          }`}
                      >
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] transition-all duration-300 ${isActive ? 'h-8 bg-brand-red' : 'h-0 bg-transparent'}`} />
                        <Icon size={16} className={isActive ? 'text-brand-red' : 'text-white/15 group-hover:text-white/30'} />
                        <span className="font-display font-bold text-[13px] uppercase tracking-wider flex-1 truncate">{kat.name}</span>
                        <ChevronRight size={14} className={isActive ? 'text-brand-red translate-x-1' : 'text-white/5 opacity-0 group-hover:opacity-100'} />
                      </button>
                    )
                  })}
                  <div className="px-6 mt-6 pt-6 border-t border-white/5">
                    <Link href="/urunler" className="flex items-center gap-2 text-brand-red font-display font-black text-[10px] tracking-[0.2em] uppercase hover:gap-3 transition-all">
                      TÜM KATALOG <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Alt Kategoriler (ORTA) */}
                <div className="col-span-4 border-r border-white/5 py-6 bg-white/[0.01]">
                  <div className="px-8 mb-5">
                    <span className="font-display font-black text-[9px] tracking-[0.4em] uppercase text-brand-red/40">{ana?.name}</span>
                  </div>
                  <div className="space-y-0.5">
                    {ana?.children?.map((sub, j) => {
                      const isActive = j === activeAlt
                      return (
                        <button
                          key={sub.slug}
                          onMouseEnter={() => setActiveAlt(j)}
                          className={`w-full text-left px-8 py-3.5 flex items-center justify-between transition-all duration-200 group ${isActive ? 'bg-white/[0.03] text-white' : 'text-white/30 hover:text-white/60'
                            }`}
                        >
                          <span className="font-display font-semibold text-[13px] uppercase tracking-wide truncate">{sub.name}</span>
                          <ChevronRight size={13} className={isActive ? 'text-brand-red translate-x-1' : 'text-white/5'} />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 3. Seviye / Detaylar (SAĞ) */}
                <div className="col-span-5 py-6 relative">
                  <div className="px-8 relative z-10">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="w-6 h-px bg-brand-red/50" />
                      <span className="font-display font-black text-[9px] tracking-[0.4em] uppercase text-white/30">{alt?.name}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {alt?.children?.map((d) => (
                        <Link
                          key={d.slug}
                          href={`/urunler/${ana.slug}/${alt.slug}/${d.slug}`}
                          className="flex items-center gap-3 px-4 py-2.5 text-white/40 hover:text-white hover:bg-white/[0.04] transition-all group rounded-sm border border-transparent hover:border-white/5"
                        >
                          <div className="w-1 h-1 rounded-full bg-white/10 group-hover:bg-brand-red group-hover:scale-150 transition-all" />
                          <span className="font-body text-sm font-medium">{d.name}</span>
                          <ChevronRight size={10} className="ml-auto text-white/0 group-hover:text-brand-red/50 group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5">
                      <Link
                        href={`/urunler/${ana.slug}/${alt?.slug}`}
                        className="inline-flex items-center gap-3 bg-brand-red/10 border border-brand-red/20 px-5 py-2.5 text-brand-red font-display font-bold text-[10px] tracking-[0.2em] uppercase hover:bg-brand-red hover:text-white transition-all"
                      >
                        TÜM {alt?.name} <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden bg-[#0A0A0A] border-t border-white/5 ${open ? 'max-h-screen' : 'max-h-0'}`}>
          <div className="px-6 py-8 space-y-6 overflow-y-auto max-h-[85vh]">

            {/* Search Box Mobile */}
            <div className="relative">
              <ProductSearch fullPage />
            </div>

            <div className="flex flex-col gap-1">
              {/* Ana Sayfa */}
              <Link href="/" className={`font-display font-black text-xs tracking-[0.3em] uppercase py-4 border-b border-white/5 ${pathname === '/' ? 'text-brand-red' : 'text-white/50'}`}>ANA SAYFA</Link>

              {/* Ürünler Accordion */}
              <div className="border-b border-white/5">
                <button onClick={() => setMobileKatOpen(!mobileKatOpen)} className={`w-full text-left font-display font-black text-xs tracking-[0.3em] uppercase py-4 flex items-center justify-between ${mobileKatOpen ? 'text-brand-red' : 'text-white/50'}`}>
                  ÜRÜNLER
                  <ChevronDown size={14} className={`transition-transform duration-300 ${mobileKatOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-500 ${mobileKatOpen ? 'max-h-[2000px] pb-6' : 'max-h-0'}`}>
                  {NEW_KATEGORI_HIYERARSI.map((kat, i) => {
                    const isAnaOpen = mobileAnaIdx === i
                    return (
                      <div key={kat.slug} className="mb-2 border-l border-white/5 ml-2">
                        <button onClick={() => setMobileAnaIdx(isAnaOpen ? null : i)} className={`w-full text-left pl-4 py-3 flex items-center justify-between group ${isAnaOpen ? 'text-white' : 'text-white/40'}`}>
                          <span className="font-display font-bold text-[11px] tracking-wider uppercase">{kat.name}</span>
                          <ChevronRight size={14} className={`transition-transform duration-300 ${isAnaOpen ? 'rotate-90 text-brand-red' : 'text-white/10'}`} />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${isAnaOpen ? 'max-h-[1500px]' : 'max-h-0'}`}>
                          {kat.children?.map((sub, j) => {
                            const isAltOpen = mobileAltIdx === j
                            return (
                              <div key={sub.slug} className="ml-4 border-l border-white/5">
                                <button onClick={() => setMobileAltIdx(isAltOpen ? null : j)} className={`w-full text-left pl-4 py-2.5 flex items-center justify-between ${isAltOpen ? 'text-white' : 'text-white/30'}`}>
                                  <span className="font-display font-semibold text-[10px] tracking-wider uppercase">{sub.name}</span>
                                  <ChevronRight size={12} className={`transition-transform duration-300 ${isAltOpen ? 'rotate-90 text-brand-red' : 'text-white/10'}`} />
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ${isAltOpen ? 'max-h-[1000px]' : 'max-h-0'}`}>
                                  {sub.children?.map(d => (
                                    <Link key={d.slug} href={`/urunler/${kat.slug}/${sub.slug}/${d.slug}`} className="block pl-8 py-2 font-body text-xs text-white/20 hover:text-brand-red transition-colors border-l border-transparent hover:border-brand-red ml-2">
                                      {d.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Diğer Linkler */}
              <Link href="/hakkimizda" className="font-display font-black text-xs tracking-[0.3em] uppercase py-4 border-b border-white/5 text-white/50">HAKKIMIZDA</Link>
              <Link href="/iletisim" className="font-display font-black text-xs tracking-[0.3em] uppercase py-4 border-b border-white/5 text-white/50">İLETİŞİM</Link>
              <Link href={user ? "/hesabim" : "/bayi"} className="font-display font-black text-xs tracking-[0.3em] uppercase py-4 border-b border-white/5 text-brand-red">
                {user ? "HESABIM" : "BAYİ GİRİŞİ"}
              </Link>
            </div>

            <div className="pt-6 space-y-4">
              <CartIcon />
              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <Link href="/favoriler" className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-white/40"><Heart size={18} /></Link>
                <Link href="/karsilastir" className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-white/40"><GitCompare size={18} /></Link>
              </div>
              <a href="tel:+903522316915" className="font-display font-bold text-xs tracking-widest uppercase text-white/50 py-3 flex items-center gap-2">
                <Phone size={13} />
                +90 352 231 69 15
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
