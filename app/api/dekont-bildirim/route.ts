import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { dekontAlindiHTML, dekontAdminHTML } from '@/lib/email'
import { sendEmail } from '@/lib/send-email'

const supabaseAdmin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { siparis_id, siparis_no, dekont_url, ad_soyad } = await req.json()

    const db = supabaseAdmin()

    // Müşteri e-postasını veritabanından al
    let musteriEmail: string | null = null
    if (siparis_id) {
      const { data: siparis } = await db
        .from('siparisler')
        .select('email')
        .eq('id', siparis_id)
        .single()
      musteriEmail = siparis?.email || null
    }

    // Admin'e dekont bildirimi
    const adminEmail = process.env.ADMIN_EMAIL || 'info@akdagelektronik.com'
    await sendEmail(
      adminEmail,
      `📄 Yeni Dekont Yüklendi: ${siparis_no}`,
      dekontAdminHTML({ siparis_no, ad_soyad, dekont_url })
    )

    // Müşteriye "dekontu aldık" bildirimi
    if (musteriEmail) {
      await sendEmail(
        musteriEmail,
        `Dekontunuz Alındı — ${siparis_no} | Akdağ Elektronik`,
        dekontAlindiHTML({ siparis_no, ad_soyad })
      )
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Dekont bildirim hatası:', e)
    return NextResponse.json({ error: 'Bildirim gönderilemedi' }, { status: 500 })
  }
}
