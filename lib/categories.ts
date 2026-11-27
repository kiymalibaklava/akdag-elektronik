// ─────────────────────────────────────────────
// Akdağ Elektronik — Merkezi Kategori Tanımları
// Sescim.com ile birebir uyumlu 3 Seviyeli Hiyerarşi (Ana > Alt > 3. Seviye)
// ─────────────────────────────────────────────

export interface CategoryNode {
  name: string
  slug: string
  dbName?: string | string[]
  children?: CategoryNode[]
}

export const HIERARCHY_DATA: CategoryNode[] = [
  {
    name: 'Ses Sistemleri',
    slug: 'ses-sistemleri',
    dbName: ['Ses Sistemleri', 'Ses Sistemleri (Pro Audio)'],
    children: [
      {
        name: 'Mixer & Amfi',
        slug: 'mixer-amfi',
        dbName: ['Mixer & Amfi', 'Mikserler ve Kontrol'],
        children: [
          { name: 'Analog Mikserler', slug: 'analog-mikserler' },
          { name: 'Dijital Mikserler', slug: 'dijital-mikserler' },
          { name: 'Power Mikserler', slug: 'power-mikserler' },
          { name: 'Power Amfileri', slug: 'power-amfileri', dbName: ['Power Amfileri', 'Power (Güç) Amfileri'] },
          { name: 'Hat Trafolu Kurulum Amfileri', slug: 'hat-trafolu-kurulum-amfileri', dbName: ['Hat Trafolu Kurulum Amfileri', 'Hat Trafolu (100V) Kurulum Amfileri'] },
        ],
      },
      {
        name: 'Hoparlörler',
        slug: 'hoparlorler',
        dbName: ['Hoparlörler', 'Hoparlör Grupları'],
        children: [
          { name: 'Taşınabilir Ses Sistemleri', slug: 'tasinabilir-ses-sistemleri' },
          { name: 'Aktif Hoparlörler', slug: 'aktif-hoparlorler', dbName: ['Aktif Hoparlörler', 'Aktif Hoparlörler (Kabinler)', 'Aktif/Pasif Kabin Hoparlörler'] },
          { name: 'Pasif Hoparlörler', slug: 'pasif-hoparlorler', dbName: ['Pasif Hoparlörler', 'Pasif Hoparlörler (Kabinler)', 'Aktif/Pasif Kabin Hoparlörler'] },
          { name: 'Line Array Sistemler', slug: 'line-array-sistemler', dbName: ['Line Array Sistemler', 'Line-Array Sistemler', 'Line Array (Dizi) Sistemler'] },
          { name: 'Subwooferlar', slug: 'subwooferlar', dbName: ['Subwooferlar', 'Subwooferlar (Bas Kabinleri)'] },
          { name: 'Tavan, Sütun ve Duvar Hoparlörleri', slug: 'tavan-sutun-duvar-hoparlorleri', dbName: ['Tavan, Sütun ve Duvar Hoparlörleri', 'Tavan, Sütun ve Duvar Hoparlörleri (Kurulum)'] },
        ],
      },
      {
        name: 'Mikrofon Sistemleri',
        slug: 'mikrofon-sistemleri',
        dbName: ['Mikrofon Sistemleri', 'Mikrofonlar'],
        children: [
          { name: 'Telsiz Mikrofonlar (El, Yaka, Kafa)', slug: 'telsiz-mikrofonlar', dbName: ['Telsiz Mikrofonlar (El, Yaka, Kafa)', 'Telsiz (Kablosuz) Mikrofonlar (El, Yaka, Kafa)', 'Kablosuz (Wireless) El/Yaka/Headset Takımları'] },
          { name: 'Kablolu Dinamik ve Condenser Mikrofonlar', slug: 'kablolu-mikrofonlar' },
          { name: 'Kürsü ve Konferans Sistemleri', slug: 'kursu-ve-konferans-sistemleri', dbName: ['Kürsü ve Konferans Sistemleri', 'Kürsü ve Konferans (Delege) Sistemleri', 'Kürsü ve Konferans Mikrofonları'] },
          { name: 'Enstrüman Mikrofonları', slug: 'enstruman-mikrofonlari' },
          { name: 'Stüdyo Kondenser Mikrofon', slug: 'studyo-kondenser-mikrofon' },
          { name: 'USB Mikrofon', slug: 'usb-mikrofon' },
        ],
      },
      {
        name: 'Sinyal İşleyiciler',
        slug: 'sinyal-isleyiciler',
        children: [
          { name: 'DSP Ses İşlemcileri', slug: 'dsp-ses-islemcileri', dbName: ['DSP Ses İşlemcileri', 'DSP (Dijital Ses İşlemcileri)'] },
          { name: 'Crossover ve Equalizerlar', slug: 'crossover-ve-equalizerlar' },
          { name: 'Ses Dağıtıcılar (Splitter)', slug: 'ses-dagiticilar', dbName: ['Ses Dağıtıcılar (Splitter)', 'Dağıtıcılar (Splitter)'] },
        ],
      },
    ],
  },
  {
    name: 'Işık Sistemleri',
    slug: 'isik-sistemleri',
    dbName: ['Işık Sistemleri', 'Işık Sistemleri (Pro Lighting)'],
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
          { name: 'Strobe ve Blinder Işıklar', slug: 'strobe-ve-blinder-isiklar', dbName: ['Strobe ve Blinder Işıklar', 'Strobe (Çakar) ve Blinder (Kör Edici) Işıklar'] },
          { name: 'Lazer Sistemleri', slug: 'lazer-sistemleri' },
        ],
      },
      {
        name: 'Efekt Makineleri',
        slug: 'efekt-makineleri-ve-likitler',
        dbName: ['Efekt Makineleri', 'Efekt Makineleri ve Likitler'],
        children: [
          { name: 'Sis, Duman ve Hazer Makineleri', slug: 'sis-ve-duman-makineleri' },
          { name: 'Kar, Köpük ve Baloncuk Makineleri', slug: 'kar-ve-kopuk-makineleri' },
          { name: 'Kıvılcım ve Alev Makineleri', slug: 'kivilcim-ve-alev-makineleri', dbName: ['Kıvılcım ve Alev Makineleri', 'Kıvılcım (Cold Spark) ve Alev Makineleri'] },
          { name: 'Efekt Likitleri ve Tozları', slug: 'efekt-likitleri' },
        ],
      },
      {
        name: 'Işık Kontrol',
        slug: 'isik-kontrol',
        children: [
          { name: 'DMX Işık Masaları ve Konsollar', slug: 'dmx-isik-masalari' },
          { name: 'PC/USB DMX Yazılım ve Arayüzleri', slug: 'pc-dmx-yazilimlari' },
          { name: 'DMX Dağıtıcı ve Sinyal Güçlendiriciler', slug: 'dmx-splitterlar', dbName: ['DMX Dağıtıcı ve Sinyal Güçlendiriciler', 'DMX Dağıtıcı (Splitter) ve Sinyal Güçlendiriciler'] },
        ],
      },
      {
        name: 'Mimari Aydınlatma',
        slug: 'mimari-aydinlatma',
        dbName: ['Mimari Aydınlatma', 'Mimari ve Dış Mekan Aydınlatma'],
        children: [
          { name: "Dış Mekan LED Par'lar", slug: 'dis-mekan-led-parlar', dbName: ["Dış Mekan LED Par'lar", "Dış Mekan (Outdoor) LED Par'lar"] },
          { name: 'Wall Washerlar', slug: 'wall-washerlar', dbName: ['Wall Washerlar', 'Wall Washerlar (Duvar Boyamalar)'] },
        ],
      },
    ],
  },
  {
    name: 'Görüntü Sistemleri',
    slug: 'goruntu-sistemleri',
    dbName: ['Görüntü Sistemleri', 'Görüntü Sistemleri (Visuals)'],
    children: [
      {
        name: 'LED Ekran Sistemleri',
        slug: 'led-ekran-sistemleri',
        children: [
          { name: 'İç Mekan LED Paneller', slug: 'ic-mekan-led-paneller', dbName: ['İç Mekan LED Paneller', 'İç Mekan (Indoor) LED Paneller'] },
          { name: 'Dış Mekan LED Paneller', slug: 'dis-mekan-led-paneller', dbName: ['Dış Mekan LED Paneller', 'Dış Mekan (Outdoor) LED Paneller'] },
          { name: 'LED Ekran İşlemcileri', slug: 'led-ekran-islemcileri', dbName: ['LED Ekran İşlemcileri', 'LED Ekran İşlemcileri (Video Processor) ve Gönderici Kartlar'] },
        ],
      },
      {
        name: 'Projeksiyon Sistemleri',
        slug: 'projeksiyon-sistemleri',
        dbName: ['Projeksiyon Sistemleri', 'Projeksiyon Cihazları ve Perdeler'],
        children: [
          { name: 'Profesyonel Projeksiyon Cihazları', slug: 'profesyonel-projeksiyonlar' },
          { name: 'Motorlu Projeksiyon Perdeleri', slug: 'motorlu-projeksiyon-perdeleri' },
          { name: 'Stor ve Taşınabilir Perdeler', slug: 'tasinabilir-projeksiyon-perdeleri' },
        ],
      },
      {
        name: 'Görüntü Yönetimi',
        slug: 'goruntu-yonetimi',
        dbName: ['Görüntü Yönetimi', 'Görüntü Yönetimi ve Dağıtım'],
        children: [
          { name: 'Video Mikserleri (Switcher)', slug: 'video-mikserleri' },
          { name: 'Görüntü Splitter ve Matrisler', slug: 'goruntu-splitterlar', dbName: ['Görüntü Splitter ve Matrisler', 'Görüntü Çoklayıcı (Splitter) ve Matrisler (Matrix)'] },
          { name: 'Görüntü Çeviriciler (Converter)', slug: 'goruntu-ceviriciler' },
        ],
      },
    ],
  },
  {
    name: 'Kulaklık & Monitör',
    slug: 'kulaklik-ve-monitor',
    children: [
      {
        name: 'DJ & Stüdyo Kulaklıklar',
        slug: 'dj-studyo-kulakliklar',
        children: [
          { name: 'Over-Ear DJ Kulaklıklar', slug: 'over-ear-dj-kulakliklar' },
          { name: 'Stüdyo Referans Kulaklıklar', slug: 'studyo-referans-kulakliklar' },
          { name: 'Kablosuz Sahnesi Kulaklıklar', slug: 'kablosuz-sahne-kulakliklar' },
        ],
      },
      {
        name: 'In-Ear Monitor (IEM)',
        slug: 'in-ear-monitor',
        children: [
          { name: 'Kablolu IEM', slug: 'kablolu-iem' },
          { name: 'Kablosuz IEM Sistemleri', slug: 'kablosuz-iem-sistemleri' },
        ],
      },
      {
        name: 'Stüdyo Monitör Hoparlörler',
        slug: 'studyo-monitor-hoparlorler',
        children: [
          { name: 'Aktif Stüdyo Monitörler', slug: 'aktif-studyo-monitorler' },
          { name: 'Pasif Stüdyo Monitörler', slug: 'pasif-studyo-monitorler' },
        ],
      },
      {
        name: 'Kulaklık Amplifikatörleri',
        slug: 'kulaklik-amplifikatorleri',
        children: [
          { name: 'Stereo Kulaklık Amfileri', slug: 'stereo-kulaklik-amfileri' },
          { name: 'Çok Kanallı Kulaklık Dağıtıcılar', slug: 'kulaklik-dagiticilar' },
        ],
      },
    ],
  },
  {
    name: 'DJ Ekipmanları',
    slug: 'dj-ekipmanlari',
    children: [
      {
        name: 'DJ Controller & Mixer',
        slug: 'dj-controller-mixer',
        children: [
          { name: 'DJ Controller', slug: 'dj-controller' },
          { name: 'DJ Mixer', slug: 'dj-mixer' },
          { name: 'Scratch Turntable', slug: 'scratch-turntable' },
        ],
      },
      {
        name: 'Media Player & CDJ',
        slug: 'media-player-cdj',
        children: [
          { name: 'Profesyonel CDJ', slug: 'profesyonel-cdj' },
          { name: 'DJ Media Player', slug: 'dj-media-player' },
        ],
      },
      {
        name: 'DJ Aksesuarları',
        slug: 'dj-aksesuarlari',
        children: [
          { name: 'DJ Çantası ve Kılıfı', slug: 'dj-cantasi' },
          { name: 'DJ Stand ve Rack', slug: 'dj-stand-rack' },
          { name: 'İğne ve Kartuş', slug: 'igne-ve-kartus' },
        ],
      },
    ],
  },
  {
    name: 'Stüdyo Ekipmanları',
    slug: 'studyo-ekipmanlari',
    children: [
      {
        name: 'Audio Interface (Ses Kartı)',
        slug: 'audio-interface',
        children: [
          { name: '2 Kanal Ses Kartı', slug: '2-kanal-ses-karti' },
          { name: 'Çok Kanallı Ses Kartı', slug: 'cok-kanalli-ses-karti' },
          { name: 'USB Ses Kartı', slug: 'usb-ses-karti' },
        ],
      },
      {
        name: 'Stüdyo Mikrofon Paketleri',
        slug: 'studyo-mikrofon-paketleri',
        children: [
          { name: 'Condenser Mikrofon Seti', slug: 'condenser-mikrofon-seti' },
          { name: 'Vokal Kayıt Paketi', slug: 'vokal-kayit-paketi' },
          { name: 'Podcast & Yayın Seti', slug: 'podcast-yayin-seti' },
        ],
      },
      {
        name: 'Akustik & Ses Yalıtım',
        slug: 'akustik-ses-yalitim',
        children: [
          { name: 'Akustik Panel', slug: 'akustik-panel' },
          { name: 'Köpük Sünger (Akustik Sünger)', slug: 'akustik-sunger' },
          { name: 'Ses Yalıtım Malzemeleri', slug: 'ses-yalitim-malzemeleri' },
        ],
      },
    ],
  },
  {
    name: 'Sahne ve Truss',
    slug: 'sahne-ve-truss',
    dbName: ['Sahne ve Truss', 'Sahne ve Truss (Truss & Rigging)'],
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
          { name: 'Sahne Ayakları', slug: 'sahne-ayaklari', dbName: ['Sahne Ayakları', 'Sahne Ayakları ve Profiller'] },
          { name: 'Sahne Merdivenleri', slug: 'sahne-merdivenleri', dbName: ['Sahne Merdivenleri', 'Sahne Merdivenleri ve Korkuluklar'] },
        ],
      },
      {
        name: 'Rigging Sistemleri',
        slug: 'kaldirma-sistemleri',
        dbName: ['Rigging Sistemleri', 'Kaldırma Sistemleri (Rigging)'],
        children: [
          { name: 'Manuel Zincirli Vinçler', slug: 'manuel-vincler', dbName: ['Manuel Zincirli Vinçler', 'Manuel Zincirli Vinçler (Chain Hoist)'] },
          { name: 'Elektrikli Vinç Motorları', slug: 'elektrikli-vincler' },
          { name: 'Kule (Lifter) Sistemleri', slug: 'kule-lifterlar' },
          { name: 'Rigging Bağlantı Ekipmanları', slug: 'rigging-baglanti-ekipmanlari', dbName: ['Rigging Bağlantı Ekipmanları', 'Bağlantı Ekipmanları (Kelepçe, Sapan, Kilit)'] },
        ],
      },
    ],
  },
  {
    name: 'Kablo, Stand ve Aksesuar',
    slug: 'kablo-stand-ve-aksesuar',
    dbName: ['Kablo, Stand ve Aksesuar', 'Kablo, Stand ve Aksesuar (Accessories & Cables)'],
    children: [
      {
        name: 'Kablolar',
        slug: 'kablolar',
        dbName: ['Kablolar', 'Kablolar (Hazır ve Makara)', 'Kablolar ve Konnektörler'],
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
        dbName: ['Standlar ve Sehpalar', 'Stand ve Sehpalar'],
        children: [
          { name: 'Hoparlör Standları', slug: 'hoparlor-standlari', dbName: ['Hoparlör Standları', 'Hoparlör Standları (Ayakları)', 'Hoparlör ve Işık Sehpaları'] },
          { name: 'Mikrofon Standları', slug: 'mikrofon-standlari', dbName: ['Mikrofon Standları', 'Mikrofon Standları (Düz ve Deveboynu)'] },
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
    name: 'Taşıma ve Altyapı',
    slug: 'tasima-ve-altyapi',
    dbName: ['Taşıma ve Altyapı', 'Taşıma ve Altyapı (Cases & Power)'],
    children: [
      {
        name: 'Taşıma Çantaları (Hard Case & Bag)',
        slug: 'tasima-cantalari',
        children: [
          { name: 'Rack Kabinler (Standart 19")', slug: 'rack-kabinler' },
          { name: 'Mikser ve Işık Masası Caseleri', slug: 'mikser-ve-isik-masasi-caseleri' },
          { name: 'Trunk Case (Kablo Sandığı)', slug: 'trunk-caseler', dbName: ['Trunk Case (Kablo Sandığı)', 'Kablo ve Aksesuar Sandıkları (Trunk Case)'] },
          { name: 'Soft Case Taşıma Çantaları', slug: 'soft-case-cantalar' },
        ],
      },
      {
        name: 'Enerji ve Güç Dağıtımı',
        slug: 'enerji-ve-guc-dagitimi',
        children: [
          { name: 'Sahne Tipi Güç Dağıtım Panoları', slug: 'power-boxlar', dbName: ['Sahne Tipi Güç Dağıtım Panoları', 'Sahne Tipi Güç Dağıtım Panoları (Power Box)'] },
          { name: 'Rack Tipi Grup Prizler', slug: 'rack-tipi-prizler' },
          { name: 'Sanayi Tipi Fiş ve Kauçuk Uzatmalar', slug: 'sanayi-tipi-fislere-prizler', dbName: ['Sanayi Tipi Fiş ve Kauçuk Uzatmalar', 'Sanayi Tipi Fiş, Priz ve Kauçuk Uzatmalar'] },
        ],
      },
    ],
  },
]

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

export function canonicalCategoryLabel(rawCat?: string | null): string {
  if (!rawCat) return ''
  const trimmed = rawCat.trim()
  for (const node of HIERARCHY_DATA) {
    if (node.name.toLowerCase() === trimmed.toLowerCase()) return node.name
    if (Array.isArray(node.dbName)) {
      if (node.dbName.some(d => d.toLowerCase() === trimmed.toLowerCase())) return node.name
    } else if (node.dbName && node.dbName.toLowerCase() === trimmed.toLowerCase()) {
      return node.name
    }
  }
  for (const node of HIERARCHY_DATA) {
    if (trimmed.toLowerCase().startsWith(node.name.toLowerCase())) return node.name
  }
  return trimmed
}

export function canonicalSubCategoryLabel(categoryName: string, rawSub?: string | null): string {
  if (!rawSub) return ''
  const trimmed = rawSub.trim()
  const catNode = HIERARCHY_DATA.find(n => n.name.toLowerCase() === categoryName.trim().toLowerCase())
  if (!catNode || !catNode.children) return trimmed

  for (const sub of catNode.children) {
    if (sub.name.toLowerCase() === trimmed.toLowerCase()) return sub.name
    if (Array.isArray(sub.dbName)) {
      if (sub.dbName.some(d => d.toLowerCase() === trimmed.toLowerCase())) return sub.name
    } else if (sub.dbName && sub.dbName.toLowerCase() === trimmed.toLowerCase()) {
      return sub.name
    }
  }
  for (const sub of catNode.children) {
    if (trimmed.toLowerCase().includes(sub.name.toLowerCase()) || sub.name.toLowerCase().includes(trimmed.toLowerCase())) {
      return sub.name
    }
  }
  return trimmed
}

export function canonicalUrunTipiLabel(categoryName: string, subCategoryName: string, rawType?: string | null): string {
  if (!rawType) return ''
  const trimmed = rawType.trim()
  const catNode = HIERARCHY_DATA.find(n => n.name.toLowerCase() === categoryName.trim().toLowerCase())
  if (!catNode || !catNode.children) return trimmed
  const subNode = catNode.children.find(s => s.name.toLowerCase() === subCategoryName.trim().toLowerCase())
  if (!subNode || !subNode.children) return trimmed

  for (const leaf of subNode.children) {
    if (leaf.name.toLowerCase() === trimmed.toLowerCase()) return leaf.name
    if (Array.isArray(leaf.dbName)) {
      if (leaf.dbName.some(d => d.toLowerCase() === trimmed.toLowerCase())) return leaf.name
    } else if (leaf.dbName && leaf.dbName.toLowerCase() === trimmed.toLowerCase()) {
      return leaf.name
    }
  }
  for (const leaf of subNode.children) {
    if (trimmed.toLowerCase().includes(leaf.name.toLowerCase()) || leaf.name.toLowerCase().includes(trimmed.toLowerCase())) {
      return leaf.name
    }
  }
  return trimmed
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

export interface MatchedCategory extends CategoryNode {
  level: number
  canonicalPath: string[]
}

export function findCategoryBySlug(slugs: string[]): MatchedCategory | null {
  if (!slugs || slugs.length === 0) return null

  let current: CategoryNode | undefined = undefined
  let list = HIERARCHY_DATA
  let exactMatch = true

  for (const slug of slugs) {
    current = list.find(n => n.slug === slug)
    if (!current) {
      exactMatch = false
      break
    }
    list = current.children || []
  }

  if (exactMatch && current) {
    return {
      ...current,
      level: slugs.length,
      canonicalPath: slugs
    }
  }

  const targetSlug = slugs[slugs.length - 1]
  let result: MatchedCategory | null = null

  function search(nodes: CategoryNode[], currentPath: string[], currentLevel: number) {
    for (const node of nodes) {
      const nodePath = [...currentPath, node.slug]
      if (node.slug === targetSlug) {
        result = {
          ...node,
          level: currentLevel,
          canonicalPath: nodePath
        }
        return
      }
      if (node.children && node.children.length > 0) {
        search(node.children, nodePath, currentLevel + 1)
        if (result) return
      }
    }
  }

  search(HIERARCHY_DATA, [], 1)
  return result
}

export function getBreadcrumbs(ana?: string | null, alt?: string | null, detay?: string | null) {
  const crumbs = [{ name: 'Ürünler', href: '/urunler' }]
  if (!ana) return crumbs

  const normalizedAna = canonicalCategoryLabel(ana)
  const anaNode = HIERARCHY_DATA.find(n => n.name === normalizedAna)
  if (anaNode) {
    crumbs.push({ name: anaNode.name, href: `/urunler/${anaNode.slug}` })
    if (alt && anaNode.children) {
      const normalizedAlt = canonicalSubCategoryLabel(anaNode.name, alt)
      const altNode = anaNode.children.find(n => n.name === normalizedAlt)
      if (altNode) {
        crumbs.push({ name: altNode.name, href: `/urunler/${anaNode.slug}/${altNode.slug}` })
        if (detay && altNode.children) {
          const normalizedDetay = canonicalUrunTipiLabel(anaNode.name, altNode.name, detay)
          const detayNode = altNode.children.find(n => n.name === normalizedDetay)
          if (detayNode) {
            crumbs.push({ name: detayNode.name, href: `/urunler/${anaNode.slug}/${altNode.slug}/${detayNode.slug}` })
          }
        }
      }
    }
  }
  return crumbs
}

export interface FlattenedCategory {
  name: string
  slug: string
  path: string
  hierarchyText: string
  level: 1 | 2 | 3
}

export function getAllFlattenedCategories(): FlattenedCategory[] {
  const result: FlattenedCategory[] = []

  for (const ana of HIERARCHY_DATA) {
    result.push({
      name: ana.name,
      slug: ana.slug,
      path: `/urunler/${ana.slug}`,
      hierarchyText: ana.name,
      level: 1,
    })

    if (ana.children) {
      for (const alt of ana.children) {
        result.push({
          name: alt.name,
          slug: alt.slug,
          path: `/urunler/${ana.slug}/${alt.slug}`,
          hierarchyText: `${ana.name} > ${alt.name}`,
          level: 2,
        })

        if (alt.children) {
          for (const detay of alt.children) {
            result.push({
              name: detay.name,
              slug: detay.slug,
              path: `/urunler/${ana.slug}/${alt.slug}/${detay.slug}`,
              hierarchyText: `${ana.name} > ${alt.name} > ${detay.name}`,
              level: 3,
            })
          }
        }
      }
    }
  }

  return result
}
