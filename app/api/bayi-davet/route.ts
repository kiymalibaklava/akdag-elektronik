import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { bayiDavetSchema } from '@/lib/api-schemas'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/request-ip'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    if (!rateLimit(`bayi-davet:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Çok fazla istek.' }, { status: 429 })
    }

    const raw = await req.json()
    const parsed = bayiDavetSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 })
    }

    const { email, firma_adi, yetkili_adi, sehir, telefon } = parsed.data

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const siteUrl = origin.replace(/\/$/, '')

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: inviteData, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      // PKCE akışı: /auth/callback üzerinden geçer, sonra /bayi/sifrele'ye yönlenir
      redirectTo: `${siteUrl}/auth/callback?next=/bayi/sifrele`,
      data: { firma_adi, yetkili_adi: yetkili_adi || '' },
    })

    if (inviteErr) {
      if (inviteErr.message.includes('already been registered')) {
        const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
        const user = existingUser?.users.find((u) => u.email === email)
        if (user) {
          await supabaseAdmin.from('bayiler').upsert(
            {
              user_id: user.id,
              firma_adi,
              yetkili_adi: yetkili_adi || '',
              telefon: telefon || '',
              sehir: sehir || '',
              onaylandi: true,
            },
            { onConflict: 'user_id' }
          )
          return NextResponse.json({ success: true, note: 'Mevcut kullanıcı güncellendi' })
        }
      }
      return NextResponse.json({ error: inviteErr.message }, { status: 400 })
    }

    if (!inviteData?.user?.id) {
      return NextResponse.json({ error: 'Davet oluşturulamadı' }, { status: 400 })
    }

    const { error: dbErr } = await supabaseAdmin.from('bayiler').insert({
      user_id: inviteData.user.id,
      firma_adi,
      yetkili_adi: yetkili_adi || '',
      telefon: telefon || '',
      sehir: sehir || '',
      onaylandi: true,
    })

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Bayi davet:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
