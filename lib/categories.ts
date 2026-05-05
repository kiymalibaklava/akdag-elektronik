// ─────────────────────────────────────────────
// Akdağ Elektronik — Merkezi Kategori Tanımları
// Tüm bileşenler bu dosyadan import eder.
// ─────────────────────────────────────────────

export interface AltKategori {
  label: string
  detaylar: string[]
}

export interface AnaKategori {
  label: string
  labelEn: string
  altKategoriler: AltKategori[]
}

/**
 * Profesyonel hiyerarşik kategori yapısı.
 * Ana Kategori → Alt Kategori → Detaylar
 */
export const KATEGORI_HIYERARSI: AnaKategori[] = [
  {
    label: 'Ses Sistemleri',
    labelEn: 'Pro Audio',
    altKategoriler: [
      {
        label: 'Hoparlör Grupları',
        detaylar: [
          'Line-Array Sistemler',
          'Aktif/Pasif Kabin Hoparlörler',
          'Subwooferlar',
          'Sahne Monitörleri',
        ],
      },
      {
        label: 'Mikserler ve Kontrol',
        detaylar: [
          'Dijital Ses Mikserleri',
          'Analog Mikserler',
          'Sahne Box (Stagebox) ve Snake Kablolar',
        ],
      },
      {
        label: 'Mikrofonlar',
        detaylar: [
          'Kablosuz (Wireless) El/Yaka/Headset Takımları',
          'Enstrüman Mikrofonları',
          'Kürsü ve Konferans Mikrofonları',
        ],
      },
      {
        label: 'İşlemciler ve Amfiler',
        detaylar: [
          'Güç Amplifikatörleri',
          'DSP ve EQ Üniteleri',
        ],
      },
    ],
  },
  {
    label: 'Işık Sistemleri',
    labelEn: 'Pro Lighting',
    altKategoriler: [
      {
        label: 'Robot Işıklar (Moving Heads)',
        detaylar: ['Beam', 'Spot', 'Wash'],
      },
      {
        label: 'Statik ve Boyama Işıkları',
        detaylar: [
          'LED Par ve Bar Aydınlatmalar',
          'Blinderlar',
          'Tiyatro Spotları',
        ],
      },
      {
        label: 'Kontrol Sistemleri',
        detaylar: [
          'DMX Işık Masaları',
          'PC Tabanlı Kontrol Yazılımları/Arayüzler',
          'DMX Splitter ve Wireless DMX',
        ],
      },
      {
        label: 'Efekt Makineleri',
        detaylar: [
          'Sis (Fazer/Haze) Makineleri',
          'Konfeti/Kabarcık Makineleri',
          'Alev ve Soğuk Kıvılcım Makineleri',
        ],
      },
    ],
  },
  {
    label: 'Görüntü Sistemleri',
    labelEn: 'Visuals',
    altKategoriler: [
      {
        label: 'LED Ekran Teknolojileri',
        detaylar: ['Indoor LED Ekranlar', 'Outdoor LED Ekranlar'],
      },
      {
        label: 'Projeksiyon',
        detaylar: [
          'Yüksek Lümenli Projeksiyon Cihazları',
          'Projeksiyon Perdeleri',
        ],
      },
      {
        label: 'Görüntü İşleme',
        detaylar: [
          'Video Processor ve Switcherlar',
          'Medya Sunucuları (Watchout, Resolume vb.)',
        ],
      },
    ],
  },
  {
    label: 'Sahne ve Truss',
    labelEn: 'Truss & Rigging',
    altKategoriler: [
      {
        label: 'Truss (Alüminyum Konstrüksiyon)',
        detaylar: [
          'Kare, Üçgen ve Merdiven Trusslar',
          'Corner ve Bağlantı Aparatları',
        ],
      },
      {
        label: 'Sahne Sistemleri',
        detaylar: [
          'Modüler Sahne Platformları (Podyum)',
          'Sahne Mekaniği ve Motorlu Vinçler',
          'Zemin Kaplamaları',
        ],
      },
    ],
  },
  {
    label: 'Kablo, Stand ve Aksesuar',
    labelEn: 'Accessories & Cables',
    altKategoriler: [
      {
        label: 'Kablolar ve Konnektörler',
        detaylar: [
          'XLR ve Mikrofon Kabloları',
          'DMX ve Sinyal Kabloları',
          'Speakon ve Hoparlör Kabloları',
          'Neutrik ve Çeşitli Konnektörler',
        ],
      },
      {
        label: 'Stand ve Sehpalar',
        detaylar: [
          'Mikrofon Standları',
          'Hoparlör ve Işık Sehpaları',
          'Müzik ve Notalık Standları',
        ],
      },
      {
        label: 'Sarf Malzemeler',
        detaylar: [
          'Gaffa ve Sahne Bantları',
          'Sis, Haze ve Kar Likitleri',
        ],
      },
    ],
  },
  {
    label: 'Taşıma ve Altyapı',
    labelEn: 'Cases & Power',
    altKategoriler: [
      {
        label: 'Flight Case (Hardcase)',
        detaylar: [
          'Mikser Çantaları ve Kasaları',
          'Işık ve Robot Işık Taşıma Kasaları',
          'Özel Üretim Case Sistemleri',
        ],
      },
      {
        label: 'Rack Kabinler',
        detaylar: [
          '19" Rack Kabin Çözümleri',
          'Rack Çekmeceleri ve Paneller',
        ],
      },
      {
        label: 'Güç ve Elektrik',
        detaylar: [
          'Power Distro (Güç Dağıtım Panoları)',
          'Çoklu Priz ve Şebeke Kabloları',
          'Voltaj Regülatörleri',
        ],
      },
    ],
  },
]

/**
 * Ana kategorilerin düz listesi — ürün ekleme/düzenleme select'inde kullanılır.
 * Veritabanında `kategori` alanına yazılan değerler.
 */
export const KATEGORILER: string[] = KATEGORI_HIYERARSI.map((k) => k.label)

/**
 * "Tümü" seçeneği dahil — filtre butonlarında kullanılır.
 */
export const TUM_KATEGORILER: string[] = ['Tümü', ...KATEGORILER]

/**
 * Her ana kategori için alt kategorilerin düz listesi.
 * Admin panelde alt kategori seçimi için.
 */
export function getAltKategoriler(anaKategori: string): string[] {
  const ana = KATEGORI_HIYERARSI.find((k) => k.label === anaKategori)
  if (!ana) return []
  return ana.altKategoriler.map((a) => a.label)
}

/**
 * Tüm alt kategorilerin düz listesi (tüm ana kategorilerden).
 */
export function tumAltKategoriler(): string[] {
  return KATEGORI_HIYERARSI.flatMap((k) => k.altKategoriler.map((a) => a.label))
}

/**
 * Belirli bir ana ve alt kategoriye ait olan 3. seviye detayların (urun_tipi) listesi.
 * Admin panelde ürün detaylarını seçtirmek için.
 */
export function getDetayKategoriler(anaKategori: string, altKategori: string): string[] {
  const ana = KATEGORI_HIYERARSI.find((k) => k.label === anaKategori)
  if (!ana) return []
  const alt = ana.altKategoriler.find((a) => a.label === altKategori)
  if (!alt) return []
  return alt.detaylar
}
