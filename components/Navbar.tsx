'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, Phone, Heart, GitCompare, ChevronRight, ChevronDown, Speaker, Lightbulb, Monitor, Box, Plug, Briefcase } from 'lucide-react'
import AdLogo from './AdLogo'
import CartIcon from './CartIcon'
import KurGostergesi from './KurGostergesi'
import { KATEGORI_HIYERARSI, type AnaKategori } from '@/lib/categories'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const navLinks = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/urunler', label: 'Ürünler', hasMega: true },
  { href: '/hakkimizda', label: 'Hakkımızda' },
  { href: '/iletisim', label: 'İletişim' },
]

/** Ana kategori ikonları — sırası KATEGORI_HIYERARSI ile eşleşir */
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
    supabase.auth.getSession().then(({ data }: any) => setUser(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: any, session: any) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Mega menü açıkken sayfa değişince kapat
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

  const ana = KATEGORI_HIYERARSI[activeAna]
  const alt = ana?.altKategoriler[activeAlt]

  return (
    <>
      {/* Top bar */}
      <div className="bg-brand-red text-white text-xs font-body tracking-wider">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
          <span className="opacity-80 hidden sm:block">Cumhuriyet Mah. Sur Cad. No:17/A, Melikgazi / Kayseri</span>
          <a href="tel:+903522316915" className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity">
            <Phone size={11} />
            +90 352 231 69 15
          </a>
        </div>
      </div>

      {/* Kur bar */}
      <div className="bg-[#0A0A0A] border-b border-white/5 py-1.5 px-6">
        <div className="max-w-7xl mx-auto flex justify-end">
          <KurGostergesi />
        </div>
      </div>

      {/* Main nav */}
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-[#0F0F0F]/95 backdrop-blur-md border-b border-white/5 shadow-2xl' : 'bg-[#0F0F0F]'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <AdLogo size={40} />
            <div className="font-display leading-none">
              <div className="text-white font-bold text-xl tracking-wide uppercase">AKDAĞ</div>
              <div className="text-brand-gray-light text-xs tracking-[0.3em] uppercase">ELEKTRONİK</div>
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
                  className={`font-display font-semibold text-sm tracking-widest uppercase transition-colors duration-200 relative group flex items-center gap-1.5 ${
                    pathname === link.href || (link.hasMega && megaOpen) ? 'text-brand-red' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {link.label}
                  {link.hasMega && (
                    <ChevronDown size={12} className={`transition-transform duration-300 ${megaOpen ? 'rotate-180' : ''}`} />
                  )}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-red transition-all duration-300 ${
                    pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              </div>
            ))}
          </div>

          {/* Right: Ara + Bayi Girişi */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/favoriler" className="text-white/50 hover:text-white transition-colors duration-200">
              <Heart size={16} />
            </Link>
            <Link href="/karsilastir" className="text-white/50 hover:text-white transition-colors duration-200">
              <GitCompare size={16} />
            </Link>
            <Link
              href="/urunler"
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-200 text-sm"
            >
              <Search size={16} />
              <span className="font-body">Ürün Ara</span>
            </Link>
            <CartIcon />
            <Link
              href={user ? "/hesabim" : "/bayi"}
              className="font-display font-bold text-xs tracking-widest uppercase px-5 py-2.5 bg-brand-red text-white hover:bg-brand-red-dark transition-all duration-200 flex items-center gap-2"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {user ? "Hesabım" : "Bayi Girişi"}
            </Link>
          </div>

          {/* Hamburger */}
          <button className="md:hidden text-white p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ═══════════════════════════════════════════
            MEGA MENU — Desktop
        ═══════════════════════════════════════════ */}
        <div
          ref={megaRef}
          onMouseEnter={cancelClose}
          onMouseLeave={closeMega}
          className={`hidden md:block absolute left-0 right-0 top-full transition-all duration-300 origin-top ${
            megaOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="bg-[#0F0F0F]/[0.98] backdrop-blur-xl border-b border-white/5 shadow-2xl">
            {/* Kırmızı üst çizgi */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-brand-red to-transparent" />

            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-12 min-h-[360px]">

                {/* ── SOL: Ana Kategoriler ─────────────── */}
                <div className="col-span-3 border-r border-white/5 py-5">
                  <div className="px-5 mb-4">
                    <span className="font-display font-semibold text-[10px] tracking-[0.3em] uppercase text-white/25">
                      Kategoriler
                    </span>
                  </div>
                  {KATEGORI_HIYERARSI.map((kat, i) => {
                    const Icon = KATEGORI_IKONLARI[i] || Speaker
                    const isActive = i === activeAna
                    return (
                      <button
                        key={kat.label}
                        onMouseEnter={() => { setActiveAna(i); setActiveAlt(0) }}
                        onClick={() => { setActiveAna(i); setActiveAlt(0) }}
                        className={`w-full text-left px-5 py-3.5 flex items-center gap-3 transition-all duration-200 group relative ${
                          isActive
                            ? 'bg-brand-red/10 text-white'
                            : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                        }`}
                      >
                        {/* Sol kırmızı çubuk */}
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-300 ${
                          isActive ? 'h-8 bg-brand-red' : 'h-0 bg-transparent'
                        }`} />

                        <div className={`w-8 h-8 flex items-center justify-center border transition-all duration-200 ${
                          isActive
                            ? 'bg-brand-red border-brand-red text-white'
                            : 'bg-transparent border-white/10 text-white/30 group-hover:border-brand-red/40 group-hover:text-brand-red'
                        }`}>
                          <Icon size={15} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-display font-bold text-sm uppercase tracking-wide truncate">{kat.label}</div>
                          <div className={`font-body text-[10px] tracking-wider uppercase transition-colors ${
                            isActive ? 'text-brand-red' : 'text-white/20'
                          }`}>{kat.labelEn}</div>
                        </div>

                        <ChevronRight size={13} className={`flex-shrink-0 transition-all duration-200 ${
                          isActive ? 'text-brand-red translate-x-0.5' : 'text-white/15'
                        }`} />
                      </button>
                    )
                  })}

                  {/* Tüm ürünler linki */}
                  <div className="px-5 mt-4 pt-4 border-t border-white/5">
                    <Link
                      href="/urunler"
                      onClick={() => setMegaOpen(false)}
                      className="flex items-center gap-2 text-brand-red font-display font-semibold text-xs tracking-widest uppercase hover:gap-3 transition-all duration-300"
                    >
                      Tüm Ürünleri Gör
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>

                {/* ── ORTA: Alt Kategoriler ────────────── */}
                <div className="col-span-4 border-r border-white/5 py-5">
                  <div className="px-6 mb-4">
                    <span className="font-display font-semibold text-[10px] tracking-[0.3em] uppercase text-brand-red/60">
                      {ana?.label}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {ana?.altKategoriler.map((sub, j) => {
                      const isActive = j === activeAlt
                      return (
                        <button
                          key={sub.label}
                          onMouseEnter={() => setActiveAlt(j)}
                          onClick={() => setActiveAlt(j)}
                          className={`w-full text-left px-6 py-3 flex items-center justify-between gap-3 transition-all duration-200 group ${
                            isActive
                              ? 'bg-white/[0.04] text-white'
                              : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-200 flex-shrink-0 ${
                              isActive ? 'bg-brand-red scale-125' : 'bg-white/15'
                            }`} />
                            <span className="font-display font-semibold text-sm uppercase tracking-wide truncate">
                              {sub.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`font-body text-[10px] transition-colors ${
                              isActive ? 'text-white/30' : 'text-white/10'
                            }`}>
                              {sub.detaylar.length}
                            </span>
                            <ChevronRight size={11} className={`transition-all duration-200 ${
                              isActive ? 'text-brand-red translate-x-0.5' : 'text-white/10'
                            }`} />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* ── SAĞ: Detaylar ───────────────────── */}
                <div className="col-span-5 py-5 relative">
                  {/* Arka plan süsü */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-red/[0.02] to-transparent pointer-events-none" />

                  <div className="relative px-6">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="w-5 h-px bg-brand-red" />
                      <span className="font-display font-semibold text-[10px] tracking-[0.3em] uppercase text-white/25">
                        {alt?.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-1">
                      {alt?.detaylar.map((detay) => (
                        <Link
                          key={detay}
                          href={`/urunler?kategori=${encodeURIComponent(ana.label)}&alt=${encodeURIComponent(alt.label)}&urun_tipi=${encodeURIComponent(detay)}`}
                          onClick={() => setMegaOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-white/45 hover:text-white hover:bg-white/[0.04] transition-all duration-200 group rounded-sm"
                        >
                          <div className="w-1 h-1 bg-brand-red/40 group-hover:bg-brand-red group-hover:scale-150 transition-all duration-200 rounded-full flex-shrink-0" />
                          <span className="font-body text-sm">{detay}</span>
                          <ChevronRight size={10} className="ml-auto text-white/0 group-hover:text-brand-red/60 transition-all duration-200" />
                        </Link>
                      ))}
                    </div>

                    {/* Alt kısım: kategoriye link */}
                    <div className="mt-6 pt-4 border-t border-white/5">
                      <Link
                        href={`/urunler?kategori=${encodeURIComponent(ana?.label || '')}`}
                        onClick={() => setMegaOpen(false)}
                        className="inline-flex items-center gap-2 bg-brand-red/10 border border-brand-red/20 px-4 py-2 text-brand-red font-display font-semibold text-xs tracking-widest uppercase hover:bg-brand-red hover:text-white transition-all duration-300"
                      >
                        {ana?.label} Ürünleri
                        <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            MOBILE MENU
        ═══════════════════════════════════════════ */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${open ? 'max-h-[80vh] border-t border-white/5' : 'max-h-0'}`}>
          <div className="px-6 py-4 flex flex-col gap-1 overflow-y-auto max-h-[70vh]">
            {/* Ana Sayfa */}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className={`font-display font-semibold text-sm tracking-widest uppercase py-3 border-b border-white/5 ${
                pathname === '/' ? 'text-brand-red' : 'text-white/70'
              }`}
            >
              Ana Sayfa
            </Link>

            {/* Ürünler — Accordion */}
            <div className="border-b border-white/5">
              <button
                onClick={() => setMobileKatOpen(!mobileKatOpen)}
                className={`w-full text-left font-display font-semibold text-sm tracking-widest uppercase py-3 flex items-center justify-between ${
                  pathname === '/urunler' || mobileKatOpen ? 'text-brand-red' : 'text-white/70'
                }`}
              >
                Ürünler
                <ChevronDown size={14} className={`transition-transform duration-300 ${mobileKatOpen ? 'rotate-180' : ''}`} />
              </button>

              <div className={`overflow-hidden transition-all duration-400 ${mobileKatOpen ? 'max-h-[999px] pb-3' : 'max-h-0'}`}>
                {/* Tüm ürünler */}
                <Link
                  href="/urunler"
                  onClick={() => setOpen(false)}
                  className="block pl-4 py-2 text-brand-red font-display font-semibold text-xs tracking-widest uppercase"
                >
                  → Tüm Ürünleri Gör
                </Link>

                {/* Ana kategoriler */}
                {KATEGORI_HIYERARSI.map((kat, i) => {
                  const Icon = KATEGORI_IKONLARI[i] || Speaker
                  const isAnaOpen = mobileAnaIdx === i
                  return (
                    <div key={kat.label} className="ml-2">
                      <button
                        onClick={() => { setMobileAnaIdx(isAnaOpen ? null : i); setMobileAltIdx(null) }}
                        className={`w-full text-left pl-3 pr-2 py-2.5 flex items-center gap-2.5 transition-colors ${
                          isAnaOpen ? 'text-white' : 'text-white/50'
                        }`}
                      >
                        <Icon size={13} className={isAnaOpen ? 'text-brand-red' : 'text-white/25'} />
                        <span className="font-display font-semibold text-xs tracking-widest uppercase flex-1">{kat.label}</span>
                        <ChevronDown size={12} className={`transition-transform duration-200 ${isAnaOpen ? 'rotate-180 text-brand-red' : 'text-white/20'}`} />
                      </button>

                      <div className={`overflow-hidden transition-all duration-300 ${isAnaOpen ? 'max-h-[999px]' : 'max-h-0'}`}>
                        {kat.altKategoriler.map((sub, j) => {
                          const isAltOpen = mobileAltIdx === j
                          return (
                            <div key={sub.label} className="ml-6">
                              <button
                                onClick={() => setMobileAltIdx(isAltOpen ? null : j)}
                                className={`w-full text-left py-2 flex items-center gap-2 transition-colors ${
                                  isAltOpen ? 'text-white' : 'text-white/40'
                                }`}
                              >
                                <div className={`w-1 h-1 rounded-full ${isAltOpen ? 'bg-brand-red' : 'bg-white/20'}`} />
                                <span className="font-display text-xs tracking-wider uppercase flex-1">{sub.label}</span>
                                <ChevronDown size={10} className={`transition-transform duration-200 ${isAltOpen ? 'rotate-180 text-brand-red' : 'text-white/15'}`} />
                              </button>

                              <div className={`overflow-hidden transition-all duration-200 ${isAltOpen ? 'max-h-[400px]' : 'max-h-0'}`}>
                                {sub.detaylar.map((d) => (
                                  <Link
                                    key={d}
                                    href={`/urunler?kategori=${encodeURIComponent(kat.label)}&alt=${encodeURIComponent(sub.label)}&urun_tipi=${encodeURIComponent(d)}`}
                                    onClick={() => setOpen(false)}
                                    className="block pl-6 py-1.5 font-body text-xs text-white/30 hover:text-brand-red transition-colors"
                                  >
                                    {d}
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

            {/* Diğer linkler */}
            <Link
              href="/hakkimizda"
              onClick={() => setOpen(false)}
              className={`font-display font-semibold text-sm tracking-widest uppercase py-3 border-b border-white/5 ${
                pathname === '/hakkimizda' ? 'text-brand-red' : 'text-white/70'
              }`}
            >
              Hakkımızda
            </Link>
            <Link
              href="/iletisim"
              onClick={() => setOpen(false)}
              className={`font-display font-semibold text-sm tracking-widest uppercase py-3 border-b border-white/5 ${
                pathname === '/iletisim' ? 'text-brand-red' : 'text-white/70'
              }`}
            >
              İletişim
            </Link>
            <Link
              href="/favoriler"
              onClick={() => setOpen(false)}
              className="font-display font-semibold text-sm tracking-widest uppercase py-3 border-b border-white/5 text-white/70"
            >
              Favoriler
            </Link>
            <Link
              href="/karsilastir"
              onClick={() => setOpen(false)}
              className="font-display font-semibold text-sm tracking-widest uppercase py-3 border-b border-white/5 text-white/70"
            >
              Karşılaştırma
            </Link>
            <Link
              href={user ? "/hesabim" : "/bayi"}
              onClick={() => setOpen(false)}
              className="font-display font-bold text-xs tracking-widest uppercase text-brand-red py-3 border-b border-white/5"
            >
              {user ? "Hesabım" : "Bayi Girişi"}
            </Link>
            <a
              href="tel:+903522316915"
              className="font-display font-bold text-xs tracking-widest uppercase text-white/50 py-3 flex items-center gap-2"
            >
              <Phone size={13} />
              +90 352 231 69 15
            </a>
          </div>
        </div>
      </nav>
    </>
  )
}
