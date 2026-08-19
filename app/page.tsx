import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, ArrowRight, Speaker, Lightbulb, Monitor, Clock, Award, Users, Phone, MapPin } from 'lucide-react'
import ProductSearch from '@/components/ProductSearch'
import HeroParticles from '@/components/HeroParticles'
import BrandMarquee from '@/components/BrandMarquee'
import FeaturedProducts from '@/components/FeaturedProducts'
import StatCounter from '@/components/StatCounter'
import FaqSection from '@/components/FaqSection'

export const revalidate = 3600

const categories = [
  { icon: Speaker, label: 'Ses Sistemleri', slug: 'ses-sistemleri', desc: 'Hoparlör, mikser, mikrofon ve amfi sistemleri', count: '120+' },
  { icon: Lightbulb, label: 'Işık Sistemleri', slug: 'isik-sistemleri', desc: 'Moving head, LED par, DMX kontrol ve efekt makineleri', count: '80+' },
  { icon: Monitor, label: 'Görüntü Sistemleri', slug: 'goruntu-sistemleri', desc: 'LED ekran, projeksiyon ve video işleme', count: '60+' },
  { icon: Award, label: 'Sahne ve Truss', slug: 'sahne-ve-truss', desc: 'Truss konstrüksiyon, sahne platformları ve mekanik', count: '40+' },
]

const stats = [
  { value: '50+', label: 'Yıl Deneyim' },
  { value: '500+', label: 'Tamamlanan Proje' },
  { value: '1000+', label: 'Mutlu Müşteri' },
  { value: '4', label: 'Hizmet Kategorisi' },
]

