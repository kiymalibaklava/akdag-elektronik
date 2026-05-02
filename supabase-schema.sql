-- =============================================
-- AKDAĞ ELEKTRONİK - Supabase Schema
-- Supabase SQL Editöründe çalıştırın
-- =============================================

-- Ürünler tablosu
CREATE TABLE IF NOT EXISTS urunler (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad TEXT NOT NULL,
  aciklama TEXT NOT NULL,
  kategori TEXT NOT NULL DEFAULT 'Ses Sistemleri',
  fotograflar TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE urunler ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
DROP POLICY IF EXISTS "Herkes urunleri okuyabilir" ON urunler;
CREATE POLICY "Herkes urunleri okuyabilir"
  ON urunler FOR SELECT
  TO public
  USING (true);

-- Sadece auth kullanıcılar ekleyebilir
DROP POLICY IF EXISTS "Auth kullanici urun ekleyebilir" ON urunler;
CREATE POLICY "Auth kullanici urun ekleyebilir"
  ON urunler FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Sadece auth kullanıcılar silebilir
DROP POLICY IF EXISTS "Auth kullanici urun silebilir" ON urunler;
CREATE POLICY "Auth kullanici urun silebilir"
  ON urunler FOR DELETE
  TO authenticated
  USING (true);

-- Sadece auth kullanıcılar güncelleyebilir
DROP POLICY IF EXISTS "Auth kullanici urun guncelleyebilir" ON urunler;
CREATE POLICY "Auth kullanici urun guncelleyebilir"
  ON urunler FOR UPDATE
  TO authenticated
  USING (true);

-- Storage bucket oluştur (Supabase Dashboard > Storage'dan da yapabilirsiniz)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('urun-fotograflari', 'urun-fotograflari', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policy: Herkes görselleri görebilir
DROP POLICY IF EXISTS "Herkes fotograflari gorebilir" ON storage.objects;
CREATE POLICY "Herkes fotograflari gorebilir"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'urun-fotograflari');

-- Sadece auth kullanıcılar yükleyebilir
DROP POLICY IF EXISTS "Auth kullanici fotograf yukleyebilir" ON storage.objects;
CREATE POLICY "Auth kullanici fotograf yukleyebilir"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'urun-fotograflari');

-- Örnek veri (isteğe bağlı)
INSERT INTO urunler (ad, aciklama, kategori) VALUES
  ('JBL PRX915 Aktif Hoparlör', '15" woofer, 1500W güç çıkışı. Sahne ve etkinlik için profesyonel sınıf hoparlör.', 'Ses Sistemleri'),
  ('Shure SM58 Dinamik Mikrofon', 'Canlı performans için endüstri standardı vokal mikrofonu. Dayanıklı yapı.', 'Ses Sistemleri'),
  ('Yamaha MG16XU Mixer', '16 kanallı, USB, efektli profesyonel mixing console.', 'Ses Sistemleri'),
  ('AKUSTEK Akıllı Okul Saati', 'Programlanabilir zil sistemi, anons entegrasyonu ve uzaktan yönetim. Okul otomasyon çözümü.', 'Okul Saat Sistemleri')
ON CONFLICT DO NOTHING;
