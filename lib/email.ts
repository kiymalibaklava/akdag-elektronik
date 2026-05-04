// E-posta gönderim yardımcısı — Resend API
// npm install resend

interface SiparisItem {
  ad: string
  fiyat: number
  adet: number
  fotograf?: string
}

interface SiparisEmailData {
  siparis_no: string
  ad_soyad: string
  email: string
  telefon: string
  urunler: SiparisItem[]
  toplam_tutar: number
  odeme_tipi: string
  notlar?: string
  is_bayi?: boolean
  bayi_adi?: string
}

// Müşteriye gönderilen onay e-postası HTML
export function musterionayHTML(data: SiparisEmailData): string {
  const odemeLabel: Record<string, string> = {
    kredi_karti: 'Kredi / Banka Kartı',
    kart: 'Kredi / Banka Kartı',
    havale: 'Havale / EFT',
    whatsapp: 'WhatsApp Siparişi',
  }

  const urunlerHTML = data.urunler.map(u => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #2a2a2a;color:#ccc;font-size:13px">${u.ad}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #2a2a2a;color:#ccc;font-size:13px;text-align:center">×${u.adet}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #2a2a2a;color:#ccc;font-size:13px;text-align:right">${(u.fiyat * u.adet).toLocaleString('tr-TR')} ₺</td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">

    <!-- Logo / Header -->
    <div style="background:#1a1a1a;border-left:4px solid #DA291C;padding:24px 28px;margin-bottom:24px">
      <div style="color:#DA291C;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:6px">Akdağ Elektronik</div>
      <div style="color:#fff;font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em">
        Siparişiniz Alındı
      </div>
      <div style="color:#666;font-size:13px;margin-top:4px">Sipariş No: <strong style="color:#DA291C">${data.siparis_no}</strong></div>
    </div>

    <!-- Müşteri bilgi -->
    <div style="background:#141414;border:1px solid #222;padding:20px 24px;margin-bottom:16px">
      <div style="color:#888;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:12px">Müşteri Bilgileri</div>
      <div style="color:#ddd;font-size:14px;line-height:1.8">
        <strong style="color:#fff">${data.ad_soyad}</strong><br>
        📧 ${data.email}<br>
        📞 ${data.telefon}
        ${data.is_bayi ? `<br>🏢 Bayi: <strong style="color:#DA291C">${data.bayi_adi}</strong>` : ''}
      </div>
    </div>

    <!-- Ürün tablosu -->
    <div style="background:#141414;border:1px solid #222;margin-bottom:16px;overflow:hidden">
      <div style="padding:16px 24px;border-bottom:1px solid #222">
        <div style="color:#888;font-size:10px;letter-spacing:0.25em;text-transform:uppercase">Sipariş Kalemleri</div>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#1a1a1a">
            <th style="padding:10px 12px;color:#666;font-size:11px;text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.1em">Ürün</th>
            <th style="padding:10px 12px;color:#666;font-size:11px;text-align:center;font-weight:600;text-transform:uppercase;letter-spacing:0.1em">Adet</th>
            <th style="padding:10px 12px;color:#666;font-size:11px;text-align:right;font-weight:600;text-transform:uppercase;letter-spacing:0.1em">Tutar</th>
          </tr>
        </thead>
        <tbody>${urunlerHTML}</tbody>
        <tfoot>
          <tr style="background:#1a1a1a">
            <td colspan="2" style="padding:14px 12px;color:#888;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Toplam</td>
            <td style="padding:14px 12px;color:#DA291C;font-size:20px;font-weight:900;text-align:right">${data.toplam_tutar.toLocaleString('tr-TR')} ₺</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Ödeme yöntemi -->
    <div style="background:#141414;border:1px solid #222;padding:16px 24px;margin-bottom:16px">
      <span style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.15em">Ödeme Yöntemi: </span>
      <span style="color:#ddd;font-size:13px">${odemeLabel[data.odeme_tipi] || data.odeme_tipi}</span>
      ${data.odeme_tipi === 'havale' ? `
      <div style="margin-top:12px;padding:12px;background:#1a1a1a;border-left:3px solid #DA291C">
        <div style="color:#888;font-size:11px;margin-bottom:6px">Havale Bilgileri</div>
        <div style="color:#ddd;font-size:13px;line-height:1.8">
          Banka: Ziraat Bankası<br>
          IBAN: TR00 0000 0000 0000 0000 0000 00<br>
          Ad: Akdağ Elektronik<br>
          <strong style="color:#DA291C">Açıklama: ${data.siparis_no}</strong>
        </div>
      </div>` : ''}
    </div>

    ${data.notlar ? `
    <div style="background:#141414;border:1px solid #222;padding:16px 24px;margin-bottom:16px">
      <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px">Sipariş Notu</div>
      <div style="color:#ccc;font-size:13px;font-style:italic">${data.notlar}</div>
    </div>` : ''}

    <!-- İletişim -->
    <div style="background:#DA291C;padding:20px 24px;text-align:center">
      <div style="color:#fff;font-size:12px;opacity:0.8;margin-bottom:4px">Sorularınız için</div>
      <a href="tel:+903522316915" style="color:#fff;font-size:20px;font-weight:900;text-decoration:none">+90 352 231 69 15</a>
      <div style="color:#fff;font-size:11px;opacity:0.7;margin-top:4px">Cumhuriyet Mah. Sur Cad. No:17/A, Melikgazi / Kayseri</div>
    </div>

    <div style="text-align:center;padding:16px;color:#444;font-size:11px">
      © ${new Date().getFullYear()} Akdağ Elektronik — Bu e-posta otomatik olarak gönderilmiştir.
    </div>
  </div>
</body>
</html>`
}

// Admin'e gönderilen yeni sipariş bildirimi HTML
export function adminBildirimHTML(data: SiparisEmailData): string {
  const urunlerHTML = data.urunler.map(u =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#ccc;font-size:13px">${u.ad} ×${u.adet}</td><td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#ccc;font-size:13px;text-align:right">${(u.fiyat * u.adet).toLocaleString('tr-TR')} ₺</td></tr>`
  ).join('')

  return `
<!DOCTYPE html>
<html lang="tr">
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif">
<div style="max-width:500px;margin:0 auto;padding:24px 16px">
  <div style="background:#DA291C;padding:16px 24px;margin-bottom:16px">
    <div style="color:#fff;font-size:18px;font-weight:900;text-transform:uppercase">🔔 Yeni Sipariş!</div>
    <div style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:2px">${data.siparis_no}</div>
  </div>
  <div style="background:#141414;border:1px solid #222;padding:16px 24px;margin-bottom:12px">
    <div style="color:#DA291C;font-size:11px;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:8px">Müşteri</div>
    <div style="color:#fff;font-size:15px;font-weight:700">${data.ad_soyad}</div>
    <div style="color:#888;font-size:13px">${data.email} | ${data.telefon}</div>
    ${data.is_bayi ? `<div style="color:#DA291C;font-size:12px;margin-top:4px">🏢 Bayi: ${data.bayi_adi}</div>` : ''}
  </div>
  <div style="background:#141414;border:1px solid #222;margin-bottom:12px">
    <table style="width:100%;border-collapse:collapse">${urunlerHTML}
      <tr><td style="padding:12px;background:#1a1a1a;color:#888;font-size:11px;text-transform:uppercase">Toplam</td>
      <td style="padding:12px;background:#1a1a1a;color:#DA291C;font-size:18px;font-weight:900;text-align:right">${data.toplam_tutar.toLocaleString('tr-TR')} ₺</td></tr>
    </table>
  </div>
  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" style="display:block;background:#DA291C;color:#fff;text-align:center;padding:14px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.15em;font-size:13px">
    Admin Paneline Git →
  </a>
</div>
</body>
</html>`
}

