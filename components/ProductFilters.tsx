'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, Filter, X, RotateCcw, ChevronRight, FolderTree } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { NEW_KATEGORI_HIYERARSI } from '@/lib/categories'

interface FilterProps {
  markalar: string[]
  kullanimAlanlari: string[]
  searchParams: Record<string, string | undefined>
  slugArray: string[]
}

export default function ProductFilters({ markalar, kullanimAlanlari, searchParams, slugArray }: FilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [brandSearch, setBrandSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (isOpen) {
      const orig = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false)
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = orig
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, mounted])

  const clearFiltersUrl = slugArray.length > 0 ? `/urunler/${slugArray.join('/')}` : '/urunler'

  const hasFilters = !!(
    (searchParams.marka && searchParams.marka !== 'tum') ||
    (searchParams.kullanim && searchParams.kullanim !== 'tum') ||
    (searchParams.stok && searchParams.stok !== 'tum') ||
    searchParams.min ||
    searchParams.max ||
    searchParams.q ||
    (searchParams.sirala && searchParams.sirala !== 'yeni')
  )

  const filteredBrands = brandSearch.trim()
    ? markalar.filter((m) => m.toLowerCase().includes(brandSearch.trim().toLowerCase()))
    : markalar

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams()

    const q = formData.get('q') as string
    if (q) params.set('q', q)

    const marka = formData.get('marka') as string
    if (marka && marka !== 'tum') params.set('marka', marka)

    const min = formData.get('min') as string
    if (min) params.set('min', min)

    const max = formData.get('max') as string
    if (max) params.set('max', max)

    const stok = formData.get('stok') as string
    if (stok && stok !== 'tum') params.set('stok', stok)

    const sirala = formData.get('sirala') as string
    if (sirala && sirala !== 'yeni') params.set('sirala', sirala)

    const kullanim = formData.get('kullanim') as string
    if (kullanim && kullanim !== 'tum') params.set('kullanim', kullanim)

    setIsOpen(false)
    const qs = params.toString()
    router.push(qs ? `${clearFiltersUrl}?${qs}` : clearFiltersUrl)
  }

  const activeRootSlug = slugArray[0] || ''

  const renderFormFields = (formId: string) => (
    <form
      className="space-y-6"
      id={formId}
      action={clearFiltersUrl}
      method="GET"
      onSubmit={handleSubmit}
    >
      {searchParams.q && <input type="hidden" name="q" value={searchParams.q} />}

      {/* Kategoriler (Sescim 9 Ana Kategori Ağacı) */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-[10px] font-display font-black uppercase text-white tracking-[0.2em] border-b border-white/10 pb-2">
          <FolderTree size={12} className="text-brand-red" />
          <span>Kategoriler</span>
        </div>
        <ul className="space-y-1">
          <li>
            <Link
              href="/urunler"
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-body transition-colors ${
                slugArray.length === 0
                  ? 'bg-brand-red/10 text-brand-red font-bold'
                  : 'text-white/65 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Tüm Ürünler</span>
              <ChevronRight size={12} className="opacity-50" />
            </Link>
          </li>
          {NEW_KATEGORI_HIYERARSI.map((kat) => {
            const isActive = activeRootSlug === kat.slug
            return (
              <li key={kat.slug}>
                <Link
                  href={searchParams.marka ? `/urunler/${kat.slug}?marka=${encodeURIComponent(searchParams.marka)}` : `/urunler/${kat.slug}`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-body transition-colors ${
                    isActive
                      ? 'bg-brand-red/10 text-brand-red font-bold'
                      : 'text-white/65 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{kat.name}</span>
                  <ChevronRight size={12} className={isActive ? 'text-brand-red' : 'opacity-40'} />
                </Link>
                {isActive && kat.children && kat.children.length > 0 && (
                  <ul className="ml-3 mt-1 pl-2.5 border-l border-white/10 space-y-1">
                    {kat.children.map((sub) => {
                      const isSubActive = slugArray[1] === sub.slug
                      return (
                        <li key={sub.slug}>
                          <Link
                            href={`/urunler/${kat.slug}/${sub.slug}`}
                            onClick={() => setIsOpen(false)}
                            className={`block py-1 text-[11px] font-body transition-colors ${
                              isSubActive ? 'text-brand-red font-bold' : 'text-white/50 hover:text-white'
                            }`}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {/* Markalar */}
      <div className="space-y-3">
        <label className="block text-[10px] font-display font-black uppercase text-white tracking-[0.2em] border-b border-white/10 pb-2">
          Markalar
        </label>
        <input
          type="text"
          value={brandSearch}
          onChange={(e) => setBrandSearch(e.target.value)}
          placeholder="Marka ara..."
          className="input-dark text-xs py-2 px-3 rounded-lg"
        />
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
          <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
            <input
              type="radio"
              name="marka"
              value="tum"
              defaultChecked={!searchParams.marka || searchParams.marka === 'tum'}
              className="w-3.5 h-3.5 accent-brand-red"
            />
            <span className="text-xs font-body font-medium text-white/70 group-hover:text-brand-red transition-colors">
              Tüm Markalar
            </span>
          </label>
          {filteredBrands.map((m) => (
            <label key={m} className="flex items-center gap-2.5 cursor-pointer group py-0.5">
              <input
                type="radio"
                name="marka"
                value={m}
                defaultChecked={searchParams.marka?.toLowerCase() === m.toLowerCase()}
                className="w-3.5 h-3.5 accent-brand-red"
              />
              <span className="text-xs font-body font-medium text-white/70 group-hover:text-brand-red transition-colors truncate">
                {m.toUpperCase()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Kullanım Alanı */}
      {kullanimAlanlari.length > 0 && (
        <div className="space-y-3">
          <label className="block text-[10px] font-display font-black uppercase text-white tracking-[0.2em] border-b border-white/10 pb-2">
            Kullanım Alanı
          </label>
          <select
            name="kullanim"
            defaultValue={searchParams.kullanim || 'tum'}
            className="input-dark text-xs py-2.5 px-3 rounded-lg cursor-pointer"
          >
            <option value="tum">Tüm Alanlar</option>
            {kullanimAlanlari.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Fiyat Aralığı */}
      <div className="space-y-3">
        <label className="block text-[10px] font-display font-black uppercase text-white tracking-[0.2em] border-b border-white/10 pb-2">
          Fiyat Aralığı (₺)
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 text-xs">₺</span>
            <input
              name="min"
              type="number"
              min="0"
              defaultValue={searchParams.min || ''}
              className="input-dark text-xs py-2.5 pl-6 pr-2 rounded-lg"
              placeholder="Min"
            />
          </div>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 text-xs">₺</span>
            <input
              name="max"
              type="number"
              min="0"
              defaultValue={searchParams.max || ''}
              className="input-dark text-xs py-2.5 pl-6 pr-2 rounded-lg"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* Stok Durumu */}
      <div className="space-y-2.5">
        <label className="block text-[10px] font-display font-black uppercase text-white tracking-[0.2em] border-b border-white/10 pb-2">
          Stok Durumu
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="stok"
              value="tum"
              defaultChecked={!searchParams.stok || searchParams.stok === 'tum'}
              className="w-3.5 h-3.5 accent-brand-red"
            />
            <span className="text-xs font-body font-medium text-white/70 group-hover:text-brand-red transition-colors">
              Tümü
            </span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="stok"
              value="stokta"
              defaultChecked={searchParams.stok === 'stokta'}
              className="w-3.5 h-3.5 accent-brand-red"
            />
            <span className="text-xs font-body font-medium text-white/70 group-hover:text-brand-red transition-colors">
              Sadece Stoktakiler
            </span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="stok"
              value="siparise_gore"
              defaultChecked={searchParams.stok === 'siparise_gore'}
              className="w-3.5 h-3.5 accent-brand-red"
            />
            <span className="text-xs font-body font-medium text-white/70 group-hover:text-brand-red transition-colors">
              Siparişe Göre
            </span>
          </label>
        </div>
      </div>

      {/* Sıralama */}
      <div className="space-y-2.5">
        <label className="block text-[10px] font-display font-black uppercase text-white tracking-[0.2em] border-b border-white/10 pb-2">
          Sıralama
        </label>
        <select
          name="sirala"
          defaultValue={searchParams.sirala || 'yeni'}
          className="input-dark text-xs py-2.5 px-3 rounded-lg cursor-pointer font-body"
        >
          <option value="yeni">Önerilen &amp; En Yeniler</option>
          <option value="fiyat_artan">Fiyat (Düşükten Yükseğe)</option>
          <option value="fiyat_azalan">Fiyat (Pahalıdan Ucuza)</option>
          <option value="ad_asc">İsim (A-Z)</option>
          <option value="ad_desc">İsim (Z-A)</option>
        </select>
      </div>
    </form>
  )

  return (
    <>
      {/* Mobil Tetikleyici Buton (Sescim Drawer Stili) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden w-full flex items-center justify-between bg-[#141414] border border-white/10 rounded-xl p-4 hover:border-brand-red transition-colors shadow-sm"
      >
        <div className="flex items-center gap-3">
          <SlidersHorizontal size={18} className="text-brand-red" />
          <span className="font-display font-black text-xs tracking-[0.15em] uppercase text-white">
            Filtrele &amp; Sırala
          </span>
        </div>
        {hasFilters && <span className="w-2.5 h-2.5 rounded-full bg-brand-red animate-pulse" />}
      </button>

      {/* Masaüstü Sabit Sol Sidebar (Sescim 2 Kolonlu Katalog Yapısı) */}
      <aside className="hidden lg:block bg-[#141414] border border-white/10 rounded-2xl overflow-hidden sticky top-24 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-brand-red" />
            <span className="font-display font-black text-xs tracking-[0.18em] uppercase text-white">
              FİLTRELER
            </span>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={() => router.push(clearFiltersUrl)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/50 hover:text-brand-red transition-colors cursor-pointer"
            >
              <RotateCcw size={11} />
              Temizle
            </button>
          )}
        </div>

        <div className="p-5">{renderFormFields('desktop-filter-form')}</div>

        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex gap-2">
          {hasFilters && (
            <button
              type="button"
              onClick={() => router.push(clearFiltersUrl)}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-display font-bold tracking-widest uppercase transition-colors rounded-xl cursor-pointer"
            >
              Sıfırla
            </button>
          )}
          <button
            type="submit"
            form="desktop-filter-form"
            className="flex-1 bg-brand-red hover:bg-brand-red-dark text-white flex items-center justify-center gap-2 text-xs py-2.5 font-display font-bold tracking-widest uppercase transition-colors rounded-xl shadow-md cursor-pointer"
          >
            <Filter size={14} />
            Uygula
          </button>
        </div>
      </aside>

      {/* Mobil Yan Pencere (Drawer - Framer Motion) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div className="fixed inset-0 z-[9999] lg:hidden">
                <motion.div
                  key="filter-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/75 backdrop-blur-sm"
                  onClick={() => setIsOpen(false)}
                />

                <motion.div
                  key="filter-panel"
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                  className="fixed top-0 left-0 h-[100dvh] max-h-[100dvh] w-[300px] sm:w-[340px] bg-[#141414] z-[10000] shadow-2xl flex flex-col border-r border-white/10"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0F0F0F] shrink-0">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal size={17} className="text-brand-red" />
                      <span className="font-display font-black text-sm tracking-[0.15em] uppercase text-white">
                        FİLTRELER
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="text-white/50 hover:text-brand-red transition-colors cursor-pointer"
                      aria-label="Kapat"
                    >
                      <X size={22} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {renderFormFields('mobile-filter-form')}
                  </div>

                  <div className="p-4 bg-[#0F0F0F] border-t border-white/10 flex gap-2.5 shrink-0">
                    {hasFilters && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false)
                          router.push(clearFiltersUrl)
                        }}
                        className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-display font-bold tracking-widest uppercase transition-colors rounded-xl cursor-pointer"
                      >
                        Temizle
                      </button>
                    )}
                    <button
                      type="submit"
                      form="mobile-filter-form"
                      className="flex-1 bg-brand-red hover:bg-brand-red-dark text-white flex items-center justify-center gap-2 text-xs py-3 font-display font-bold tracking-widest uppercase transition-colors rounded-xl shadow-md cursor-pointer"
                    >
                      <Filter size={14} />
                      Uygula
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}
