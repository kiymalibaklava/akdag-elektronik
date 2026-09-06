import Link from 'next/link'
import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react'
import AdLogo from './AdLogo'
import { KATEGORILER } from '@/lib/categories'

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <AdLogo size={40} />
            <div className="font-display leading-none">
              <div className="text-white font-bold text-xl tracking-wide uppercase">AKDAĞ</div>
              <div className="text-brand-gray-light text-xs tracking-[0.3em] uppercase">ELEKTRONİK</div>
            </div>
          </div>
          <p className="text-white/40 text-sm leading-relaxed font-body">
            Kayseri&apos;nin lider ses, ışık ve görüntü sistemleri firması. Profesyonel çözümler, güvenilir hizmet.
          </p>
          <div className="flex gap-3 mt-6">
            <a href="https://facebook.com/kayseriakdagelektronik" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:border-brand-red hover:text-brand-red transition-all duration-200">
              <Facebook size={16} />
            </a>
            <a href="https://www.instagram.com/akdagelektronik" target='_blank' rel='noopener noreferrer' aria-label="Instagram"
            className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:border-brand-red hover:text-brand-red transition-all duration-200">
              <Instagram size={16} />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-display font-bold text-sm tracking-widest uppercase text-white mb-6">Sayfalar</h4>
          <ul className="space-y-3">
            {[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Ürünler', href: '/urunler' },
              { label: 'Bayilik Başvurusu (B2B)', href: '/bayi/basvuru' },
              { label: 'Bayi Girişi', href: '/bayi' },
              { label: 'Proje Talebi (Ücretsiz Keşif)', href: '/proje-talebi' },
              { label: 'Hakkımızda', href: '/hakkimizda' },
              { label: 'İletişim', href: '/iletisim' },
              { label: 'Banka Hesaplarımız', href: '/banka-hesaplari' },
              { label: 'Sözleşmeler', href: '/mesafeli-satis-sozlesmesi' },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  prefetch={false}
                  className="text-white/40 hover:text-brand-red text-sm font-body transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-4 h-px bg-brand-red/0 group-hover:bg-brand-red/60 transition-all duration-200" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-display font-bold text-sm tracking-widest uppercase text-white mb-6">Ürün Kategorileri</h4>
          <ul className="space-y-3">
            {KATEGORILER.map((item) => (
              <li key={item}>
                <Link href="/urunler" prefetch={false} className="text-white/40 hover:text-brand-red text-sm font-body transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-4 h-px bg-brand-red/0 group-hover:bg-brand-red/60 transition-all duration-200" />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display font-bold text-sm tracking-widest uppercase text-white mb-6">İletişim</h4>
          <ul className="space-y-4">
            <li className="flex gap-3 text-sm font-body text-white/40">
              <MapPin size={15} className="text-brand-red shrink-0 mt-0.5" />
              <span>Cumhuriyet Mah. Sur Cad. No:17/A, Melikgazi / Kayseri</span>
            </li>
            <li>
              <a href="tel:+903522316915" className="flex gap-3 text-sm font-body text-white/40 hover:text-white transition-colors duration-200">
                <Phone size={15} className="text-brand-red shrink-0 mt-0.5" />
                +90 352 231 69 15
              </a>
            </li>
            <li>
              <a href="mailto:info@akdagelektronik.com.tr" className="flex gap-3 text-sm font-body text-white/40 hover:text-white transition-colors duration-200">
                <Mail size={15} className="text-brand-red shrink-0 mt-0.5" />
                info@akdagelektronik.com.tr
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/20 font-body">
          <span>© {new Date().getFullYear()} Akdağ Elektronik. Tüm hakları saklıdır.</span>
          <div className="flex gap-4">
            <Link href="/mesafeli-satis-sozlesmesi" prefetch={false} className="hover:text-white/50 transition-colors">Mesafeli Satış Sözleşmesi</Link>
            <Link href="/iptal-ve-iade" prefetch={false} className="hover:text-white/50 transition-colors">İptal ve İade</Link>
            <Link href="/gizlilik-politikasi" prefetch={false} className="hover:text-white/50 transition-colors">Gizlilik Politikası</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
