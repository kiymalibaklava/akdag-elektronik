import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { musterionayHTML, adminBildirimHTML } from '@/lib/email'

const supabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) { console.warn('RESEND_API_KEY yok, e-posta atlandı'); return }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Akdağ Elektronik <siparis@akdagelektronik.com>',
      to,
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Resend hata:', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      user_id,
      bayi_id,
      urunler,
      toplam_tutar,
      ad_soyad,
      email,
      telefon,
      notlar,
      odeme_tipi,
      bayi_adi,
      is_bayi,
    } = body

    if (!urunler?.length || !toplam_tutar || !email) {
      return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
    }

    const db = supabaseAdmin()

    // 1. Siparişi oluştur
    const { data: siparis, error: dbErr } = await db
      .from('siparisler')
      .insert({
        user_id: user_id || null,
        bayi_id: bayi_id || null,
        urunler,
        toplam_tutar,
        ad_soyad,
        email,
        telefon,
        notlar,
        odeme_tipi,
        odeme_durumu: 'beklemede',
        durum: 'beklemede',
      })
      .select('siparis_no, id')
      .single()

    if (dbErr || !siparis) {
      return NextResponse.json({ error: dbErr?.message || 'Sipariş oluşturulamadı' }, { status: 400 })
    }

    // 2. Stok takibi — sipariş verilen ürünlerin stoğunu güncelle
    for (const item of urunler) {
      if (!item.urun_id) continue
      const { data: urun } = await db
        .from('urunler')
        .select('stok_durumu')
        .eq('id', item.urun_id)
        .single()

      // Stok düşme mantığı — şimdilik basit: çok sipariş gelirse "siparise_gore" yap
      // İleride sayısal stok için genişletilebilir
      if (urun?.stok_durumu === 'stokta') {
        // Aynı üründen kaç aktif sipariş var sayıyoruz
        const { count } = await db
          .from('siparisler')
          .select('*', { count: 'exact', head: true })
          .neq('durum', 'iptal')
          .neq('durum', 'teslim_edildi')
          .filter('urunler', 'cs', JSON.stringify([{ urun_id: item.urun_id }]))

        if ((count || 0) >= 5) {
          await db.from('urunler')
            .update({ stok_durumu: 'siparise_gore' })
            .eq('id', item.urun_id)
        }
      }
    }

    const emailData = {
      siparis_no: siparis.siparis_no,
      ad_soyad: ad_soyad || 'Müşteri',
      email,
      telefon: telefon || '',
      urunler,
      toplam_tutar,
      odeme_tipi,
      notlar,
      is_bayi,
      bayi_adi,
    }

    // 3. Müşteriye onay e-postası
    await sendEmail(
      email,
      `Siparişiniz Alındı — ${siparis.siparis_no} | Akdağ Elektronik`,
      musterionayHTML(emailData)
    )

    // 4. Admin'e bildirim e-postası
    const adminEmail = process.env.ADMIN_EMAIL || 'info@akdagelektronik.com'
    await sendEmail(
      adminEmail,
      `🔔 Yeni Sipariş: ${siparis.siparis_no} — ${(toplam_tutar as number).toLocaleString('tr-TR')} ₺`,
      adminBildirimHTML(emailData)
    )

    return NextResponse.json({ success: true, siparis_no: siparis.siparis_no, id: siparis.id })
  } catch (e) {
    console.error('Sipariş oluşturma hatası:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
