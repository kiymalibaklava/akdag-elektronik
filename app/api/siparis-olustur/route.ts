import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { musterionayHTML, adminBildirimHTML } from '@/lib/email'
import { sendEmail } from '@/lib/send-email'
import { siparisOlusturSchema } from '@/lib/api-schemas'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/request-ip'
import { dovizToTL } from '@/lib/kur'

const supabaseAdmin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    if (!(await rateLimit(`siparis:${ip}`, 15, 60_000))) {
      return NextResponse.json({ error: 'Çok fazla istek. Lütfen bir dakika sonra deneyin.' }, { status: 429 })
    }

    const raw = await req.json()
    const parsed = siparisOlusturSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Geçersiz veri', details: parsed.error.flatten() }, { status: 400 })
    }

    const {
      user_id,
      urunler,
      toplam_tutar,
      ad_soyad,
      email,
      telefon,
      notlar,
      odeme_tipi,
      teslimat_tipi,
      fatura_tipi,
      firma_unvani,
      vergi_dairesi,
      vergi_no,
      teslimat_adresi,
    } = parsed.data

    const db = supabaseAdmin()

    // 1. Sadece Onaylı Bayi Doğrulaması (B2B Zorunluluğu)
    const authHeader = req.headers.get('Authorization')
    const token = authHeader ? authHeader.replace('Bearer ', '').trim() : null
    let authUserId = user_id

    if (token) {
      const { data: authData } = await db.auth.getUser(token)
      if (authData?.user?.id) {
        authUserId = authData.user.id
      }
    }

    if (!authUserId) {
      return NextResponse.json({ error: 'Sipariş verebilmek için lütfen bayi girişi yapınız.' }, { status: 401 })
    }

    const { data: bayiKaydi } = await db
      .from('bayiler')
      .select('id, firma_adi, yetkili_adi, telefon, sehir, onaylandi')
      .eq('user_id', authUserId)
      .maybeSingle()

    if (!bayiKaydi || !bayiKaydi.onaylandi) {
      return NextResponse.json({ error: 'Sitemiz yalnızca onaylı bayilere satış yapmaktadır.' }, { status: 403 })
    }

    // 2. Döviz kurlarını al
    let dolarKuru = 32.5
    let euroKuru = 35.2
    try {
      const kurRes = await fetch(`${req.nextUrl.origin}/api/kur`)
      if (kurRes.ok) {
        const kurData = await kurRes.json()
        dolarKuru = kurData.USD || 32.5
        euroKuru = kurData.EUR || 35.2
      }
    } catch {}

    const kurObj = { USD: dolarKuru, EUR: euroKuru, guncelleme: null }

    // 3. Fiyat Manipülasyonu Koruması: Ürün fiyatlarını veritabanından doğrula
    const urunIds = urunler.map((u) => u.urun_id).filter(Boolean) as string[]
    const [{ data: dbUrunler }, { data: dbOzelFiyatlar }] = await Promise.all([
      db.from('urunler').select('id, ad, fiyat, bayi_fiyati, para_birimi, bayi_para_birimi, fotograflar').in('id', urunIds),
      db.from('urun_fiyatlari').select('urun_id, bayi_fiyati, para_birimi').in('urun_id', urunIds),
    ])

    const verifiedUrunler: any[] = []
    let verifiedTotal = 0

    for (const item of urunler) {
      const dbUrun = dbUrunler?.find((u) => u.id === item.urun_id)
      if (!dbUrun) {
        return NextResponse.json({ error: `Ürün bulunamadı veya satıştan kaldırıldı: ${item.ad}` }, { status: 400 })
      }

      const ozelFiyat = dbOzelFiyatlar?.find((f) => f.urun_id === item.urun_id)
      const rawBayiFiyat = ozelFiyat?.bayi_fiyati ?? dbUrun.bayi_fiyati ?? dbUrun.fiyat ?? 0
      const rawParaBirimi = ozelFiyat?.para_birimi ?? dbUrun.bayi_para_birimi ?? dbUrun.para_birimi ?? 'TRY'

      const birimFiyatTL = dovizToTL(Number(rawBayiFiyat), rawParaBirimi, kurObj)
      verifiedTotal += birimFiyatTL * item.adet

      verifiedUrunler.push({
        urun_id: dbUrun.id,
        ad: dbUrun.ad,
        adet: item.adet,
        fiyat: birimFiyatTL,
        fotograf: item.fotograf || dbUrun.fotograflar?.[0] || '',
      })
    }

    verifiedTotal = Math.ceil(verifiedTotal)

    if (Math.abs(verifiedTotal - Math.ceil(toplam_tutar)) > 2) {
      return NextResponse.json({
        error: 'Sepet fiyatları güncel kurlara göre yenilendi. Lütfen sepetinizi kontrol edip tekrar deneyin.',
        guncel_tutar: verifiedTotal,
      }, { status: 400 })
    }

    // 4. Siparişi doğrulanmış verilerle kaydet
    const { data: siparis, error: dbErr } = await db
      .from('siparisler')
      .insert({
        user_id: authUserId,
        bayi_id: bayiKaydi.id,
        urunler: verifiedUrunler,
        toplam_tutar: verifiedTotal,
        ad_soyad: ad_soyad || bayiKaydi.yetkili_adi || 'Bayi Yetkilisi',
        email,
        telefon: telefon || bayiKaydi.telefon || null,
        notlar,
        odeme_tipi,
        teslimat_tipi: teslimat_tipi || 'kargo',
        odeme_durumu: 'beklemede',
        durum: 'beklemede',
        fatura_tipi: fatura_tipi || 'kurumsal',
        firma_unvani: firma_unvani || bayiKaydi.firma_adi || null,
        vergi_dairesi: vergi_dairesi || null,
        vergi_no: vergi_no || null,
        teslimat_adresi: teslimat_adresi || null,
        dolar_kuru: dolarKuru,
        euro_kuru: euroKuru,
        ip_adresi: ip,
        user_agent: req.headers.get('user-agent') || null,
      })
      .select('siparis_no, id')
      .single()

    if (dbErr || !siparis) {
      return NextResponse.json({ error: dbErr?.message || 'Sipariş oluşturulamadı' }, { status: 400 })
    }

    for (const item of urunler) {
      if (!item.urun_id) continue

      // Önce mevcut durumu al (siparise_gore mantığı için gerekli)
      const { data: urun } = await db
        .from('urunler')
        .select('stok_durumu, stok_adedi')
        .eq('id', item.urun_id)
        .single()

      if (typeof urun?.stok_adedi === 'number') {
        // Atomic stok düşürme — PostgreSQL fonksiyonu ile race condition olmadan güncelle
        // Supabase SQL: UPDATE urunler SET stok_adedi = GREATEST(stok_adedi - p_adet, 0) WHERE id = p_urun_id
        const { error: rpcErr } = await db.rpc('atomic_stok_dusur', {
          p_urun_id: item.urun_id,
          p_adet: item.adet,
        })

        if (rpcErr) {
          // RPC henüz eklenmemişse fallback (eski davranış) — uyarı logla
          console.warn('[stok] atomic_stok_dusur RPC bulunamadı, fallback kullanılıyor. Lütfen stok-migration.sql dosyasını Supabase SQL Editor\'da çalıştırın.', rpcErr.message)
          const kalan = Math.max(0, urun.stok_adedi - item.adet)
          const nextDurum = kalan <= 0 ? 'tukendi' : 'stokta'
          await db.from('urunler').update({ stok_adedi: kalan, stok_durumu: nextDurum }).eq('id', item.urun_id)
        }
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
      ad_soyad: ad_soyad || bayiKaydi.yetkili_adi || 'Bayi Yetkilisi',
      email,
      telefon: telefon || bayiKaydi.telefon || '',
      urunler: verifiedUrunler,
      toplam_tutar: verifiedTotal,
      odeme_tipi: odeme_tipi || 'havale',
      notlar: notlar ?? undefined,
      is_bayi: true,
      bayi_adi: bayiKaydi.firma_adi,
      fatura_tipi: fatura_tipi || 'kurumsal',
      firma_unvani: firma_unvani || bayiKaydi.firma_adi,
      vergi_dairesi: vergi_dairesi || undefined,
      vergi_no: vergi_no || undefined,
      teslimat_tipi: teslimat_tipi || 'kargo',
      teslimat_adresi: teslimat_adresi || undefined,
    }

    // E-postaları ayrı try/catch ile gönder — mail hatası siparişi engellemesin
    let emailError: string | undefined
    try {
      await sendEmail(
        email,
        `Siparişiniz Alındı — ${siparis.siparis_no} | Akdağ Elektronik`,
        musterionayHTML(emailData)
      )
      const adminEmail = process.env.ADMIN_EMAIL || 'info@akdagelektronik.com.tr'
      await sendEmail(
        adminEmail,
        `🔔 Yeni Sipariş: ${siparis.siparis_no} — ${toplam_tutar.toLocaleString('tr-TR')} ₺`,
        adminBildirimHTML(emailData)
      )
    } catch (mailErr) {
      emailError = (mailErr as Error).message
      console.error('[siparis-olustur] E-posta gönderilemedi, sipariş oluşturuldu:', emailError)
    }

    return NextResponse.json({
      success: true,
      siparis_no: siparis.siparis_no,
      id: siparis.id,
      ...(emailError ? { email_error: 'E-posta gönderilemedi, siparişiniz kaydedildi.' } : {}),
    })
  } catch (e) {
    console.error('Sipariş oluşturma hatası:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
