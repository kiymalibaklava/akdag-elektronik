import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("1. Frontend'den Gelen Veri:", body) // BURAYA BAKACAĞIZ

    const { email, firma_adi, yetkili_adi, sehir, telefon } = body

    if (!email || !firma_adi) {
      console.log("2. HATA: Eksik alan var! Email veya Firma Adı boş.")
      return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Kullanıcıyı davet et
    console.log(`3. ${email} adresine davet atılıyor...`)
    const { data: inviteData, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: `${siteUrl}/bayi/sifrele`,
        data: { firma_adi, yetkili_adi },
      }
    )

    if (inviteErr) {
      console.log("4. SUPABASE INVITE HATASI:", inviteErr) // BURAYA BAKACAĞIZ
      
      if (inviteErr.message.includes('already been registered')) {
        const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
        const user = existingUser.users.find(u => u.email === email)
        if (user) {
          await supabaseAdmin.from('bayiler').upsert({
            user_id: user.id, firma_adi, yetkili_adi, telefon, sehir, onaylandi: true,
          }, { onConflict: 'user_id' })
          return NextResponse.json({ success: true, note: 'Mevcut kullanıcı güncellendi' })
        }
      }
      return NextResponse.json({ error: inviteErr.message }, { status: 400 })
    }

    // bayiler tablosuna ekle
    console.log("5. Davet başarılı, DB'ye ekleniyor:", inviteData.user.id)
    const { error: dbErr } = await supabaseAdmin.from('bayiler').insert({
      user_id: inviteData.user.id,
      firma_adi, yetkili_adi, telefon, sehir, onaylandi: true,
    })

    if (dbErr) {
      console.log("6. SUPABASE DB KAYIT HATASI:", dbErr) // BURAYA BAKACAĞIZ
      return NextResponse.json({ error: dbErr.message }, { status: 400 })
    }

    console.log("7. İŞLEM TAMAMLANDI")
    return NextResponse.json({ success: true })
    
  } catch (e) {
    console.log("8. SUNUCU ÇÖKTÜ:", e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}