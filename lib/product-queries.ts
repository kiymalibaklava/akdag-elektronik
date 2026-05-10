/**
 * Ürün listeleme ekranlarında (katalog, arama, benzer ürünler) 
 * performansı artırmak ve veritabanı trafiğini (egress) azaltmak için
 * sadece gerekli olan kolonları çekeriz.
 * 
 * KRİTİK: 'aciklama' kolonu çok büyük veri içerebileceği için listelerde ASLA çekilmemelidir.
 */
export const LIGHT_PRODUCT_FIELDS = `
  id, 
  ad, 
  kategori, 
  alt_kategori, 
  urun_tipi, 
  fotograflar, 
  fiyat, 
  bayi_fiyati, 
  para_birimi, 
  bayi_para_birimi, 
  stok_durumu, 
  stok_adedi, 
  kritik_stok, 
  marka, 
  kullanim_alani, 
  fiyat_guncelleme
`.replace(/\s+/g, '').trim()

/**
 * Arama önerileri (dropdown) için daha da hafifletilmiş kolon seti.
 */
export const SEARCH_SUGGESTION_FIELDS = 'id, ad, kategori, fotograflar'.replace(/\s+/g, '').trim()
