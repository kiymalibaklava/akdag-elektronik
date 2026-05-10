import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { musterionayHTML, adminBildirimHTML } from '@/lib/email'
import { siparisOlusturSchema } from '@/lib/api-schemas'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/request-ip'

const supabaseAdmin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY yok, e-posta atlandı')
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
    const ip = getClientIp(req)
    if (!rateLimit(`siparis:${ip}`, 15, 60_000)) {
      return NextResponse.json({ error: 'Çok fazla istek. Lütfen bir dakika sonra deneyin.' }, { status: 429 })
    }

    const raw = await req.json()
    const parsed = siparisOlusturSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Geçersiz veri', details: parsed.error.flatten() }, { status: 400 })
    }

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
      teslimat_tipi,
      bayi_adi,
      is_bayi,
      fatura_tipi,
      firma_unvani,
      vergi_dairesi,
      vergi_no,
      teslimat_adresi,
    } = parsed.data

    const hesaplanan = urunler.reduce((s, u) => s + u.fiyat * u.adet, 0)
    if (Math.abs(hesaplanan - toplam_tutar) > 0.05) {
      return NextResponse.json({ error: 'Tutar doğrulanamadı' }, { status: 400 })
    }

    const db = supabaseAdmin()

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
        teslimat_tipi: teslimat_tipi || 'kargo',
        odeme_durumu: 'beklemede',
        durum: 'beklemede',
        fatura_tipi: fatura_tipi || 'bireysel',
        firma_unvani: firma_unvani || null,
        vergi_dairesi: vergi_dairesi || null,
        vergi_no: vergi_no || null,
        teslimat_adresi: teslimat_adresi || null,
      })
      .select('siparis_no, id')
      .single()

    if (dbErr || !siparis) {
      return NextResponse.json({ error: dbErr?.message || 'Sipariş oluşturulamadı' }, { status: 400 })
    }

    for (const item of urunler) {
      if (!item.urun_id) continue
      const { data: urun } = await db
        .from('urunler')
        .select('stok_durumu, stok_adedi, kritik_stok')
        .eq('id', item.urun_id)
        .single()

      const kalan = typeof urun?.stok_adedi === 'number' ? Math.max(0, urun.stok_adedi - item.adet) : null
      if (kalan !== null) {
        const nextDurum = kalan <= 0 ? 'tukendi' : 'stokta'
        await db
          .from('urunler')
          .update({
            stok_adedi: kalan,
            stok_durumu: nextDurum,
          })
          .eq('id', item.urun_id)
      }

      if (urun?.stok_durumu === 'stokta') {
        const { count } = await db
          .from('siparisler')
          .select('*', { count: 'exact', head: true })
          .neq('durum', 'iptal')
          .neq('durum', 'teslim_edildi')
          .filter('urunler', 'cs', JSON.stringify([{ urun_id: item.urun_id }]))

        if ((count || 0) >= 5) {
          await db.from('urunler').update({ stok_durumu: 'siparise_gore' }).eq('id', item.urun_id)
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
      odeme_tipi: odeme_tipi || 'havale',
      notlar: notlar ?? undefined,
      is_bayi,
      bayi_adi: bayi_adi ?? undefined,
    }

    await sendEmail(
      email,
      `Siparişiniz Alındı — ${siparis.siparis_no} | Akdağ Elektronik`,
      musterionayHTML(emailData)
    )

    const adminEmail = process.env.ADMIN_EMAIL || 'info@akdagelektronik.com'
    await sendEmail(
      adminEmail,
      `🔔 Yeni Sipariş: ${siparis.siparis_no} — ${toplam_tutar.toLocaleString('tr-TR')} ₺`,
      adminBildirimHTML(emailData)
    )

    return NextResponse.json({ success: true, siparis_no: siparis.siparis_no, id: siparis.id })
  } catch (e) {
    console.error('Sipariş oluşturma hatası:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