export function iletisimAdminHTML(data: {
  ad: string
  soyad?: string | null
  telefon?: string | null
  email: string
  konu?: string | null
  mesaj: string
}): string {
  const adSoyad = [data.ad, data.soyad].filter(Boolean).join(' ')
  return `
<!DOCTYPE html>
<html lang="tr">
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="background:#DA291C;padding:14px 20px;margin-bottom:16px">
    <div style="color:#fff;font-size:16px;font-weight:900;text-transform:uppercase">Yeni iletişim mesajı</div>
  </div>
  <div style="background:#141414;border:1px solid #222;padding:20px;color:#ccc;font-size:14px;line-height:1.6">
    <p style="margin:0 0 8px"><strong style="color:#fff">Gönderen:</strong> ${adSoyad}</p>
    <p style="margin:0 0 8px"><strong style="color:#fff">E-posta:</strong> <a href="mailto:${data.email}" style="color:#DA291C">${data.email}</a></p>
    ${data.telefon ? `<p style="margin:0 0 8px"><strong style="color:#fff">Telefon:</strong> ${data.telefon}</p>` : ''}
    ${data.konu ? `<p style="margin:0 0 8px"><strong style="color:#fff">Konu:</strong> ${data.konu}</p>` : ''}
    <div style="margin-top:16px;padding-top:16px;border-top:1px solid #2a2a2a;white-space:pre-wrap;color:#aaa">${data.mesaj}</div>
  </div>
</div>
</body>
</html>`
}
