    -- =============================================
    -- AKDAĞ ELEKTRONİK — B2B Migration
    -- Supabase SQL Editor'da çalıştırın.
    -- =============================================

    -- 1) Ürünler tablosuna gerekli sütunlar
    ALTER TABLE urunler ADD COLUMN IF NOT EXISTS alt_kategori TEXT;
    ALTER TABLE urunler ADD COLUMN IF NOT EXISTS urun_tipi TEXT;
    ALTER TABLE urunler ADD COLUMN IF NOT EXISTS model_kodu TEXT;

    -- 2) Siparişler tablosuna teslimat tipi
    ALTER TABLE siparisler ADD COLUMN IF NOT EXISTS teslimat_tipi TEXT DEFAULT 'kargo';

    -- 3) Sepet Tablosu (Kalıcı Sepet Mimarisi)
    CREATE TABLE IF NOT EXISTS sepet (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        urun_id UUID REFERENCES urunler(id) ON DELETE CASCADE NOT NULL,
        adet INT DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, urun_id)
    );

    -- Sepet RLS Güvenlik Politikaları
    ALTER TABLE sepet ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Kullanıcılar kendi sepetini görebilir" ON sepet;
    CREATE POLICY "Kullanıcılar kendi sepetini görebilir" ON sepet FOR SELECT USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Kullanıcılar kendi sepetine ürün ekleyebilir" ON sepet;
    CREATE POLICY "Kullanıcılar kendi sepetine ürün ekleyebilir" ON sepet FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Kullanıcılar kendi sepetini güncelleyebilir" ON sepet;
    CREATE POLICY "Kullanıcılar kendi sepetini güncelleyebilir" ON sepet FOR UPDATE USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Kullanıcılar kendi sepetinden ürün silebilir" ON sepet;
    CREATE POLICY "Kullanıcılar kendi sepetinden ürün silebilir" ON sepet FOR DELETE USING (auth.uid() = user_id);
