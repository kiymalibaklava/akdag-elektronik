import { Award, Users, MapPin, Phone, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hakkımızda | Akdağ Elektronik',
  description: 'Akdağ Elektronik hakkında bilgi edinin. Kayseri\'nin 25 yıllık ses, ışık ve görüntü sistemleri uzmanı.',
}

const ekip = [
  { ad: 'Mustafa Akdağ', unvan: 'Kurucu & Genel Müdür', tecrube: '25+ Yıl' },
]

const degerler = [
  { icon: Award,        baslik: 'Kalite Güvencesi',    aciklama: 'Sadece orijinal ve garantili ürünler satıyoruz. Her ürün için resmi distribütörlük belgelerine sahibiz.' },
  { icon: Users,        baslik: 'Müşteri Odaklılık',   aciklama: 'Her projeyi özgün bir çözümle ele alıyor, müşterinin ihtiyacına en uygun sistemi tasarlıyoruz.' },
  { icon: CheckCircle,  baslik: 'Teknik Uzmanlık',     aciklama: 'Sertifikalı mühendis ve teknisyen kadromuzla kurulum, devreye alma ve servis hizmeti veriyoruz.' },
  { icon: Clock,        baslik: 'Sürekli Destek',      aciklama: 'Satış sonrası hizmet anlayışımızla müşterilerimize teknik destek sağlıyoruz.' },
]

const hizmetler = [
  'Profesyonel Ses Sistemleri Kurulum ve Satış',
  'Sahne ve Gösteri Işık Sistemleri',
  'LED Ekran ve Görüntü Sistemleri',
  'Simultune Konferans Sistemleri',
  'AKUSTEK Akıllı Okul Saati — Ana Bayi',
  'Cami Ses Sistemleri',
  'Düğün Salonu Ses ve Işık Paketleri',
  'Okul ve Üniversite Ses Sistemleri',
  'Teknik Servis ve Bakım Hizmetleri',
]

