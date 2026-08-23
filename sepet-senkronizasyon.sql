-- Kullanýcý sepet verilerini tutacak tablo
CREATE TABLE IF NOT EXISTS sepet (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  urun_id UUID REFERENCES urunler(id) ON DELETE CASCADE,
  adet INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, urun_id)
);

-- RLS (Row Level Security) ayarlarý
ALTER TABLE sepet ENABLE ROW LEVEL SECURITY;

-- Kullanýcýlar sadece kendi sepetlerini görebilir
DROP POLICY IF EXISTS "Kullanici kendi sepetini gorebilir" ON sepet;
CREATE POLICY "Kullanici kendi sepetini gorebilir"
ON sepet FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Kullanýcýlar sadece kendi sepetlerine ekleme yapabilir
DROP POLICY IF EXISTS "Kullanici kendi sepetine urun ekleyebilir" ON sepet;
CREATE POLICY "Kullanici kendi sepetine urun ekleyebilir"
ON sepet FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Kullanýcýlar sadece kendi sepetini güncelleyebilir
DROP POLICY IF EXISTS "Kullanici kendi sepetini guncelleyebilir" ON sepet;
CREATE POLICY "Kullanici kendi sepetini guncelleyebilir"
ON sepet FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Kullanýcýlar kendi sepetinden ürün silebilir
DROP POLICY IF EXISTS "Kullanici kendi sepetinden silebilir" ON sepet;
CREATE POLICY "Kullanici kendi sepetinden silebilir"
ON sepet FOR DELETE
TO authenticated
USING (user_id = auth.uid());
