import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { odemeOnaylandiHTML, siparisIptalHTML } from '@/lib/email'
import { sendEmail } from '@/lib/send-email'

const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!

export async function POST(req: NextRequest) {
  const merchantKey = process.env.PAYTR_MERCHANT_KEY
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT

  if (!merchantKey || !merchantSalt) {
    console.error('[PayTR Callback] API anahtarları tanımlanmamış.')
    return new NextResponse('CONFIG_ERROR', { status: 500 })
  }

  try {
    const formData = await req.formData()
    const merchant_oid = (formData.get('merchant_oid') as string)?.trim()
    const status = (formData.get('status') as string)?.trim()
    const total_amount = (formData.get('total_amount') as string)?.trim()
    const hash = (formData.get('hash') as string)?.trim()
    const failed_reason_code = formData.get('failed_reason_code') as string | null
    const failed_reason_msg = formData.get('failed_reason_msg') as string | null

    if (!merchant_oid || !status || !total_amount || !hash) {
      console.warn('[PayTR Callback] Eksik parametreler:', { merchant_oid, status, total_amount })
      return new NextResponse('PAYTR_MISSING_PARAMS', { status: 400 })
    }

    // 1. PayTR Hash Doğrulama
    const hashStr = merchant_oid + merchantSalt + status + total_amount
    const expectedHash = crypto
      .createHmac('sha256', merchantKey)
      .update(hashStr)
      .digest('base64')

    if (hash !== expectedHash) {
      console.error('[PayTR Callback] Güvenlik ihlali: Geçersiz hash!', {
        merchant_oid,
        receivedHash: hash,
        expectedHash,
      })
      return new NextResponse('PAYTR_INVALID_HASH', { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 2. Sipariş bilgilerini al (Hem alfanümerik hem de tireli formatı destekle)
    const withHyphen = merchant_oid.startsWith('AKD') && !merchant_oid.includes('-')
      ? merchant_oid.replace(/^AKD/, 'AKD-')
      : merchant_oid

    const { data: siparis, error: siparisErr } = await supabase
      .from('siparisler')
      .select('id, siparis_no, email, ad_soyad, toplam_tutar, odeme_durumu, durum, urunler')
      .or(`siparis_no.eq.${merchant_oid},siparis_no.eq.${withHyphen}`)
      .maybeSingle()

    if (siparisErr || !siparis) {
      console.warn('[PayTR Callback] İlgili sipariş veritabanında bulunamadı:', merchant_oid)
      // PayTR'ın tekrar tekrar denemesini engellemek için OK dönülür
      return new NextResponse('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } })
    }

    // 3. Idempotency Koruması: Zaten ödenmiş siparişi tekrar işleme, müşteri bildirimini mükerrer gönderme
    if (siparis.odeme_durumu === 'odendi') {
      return new NextResponse('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } })
    }

    const isSuccess = status === 'success'

    // 4. Sipariş Durumunu Güncelle
    await supabase
      .from('siparisler')
      .update({
        odeme_durumu: isSuccess ? 'odendi' : 'iptal',
        durum: isSuccess ? 'onaylandi' : 'iptal',
        notlar: isSuccess
          ? undefined
          : `PayTR Ödeme Başarısız: [${failed_reason_code || 'HATA'}] ${failed_reason_msg || 'İşlem tamamlanamadı'}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', siparis.id)

    // 5. Başarılı ödemede stokları güvenli ve atomik şekilde düş
    if (isSuccess && Array.isArray(siparis.urunler)) {
      try {
        for (const item of siparis.urunler) {
          if (!item.urun_id || !item.adet) continue
          const { error: rpcErr } = await supabase.rpc('atomic_stok_dusur', {
            p_urun_id: item.urun_id,
            p_adet: item.adet,
          })

          if (rpcErr) {
            const { data: urun } = await supabase
              .from('urunler')
              .select('stok_adedi')
              .eq('id', item.urun_id)
              .single()

            if (urun && typeof urun.stok_adedi === 'number') {
              const kalan = Math.max(0, urun.stok_adedi - Number(item.adet))
              const nextDurum = kalan <= 0 ? 'tukendi' : 'stokta'
              await supabase
                .from('urunler')
                .update({
                  stok_adedi: kalan,
                  stok_durumu: nextDurum,
                })
                .eq('id', item.urun_id)
            }
          }
        }
      } catch (stokErr) {
        console.error('[PayTR Callback] Stok düşülürken hata:', stokErr)
      }
    }

    // 6. E-posta Bildirimleri (Müşteri ve Yönetici)
    try {
      if (isSuccess) {
        // Müşteri dekont e-postası
        await sendEmail(
          siparis.email,
          `Ödemeniz Onaylandı — ${siparis.siparis_no} | Akdağ Elektronik`,
          odemeOnaylandiHTML({
            siparis_no: siparis.siparis_no,
            ad_soyad: siparis.ad_soyad,
            toplam_tutar: siparis.toplam_tutar,
          })
        )

        // Yönetici tahsilat bildirimi
        const adminEmail = process.env.ADMIN_EMAIL || 'info@akdagelektronik.com'
        await sendEmail(
          adminEmail,
          `💳 PayTR Tahsilatı: ${siparis.siparis_no} — ${Number(siparis.toplam_tutar).toLocaleString('tr-TR')} ₺`,
          `<div style="font-family:sans-serif;padding:20px;background:#f9f9f9;color:#333;">
            <h2 style="color:#16a34a;">PayTR Kredi Kartı Ödemesi Alındı</h2>
            <p><strong>Sipariş No:</strong> ${siparis.siparis_no}</p>
            <p><strong>Müşteri:</strong> ${siparis.ad_soyad} (${siparis.email})</p>
            <p><strong>Tahsil Edilen Tutar:</strong> ${Number(siparis.toplam_tutar).toLocaleString('tr-TR')} ₺</p>
            <p><strong>Durum:</strong> Onaylandı / Ödendi</p>
          </div>`
        )
      } else {
        await sendEmail(
          siparis.email,
          `Ödeme Alınamadı — ${siparis.siparis_no} | Akdağ Elektronik`,
          siparisIptalHTML({
            siparis_no: siparis.siparis_no,
            ad_soyad: siparis.ad_soyad,
          })
        )
      }
    } catch (mailErr) {
      console.error('[PayTR Callback] E-posta gönderilemedi:', (mailErr as Error).message)
    }

    // PayTR sistemine işlemin başarıyla alındığını bildiren 'OK' yanıtı (Zorunludur)
    return new NextResponse('OK', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  } catch (e) {
    console.error('PayTR callback sistem hatası:', e)
    return new NextResponse('ERROR', { status: 500, headers: { 'Content-Type': 'text/plain' } })
  }
}
