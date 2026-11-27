import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronRight,
  ArrowRight,
  Speaker,
  Lightbulb,
  Monitor,
  Headphones,
  Mic2,
  Clock,
  Award,
  Users,
  Phone,
  MapPin,
} from 'lucide-react'
import HomeHeroBanner from '@/components/HomeHeroBanner'
import HomeProductShowcase from '@/components/HomeProductShowcase'
import HomeSecondaryShowcase from '@/components/HomeSecondaryShowcase'
import BrandMarquee from '@/components/BrandMarquee'
import FaqSection from '@/components/FaqSection'
import { getActiveBanners } from '@/lib/banner-service'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PUBLIC_PRODUCT_FIELDS } from '@/lib/product-queries'
import { unstable_cache } from 'next/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const categories = [
  {
    icon: Speaker,
    label: 'Ses Sistemleri',
    slug: 'ses-sistemleri',
    desc: 'Hoparlör, mikser, mikrofon ve amfi sistemleri',
    count: '120+',
  },
  {
    icon: Lightbulb,
    label: 'Işık Sistemleri',
    slug: 'isik-sistemleri',
    desc: 'Moving head, LED par, DMX kontrol ve efekt makineleri',
    count: '80+',
  },
  {
    icon: Monitor,
    label: 'Görüntü Sistemleri',
    slug: 'goruntu-sistemleri',
    desc: 'LED ekran, projeksiyon ve video işleme çözümleri',
    count: '60+',
  },
  {
    icon: Mic2,
    label: 'Stüdyo Ekipmanları',
    slug: 'studyo-ekipmanlari',
    desc: 'Ses kartları, stüdyo mikrofonları ve akustik paneller',
    count: '50+',
  },
  {
    icon: Headphones,
    label: 'Kulaklık & Monitör',
    slug: 'kulaklik-ve-monitor',
    desc: 'Referans kulaklıklar, IEM ve stüdyo monitör hoparlörler',
    count: '45+',
  },
  {
    icon: Award,
    label: 'Sahne ve Truss',
    slug: 'sahne-ve-truss',
    desc: 'Truss konstrüksiyon, sahne platformları ve rigging',
    count: '40+',
  },
]

const FLAGSHIP_BRANDS = [
  'SHURE',
  'SOUNDCRAFT',
  'BEHRINGER',
  'AKG',
  'YAMAHA',
  'JBL',
  'RCF',
  'SENNHEISER',
  'MACKIE',
  'DB TECHNOLOGIES',
  'AUDAC',
  'ALLEN&HEATH',
  'ALLEN & HEATH',
  'ALTO',
  'LD SYSTEMS',
  'MARTIN AUDIO',
]

