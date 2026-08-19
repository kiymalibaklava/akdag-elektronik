-- 1. Bayilerin kendi profillerini güncelleyebilmeleri için gerekli yetkiyi (Policy) veriyoruz.
DROP POLICY IF EXISTS "Bayiler kendi profilini guncelleyebilir" ON bayiler;
CREATE POLICY "Bayiler kendi profilini guncelleyebilir" 
  ON bayiler FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

-- 2. GÜVENLÝK (ÖNEMLÝ): Kötü niyetli bir bayinin yazýlým üzerinden "onaylandi = true"
-- gönderip kendini yetkilendirmesini engellemek için koruma kalkaný (Trigger) ekliyoruz.
CREATE OR REPLACE FUNCTION prevent_bayi_onay_degisikligi()
RETURNS TRIGGER AS $$
BEGIN
  -- Eðer onay durumu deðiþmiþse ve iþlemi yapan kiþi site sahibi/admin deðilse:
  IF NEW.onaylandi IS DISTINCT FROM OLD.onaylandi THEN
     -- current_setting ile giriþ yapan kullanýcýnýn emailini alýyoruz
     IF (current_setting('request.jwt.claims', true)::json->>'email') != 'akdagelektronik@hotmail.com' THEN
        -- Deðiþikliði yoksay ve eski haline (örneðin false ise false'a) zorla.
        NEW.onaylandi = OLD.onaylandi; 
     END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_bayi_onay_degisikligi ON bayiler;
CREATE TRIGGER trg_prevent_bayi_onay_degisikligi
BEFORE UPDATE ON bayiler
FOR EACH ROW
EXECUTE FUNCTION prevent_bayi_onay_degisikligi();