export default function HomePage() {
  return (
    <div className="relative">

      {/* ═══════════════════════════════════════════════
          HERO — parçacık animasyonu + diyagonal geçiş
      ═══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden diagonal-bottom bg-[#0F0F0F]">
        {/* Grid */}
        <div className="absolute inset-0 hero-grid" />

        {/* Parçacık animasyonu */}
        <HeroParticles />

        {/* Kırmızı diyagonal */}
        <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-brand-red/6 to-transparent"
            style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0 100%)' }} />
        </div>

        {/* Sol dikey çizgi */}
        <div className="absolute left-6 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-brand-red to-transparent opacity-30" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 pt-20 pb-36">
          <div className="max-w-4xl">
            {/* Rozet */}
            <div className="inline-flex items-center gap-3 border border-brand-red/30 bg-brand-red/5 px-4 py-2 mb-8 animate-fade-up">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
              <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">
                Kayseri'nin Profesyonel Ses & Işık Uzmanı
              </span>
            </div>

            {/* Başlık — display font büyük, tagline italic serif kontrast */}
            <h1 className="uppercase leading-none mb-4 animate-fade-up stagger-1" style={{ animationFillMode: 'both' }}>
              <span className="block font-display font-black text-6xl md:text-8xl lg:text-[108px] text-white tracking-tight">SES,</span>
              <span className="block font-display font-black text-6xl md:text-8xl lg:text-[108px] text-white tracking-tight">IŞIK &</span>
              <span className="block font-display font-black text-6xl md:text-8xl lg:text-[108px] text-brand-red tracking-tight">GÖRÜNTÜ.</span>
            </h1>

            {/* Alt yazı — body font, daha geniş satır aralığı (#6) */}
            <p className="font-body text-white/45 text-lg md:text-xl max-w-xl leading-relaxed mb-10 animate-fade-up stagger-2"
              style={{ animationFillMode: 'both' }}>
              1976'dan bugüne yarım asırlık (50+ yıl) deneyimimizle Türkiye genelinde profesyonel ses, ışık ve görüntü sistemleri
              <span className="silver-text font-medium"> kurulum, satış ve servis</span> hizmetleri sunuyoruz.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 mb-14 animate-fade-up stagger-3" style={{ animationFillMode: 'both' }}>
              <Link href="/urunler" className="btn-primary text-sm">
                Ürünleri İncele
                <ArrowRight size={16} />
              </Link>
              <a href="tel:+903522316915" className="btn-outline text-sm">
                <Phone size={14} />
                Hemen Arayın
              </a>
            </div>

            {/* Sayaç (#2 — scroll'da sayar) */}
            <div className="animate-fade-up stagger-4" style={{ animationFillMode: 'both' }}>
              <StatCounter stats={stats} />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 z-10">
          <span className="font-display text-xs tracking-widest uppercase">Keşfet</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          ÜRÜN ARAMA
      ═══════════════════════════════════════════════ */}
      <section className="py-8 bg-[#0A0A0A] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <ProductSearch />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          KATEGORİLER — diyagonal alt geçiş
      ═══════════════════════════════════════════════ */}
      <section className="pt-24 pb-32 bg-[#0F0F0F] diagonal-bottom">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-brand-red" />
                <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Hizmetlerimiz</span>
              </div>
              {/* Başlık display + ghost alt yazı (#6) */}
              <h2 className="font-display font-black text-5xl md:text-6xl uppercase tracking-tight leading-none text-white">
                UZMAN<br />
                <span className="text-white/35">ÇÖZÜMLERİMİZ</span>
              </h2>
            </div>
            <Link href="/urunler" className="flex items-center gap-2 text-brand-red font-display font-semibold text-sm tracking-widest uppercase hover:gap-4 transition-all duration-300 group">
              Tüm Ürünler
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
            {categories.map((cat, i) => {
              const Icon = cat.icon
              return (
                <Link href={`/urunler/${cat.slug}`} key={cat.label}
                  className="product-card group bg-[#141414] border border-white/5 p-8 hover:bg-[#1A1A1A] hover:border-brand-red/30 transition-all duration-300 silver-border">
                  {/* Numara watermark */}
                  <div className="absolute top-5 right-5 font-display font-black text-[80px] leading-none text-white/[0.025] select-none">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  {/* İkon */}
                  <div className="w-12 h-12 bg-brand-red/10 border border-brand-red/20 flex items-center justify-center mb-6 group-hover:bg-brand-red group-hover:border-brand-red transition-all duration-300 relative z-10">
                    <Icon size={20} className="text-brand-red group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-display font-bold text-lg uppercase tracking-wide text-white mb-2 group-hover:text-brand-red transition-colors duration-300 relative z-10">
                    {cat.label}
                  </h3>
                  {/* Body font açıklama (#6) */}
                  <p className="font-body text-white/35 text-sm leading-relaxed mb-4 relative z-10">{cat.desc}</p>
                  <div className="font-display font-semibold text-xs tracking-widest silver-text relative z-10">{cat.count} ÜRÜN</div>
                  {/* Alt kırmızı çizgi */}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-red group-hover:w-full transition-all duration-500" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          AKUSTEK — diyagonal üst giriş
      ═══════════════════════════════════════════════ */}
      <section className="diagonal-top pt-32 pb-24 bg-[#0A0A0A] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-red/4 via-transparent to-transparent" />
        <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-brand-red/15 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-3 bg-brand-red text-white px-4 py-1.5 mb-8">
                <Award size={14} />
                <span className="font-display font-bold text-xs tracking-[0.3em] uppercase">Resmi Ana Bayi</span>
              </div>
              <h2 className="font-display font-black uppercase leading-none mb-6">
                <span className="block text-5xl md:text-7xl text-white">AKUSTEK</span>
                {/* Gümüş metalik alt başlık (#7) */}
                <span className="block text-xl md:text-2xl silver-text tracking-[0.3em] mt-2">AKILLI OKUL SAATİ</span>
              </h2>
              {/* Body font açıklama (#6) */}
              <p className="font-body text-white/45 text-base leading-relaxed mb-8 max-w-lg">
                Türkiye'nin yeni nesil akıllı okul saati ve otomasyon sistemi <strong className="text-white font-semibold">AKUSTEK</strong>'in
                resmi ana bayisiyiz. Akıllı zil, anons ve dijital tabela tek platformda.
              </p>
              <ul className="space-y-3 mb-10">
                {[
                  'Merkezi programlanabilir zil sistemi',
                  'Okul anons ve yönlendirme sistemi',
                  'Dijital tabela ve bilgi ekranları',
                  'Uzaktan yönetim ve kontrol',
                  'Kolay kurulum ve servis desteği',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 font-body text-sm text-white/50">
                    <div className="w-1.5 h-1.5 bg-brand-red flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <a href="tel:+903522316915" className="btn-primary text-sm">
                  <Phone size={14} />
                  Teklif İçin Arayın
                </a>
                <a href="https://akustek.com" target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">
                  Akustek.com'u Ziyaret Et
                </a>
              </div>
            </div>

            {/* Görsel kart */}
            <div className="relative">
              {/* Premium Glow Effect */}
              <div className="absolute inset-0 bg-brand-red/20 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="relative bg-[#141414] border border-white/10 overflow-hidden silver-border flex items-center justify-center group shadow-2xl shadow-black">
                {/* Akustek Fotoğrafı (public klasörüne akustek.png olarak yüklemeniz yeterli) */}
                <a href="https://akustek.com" target="_blank" rel="noopener noreferrer" className="relative w-full block">
                  <Image 
                    src="/akustek.png" 
                    alt="Akustek Akıllı Okul Saati" 
                    width={1600}
                    height={1000}
                    className="w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-700"
                  />
                </a>
              </div>

              {/* Etiketler (Glassmorphism) */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brand-red/90 backdrop-blur-md border border-brand-red border-b-white/20 text-white px-5 py-2 z-20 shadow-xl shadow-brand-red/20">
                <div className="font-display font-black text-xs tracking-widest uppercase">YENİ ÜRÜN</div>
              </div>
              
              <div className="absolute -bottom-4 -left-2 md:-left-6 inline-flex items-center gap-3 bg-black/60 backdrop-blur-lg border border-white/10 px-6 py-3 z-20 shadow-2xl">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-red"></span>
                </div>
                <span className="font-display font-semibold text-[10px] sm:text-xs tracking-widest uppercase text-white/90">Ana Bayi – Kayseri</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          ÖNE ÇIKAN ÜRÜNLER (TRENDYOL STİLİ)
      ═══════════════════════════════════════════════ */}
      <FeaturedProducts />

      {/* ═══════════════════════════════════════════════
          MARKA ŞERİDİ — kayan marquee (#2)
      ═══════════════════════════════════════════════ */}
      <BrandMarquee />

      {/* ═══════════════════════════════════════════════
          NEDEN BİZ — diyagonal üst giriş
      ═══════════════════════════════════════════════ */}
      <section className="diagonal-top pt-32 pb-24 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Sol görsel */}
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto relative">
                <div className="absolute inset-0 border border-white/3 rounded-full" />
                <div className="absolute inset-8 border border-white/5 rounded-full" />
                <div className="absolute inset-16 border border-brand-red/10 rounded-full" />
                {/* Gümüş halka (#7) */}
                <div className="absolute inset-24 border silver-border rounded-full" style={{ borderColor: 'rgba(192,192,192,0.12)' }} />
                <div className="absolute inset-32 bg-brand-red/10 rounded-full flex items-center justify-center border border-brand-red/30">
                  <Award size={40} className="text-brand-red" />
                </div>
                {[
                  { label: 'Güven', angle: 0 },
                  { label: 'Kalite', angle: 90 },
                  { label: 'Hız', angle: 180 },
                  { label: 'Servis', angle: 270 },
                ].map(({ label, angle }) => (
                  <div key={label} className="absolute"
                    style={{ top: '50%', left: '50%', transform: `translate(-50%,-50%) rotate(${angle}deg) translateY(-160px)` }}>
                    <div className="bg-[#141414] border border-brand-red/30 px-3 py-1.5 font-display font-bold text-xs uppercase tracking-wider text-brand-red"
                      style={{ transform: `rotate(-${angle}deg)` }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sağ içerik */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-brand-red" />
                <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Neden Biz?</span>
              </div>
              <h2 className="font-display font-black text-5xl md:text-6xl uppercase tracking-tight leading-none text-white mb-8">
                YARIM ASIRLIK<br />
                <span className="text-brand-red">GÜVEN VE</span><br />
                DENEYİM
              </h2>
              {/* Body font (#6) */}
              <p className="font-body text-white/45 text-base leading-relaxed mb-8">
                1976 yılında Ahmet Akdağ tarafından temelleri atılan ve bugün Mustafa Akdağ liderliğinde büyüyen şirketimiz, profesyonel ses, ışık ve görüntü sistemleri alanında
                <span className="silver-text font-medium"> 50 yılı aşkın deneyimiyle</span> sektörün
                öncüsü olmaya devam ediyor.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: Users, label: 'Uzman Ekip', desc: 'Sertifikalı teknisyenler' },
                  { icon: Award, label: 'Garantili Ürün', desc: 'Resmi distribütörlük' },
                  { icon: Clock, label: 'Hızlı Servis', desc: '24/7 teknik destek' },
                  { icon: MapPin, label: 'Yerinde Kurulum', desc: 'Kayseri ve çevresi' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="bg-[#141414] border border-white/5 p-4 hover:border-brand-red/30 hover:bg-[#1A1A1A] transition-all duration-300 group">
                    <Icon size={18} className="text-brand-red mb-2" />
                    <div className="font-display font-bold text-sm uppercase text-white tracking-wide group-hover:text-brand-red transition-colors">{label}</div>
                    {/* Body font küçük yazı (#6) */}
                    <div className="font-body silver-text text-xs mt-1">{desc}</div>
                  </div>
                ))}
              </div>
              <Link href="/iletisim" className="btn-primary text-sm">
                Bizimle İletişime Geç
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════
          BAYİMİZ OLUN
      ═══════════════════════════════════════════════ */}
      <section className="py-20 bg-[#0A0A0A] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-brand-red" />
                <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">İş Ortaklığı</span>
              </div>
              <h2 className="font-display font-black text-5xl uppercase text-white leading-none mb-6">
                BAYİMİZ<br /><span className="text-brand-red">OLUN</span>
              </h2>
              <p className="font-body text-white/45 text-base leading-relaxed mb-8">
                Akdağ Elektronik bayi ağına katılın. Özel fiyatlar, teknik destek ve
                <span className="silver-text font-medium"> bölgesel temsil</span> hakkıyla işinizi büyütün.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  '💰 Özel Bayi Fiyatları',
                  '📦 Öncelikli Stok',
                  '🎯 Teknik Destek',
                  '🤝 Bölgesel Temsil',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-body text-white/70">
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <Link href="/bayi/basvuru" className="btn-primary text-sm">
                  Başvuru Yap
                  <ArrowRight size={15} />
                </Link>
                <Link href="/bayi" className="btn-outline text-sm">
                  Bayi Girişi
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { num: '50+', label: 'Aktif Bayi' },
                { num: '%30', label: 'Ortalama İndirim' },
                { num: '24/7', label: 'Teknik Destek' },
                { num: '81', label: 'İlde Hizmet' },
              ].map((item) => (
                <div key={item.label} className="bg-[#141414] border border-white/5 p-6 hover:border-brand-red/20 transition-colors">
                  <div className="font-display font-black text-4xl text-brand-red mb-2">{item.num}</div>
                  <div className="font-body text-white/60 text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SIKÇA SORULAN SORULAR (FAQ SCHEMA)
      ═══════════════════════════════════════════════ */}
      <FaqSection />

      {/* ═══════════════════════════════════════════════
          SEO METİN BLOĞU (ÇÖZÜMLER)
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-[#0F0F0F] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 text-white/50 font-body text-sm leading-relaxed">
            <div>
              <h2 className="font-display font-bold text-2xl text-white mb-4 uppercase tracking-widest">Profesyonel Ses Sistemleri</h2>
              <p className="mb-4">
                Akdağ Elektronik olarak, Kayseri ve tüm Türkiye'ye profesyonel <strong>ses sistemleri</strong> çözümleri sunuyoruz. İster geniş çaplı bir <strong>fabrika ses sistemi</strong>, ister butik bir <strong>kafe ses sistemi</strong> arıyor olun, uzman ekibimizle ücretsiz keşif yaparak en doğru ürünleri belirliyoruz. 
              </p>
              <p>
                <strong>Okul ses sistemi</strong> ve zil sistemleri konusunda Akustek Ana Bayisi olarak, yeni nesil akıllı okul saatleri ile eğitim kurumlarına kalıcı ve güvenilir çözümler üretiyoruz. Ayrıca <strong>cami ses sistemi</strong> projelerinde yankı ve akustiği dengeleyen özel kurulumlar gerçekleştiriyoruz.
              </p>
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl text-white mb-4 uppercase tracking-widest">Sahne ve Konferans Sistemleri</h2>
              <p className="mb-4">
                Etkinlikleriniz için kusursuz bir deneyim sunan <strong>sahne ses sistemleri</strong>, line array hoparlörler ve ışık sistemleri ile projenizi A'dan Z'ye tasarlıyoruz. <strong>Konferans salonu ses sistemi</strong> kurulumlarımızda, delege mikrofonlarından görüntü sistemlerine kadar entegre yapılar kuruyoruz.
              </p>
              <p>
                Kurumsal projelerinizde ve toptan ihtiyaçlarınızda <Link href="/bayi" className="text-brand-red hover:underline">Bayi Portalımız</Link> üzerinden özel iskonto oranlarıyla anında online teklif oluşturabilir, projelerinizi hızlandırabilirsiniz. En kaliteli markalar, rekabetçi fiyatlar ve 50 yıllık tecrübemizle yanınızdayız.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CONTACT CTA
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-[#0A0A0A] relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-red/4 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="border border-brand-red/20 bg-[#141414] p-12 md:p-20 text-center relative overflow-hidden silver-border">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-brand-red" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-12 bg-brand-red" />
            {/* Gümüş köşe aksanları (#7) */}
            <div className="absolute top-4 left-4 w-10 h-10 border-t border-l" style={{ borderColor: 'rgba(192,192,192,0.15)' }} />
            <div className="absolute top-4 right-4 w-10 h-10 border-t border-r" style={{ borderColor: 'rgba(192,192,192,0.15)' }} />
            <div className="absolute bottom-4 left-4 w-10 h-10 border-b border-l" style={{ borderColor: 'rgba(192,192,192,0.15)' }} />
            <div className="absolute bottom-4 right-4 w-10 h-10 border-b border-r" style={{ borderColor: 'rgba(192,192,192,0.15)' }} />

            <div className="inline-flex items-center gap-3 border border-brand-red/30 bg-brand-red/5 px-4 py-2 mb-8">
              <Phone size={12} className="text-brand-red" />
              <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Ücretsiz Keşif & Teklif</span>
            </div>

            <h2 className="font-display font-black text-5xl md:text-6xl uppercase tracking-tight leading-none text-white mb-6">
              PROJE TEKLİFİ<br />
              <span className="text-brand-red">ALIN</span>
            </h2>
            {/* Tagline italic serif kontrast (#6) */}
            <p className="font-body text-white/60 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
              Uzman ekibimiz ihtiyaçlarınızı analiz edip{' '}
              <em className="silver-text not-italic font-medium">en uygun çözümü</em> sunsun.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <a href="tel:+903522316915" className="btn-primary text-base">
                <Phone size={16} />
                +90 352 231 69 15
              </a>
              <Link href="/iletisim" className="btn-outline text-sm">
                İletişim Formu
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
