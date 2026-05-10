import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Akdağ Elektronik <sistem@akdagelektronik.com>',
      to,
      subject,
      html,
    }),
  })
}

export async function POST(req: NextRequest) {
  try {
    const { siparis_id, siparis_no, dekont_url, ad_soyad } = await req.json()

    const adminEmail = process.env.ADMIN_EMAIL || 'info@akdagelektronik.com'
    
    await sendEmail(
      adminEmail,
      `📄 Yeni Dekont Yüklendi: ${siparis_no}`,
      `
      <div style="font-family:sans-serif; padding:20px; background:#f9f9f9;">
        <h2 style="color:#DA291C;">Yeni Ödeme Dekontu</h2>
        <p><strong>Sipariş No:</strong> ${siparis_no}</p>
        <p><strong>Müşteri:</strong> ${ad_soyad}</p>
        <p>Aşağıdaki bağlantıdan dekontu görüntüleyebilir ve siparişi onaylayabilirsiniz:</p>
        <a href="${dekont_url}" style="display:inline-block; padding:10px 20px; background:#DA291C; color:#fff; text-decoration:none; font-weight:bold;">Dekontu Gör</a>
        <br><br>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin">Admin Paneline Git</a>
      </div>
      `
    )

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Bildirim gönderilemedi' }, { status: 500 })
  }
}
