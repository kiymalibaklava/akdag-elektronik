import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

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
    const { id, durum, kargo_takip_no } = await req.json()
    const db = supabaseAdmin()

    // 1. Get order details
    const { data: siparis, error: getErr } = await db
      .from('siparisler')
      .select('siparis_no, email, ad_soyad')
      .eq('id', id)
      .single()

    if (getErr || !siparis) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })
    }

    // 2. Update status
    const updateData: any = { durum, updated_at: new Date().toISOString() }
    if (kargo_takip_no) updateData.kargo_takip_no = kargo_takip_no

    const { error: updErr } = await db
      .from('siparisler')
      .update(updateData)
      .eq('id', id)

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 400 })
    }

    // 3. Send notification email
    let subject = ''
    let body = ''

    if (durum === 'onaylandi') {
      subject = `Siparişiniz Onaylandı — ${siparis.siparis_no}`
      body = `Sayın ${siparis.ad_soyad}, <br/><br/> ${siparis.siparis_no} numaralı siparişiniz onaylanmış ve hazırlık sürecine alınmıştır. <br/><br/> Akdağ Elektronik`
    } else if (durum === 'hazirlaniyor') {
      subject = `Siparişiniz Hazırlanıyor — ${siparis.siparis_no}`
      body = `Sayın ${siparis.ad_soyad}, <br/><br/> ${siparis.siparis_no} numaralı siparişiniz şu an depomuzda paketlenmektedir. <br/><br/> Akdağ Elektronik`
    } else if (durum === 'kargolandi' || (durum === 'teslim_edildi' && kargo_takip_no)) {
      subject = `Siparişiniz Kargoya Verildi — ${siparis.siparis_no}`
      body = `Sayın ${siparis.ad_soyad}, <br/><br/> ${siparis.siparis_no} numaralı siparişiniz kargoya verilmiştir. <br/> <strong>Kargo Takip No: ${kargo_takip_no || 'Sistemde güncellendi'}</strong> <br/><br/> Akdağ Elektronik`
    } else if (durum === 'iptal') {
      subject = `Siparişiniz İptal Edildi — ${siparis.siparis_no}`
      body = `Sayın ${siparis.ad_soyad}, <br/><br/> ${siparis.siparis_no} numaralı siparişiniz iptal edilmiştir. Bir hata olduğunu düşünüyorsanız bizimle iletişime geçebilirsiniz. <br/><br/> Akdağ Elektronik`
    }

    if (subject && body) {
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #DA291C;">Akdağ Elektronik</h2>
          <p style="font-size: 16px; color: #333;">${body}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Bu otomatik bir bilgilendirme mesajıdır. Lütfen bu e-postayı yanıtlamayınız.</p>
        </div>
      `
      await sendEmail(siparis.email, subject, html)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
