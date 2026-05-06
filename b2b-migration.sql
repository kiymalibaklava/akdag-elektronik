    -- =============================================
    -- AKDAĞ ELEKTRONİK — B2B Migration
    -- Supabase SQL Editor'da çalıştırın.
    -- =============================================

    -- 1) Ürünler tablosuna alt kategori sütunları
    ALTER TABLE urunler ADD COLUMN IF NOT EXISTS alt_kategori TEXT;
    ALTER TABLE urunler ADD COLUMN IF NOT EXISTS urun_tipi TEXT;

    -- 2) Siparişler tablosuna teslimat tipi
    ALTER TABLE siparisler ADD COLUMN IF NOT EXISTS teslimat_tipi TEXT DEFAULT 'kargo';
