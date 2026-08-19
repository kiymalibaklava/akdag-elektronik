-- 1. Sipariþler tablosunda kullanýcýnýn kendi sipariþine dekont yükleyebilmesi için UPDATE izni
DROP POLICY IF EXISTS "Kullanici kendi siparisini guncelleyebilir" ON siparisler;

CREATE POLICY "Kullanici kendi siparisini guncelleyebilir"
ON siparisler
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 2. "siparis-dekontlari" isimli Storage bucket'ýn varlýðýndan emin olalým
INSERT INTO storage.buckets (id, name, public)
VALUES ('siparis-dekontlari', 'siparis-dekontlari', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage bucket için RLS izinleri (Sadece giriþ yapmýþ kullanýcýlar yükleyebilir)
DROP POLICY IF EXISTS "Kullanici dekont yukleyebilir" ON storage.objects;
CREATE POLICY "Kullanici dekont yukleyebilir"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'siparis-dekontlari');

-- 4. Herkes dekontlari (public url'yi) gorebilir
DROP POLICY IF EXISTS "Herkes dekontlari gorebilir" ON storage.objects;
CREATE POLICY "Herkes dekontlari gorebilir"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'siparis-dekontlari');