// Vitrin ürünlerini önbellekle: küresel pro-audio markalarını ve stokta olanları eksiksiz çek
const getCachedHomepageProducts = unstable_cache(
  async () => {
    const supabase = await createServerSupabaseClient()

    const [flagshipRes, inStockRes] = await Promise.all([
      supabase
        .from('urunler')
        .select(PUBLIC_PRODUCT_FIELDS)
        .in('marka', FLAGSHIP_BRANDS)
        .order('stok_adedi', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(200),
      supabase
        .from('urunler')
        .select(PUBLIC_PRODUCT_FIELDS)
        .eq('stok_durumu', 'stokta')
        .order('stok_adedi', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(60),
    ])

    const map = new Map<string, any>()
    ;(flagshipRes.data || []).forEach((p: any) => map.set(p.id, p))
    ;(inStockRes.data || []).forEach((p: any) => {
      if (!map.has(p.id)) map.set(p.id, p)
    })

    return Array.from(map.values())
  },
  ['homepage-vitrin-products-v2'],
  { revalidate: 60, tags: ['products'] }
)

export default async function HomePage() {
  const [banners, products] = await Promise.all([
    getActiveBanners(),
    getCachedHomepageProducts(),
  ])

  return (
    <div className="relative">
      {/* ═══════════════════════════════════════════════
          1. HERO BANNER SLIDER & GÜVEN ÇUBUĞU
      ═══════════════════════════════════════════════ */}
      <HomeHeroBanner banners={banners} />

      {/* ═══════════════════════════════════════════════
          2. VİTRİN 1: CANLI STOK & ÖNE ÇIKANLAR VİTRİNİ
      ═══════════════════════════════════════════════ */}
      <HomeProductShowcase products={products} />

      {/* ═══════════════════════════════════════════════
          3. DÜNYACA ÜNLÜ MARKALAR (KAYAN LOGO ŞERİDİ)
      ═══════════════════════════════════════════════ */}
      <BrandMarquee />

      {/* ═══════════════════════════════════════════════
          4. KATEGORİLER — UZMAN ÇÖZÜMLERİMİZ
      ═══════════════════════════════════════════════ */}
      <section className="py-20 bg-[#0F0F0F] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-px bg-brand-red" />
                <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">
                  Hizmet Alanlarımız
                </span>
              </div>
              <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight leading-none text-white">
                UZMAN <span className="text-brand-red">ÇÖZÜMLERİMİZ</span>
              </h2>
            </div>
            <Link
              href="/urunler"
              className="flex items-center gap-2 text-brand-red font-display font-semibold text-xs tracking-widest uppercase hover:gap-3 transition-all duration-300 group"
            >
              Tüm Kategoriler
              <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, i) => {
              const Icon = cat.icon
              return (
                <Link
                  href={`/urunler/${cat.slug}`}
                  key={cat.label}
                  className="product-card group bg-[#141414] border border-white/10 rounded-xl p-7 hover:bg-[#1A1A1A] hover:border-brand-red/40 transition-all duration-300"
                >
                  {/* Numara watermark */}
                  <div className="absolute top-4 right-5 font-display font-black text-[68px] leading-none text-white/[0.03] select-none">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  {/* İkon */}
                  <div className="w-11 h-11 rounded-lg bg-brand-red/10 border border-brand-red/20 flex items-center justify-center mb-5 group-hover:bg-brand-red group-hover:border-brand-red transition-all duration-300 relative z-10">
                    <Icon size={20} className="text-brand-red group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-display font-bold text-lg uppercase tracking-wide text-white mb-2 group-hover:text-brand-red transition-colors duration-300 relative z-10">
                    {cat.label}
                  </h3>
                  <p className="font-body text-white/50 text-sm leading-relaxed mb-4 relative z-10">{cat.desc}</p>
                  <div className="font-display font-bold text-xs tracking-widest text-brand-red/80 flex items-center gap-1.5 relative z-10">
                    <span>{cat.count} ÜRÜN</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                  {/* Alt kırmızı çizgi */}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-red group-hover:w-full transition-all duration-500" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          5. AKUSTEK AKILLI OKUL SAATİ — RESMİ ANA BAYİ
      ═══════════════════════════════════════════════ */}
      <section className="py-20 bg-[#0A0A0A] border-b border-white/5 relative overflow-hidden">
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
                <span className="block text-xl md:text-2xl silver-text tracking-[0.3em] mt-2">AKILLI OKUL SAATİ</span>
              </h2>
              <p className="font-body text-white/45 text-base leading-relaxed mb-8 max-w-lg">
                Türkiye&apos;nin yeni nesil akıllı okul saati ve otomasyon sistemi{' '}
                <strong className="text-white font-semibold">AKUSTEK</strong>&apos;in resmi ana bayisiyiz. Akıllı zil,
                anons ve dijital tabela tek platformda.
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
                <a
                  href="https://akustek.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline text-sm"
                >
                  Akustek.com&apos;u Ziyaret Et
                </a>
              </div>
            </div>

            {/* Görsel kart */}
            <div className="relative">
              <div className="absolute inset-0 bg-brand-red/20 blur-[80px] rounded-full pointer-events-none" />

              <div className="relative bg-[#141414] border border-white/10 overflow-hidden silver-border flex items-center justify-center group shadow-2xl shadow-black">
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

              {/* Etiketler */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brand-red/90 backdrop-blur-md border border-brand-red text-white px-5 py-2 z-20 shadow-xl shadow-brand-red/20">
                <div className="font-display font-black text-xs tracking-widest uppercase">YENİ ÜRÜN</div>
              </div>

              <div className="absolute -bottom-4 -left-2 md:-left-6 inline-flex items-center gap-3 bg-black/60 backdrop-blur-lg border border-white/10 px-6 py-3 z-20 shadow-2xl">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-red"></span>
                </div>
                <span className="font-display font-semibold text-[10px] sm:text-xs tracking-widest uppercase text-white/90">
                  Ana Bayi – Kayseri
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          6. VİTRİN 2: YENİ GELENLER & SEÇKİN EKİPMANLAR
      ═══════════════════════════════════════════════ */}
      <HomeSecondaryShowcase products={products} />

      {/* ═══════════════════════════════════════════════
          7. NEDEN BİZ? — 50 YILLIK GÜVEN VE DENEYİM
      ═══════════════════════════════════════════════ */}
      <section className="py-20 bg-[#0F0F0F] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Sol görsel / armut */}
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto relative">
                <div className="absolute inset-0 border border-white/5 rounded-full" />
                <div className="absolute inset-8 border border-white/5 rounded-full" />
                <div className="absolute inset-16 border border-brand-red/10 rounded-full" />
                <div
                  className="absolute inset-24 border silver-border rounded-full"
                  style={{ borderColor: 'rgba(192,192,192,0.12)' }}
                />
                <div className="absolute inset-32 bg-brand-red/10 rounded-full flex items-center justify-center border border-brand-red/30">
                  <Award size={40} className="text-brand-red" />
                </div>
                {[
                  { label: 'Güven', angle: 0 },
                  { label: 'Kalite', angle: 90 },
                  { label: 'Hız', angle: 180 },
                  { label: 'Servis', angle: 270 },
                ].map(({ label, angle }) => (
                  <div
                    key={label}
                    className="absolute"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%,-50%) rotate(${angle}deg) translateY(-160px)`,
                    }}
                  >
                    <div
                      className="bg-[#141414] border border-brand-red/30 px-3 py-1.5 font-display font-bold text-xs uppercase tracking-wider text-brand-red"
                      style={{ transform: `rotate(-${angle}deg)` }}
                    >
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
                <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">
                  Neden Biz?
                </span>
              </div>
              <h2 className="font-display font-black text-5xl md:text-6xl uppercase tracking-tight leading-none text-white mb-8">
                YARIM ASIRLIK
                <br />
                <span className="text-brand-red">GÜVEN VE</span>
                <br />
                DENEYİM
              </h2>
              <p className="font-body text-white/45 text-base leading-relaxed mb-8">
                1976 yılında Ahmet Akdağ tarafından temelleri atılan ve bugün Mustafa Akdağ liderliğinde büyüyen şirketimiz, profesyonel ses, ışık ve görüntü sistemleri alanında{' '}
                <span className="silver-text font-medium">50 yılı aşkın deneyimiyle</span> sektörün öncüsü olmaya devam ediyor.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: Users, label: 'Uzman Ekip', desc: 'Sertifikalı teknisyenler' },
                  { icon: Award, label: 'Garantili Ürün', desc: 'Resmi distribütörlük' },
                  { icon: Clock, label: 'Hızlı Servis', desc: '24/7 teknik destek' },
                  { icon: MapPin, label: 'Yerinde Kurulum', desc: 'Kayseri ve çevresi' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="bg-[#141414] border border-white/5 p-4 hover:border-brand-red/30 hover:bg-[#1A1A1A] transition-all duration-300 group"
                  >
                    <Icon size={18} className="text-brand-red mb-2" />
                    <div className="font-display font-bold text-sm uppercase text-white tracking-wide group-hover:text-brand-red transition-colors">
                      {label}
                    </div>
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
          8. BAYİMİZ OLUN — B2B İŞ ORTAKLIĞI
      ═══════════════════════════════════════════════ */}
      <section className="py-20 bg-[#0A0A0A] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-brand-red" />
                <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">
                  İş Ortaklığı
                </span>
              </div>
              <h2 className="font-display font-black text-5xl uppercase text-white leading-none mb-6">
                BAYİMİZ
                <br />
                <span className="text-brand-red">OLUN</span>
              </h2>
              <p className="font-body text-white/45 text-base leading-relaxed mb-8">
                Akdağ Elektronik bayi ağına katılın. Özel fiyatlar, öncelikli stok ve{' '}
                <span className="silver-text font-medium">bölgesel temsil</span> hakkıyla işinizi büyütün.
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
                <div
                  key={item.label}
                  className="bg-[#141414] border border-white/5 p-6 hover:border-brand-red/20 transition-colors"
                >
                  <div className="font-display font-black text-4xl text-brand-red mb-2">{item.num}</div>
                  <div className="font-body text-white/60 text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          9. SIKÇA SORULAN SORULAR
      ═══════════════════════════════════════════════ */}
      <FaqSection />

      {/* ═══════════════════════════════════════════════
          10. SEO METİN BLOĞU
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-[#0F0F0F] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 text-white/50 font-body text-sm leading-relaxed">
            <div>
              <h2 className="font-display font-bold text-2xl text-white mb-4 uppercase tracking-widest">
                Profesyonel Ses Sistemleri
              </h2>
              <p className="mb-4">
                Akdağ Elektronik olarak, Kayseri ve tüm Türkiye&apos;ye profesyonel <strong>ses sistemleri</strong> çözümleri sunuyoruz. İster geniş çaplı bir <strong>fabrika ses sistemi</strong>, ister butik bir <strong>kafe ses sistemi</strong> arıyor olun, uzman ekibimizle ücretsiz keşif yaparak en doğru ürünleri belirliyoruz.
              </p>
              <p>
                <strong>Okul ses sistemi</strong> ve zil sistemleri konusunda Akustek Ana Bayisi olarak, yeni nesil akıllı okul saatleri ile eğitim kurumlarına kalıcı ve güvenilir çözümler üretiyoruz. Ayrıca <strong>cami ses sistemi</strong> projelerinde yankı ve akustiği dengeleyen özel kurulumlar gerçekleştiriyoruz.
              </p>
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl text-white mb-4 uppercase tracking-widest">
                Kayseri Ses Sistemleri ve Sahne Çözümleri
              </h2>
              <p className="mb-4">
                Akdağ Elektronik olarak, başta <strong>Kayseri ses sistemleri</strong> olmak üzere tüm Türkiye&apos;ye profesyonel ses, ışık ve görüntü çözümleri sunuyoruz. Etkinlikleriniz için kusursuz bir deneyim sunan <strong>sahne ses sistemleri</strong>, line array hoparlörler ve ışık sistemleri ile projenizi A&apos;dan Z&apos;ye tasarlıyoruz.
              </p>
              <p>
                Kurumsal projelerinizde ve toptan ihtiyaçlarınızda{' '}
                <Link href="/bayi" className="text-brand-red hover:underline">
                  Bayi Portalımız
                </Link>{' '}
                üzerinden özel iskonto oranlarıyla anında online teklif oluşturabilir, projelerinizi hızlandırabilirsiniz. Kayseri içi ücretsiz keşif ve montaj avantajıyla en kaliteli markalar, rekabetçi fiyatlar ve 50 yıllık tecrübemizle yanınızdayız.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          11. PROJE TEKLİFİ ALIN (CONTACT CTA)
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-[#0A0A0A] relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-red/4 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="border border-brand-red/20 bg-[#141414] p-12 md:p-20 text-center relative overflow-hidden silver-border">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-brand-red" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-12 bg-brand-red" />
            <div
              className="absolute top-4 left-4 w-10 h-10 border-t border-l"
              style={{ borderColor: 'rgba(192,192,192,0.15)' }}
            />
            <div
              className="absolute top-4 right-4 w-10 h-10 border-t border-r"
              style={{ borderColor: 'rgba(192,192,192,0.15)' }}
            />
            <div
              className="absolute bottom-4 left-4 w-10 h-10 border-b border-l"
              style={{ borderColor: 'rgba(192,192,192,0.15)' }}
            />
            <div
              className="absolute bottom-4 right-4 w-10 h-10 border-b border-r"
              style={{ borderColor: 'rgba(192,192,192,0.15)' }}
            />

            <div className="inline-flex items-center gap-3 border border-brand-red/30 bg-brand-red/5 px-4 py-2 mb-8">
              <Phone size={12} className="text-brand-red" />
              <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">
                Ücretsiz Keşif & Teklif
              </span>
            </div>

            <h2 className="font-display font-black text-5xl md:text-6xl uppercase tracking-tight leading-none text-white mb-6">
              PROJE TEKLİFİ
              <br />
              <span className="text-brand-red">ALIN</span>
            </h2>
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
