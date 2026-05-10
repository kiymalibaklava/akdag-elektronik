// ─────────────────────────────────────────────
// Akdağ Elektronik — Merkezi Kategori Tanımları
// Yeni 3 Seviyeli Hiyerarşi (Ana > Alt > 3. Seviye)
// ─────────────────────────────────────────────

export interface CategoryNode {
  name: string
  slug: string
  children?: CategoryNode[]
}

/**
 * Yeni hiyerarşik kategori yapısı.
 * Dahili kullanım için ana veri kaynağı.
 */
export const HIERARCHY_DATA: CategoryNode[] = [
  {
    name: 'Ses Sistemleri (Pro Audio)',
    slug: 'ses-sistemleri',
    children: [
      {
        name: 'Mixer & Amfi',
        slug: 'mixer-amfi',
        children: [
          { name: 'Analog Mikserler', slug: 'analog-mikserler' },
          { name: 'Dijital Mikserler', slug: 'dijital-mikserler' },
          { name: 'Power Mikserler', slug: 'power-mikserler' },
          { name: 'Power (Güç) Amfileri', slug: 'power-amfileri' },
          { name: 'Hat Trafolu (100V) Kurulum Amfileri', slug: 'hat-trafolu-kurulum-amfileri' },
        ],
      },
      {
        name: 'Hoparlörler',
        slug: 'hoparlorler',
        children: [
          { name: 'Taşınabilir Ses Sistemleri', slug: 'tasinabilir-ses-sistemleri' },
          { name: 'Aktif Hoparlörler (Kabinler)', slug: 'aktif-hoparlorler' },
          { name: 'Pasif Hoparlörler (Kabinler)', slug: 'pasif-hoparlorler' },
          { name: 'Line Array (Dizi) Sistemler', slug: 'line-array-sistemler' },
          { name: 'Subwooferlar (Bas Kabinleri)', slug: 'subwooferlar' },
          { name: 'Tavan, Sütun ve Duvar Hoparlörleri (Kurulum)', slug: 'tavan-sutun-duvar-hoparlorleri' },
        ],
      },
      {
        name: 'Mikrofon Sistemleri',
        slug: 'mikrofon-sistemleri',
        children: [
          { name: 'Telsiz (Kablosuz) Mikrofonlar (El, Yaka, Kafa)', slug: 'telsiz-mikrofonlar' },
          { name: 'Kablolu Dinamik ve Condenser Mikrofonlar', slug: 'kablolu-mikrofonlar' },
          { name: 'Kürsü ve Konferans (Delege) Sistemleri', slug: 'kursu-ve-konferans-sistemleri' },
          { name: 'Enstrüman Mikrofonları', slug: 'enstruman-mikrofonlari' },
        ],
      },
      {
        name: 'Sinyal İşleyiciler',
        slug: 'sinyal-isleyiciler',
        children: [
          { name: 'DSP (Dijital Ses İşlemcileri)', slug: 'dsp-ses-islemcileri' },
          { name: 'Crossover ve Equalizerlar', slug: 'crossover-ve-equalizerlar' },
          { name: 'Dağıtıcılar (Splitter)', slug: 'ses-dagiticilar' },
        ],
      },
    ],
  },
  {
    name: 'Işık Sistemleri (Pro Lighting)',
    slug: 'isik-sistemleri',
    children: [
      {
        name: 'Sahne Işıkları (Hareketli)',
        slug: 'sahne-isiklari-hareketli',
        children: [
          { name: 'Robot Işıklar (Moving Head - Beam, Spot, Wash)', slug: 'robot-isiklar' },
          { name: 'Scanner Sistemler', slug: 'scanner-sistemler' },
        ],
      },
      {
        name: 'Sahne Işıkları (Sabit)',
        slug: 'sahne-isiklari-sabit',
        children: [
          { name: 'LED Par ve Boyama Işıkları', slug: 'led-par-ve-boyama-isiklari' },
          { name: 'Profil, PC ve Tiyatro Spotları', slug: 'tiyatro-spotlari' },
          { name: 'Strobe (Çakar) ve Blinder (Kör Edici) Işıklar', slug: 'strobe-ve-blinder-isiklar' },
          { name: 'Lazer Sistemleri', slug: 'lazer-sistemleri' },
        ],
      },
      {
        name: 'Efekt Makineleri ve Likitler',
        slug: 'efekt-makineleri-ve-likitler',
        children: [
          { name: 'Sis, Duman ve Hazer Makineleri', slug: 'sis-ve-duman-makineleri' },
          { name: 'Kar, Köpük ve Baloncuk Makineleri', slug: 'kar-ve-kopuk-makineleri' },
          { name: 'Kıvılcım (Cold Spark) ve Alev Makineleri', slug: 'kivilcim-ve-alev-makineleri' },
          { name: 'Efekt Likitleri ve Tozları', slug: 'efekt-likitleri' },
        ],
      },
      {
        name: 'Işık Kontrol',
        slug: 'isik-kontrol',
        children: [
          { name: 'DMX Işık Masaları ve Konsollar', slug: 'dmx-isik-masalari' },
          { name: 'PC/USB DMX Yazılım ve Arayüzleri', slug: 'pc-dmx-yazilimlari' },
          { name: 'DMX Dağıtıcı (Splitter) ve Sinyal Güçlendiriciler', slug: 'dmx-splitterlar' },
        ],
      },
      {
        name: 'Mimari ve Dış Mekan Aydınlatma',
        slug: 'mimari-aydinlatma',
        children: [
          { name: "Dış Mekan (Outdoor) LED Par'lar", slug: 'dis-mekan-led-parlar' },
          { name: 'Wall Washerlar (Duvar Boyamalar)', slug: 'wall-washerlar' },
        ],
      },
    ],
  },
  {
    name: 'Görüntü Sistemleri (Visuals)',
    slug: 'goruntu-sistemleri',
    children: [
      {
        name: 'LED Ekran Sistemleri',
        slug: 'led-ekran-sistemleri',
        children: [
          { name: 'İç Mekan (Indoor) LED Paneller', slug: 'ic-mekan-led-paneller' },
          { name: 'Dış Mekan (Outdoor) LED Paneller', slug: 'dis-mekan-led-paneller' },
          { name: 'LED Ekran İşlemcileri (Video Processor) ve Gönderici Kartlar', slug: 'led-ekran-islemcileri' },
        ],
      },
      {
        name: 'Projeksiyon Cihazları ve Perdeler',
        slug: 'projeksiyon-sistemleri',
        children: [
          { name: 'Profesyonel Projeksiyon Cihazları', slug: 'profesyonel-projeksiyonlar' },
          { name: 'Motorlu Projeksiyon Perdeleri', slug: 'motorlu-projeksiyon-perdeleri' },
          { name: 'Stor ve Taşınabilir Perdeler', slug: 'tasinabilir-projeksiyon-perdeleri' },
        ],
      },
      {
        name: 'Görüntü Yönetimi ve Dağıtım',
        slug: 'goruntu-yonetimi',
        children: [
          { name: 'Video Mikserleri (Switcher)', slug: 'video-mikserleri' },
          { name: 'Görüntü Çoklayıcı (Splitter) ve Matrisler (Matrix)', slug: 'goruntu-splitterlar' },
          { name: 'Görüntü Çeviriciler (Converter)', slug: 'goruntu-ceviriciler' },
        ],
      },
    ],
  },
  {
    name: 'Sahne ve Truss (Truss & Rigging)',
    slug: 'sahne-ve-truss',
    children: [
      {
        name: 'Truss Sistemleri',
        slug: 'truss-sistemleri',
        children: [
          { name: 'Kare Trusslar', slug: 'kare-trusslar' },
          { name: 'Üçgen Trusslar', slug: 'ucgen-trusslar' },
          { name: 'Dairesel Trusslar', slug: 'dairesel-trusslar' },
          { name: 'Köşe Bağlantıları ve Uzatmalar', slug: 'truss-baglanti-aparatlari' },
        ],
      },
      {
        name: 'Sahne ve Podyum',
        slug: 'sahne-ve-podyum',
        children: [
          { name: 'Modüler Sahne Platformları', slug: 'moduler-sahne-platformlari' },
          { name: 'Sahne Ayakları ve Profiller', slug: 'sahne-ayaklari' },
          { name: 'Sahne Merdivenleri ve Korkuluklar', slug: 'sahne-merdivenleri' },
        ],
      },
      {
        name: 'Kaldırma Sistemleri (Rigging)',
        slug: 'kaldirma-sistemleri',
        children: [
          { name: 'Manuel Zincirli Vinçler (Chain Hoist)', slug: 'manuel-vincler' },
          { name: 'Elektrikli Vinç Motorları', slug: 'elektrikli-vincler' },
          { name: 'Kule (Lifter) Sistemleri', slug: 'kule-lifterlar' },
          { name: 'Bağlantı Ekipmanları (Kelepçe, Sapan, Kilit)', slug: 'rigging-baglanti-ekipmanlari' },
        ],
      },
    ],
  },
  {
    name: 'Kablo, Stand ve Aksesuar (Accessories & Cables)',
    slug: 'kablo-stand-ve-aksesuar',
    children: [
      {
        name: 'Kablolar (Hazır ve Makara)',
        slug: 'kablolar',
        children: [
          { name: 'Ses Kabloları (Mikrofon, Enstrüman, Hoparlör)', slug: 'ses-kablolari' },
          { name: 'DMX Işık Kabloları', slug: 'dmx-isik-kablolari' },
          { name: 'Görüntü Kabloları (HDMI, SDI, VGA)', slug: 'goruntu-kablolari' },
          { name: 'Multicore (Yılan) Kablolar', slug: 'multicore-kablolar' },
        ],
      },
      {
        name: 'Konnektörler ve Adaptörler',
        slug: 'konnektorler-ve-adaptorler',
        children: [
          { name: 'XLR, Speakon ve Çivi Jaklar', slug: 'xlr-ve-speakon-konnektorler' },
          { name: 'Powercon Fişler', slug: 'powercon-konnektorler' },
          { name: 'Çevirici Adaptör Jaklar', slug: 'cevirici-adaptorler' },
        ],
      },
      {
        name: 'Standlar ve Sehpalar',
        slug: 'standlar-ve-sehpalar',
        children: [
          { name: 'Hoparlör Standları (Ayakları)', slug: 'hoparlor-standlari' },
          { name: 'Mikrofon Standları (Düz ve Deveboynu)', slug: 'mikrofon-standlari' },
          { name: 'Işık Standları ve T-Barlar', slug: 'isik-standlari' },
          { name: 'Nota ve Enstrüman Standları', slug: 'nota-ve-enstruman-standlari' },
        ],
      },
      {
        name: 'Sarf Malzemeler',
        slug: 'sarf-malzemeler',
        children: [
          { name: 'Gaffar Bantlar ve Sahne Bantları', slug: 'sahne-bantlari' },
          { name: 'Kablo Toplayıcılar ve Cırtlar', slug: 'kablo-toplayicilar' },
        ],
      },
    ],
  },
  {
    name: 'Taşıma ve Altyapı (Cases & Power)',
    slug: 'tasima-ve-altyapi',
    children: [
      {
        name: 'Taşıma Çantaları (Hard Case & Bag)',
        slug: 'tasima-cantalari',
        children: [
          { name: 'Rack Kabinler (Standart 19")', slug: 'rack-kabinler' },
          { name: 'Mikser ve Işık Masası Caseleri', slug: 'mikser-ve-isik-masasi-caseleri' },
          { name: 'Kablo ve Aksesuar Sandıkları (Trunk Case)', slug: 'trunk-caseler' },
          { name: 'Soft Case Taşıma Çantaları', slug: 'soft-case-cantalar' },
        ],
      },
      {
        name: 'Enerji ve Güç Dağıtımı',
        slug: 'enerji-ve-guc-dagitimi',
        children: [
          { name: 'Sahne Tipi Güç Dağıtım Panoları (Power Box)', slug: 'power-boxlar' },
          { name: 'Rack Tipi Grup Prizler', slug: 'rack-tipi-prizler' },
          { name: 'Sanayi Tipi Fiş, Priz ve Kauçuk Uzatmalar', slug: 'sanayi-tipi-fislere-prizler' },
        ],
      },
    ],
  },
]

