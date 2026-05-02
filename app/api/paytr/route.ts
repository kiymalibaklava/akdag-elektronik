import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID!
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      siparis_no,
      tutar,        // Kuruş cinsinden (99.90 TL → 9990)
      ad_soyad,
      email,
      telefon,
      urunler,      // [{ ad, fiyat, adet }]
      user_ip,
    } = body

    if (!siparis_no || !tutar || !ad_soyad || !email) {
      return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const tutarKurus = Math.round(parseFloat(tutar) * 100).toString()

    // Sepet içeriği — PayTR formatı
    const sepetIcerik = JSON.stringify(
      urunler.map((u: { ad: string; fiyat: number; adet: number }) => [
        u.ad,
        (u.fiyat * 100).toFixed(0),
        u.adet.toString(),
      ])
    )
    const sepetBase64 = Buffer.from(sepetIcerik).toString('base64')

    // Hash oluştur
    const hashStr = [
      PAYTR_MERCHANT_ID,
      user_ip || '127.0.0.1',
      siparis_no,
      email,
      tutarKurus,
      sepetBase64,
      '0',           // no_installment
      '0',           // max_installment
      'TL',
      '0',           // test_mode (1 = test, 0 = canlı)
      PAYTR_MERCHANT_SALT,
    ].join('')

    const paytrToken = crypto
      .createHmac('sha256', PAYTR_MERCHANT_KEY)
      .update(hashStr)
      .digest('base64')

    // PayTR API'ye istek
    const params = new URLSearchParams({
      merchant_id: PAYTR_MERCHANT_ID,
      user_ip: user_ip || '127.0.0.1',
      merchant_oid: siparis_no,
      email,
      payment_amount: tutarKurus,
      paytr_token: paytrToken,
      user_basket: sepetBase64,
      debug_on: '1',
      no_installment: '0',
      max_installment: '0',
      user_name: ad_soyad,
      user_phone: telefon || '',
      merchant_ok_url: `${siteUrl}/odeme/basarili`,
      merchant_fail_url: `${siteUrl}/odeme/hata`,
      timeout_limit: '30',
      currency: 'TL',
      test_mode: process.env.PAYTR_TEST_MODE === '1' ? '1' : '0',
      lang: 'tr',
    })

    const paytrRes = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const paytrData = await paytrRes.json()

    if (paytrData.status !== 'success') {
      return NextResponse.json(
        { error: paytrData.reason || 'PayTR token alınamadı' },
        { status: 400 }
      )
    }

    return NextResponse.json({ token: paytrData.token })
  } catch (e) {
    console.error('PayTR hata:', e)
    return NextResponse.json({ error: 'Ödeme sistemi hatası' }, { status: 500 })
  }
}
