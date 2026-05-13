import { unstable_cache } from 'next/cache'
import { createServerSupabaseClient } from './supabase-server'

/**
 * Ürün verisini ID'ye göre getirir ve cache-ler.
 * Bu sayede veritabanına giden gereksiz istekleri (Egress) engeller.
 * revalidate: 3600 -> Veri 1 saat boyunca cache-den gelir.
 */
export const getProduct = unstable_cache(
  async (id: string) => {
    const supabase = await createServerSupabaseClient()
    return supabase.from('urunler')
      .select('id, ad, aciklama, kategori, alt_kategori, urun_tipi, fotograflar, fiyat, bayi_fiyati, para_birimi, bayi_para_birimi, stok_durumu, stok_adedi, kritik_stok, marka, kullanim_alani, fiyat_guncelleme, created_at, updated_at')
      .eq('id', id)
      .single()
  },
  ['product-detail'],
  { revalidate: 3600, tags: ['products'] }
)