/**
 * Geriye dönük uyumluluk için eski yapıyı taklit eden exportlar.
 */
export const NEW_KATEGORI_HIYERARSI = HIERARCHY_DATA

export const KATEGORI_HIYERARSI = HIERARCHY_DATA.map(ana => ({
  label: ana.name,
  labelEn: ana.slug,
  altKategoriler: ana.children?.map(alt => ({
    label: alt.name,
    detaylar: alt.children?.map(d => d.name) || []
  })) || []
}))

export const KATEGORILER: string[] = KATEGORI_HIYERARSI.map((k) => k.label)
export const TUM_KATEGORILER: string[] = ['Tümü', ...KATEGORILER]

export function getAltKategoriler(anaKategori: string): string[] {
  const ana = KATEGORI_HIYERARSI.find((k) => k.label === anaKategori)
  return ana ? ana.altKategoriler.map((a) => a.label) : []
}

export function tumAltKategoriler(): string[] {
  return KATEGORI_HIYERARSI.flatMap((k) => k.altKategoriler.map((a) => a.label))
}

export function getDetayKategoriler(anaKategori: string, altKategori: string): string[] {
  const ana = KATEGORI_HIYERARSI.find((k) => k.label === anaKategori)
  if (!ana) return []
  const alt = ana.altKategoriler.find((a) => a.label === altKategori)
  return alt ? alt.detaylar : []
}

