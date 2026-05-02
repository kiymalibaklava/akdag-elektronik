import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export const metadata = {
  title: 'İletişim | Akdağ Elektronik',
  description: 'Akdağ Elektronik iletişim bilgileri. Kayseri\'de ses, ışık ve görüntü sistemleri için bize ulaşın.',
}

export default function IletisimPage() {
  return (
    <div className="min-h-screen pt-8 pb-24">
      {/* Header */}
      <div className="bg-[#0A0A0A] border-b border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-brand-red" />
            <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Bize Ulaşın</span>
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl uppercase text-white">
            İLETİŞİM
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Contact info */}
          <div>
            <h2 className="font-display font-bold text-2xl uppercase text-white tracking-wide mb-10 red-line">
              İletişim Bilgileri
            </h2>

            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="w-12 h-12 bg-brand-red/10 border border-brand-red/20 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-brand-red" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm uppercase tracking-widest text-white mb-1">Adres</div>
                  <p className="font-body text-white/50 leading-relaxed">
                    Cumhuriyet Mah. Sur Cad. No:17/A<br />
                    38040 Melikgazi / Kayseri
                  </p>
                  <a
                    href="https://maps.google.com/?q=Akdağ+Elektronik,+Sur+Caddesi+17A,+Melikgazi,+Kayseri"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-brand-red text-xs mt-2 hover:underline"
                  >
                    Google Maps'te Aç →
                  </a>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 bg-brand-red/10 border border-brand-red/20 flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-brand-red" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm uppercase tracking-widest text-white mb-1">Telefon</div>
                  <a href="tel:+903522316915" className="font-body text-white/50 hover:text-brand-red transition-colors text-lg font-semibold">
                    +90 352 231 69 15
                  </a>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 bg-brand-red/10 border border-brand-red/20 flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-brand-red" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm uppercase tracking-widest text-white mb-1">E-posta</div>
                  <a href="mailto:info@akdagelektronik.com" className="font-body text-white/50 hover:text-brand-red transition-colors">
                    info@akdagelektronik.com
                  </a>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 bg-brand-red/10 border border-brand-red/20 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-brand-red" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm uppercase tracking-widest text-white mb-1">Çalışma Saatleri</div>
                  <div className="font-body text-white/50 space-y-1">
                    <p>Pazartesi – Cumartesi: 09:00 – 18:30</p>
                    <p>Pazar: Kapalı</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Harita — Cumhuriyet Mah. Sur Cad. No:17/A, Melikgazi, Kayseri */}
            <div className="mt-10 border border-white/5 overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3060.5!2d35.48120!3d38.72870!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x152b1c8e2e2e2e2f%3A0x0!2zQWtkYcSfIEVsZWt0cm9uaWssIFN1ciBDYWRkZXNpIE5vOjE3QSwgTWVsaWtnYXppLCBLYXlzZXJp!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str"
                width="100%"
                height="280"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Akdağ Elektronik Konum"
              />
            </div>

            {/* Harita yedek linki */}
            <a
              href="https://maps.google.com/?q=38.7287,35.4812"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-white/30 hover:text-brand-red text-xs transition-colors"
            >
              <MapPin size={12} />
              Haritada göster
            </a>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="font-display font-bold text-2xl uppercase text-white tracking-wide mb-10 red-line">
              Mesaj Gönderin
            </h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactForm() {
  return (
    <form className="space-y-5" action="mailto:info@akdagelektronik.com" method="post" encType="text/plain">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Ad</label>
          <input name="ad" type="text" className="input-dark" placeholder="Adınız" required />
        </div>
        <div>
          <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Soyad</label>
          <input name="soyad" type="text" className="input-dark" placeholder="Soyadınız" />
        </div>
      </div>
      <div>
        <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Telefon</label>
        <input name="telefon" type="tel" className="input-dark" placeholder="+90 5xx xxx xx xx" />
      </div>
      <div>
        <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">E-posta</label>
        <input name="email" type="email" className="input-dark" placeholder="email@ornek.com" />
      </div>
      <div>
        <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Konu</label>
        <select name="konu" className="input-dark appearance-none cursor-pointer">
          <option value="">Konu seçin</option>
          <option>Ses Sistemleri</option>
          <option>Işık Sistemleri</option>
          <option>Görüntü Sistemleri</option>
          <option>AKUSTEK Okul Saati</option>
          <option>Servis & Teknik Destek</option>
          <option>Diğer</option>
        </select>
      </div>
      <div>
        <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">Mesaj</label>
        <textarea name="mesaj" rows={5} className="input-dark resize-none" placeholder="Mesajınızı buraya yazın..." required />
      </div>
      <button type="submit" className="btn-primary w-full justify-center text-sm">
        Mesaj Gönder
      </button>

      {/* Direkt arama seçeneği */}
      <div className="text-center pt-2">
        <p className="text-white/20 text-xs mb-3">veya</p>
        <a
          href="tel:+903522316915"
          className="btn-outline w-full justify-center text-sm"
        >
          <Phone size={14} />
          Hemen Arayın: +90 352 231 69 15
        </a>
      </div>
    </form>
  )
}