const referanslar = [
  'Kayseri Büyükşehir Belediyesi',
  'Erciyes Üniversitesi',
  'Kayseri Organize Sanayi Bölgesi',
  'Kayseri İl Milli Eğitim Müdürlüğü',
  'Çeşitli Düğün Salonları ve Organizasyon Firmaları',
  'Kayseri ve Çevre İllerdeki Okullar',
]

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen pb-24">

      {/* Hero */}
      <div className="relative bg-[#0A0A0A] border-b border-white/5 py-20 overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-40" />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-brand-red to-transparent opacity-30" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-brand-red" />
            <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">1999'dan Bu Yana</span>
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl uppercase text-white leading-none mb-6">
            HAKKIMIZDA
          </h1>
          <p className="font-body text-white/45 text-lg max-w-2xl leading-relaxed">
            Kayseri'nin köklü elektronik firması olarak 25 yılı aşkın deneyimimizle
            ses, ışık ve görüntü sistemleri alanında güvenilir çözümler üretiyoruz.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">

        {/* Hikayemiz */}
        <section className="py-20 border-b border-white/5">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-brand-red" />
                <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Hikayemiz</span>
              </div>
              <h2 className="font-display font-black text-4xl md:text-5xl uppercase text-white leading-none mb-8">
                25 YILLIK<br /><span className="text-brand-red">YOLCULUK</span>
              </h2>
              <div className="font-body text-white/50 text-base leading-relaxed space-y-4">
                <p>
                  Akdağ Elektronik, 1999 yılında Mustafa Akdağ tarafından Kayseri'de kuruldu.
                  Kuruluşumuzdan bu yana profesyonel ses, ışık ve görüntü sistemleri alanında
                  bölgenin önde gelen firmaları arasında yer alıyoruz.
                </p>
                <p>
                  Yıllar içinde büyüyen müşteri portföyümüz ve genişleyen ürün yelpazemizle
                  Kayseri başta olmak üzere İç Anadolu genelinde yüzlerce projeye imza attık.
                  Okullardan büyük organizasyon mekanlarına, camilerden sahne sistemlerine
                  kadar geniş bir yelpazede hizmet vermekteyiz.
                </p>
                <p>
                  Türkiye'nin yeni nesil akıllı okul çözümü <strong className="text-white">AKUSTEK</strong>'in
                  Kayseri ana bayisi olarak eğitim kurumlarına modern teknoloji sunuyoruz.
                </p>
              </div>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: '1999', label: 'Kuruluş Yılı',      color: 'border-l-brand-red' },
                { val: '25+',  label: 'Yıl Deneyim',       color: 'border-l-brand-red' },
                { val: '500+', label: 'Tamamlanan Proje',   color: 'border-l-white/20' },
                { val: '1000+',label: 'Mutlu Müşteri',      color: 'border-l-white/20' },
                { val: '10+',  label: 'Çalışan Marka',      color: 'border-l-white/20' },
                { val: '81',   label: 'İle Teslimat',       color: 'border-l-white/20' },
              ].map(s => (
                <div key={s.label} className={`bg-[#141414] border border-white/5 p-5 border-l-2 ${s.color} hover:border-brand-red/30 transition-colors`}>
                  <div className="font-display font-black text-3xl text-white mb-1">{s.val}</div>
                  <div className="font-body text-white/35 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Değerlerimiz */}
        <section className="py-20 border-b border-white/5">
          <div className="text-center mb-14">
            <div className="flex items-center gap-3 justify-center mb-4">
              <div className="w-8 h-px bg-brand-red" />
              <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Neden Biz?</span>
              <div className="w-8 h-px bg-brand-red" />
            </div>
            <h2 className="font-display font-black text-4xl uppercase text-white leading-none">DEĞERLERİMİZ</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-1">
            {degerler.map(d => {
              const Icon = d.icon
              return (
                <div key={d.baslik} className="bg-[#141414] border border-white/5 p-6 hover:border-brand-red/30 transition-all group">
                  <div className="w-12 h-12 bg-brand-red/10 border border-brand-red/20 flex items-center justify-center mb-5 group-hover:bg-brand-red group-hover:border-brand-red transition-all duration-300">
                    <Icon size={20} className="text-brand-red group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-display font-bold text-base uppercase text-white tracking-wide mb-3 group-hover:text-brand-red transition-colors">
                    {d.baslik}
                  </h3>
                  <p className="font-body text-white/40 text-sm leading-relaxed">{d.aciklama}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Hizmetlerimiz */}
        <section className="py-20 border-b border-white/5">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-brand-red" />
                <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Ne Yapıyoruz?</span>
              </div>
              <h2 className="font-display font-black text-4xl uppercase text-white leading-none mb-8">
                HİZMETLERİMİZ
              </h2>
              <ul className="space-y-3">
                {hizmetler.map(h => (
                  <li key={h} className="flex items-center gap-3 font-body text-white/55 text-sm">
                    <div className="w-1.5 h-1.5 bg-brand-red flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
              <Link href="/urunler" className="btn-primary text-sm mt-8 inline-flex">
                Ürünleri İncele
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Referanslar */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-brand-red" />
                <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Referanslarımız</span>
              </div>
              <h2 className="font-display font-black text-4xl uppercase text-white leading-none mb-8">
                ÇALIŞTIĞIMIZ<br />
                <span className="text-white/20">KURUMLAR</span>
              </h2>
              <div className="space-y-2">
                {referanslar.map((r, i) => (
                  <div key={r} className="flex items-center gap-4 bg-[#141414] border border-white/5 p-4 hover:border-brand-red/20 transition-colors">
                    <div className="w-8 h-8 bg-brand-red/10 border border-brand-red/20 flex items-center justify-center flex-shrink-0 font-display font-black text-xs text-brand-red">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <span className="font-body text-white/60 text-sm">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* İletişim CTA */}
        <section className="py-20">
          <div className="bg-[#141414] border border-brand-red/20 p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-red/5 to-transparent" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t border-r border-brand-red/20" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b border-l border-brand-red/20" />

            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-brand-red" />
                <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Birlikte Çalışalım</span>
              </div>
              <h2 className="font-display font-black text-4xl uppercase text-white leading-none mb-4">
                PROJENİZİ<br />HAYATA GEÇİRELİM
              </h2>
              <p className="font-body text-white/40 text-base leading-relaxed mb-8">
                Ses, ışık veya görüntü sistemi projeniz için ücretsiz keşif ve teklif almak üzere bize ulaşın.
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <a href="tel:+903522316915" className="btn-primary text-sm">
                  <Phone size={15} />
                  +90 352 231 69 15
                </a>
                <Link href="/iletisim" className="btn-outline text-sm">İletişim Formu</Link>
              </div>
              <div className="flex items-center gap-2 mt-6 text-white/25 text-sm font-body">
                <MapPin size={13} className="text-brand-red/50" />
                Cumhuriyet Mah. Sur Cad. No:17/A, Melikgazi / Kayseri
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
