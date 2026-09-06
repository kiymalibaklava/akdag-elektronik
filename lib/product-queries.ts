/**
 * Halka açık (public) katalog ve anasayfa vitrini sorgularında
 * toptan bayi maliyetlerinin (bayi_fiyati) sızmasını önlemek için
 * bayi kolonları hariç tutulur.
 */
export const PUBLIC_PRODUCT_FIELDS = 'id, slug, ad, kategori, fotograflar, fiyat, para_birimi, stok_durumu, stok_adedi, kritik_stok, marka, kullanim_alani, fiyat_guncelleme, is_featured'.replace(/\s+/g, '').trim()

/**
 * Bayi oturumu açmış kullanıcılar (bayi paneli, hızlı sipariş vb.)
 * ve admin paneli için bayi fiyatını içeren kolon seti.
 */
export const DEALER_PRODUCT_FIELDS = 'id, slug, ad, kategori, fotograflar, fiyat, bayi_fiyati, para_birimi, bayi_para_birimi, stok_durumu, stok_adedi, kritik_stok, marka, kullanim_alani, fiyat_guncelleme, is_featured'.replace(/\s+/g, '').trim()

export const LIGHT_PRODUCT_FIELDS = DEALER_PRODUCT_FIELDS

/**
 * Arama önerileri (dropdown) için daha da hafifletilmiş kolon seti.
 */
export const SEARCH_SUGGESTION_FIELDS = 'id, slug, ad, kategori, fotograflar'.replace(/\s+/g, '').trim()
