import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/send-email'

const MEKAN_ETIKETLER: Record<string, string> = {
  okul: 'Okul / Eğitim', cami: 'Cami / İbadet',
  konferans: 'Konferans Salonu', spor: 'Spor Tesisi',
  hastane: 'Sağlık / Hastane', diger: 'Diğer'
}

function projeTalebiAdminHTML(data: {
  ad_soyad: string; telefon: string; email: string; firma?: string
  mekan_tipi: string; mekan_adi: string; sehir: string
  alan_m2?: string; kapasite?: string; mesaj?: string; dosyalar: string[]
}) {
  const dosyaListesi = data.dosyalar.length
    ? data.dosyalar.map((url, i) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;font-size:12px;">
          <a href="${url}" target="_blank" style="color:#c0392b;text-decoration:none;">📎 Dosya ${i + 1}</a>
         </td></tr>`
      ).join('')
    : '<tr><td style="padding:6px 12px;font-size:12px;color:#999;">Dosya yüklenmedi</td></tr>'

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:620px;margin:40px auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    
    <div style="background:#1a1a1a;padding:32px;border-bottom:4px solid #c0392b;">
      <div style="display:flex;align-items:center;gap:16px;">
        <div>
          <h1 style="margin:0;color:#fff;font-size:20px;font-weight:900;text-transform:uppercase;letter-spacing:2px;">YENİ PROJe TALEBİ</h1>
          <p style="margin:4px 0 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Akdağ Elektronik — Sistem Kurulum Formu</p>
        </div>
      </div>
    </div>

    <div style="padding:32px;">
      
      <div style="background:#fef9f9;border-left:4px solid #c0392b;padding:16px 20px;margin-bottom:28px;border-radius:0 4px 4px 0;">
        <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Mekan Tipi</p>
        <p style="margin:0;font-size:20px;font-weight:900;color:#1a1a1a;text-transform:uppercase;">${MEKAN_ETIKETLER[data.mekan_tipi] || data.mekan_tipi}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr style="background:#f9f9f9;"><td colspan="2" style="padding:8px 12px;font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1px;">Mekan Bilgileri</td></tr>
        <tr><td style="padding:8px 12px;font-size:12px;color:#666;border-bottom:1px solid #eee;width:40%;">Mekan Adı</td>
            <td style="padding:8px 12px;font-size:13px;font-weight:700;color:#1a1a1a;border-bottom:1px solid #eee;">${data.mekan_adi}</td></tr>
        <tr><td style="padding:8px 12px;font-size:12px;color:#666;border-bottom:1px solid #eee;">Şehir</td>
            <td style="padding:8px 12px;font-size:13px;font-weight:700;color:#1a1a1a;border-bottom:1px solid #eee;">${data.sehir}</td></tr>
        ${data.alan_m2 ? `<tr><td style="padding:8px 12px;font-size:12px;color:#666;border-bottom:1px solid #eee;">Alan</td>
            <td style="padding:8px 12px;font-size:13px;color:#1a1a1a;border-bottom:1px solid #eee;">${data.alan_m2}</td></tr>` : ''}
        ${data.kapasite ? `<tr><td style="padding:8px 12px;font-size:12px;color:#666;">Kapasite</td>
            <td style="padding:8px 12px;font-size:13px;color:#1a1a1a;">${data.kapasite}</td></tr>` : ''}
      </table>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr style="background:#f9f9f9;"><td colspan="2" style="padding:8px 12px;font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1px;">İletişim Bilgileri</td></tr>
        <tr><td style="padding:8px 12px;font-size:12px;color:#666;border-bottom:1px solid #eee;width:40%;">Ad Soyad</td>
            <td style="padding:8px 12px;font-size:13px;font-weight:700;color:#1a1a1a;border-bottom:1px solid #eee;">${data.ad_soyad}</td></tr>
        ${data.firma ? `<tr><td style="padding:8px 12px;font-size:12px;color:#666;border-bottom:1px solid #eee;">Kurum/Firma</td>
            <td style="padding:8px 12px;font-size:13px;color:#1a1a1a;border-bottom:1px solid #eee;">${data.firma}</td></tr>` : ''}
        <tr><td style="padding:8px 12px;font-size:12px;color:#666;border-bottom:1px solid #eee;">Telefon</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;">
              <a href="tel:${data.telefon}" style="font-size:14px;font-weight:900;color:#c0392b;text-decoration:none;">${data.telefon}</a></td></tr>
        <tr><td style="padding:8px 12px;font-size:12px;color:#666;">E-posta</td>
            <td style="padding:8px 12px;">
              <a href="mailto:${data.email}" style="font-size:13px;color:#c0392b;text-decoration:none;">${data.email}</a></td></tr>
      </table>

      ${data.mesaj ? `
      <div style="background:#f9f9f9;border-radius:4px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1px;">Notlar / İstekler</p>
        <p style="margin:0;font-size:13px;color:#333;line-height:1.7;">${data.mesaj.replace(/\n/g, '<br>')}</p>
      </div>` : ''}

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr style="background:#f9f9f9;"><td style="padding:8px 12px;font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1px;">Yüklenen Dosyalar (${data.dosyalar.length})</td></tr>
        ${dosyaListesi}
      </table>

      <div style="text-align:center;padding-top:20px;border-top:1px solid #eee;">
        <a href="https://akdagelektronik.com/admin" style="display:inline-block;background:#c0392b;color:#fff;padding:12px 28px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;text-decoration:none;border-radius:2px;">
          Admin Panelde Gör
        </a>
      </div>
    </div>

    <div style="background:#1a1a1a;padding:16px 32px;text-align:center;">
      <p style="margin:0;color:#666;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Akdağ Elektronik · akdagelektronik.com</p>
    </div>
  </div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    const ad_soyad = formData.get('ad_soyad') as string
    const telefon = formData.get('telefon') as string
    const email = formData.get('email') as string
    const firma = formData.get('firma') as string
    const mekan_tipi = formData.get('mekan_tipi') as string
    const mekan_adi = formData.get('mekan_adi') as string
    const sehir = formData.get('sehir') as string
    const alan_m2 = formData.get('alan_m2') as string
    const kapasite = formData.get('kapasite') as string
    const mesaj = formData.get('mesaj') as string
    const dosyalar = formData.getAll('dosyalar') as File[]

    if (!ad_soyad || !telefon || !email || !mekan_tipi || !mekan_adi || !sehir) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
    }

    // Supabase service role client (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Dosyaları yükle
    const dosyaUrls: string[] = []
    for (const file of dosyalar) {
      if (!file || !file.name) continue
      
      const ext = file.name.split('.').pop()
      const path = `talep-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      
      const { error: upErr } = await supabase.storage
        .from('proje-dosyalari')
        .upload(path, file)
        
      if (!upErr) {
        const { data } = supabase.storage.from('proje-dosyalari').getPublicUrl(path)
        dosyaUrls.push(data.publicUrl)
      } else {
        console.error('Dosya yükleme hatası:', upErr)
      }
    }

    // Veritabanına kaydet
    const { error: dbErr } = await supabase.from('proje_talepleri').insert({
      ad_soyad, telefon, email,
      firma: firma || null,
      mekan_tipi, mekan_adi, sehir,
      alan_m2: alan_m2 || null,
      kapasite: kapasite || null,
      mesaj: mesaj || null,
      dosyalar: dosyaUrls,
      durum: 'yeni'
    })

    if (dbErr) {
      console.error('Proje talebi DB hatası:', dbErr)
      return NextResponse.json({ error: 'Kayıt başarısız' }, { status: 500 })
    }

    // Admin'e e-posta gönder
    const adminEmail = process.env.ADMIN_EMAIL || 'info@akdagelektronik.com'
    const mekanEtiketMap: Record<string, string> = {
      okul: 'Okul/Eğitim', cami: 'Cami ve İbadet Alanları', konferans: 'Konferans',
      spor: 'Spor Tesisi', hastane: 'Sağlık', diger: 'Diğer'
    }
    const mekanEtiket = mekanEtiketMap[mekan_tipi] || mekan_tipi

    await sendEmail(
      adminEmail,
      `🏗️ Yeni Proje Talebi: ${mekanEtiket} — ${mekan_adi}, ${sehir}`,
      projeTalebiAdminHTML({ ad_soyad, telefon, email, firma, mekan_tipi, mekan_adi, sehir, alan_m2, kapasite, mesaj, dosyalar: dosyaUrls })
    ).catch(err => console.error('Proje talebi mail hatası:', err))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Proje talebi route hatası:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