/**
 * Slug üzerinden kategori bulma (Routing için)
 */
export function findCategoryBySlug(slugs: string[]) {
  let current: CategoryNode | undefined = undefined
  let list = HIERARCHY_DATA

  for (const slug of slugs) {
    current = list.find(n => n.slug === slug)
    if (!current) return null
    list = current.children || []
  }
  return current
}

/**
 * Ürün kategorilerine göre tam breadcrumb hiyerarşisi oluşturur.
 */
export function getBreadcrumbs(ana?: string | null, alt?: string | null, detay?: string | null) {
  const crumbs = [{ name: 'Ürünler', href: '/urunler' }]
  if (!ana) return crumbs

  const anaNode = HIERARCHY_DATA.find(n => n.name === ana)
  if (anaNode) {
    crumbs.push({ name: anaNode.name, href: `/urunler/${anaNode.slug}` })
    
    if (alt && anaNode.children) {
      const altNode = anaNode.children.find(n => n.name === alt)
      if (altNode) {
        crumbs.push({ name: altNode.name, href: `/urunler/${anaNode.slug}/${altNode.slug}` })
        
        if (detay && altNode.children) {
          const detayNode = altNode.children.find(n => n.name === detay)
          if (detayNode) {
            crumbs.push({ name: detayNode.name, href: `/urunler/${anaNode.slug}/${altNode.slug}/${detayNode.slug}` })
          }
        }
      }
    }
  }
  return crumbs
}
