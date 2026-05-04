'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, Phone, Heart, GitCompare } from 'lucide-react'
import AdLogo from './AdLogo'
import CartIcon from './CartIcon'
import KurGostergesi from './KurGostergesi'

const navLinks = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/urunler', label: 'Ürünler' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
  { href: '/iletisim', label: 'İletişim' },
]

const rightLinks = [
  { href: '/bayi', label: 'Bayi Girişi' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
              <Link
                key={link.href}
                href={link.href}
                className={`font-display font-semibold text-sm tracking-widest uppercase transition-colors duration-200 relative group ${
                  pathname === link.href ? 'text-brand-red' : 'text-white/70 hover:text-white'
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-red transition-all duration-300 ${
                  pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
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
              href="/bayi"
              className="font-display font-bold text-xs tracking-widest uppercase px-5 py-2.5 bg-brand-red text-white hover:bg-brand-red-dark transition-all duration-200 flex items-center gap-2"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Bayi Girişi
            </Link>
          </div>

          {/* Hamburger */}
          <button className="md:hidden text-white p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${open ? 'max-h-80 border-t border-white/5' : 'max-h-0'}`}>
          <div className="px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`font-display font-semibold text-sm tracking-widest uppercase py-2 border-b border-white/5 ${
                  pathname === link.href ? 'text-brand-red' : 'text-white/70'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/favoriler"
              onClick={() => setOpen(false)}
              className="font-display font-semibold text-sm tracking-widest uppercase py-2 border-b border-white/5 text-white/70"
            >
              Favoriler
            </Link>
            <Link
              href="/karsilastir"
              onClick={() => setOpen(false)}
              className="font-display font-semibold text-sm tracking-widest uppercase py-2 border-b border-white/5 text-white/70"
            >
              Karşılaştırma
            </Link>
            <Link
              href="/bayi"
              onClick={() => setOpen(false)}
              className="font-display font-bold text-xs tracking-widest uppercase text-brand-red py-2 border-b border-white/5"
            >
              Bayi Girişi
            </Link>
            <a
              href="tel:+903522316915"
              className="font-display font-bold text-xs tracking-widest uppercase text-white/50 py-2 flex items-center gap-2"
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
