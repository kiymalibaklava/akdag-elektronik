import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { paytrTokenSchema } from '@/lib/api-schemas'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/request-ip'

const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID!
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!

export async function POST(req: NextRequest) {
  try {
    const merchantId = process.env.PAYTR_MERCHANT_ID
    const merchantKey = process.env.PAYTR_MERCHANT_KEY
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT

    if (!merchantId || !merchantKey || !merchantSalt) {
      return NextResponse.json({ error: 'Ödeme sistemi yapılandırması eksik (API anahtarları tanımlanmamış).' }, { status: 503 })
    }

    const ip = getClientIp(req)
    if (!(await rateLimit(`paytr:${ip}`, 20, 60_000))) {
      return NextResponse.json({ error: 'Çok fazla istek. Lütfen bir dakika sonra deneyin.' }, { status: 429 })
    }

    const raw = await req.json()
    const parsed = paytrTokenSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 })
    }

    const { siparis_no, ad_soyad, email, telefon, urunler } = parsed.data

    // 1. Fiyat ve Sipariş Güvenliği: Sipariş ve tutar doğrudan veritabanından doğrulanır
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const withHyphen = siparis_no.startsWith('AKD') && !siparis_no.includes('-')
      ? siparis_no.replace(/^AKD/, 'AKD-')
      : siparis_no

    const { data: dbSiparis, error: siparisErr } = await supabaseAdmin
      .from('siparisler')
      .select('id, siparis_no, toplam_tutar, urunler, ad_soyad, email, telefon, teslimat_adresi, odeme_durumu')
      .or(`siparis_no.eq.${siparis_no},siparis_no.eq.${withHyphen}`)
      .maybeSingle()

    if (siparisErr || !dbSiparis) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })
    }

    if (dbSiparis.odeme_durumu === 'odendi') {
      return NextResponse.json({ error: 'Bu siparişin ödemesi zaten tamamlanmıştır.' }, { status: 400 })
    }

    const verifiedTutar = Number(dbSiparis.toplam_tutar)
    const tutarKurus = Math.round(verifiedTutar * 100).toString()

    const rawUrunler = Array.isArray(dbSiparis.urunler) && dbSiparis.urunler.length > 0
      ? dbSiparis.urunler
      : urunler

    // PayTR sepet formatı: [[ 'Ürün Adı', 'Birim Fiyat', Adet ]]
    // Sepetteki (Birim Fiyat * Adet) toplamı payment_amount kuruş karşılığına tam olarak eşit olmalıdır.
    let basketItems: [string, string, number][] = []
    let basketSum = 0

    for (const u of rawUrunler) {
      const cleanAd = String(u.ad || 'Ürün').replace(/["\\]/g, '').slice(0, 100)
      const fiyatNum = Number(u.fiyat) || 0
      const adetNum = Number(u.adet) || 1
      basketItems.push([cleanAd, fiyatNum.toFixed(2), adetNum])
      basketSum += fiyatNum * adetNum
    }

    // Kuruş, döviz çevrimi veya yuvarlama farkı varsa PayTR'ın sepet tutarı hatası vermesini önlemek için
    // toplam tutarı tek kalem sipariş bedeli olarak garantile
    if (basketItems.length === 0 || Math.abs(basketSum - verifiedTutar) > 0.01) {
      basketItems = [[`Sipariş Bedeli (${dbSiparis.siparis_no})`, verifiedTutar.toFixed(2), 1]]
    }

    const sepetIcerik = JSON.stringify(basketItems)
    const sepetBase64 = Buffer.from(sepetIcerik).toString('base64')

    // Canlı / Test Modu
    const test_mode = process.env.PAYTR_TEST_MODE === '1' ? '1' : '0'

    // Localhost veya IPv6 loopback kontrolleri (PayTR canlı modda özel yerel IP'leri reddeder)
    let user_ip = ip
    if (!user_ip || user_ip === '127.0.0.1' || user_ip === '::1' || user_ip.includes('localhost')) {
      user_ip = '85.105.1.1'
    }

    // Telefon ve Adres formatlama (PayTR zorunlu alanları)
    const rawPhone = (telefon || dbSiparis.telefon || '05555555555').replace(/\D/g, '')
    const user_phone = rawPhone.length >= 10 ? rawPhone : '05555555555'
    const user_name = (ad_soyad || dbSiparis.ad_soyad || 'Bayi Yetkilisi').trim()
    const user_address = (dbSiparis.teslimat_adresi || 'Kayseri, Türkiye').trim()

    // PayTR alfanümerik zorunluluğu: merchant_oid özel karakter (tire vb.) İÇEREMEZ!
    const merchant_oid = dbSiparis.siparis_no.replace(/[^A-Za-z0-9]/g, '')

    const hashStr = [
      merchantId,
      user_ip,
      merchant_oid,
      email,
      tutarKurus,
      sepetBase64,
      '0', // no_installment
      '0', // max_installment
      'TL',
      test_mode,
      merchantSalt,
    ].join('')

    const paytrToken = crypto.createHmac('sha256', merchantKey).update(hashStr).digest('base64')

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.akdagelektronik.com').replace(/\/+$/, '')

    // PayTR başarılı ve hatalı dönüşlerde iframe içinde POST gönderebilir.
    // Next.js App Router sayfaları doğrudan POST aldığında 405 vermesin diye /api/odeme-sonuc köprüsüne yönlendiriyoruz.
    const params = new URLSearchParams({
      merchant_id: merchantId,
      user_ip,
      merchant_oid,
      email,
      payment_amount: tutarKurus,
      paytr_token: paytrToken,
      user_basket: sepetBase64,
      debug_on: '1',
      no_installment: '0',
      max_installment: '0',
      user_name,
      user_address,
      user_phone,
      merchant_ok_url: `${siteUrl}/api/odeme-sonuc?durum=basarili`,
      merchant_fail_url: `${siteUrl}/api/odeme-sonuc?durum=hata`,
      timeout_limit: '30',
      currency: 'TL',
      test_mode,
      lang: 'tr',
    })

    const paytrRes = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const paytrData = await paytrRes.json()

    if (paytrData.status !== 'success') {
      console.error('[PayTR Token Hatası]', paytrData)
      return NextResponse.json({ error: paytrData.reason || 'PayTR token alınamadı' }, { status: 400 })
    }

    // Token'ı siparişe kaydet
    await supabaseAdmin
      .from('siparisler')
      .update({ paytr_token: paytrData.token })
      .eq('id', dbSiparis.id)

    return NextResponse.json({ token: paytrData.token })
  } catch (e) {
    console.error('PayTR hata:', e)
    return NextResponse.json({ error: 'Ödeme sistemi hatası' }, { status: 500 })
  }
}
