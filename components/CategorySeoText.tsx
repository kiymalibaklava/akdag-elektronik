'use client'

import { useState } from 'react'
import { ChevronDown, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react'

interface Props {
  categorySlug?: string
  categoryName?: string
}

interface SeoContentItem {
  title: string
  lead: string
  highlights: string[]
  body: string
}

const SEO_CONTENT_MAP: Record<string, SeoContentItem> = {
  'ses-sistemleri': {
    title: 'Profesyonel Ses Sistemleri ve Ekipmanları Rehberi',
    lead: "Canlı sahne performansları, konserler, konferans salonları, ibadethaneler ve kurumsal mekanlar için kristal netliğinde ses iletimi sunan profesyonel ses sistemleri Akdağ Elektronik güvencesiyle.",
    highlights: [
      'Yüksek SPL kapasiteli aktif ve pasif hoparlör seçenekleri',
      'Dijital mikser konsolları ile hassas sahne ve stüdyo miksajı',
      'Parazitsiz UHF telsiz mikrofon sistemleri ve delege kürsü mikrofonları',
      '50 yılı aşkın deneyim ve resmi distribütör garantisi'
    ],
    body: `Profesyonel ses sistemi kurulumlarında doğru bileşenlerin seçimi, akustik performansın ve dinleyici memnuniyetinin temel belirleyicisidir. Mekanın büyüklüğüne, tavan yüksekliğine ve kullanım amacına bağlı olarak hat trafolu anons sistemleri, taşınabilir aktif kabinler veya geniş alan seslendirmesi sağlayan line array sistemler tercih edilmelidir. Akdağ Elektronik, dünyanın önde gelen pro audio markalarının orijinal ürünlerini projelendirme ve teknik servis desteğiyle sunar.`
  },
  'mixer-amfi': {
    title: 'Analog & Dijital Mikserler ile Güç Amfileri',
    lead: 'Müzik prodüksiyonu, canlı sahne ve sabit kurulum seslendirmelerinde sinyal yönetiminin kalbi olan profesyonel mikser ve amfi modelleri.',
    highlights: [
      'Geniş kanal kapasiteli USB / Bluetooth bağlantılı analog mikserler',
      'Wi-Fi kontrollü, DSP motorlu yeni nesil dijital sahne mikserleri',
      'Yüksek verimli Class-D power amfileri ve hat trafolu kurulum amplifikatörleri',
      'Dahili efekt işlemcileri (Reverb, Delay, Chorus, Kompresör)'
    ],
    body: `Canlı müzik performanslarından konferans salonlarına kadar her türlü etkinlikte sinyal akışının bozulmadan iletilmesi amfi ve mikser uyumuna bağlıdır. Dijital mikserler uzaktan tablet kontrolü ve sahne kayıt yetenekleriyle öne çıkarken, analog mikserler hızlı müdahale kolaylığı sağlar.`
  },
  'hoparlorler': {
    title: 'Aktif, Pasif ve Taşınabilir Hoparlör Çeşitleri',
    lead: 'Açık hava festivallerinden kurumsal tesis seslendirmesine kadar her mekana uygun yüksek performanslı hoparlör sistemleri.',
    highlights: [
      'Dahili amfili tak-çalıştır aktif kabin hoparlörler (10", 12", 15")',
      'Derin bas tepkisi için profesyonel aktif ve pasif subwooferlar',
      'Mekan mimarisine uyum sağlayan şık tavan, sütun ve duvar tipi hoparlörler',
      'Akü ve batarya beslemeli kablosuz taşınabilir ses sistemleri'
    ],
    body: `Hoparlör seçiminde desibel (SPL) seviyesi, frekans tepkisi ve yayılım açısı kritik öneme sahiptir. Cafe, mağaza, okul ve ibadethane projelerinde tavan ve sütun hoparlörler eşit ses dağılımı sağlarken; sahne ve konser performanslarında yüksek bas tepkisine sahip aktif sistemler tercih edilir.`
  },
  'mikrofon-sistemleri': {
    title: 'Telsiz, Kablolu ve Stüdyo Mikrofon Sistemleri',
    lead: 'Vokalistler, sunucular, tiyatrolar, camiler ve yayıncılar için pürüzsüz ses yakalama kabiliyetine sahip mikrofon modelleri.',
    highlights: [
      'True Diversity teknolojili çekim mesafesi yüksek UHF kablosuz mikrofonlar',
      'Yaka (Lavalier) ve Kafa (Headset) mikrofon seçenekleri',
      'Podcasting, yayıncılık ve stüdyo kaydı için geniş diyaframlı kondenser mikrofonlar',
      'Geri beslemeyi (feedback) engelleyen kardioid dinamik vokal mikrofonları'
    ],
    body: `Doğru mikrofon, sesin doğallığını ve enerjisini dinleyiciye en saf haliyle ulaştırır. Sahne hareketliliği gerektiren durumlarda çift el ya da yaka telsiz mikrofon setleri tercih edilirken; stüdyo kayıtlarında 48V Phantom Power destekli kondenser mikrofonlar öne çıkar.`
  },
  'isik-sistemleri': {
    title: 'Sahne Işık Sistemleri, Robot Işıklar & Efekt Makineleri',
    lead: 'Konserler, düğün salonları, tiyatrolar ve kültür merkezleri için büyüleyici görsel atmosferler yaratan DMX kontrollü aydınlatma ekipmanları.',
    highlights: [
      'Hızlı pan/tilt hareketli Beam, Spot ve Wash robot kafalar (Moving Head)',
      'RGBW renk karışımlı yüksek lümenli LED Par ve sahne boyama ışıkları',
      'DMX ışık kontrol masaları, kablosuz DMX vericiler ve PC arayüzleri',
      'Sis, hazer, kar, köpük ve soğuk kıvılcım efekt makineleri'
    ],
    body: `Işık ve görsel efektler, ses ile senkronize olduğunda sahnenin enerjisini katlar. Mekanınıza özel truss kurulumları ve DMX ışık projeleriniz için Akdağ Elektronik teknik ekibinden ücretsiz keşif ve mühendislik danışmanlığı alabilirsiniz.`
  },
  'goruntu-sistemleri': {
    title: 'Profesyonel Projeksiyon ve LED Ekran Sistemleri',
    lead: 'Toplantı salonları, eğitim kurumları, ibadethaneler ve etkinlik alanları için yüksek parlaklıklı görüntüleme teknolojileri.',
    highlights: [
      'Yüksek ANSI lümenli lazer ve lamba projeksiyon cihazları',
      'Motorlu, uzaktan kumandalı ve storlu projeksiyon perdeleri',
      'Modüler iç ve dış mekan LED ekran panelleri ve video işlemcileri',
      '4K HDMI / fiber optik görüntü aktarıcılar ve switcher sistemleri'
    ],
    body: `Görsel sunumların başarısı, ortam ışığına uygun parlaklık ve kontrast oranına sahip projeksiyon veya LED panellerin seçilmesine dayanır. Akdağ Elektronik anahtar teslim görüntüleme çözümleriyle projenizin tüm donanım ihtiyaçlarını karşılar.`
  },
  'dj-ekipmanlari': {
    title: 'Profesyonel DJ Ekipmanları, Kontrol Üniteleri ve Mikserler',
    lead: 'Stüdyo ve sahne performansları için en gelişmiş DJ kontrolörleri, mikserler, medya oynatıcılar ve kulaklıklar.',
    highlights: [
      'Rekordbox, Serato ve Traktor uyumlu çok kanallı DJ controller sistemleri',
      'Kulüp standardında profesyonel DJ mikserleri ve medya oynatıcılar',
      'Yüksek ses izolasyonlu DJ referans kulaklıkları',
      '2 yıl resmi distribütör garantisi ve teknik servis desteği'
    ],
    body: `DJ performansının akıcılığı, kullanılan donanımın hassasiyetine, jog wheel tepkimesine ve efekt kontrol yeteneklerine bağlıdır. En güncel DJ kontrol üniteleri ve aksesuarları Akdağ Elektronik güvencesiyle sunulmaktadır.`
  },
  'studyo-ekipmanlari': {
    title: 'Stüdyo Referans Monitörleri, Ses Kartları & Kayıt Ekipmanları',
    lead: 'Ev stüdyolarından ticari prodüksiyon merkezlerine kadar kristal netliğinde duyum ve profesyonel kayıt kalitesi sunan stüdyo donanımları.',
    highlights: [
      'Düz frekans tepkisine sahip aktif stüdyo referans monitörleri',
      'Ultra düşük gecikmeli, yüksek çözünürlüklü USB-C ses kartları',
      'Vokal ve enstrüman kaydı için geniş diyaframlı kondenser mikrofonlar',
      'Akustik paneller, ses yalıtım malzemeleri ve stüdyo aksesuarları'
    ],
    body: `Miks ve mastering süreçlerinde doğru kararlar alabilmek, renklendirilmemiş ve gerçeğe en yakın duyumu sağlayan stüdyo monitörleri ve kaliteli ses kartları ile mümkündür.`
  },
  'kulaklik-ve-monitor': {
    title: 'Stüdyo, DJ ve Sahne Kulak İçi Monitör Sistemleri',
    lead: 'Kritik dinleme, stüdyo miksi, DJ performansı ve canlı sahnede müzisyen duyumu için profesyonel kulaklık ve kablosuz IEM sistemleri.',
    highlights: [
      'Geniş frekans aralığına sahip açık ve kapalı stüdyo referans kulaklıkları',
      'Canlı sahnede berrak vokal/enstrüman takibi sağlayan kablosuz in-ear sistemler',
      'Yüksek desibel ortamlar için pasif ses izolasyonlu DJ kulaklıkları',
      'Çok kanallı kulaklık amplifikatörleri ve dağıtıcıları'
    ],
    body: `Her müzikal detayı duymak ve sahnede ritmi eksiksiz yakalamak için doğru kulaklık ve IEM monitör seçimi kritik öneme sahiptir.`
  },
  'sahne-ve-truss': {
    title: 'Alüminyum Sahne Truss Sistemleri, Podyumlar ve Rigging',
    lead: 'Konserler, festivaller ve açık hava organizasyonları için güvenli, modüler ve yüksek taşıma kapasiteli sahne konstrüksiyonları.',
    highlights: [
      'Yüksek mukavemetli alüminyum alaşımlı üçgen ve kare truss sistemleri',
      'Motorlu ve manuel zincirli vinçler, kule (lifter) sistemleri',
      'Modüler yükseklik ayarlı kaydırmaz yüzeyli sahne podyumları',
      'Kelepçe, kanca, spigot ve emniyet teli rigging aksesuarları'
    ],
    body: `Sahne güvenliği taviz verilemez en kritik unsurdur. Statik hesaplamalara uygun alüminyum truss ve podyum sistemleri için proje bazlı teknik teklif alabilirsiniz.`
  },
  'kablo-stand-ve-aksesuar': {
    title: 'Profesyonel Ses Kabloları, Standlar & Sahne Aksesuarları',
    lead: 'Sinyal kaybını en aza indiren oksijensiz bakır ses/ışık kabloları, dayanıklı mikrofon ve hoparlör standları.',
    highlights: [
      'Gürültü önleyici zırhlı dengeli XLR, TRS jak ve Speakon kabloları',
      'DMX 512 ışık kontrol kabloları ve multicore yılan kablolar',
      'Ağır tabanlı profesyonel mikrofon ve hoparlör sehpaları',
      'Profesyonel konnektörler, adaptörler ve sarf malzemeler'
    ],
    body: `En kaliteli hoparlör ve mikser dahi yetersiz kablolama yüzünden parazit ve sinyal zayıflığı yaşayabilir. Profesyonel sahne ve stüdyolar için uzun ömürlü kablo ve donanım aksesuarlarını inceleyebilirsiniz.`
  },
  'tasima-ve-altyapi': {
    title: 'Hard Case Taşıma Çantaları, Rack Kabinler ve Güç Dağıtımı',
    lead: 'Sahne ve turne ekipmanlarınızı darbelere karşı koruyan 19" rack kabinler, flight case sistemleri ve sahne güç dağıtım panoları.',
    highlights: [
      'Standart 19" darbe dayanımlı rack kabinler ve mikser caseleri',
      'Kablo ve aksesuar sandıkları (Trunk Case) ile soft case çantalar',
      'Sahne tipi güç dağıtım panoları (Power Box) ve rack grup prizler',
      'Sanayi tipi fiş, priz ve ağır hizmet kauçuk uzatmalar'
    ],
    body: `Profesyonel ekipmanların uzun ömürlü kullanımı doğru taşıma ve güvenli enerji altyapısına bağlıdır. Turne ve sabit kurulum projelerinize uygun case ve güç dağıtım çözümlerini inceleyebilirsiniz.`
  }
}

const DEFAULT_SEO_CONTENT: SeoContentItem = {
  title: 'Profesyonel Ses, Işık ve Görüntü Sistemlerinde 50 Yıllık Güven: Akdağ Elektronik',
  lead: "1976'dan bugüne yarım asırlık deneyimiyle Akdağ Elektronik, Türkiye genelinde profesyonel ses, ışık, görüntü ve sahne sistemleri tedarik, kurulum ve teknik servis çözümleri sunar.",
  highlights: [
    'Resmi distribütör garantili %100 orijinal profesyonel ekipmanlar',
    'Merkezi depo envanteri ve kurumsal B2B bayi fiyatlandırma avantajı',
    'Uzman mühendislik ekibiyle ücretsiz keşif ve akustik projelendirme',
    'Satış sonrası yetkili teknik servis ve yedek parça güvencesi'
  ],
  body: `Akdağ Elektronik kataloğunda yer alan profesyonel ürünler; konser sahnelerinden stüdyolara, okullardan ibadethanelere ve kurumsal konferans salonlarına kadar her ölçekte projeye yanıt verir. Proje teklifleri ve kurumsal tedarik için ekibimizle iletişime geçebilirsiniz.`
}

export default function CategorySeoText({ categorySlug, categoryName }: Props) {
  const [expanded, setExpanded] = useState(false)

  let content = DEFAULT_SEO_CONTENT
  if (categorySlug) {
    if (SEO_CONTENT_MAP[categorySlug]) {
      content = SEO_CONTENT_MAP[categorySlug]
    } else {
      const matchedKey = Object.keys(SEO_CONTENT_MAP).find((k) => categorySlug.includes(k))
      if (matchedKey) {
        content = SEO_CONTENT_MAP[matchedKey]
      }
    }
  }

  const title = categoryName ? `${categoryName} Modelleri ve Kurumsal Çözüm Rehberi` : content.title

  return (
    <section className="mt-14 border-t border-white/10 pt-10 pb-4 font-body">
      <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 text-brand-red font-display font-black text-xs tracking-widest uppercase mb-2">
          <Sparkles size={15} />
          <span>Akdağ Elektronik Teknik Rehber &amp; Uzman Notu</span>
        </div>

        <h2 className="font-display font-black text-xl sm:text-2xl text-white mb-3 tracking-tight uppercase">
          {title}
        </h2>

        <p className="text-sm text-white/65 leading-relaxed mb-4">{content.lead}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-4">
          {content.highlights.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-xs sm:text-sm text-white/75 bg-white/[0.03] border border-white/10 rounded-lg p-2.5"
            >
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            expanded ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pt-3 border-t border-white/10 text-xs sm:text-sm text-white/60 leading-relaxed space-y-3 whitespace-pre-line">
            <p>{content.body}</p>
            <div className="flex items-center gap-2 text-xs text-white/55 pt-2 font-medium">
              <ShieldCheck size={15} className="text-brand-red shrink-0" />
              <span>
                Akdağ Elektronik üzerinden temin edilen tüm ürünler orijinal ambalajında, resmi distribütör garantisi ve yetkili servis desteğiyle sunulmaktadır.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-1">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-brand-red hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span>{expanded ? 'Daha Az Göster' : 'Devamını Oku ve Detayları Gör'}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </section>
  )
}
