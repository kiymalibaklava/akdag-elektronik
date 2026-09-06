-- ==============================================================================
-- AKDAĞ ELEKTRONİK - TEKLİFLER TABLOSU GÜVENLİ YETKİ (RLS) MİGRASYONU
-- DİKKAT: Bu script MEVCUT TEKLİF, ÜRÜN VEYA BAYİ VERİLERİNE KESİNLİKLE DOKUNMAZ.
-- DROP TABLE veya TRUNCATE İÇERMEZ. SADECE YETKİ (POLICY) TANIMLAR.
-- ==============================================================================

-- 1. RLS etkinleştir (tablo mevcutsa veriler korunur)
ALTER TABLE IF EXISTS teklifler ENABLE ROW LEVEL SECURITY;

-- 2. Eski/çakışan yetki kurallarını temizle
DROP POLICY IF EXISTS "Bayiler kendi tekliflerini görebilir" ON teklifler;
DROP POLICY IF EXISTS "Bayiler kendi tekliflerini gorebilir" ON teklifler;
DROP POLICY IF EXISTS "Bayiler kendi tekliflerini olusturabilir" ON teklifler;
DROP POLICY IF EXISTS "Bayiler kendi tekliflerini guncelleyebilir" ON teklifler;
DROP POLICY IF EXISTS "Bayiler kendi tekliflerini silebilir" ON teklifler;
DROP POLICY IF EXISTS "Site adminleri tum teklifleri yonetebilir" ON teklifler;

-- 3. Bayiler için Güvenli RLS Politikaları
-- SELECT: Bayi sadece kendi bayi_id'sine ait teklifleri okuyabilir
CREATE POLICY "Bayiler kendi tekliflerini gorebilir" ON teklifler
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM bayiler
            WHERE bayiler.id = teklifler.bayi_id
              AND bayiler.user_id = auth.uid()
        )
    );

-- INSERT: Bayi sadece kendi bayi_id'si ile yeni teklif kaydedebilir
CREATE POLICY "Bayiler kendi tekliflerini olusturabilir" ON teklifler
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM bayiler
            WHERE bayiler.id = teklifler.bayi_id
              AND bayiler.user_id = auth.uid()
        )
    );

-- UPDATE: Bayi sadece kendi bayi_id'sine ait teklifleri güncelleyebilir
CREATE POLICY "Bayiler kendi tekliflerini guncelleyebilir" ON teklifler
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM bayiler
            WHERE bayiler.id = teklifler.bayi_id
              AND bayiler.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM bayiler
            WHERE bayiler.id = teklifler.bayi_id
              AND bayiler.user_id = auth.uid()
        )
    );

-- DELETE: Bayi sadece kendi tekliflerini silebilir
CREATE POLICY "Bayiler kendi tekliflerini silebilir" ON teklifler
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM bayiler
            WHERE bayiler.id = teklifler.bayi_id
              AND bayiler.user_id = auth.uid()
        )
    );

-- 4. Site Adminleri için Tüm İşlemlere Yetki Politikası
CREATE POLICY "Site adminleri tum teklifleri yonetebilir" ON teklifler
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM site_admins
            WHERE site_admins.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM site_admins
            WHERE site_admins.user_id = auth.uid()
        )
    );
