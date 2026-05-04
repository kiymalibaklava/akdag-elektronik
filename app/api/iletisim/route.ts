import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { iletisimSchema } from '@/lib/api-schemas'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/request-ip'
import { iletisimAdminHTML } from '@/lib/email'

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  await fetch('https://api.resend.com/emails', {
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
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    if (!rateLimit(`iletisim:${ip}`, 8, 60 * 60_000)) {
      return NextResponse.json({ error: 'Çok fazla gönderim. Lütfen daha sonra deneyin.' }, { status: 429 })
    }

    const raw = await req.json()
    const parsed = iletisimSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Geçersiz form verisi' }, { status: 400 })
    }

    const { ad, soyad, telefon, email, konu, mesaj } = parsed.data

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error: dbErr } = await supabase.from('iletisim_mesajlari').insert({
      ad,
      soyad: soyad || null,
      telefon: telefon || null,
      email,
      konu: konu || null,
      mesaj,
    })

    if (dbErr) {
      console.error('İletişim DB:', dbErr)
      return NextResponse.json({ error: 'Kayıt oluşturulamadı. Tablo henüz kurulmamış olabilir.' }, { status: 503 })
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'info@akdagelektronik.com'
    await sendEmail(
      adminEmail,
      `İletişim formu: ${konu || 'Genel'} — ${ad}`,
      iletisimAdminHTML({ ad, soyad, telefon, email, konu, mesaj })
    )

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('İletişim API:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
