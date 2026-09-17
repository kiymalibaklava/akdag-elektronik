import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

async function getAuthBayi(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader ? authHeader.replace('Bearer ', '').trim() : null
  if (!token) return null

  const db = supabaseAdmin()
  const { data: authData, error: authErr } = await db.auth.getUser(token)
  if (authErr || !authData?.user?.id) return null

  const userId = authData.user.id
  const { data: bayi } = await db
    .from('bayiler')
    .select('id, firma_adi, onaylandi')
    .eq('user_id', userId)
    .maybeSingle()

  if (!bayi || !bayi.onaylandi) return null

  return { userId, bayi }
}

// GET: Bayinin veritabanındaki sepetini getirir (tüm cihazlar için ortak)
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthBayi(req)
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const db = supabaseAdmin()
    const { data: sepetRows, error } = await db
      .from('sepet')
      .select('adet, urun_id, urunler(id, ad, kategori, fotograflar, fiyat, bayi_fiyati, para_birimi, bayi_para_birimi)')
      .eq('user_id', auth.userId)

    if (error) {
      console.error('[bayi-sepet GET] Hata:', error)
      return NextResponse.json({ error: 'Sepet getirilemedi' }, { status: 500 })
    }

    const items = (sepetRows || [])
      .filter((row: any) => row.urunler && row.urunler.id)
      .map((row: any) => {
        const u = row.urunler
        return {
          id: row.urun_id,
          ad: u.ad,
          kategori: u.kategori,
          fotograf: u.fotograflar?.[0] || '',
          fiyat: Number(u.fiyat) || 0,
          fiyat_doviz: Number(u.fiyat) || 0,
          para_birimi: u.para_birimi || 'TRY',
          bayi_fiyati: u.bayi_fiyati !== null ? Number(u.bayi_fiyati) : null,
          bayi_fiyat_doviz: u.bayi_fiyati !== null ? Number(u.bayi_fiyati) : null,
          bayi_para_birimi: u.bayi_para_birimi || u.para_birimi || 'TRY',
          adet: Math.max(1, Number(row.adet) || 1),
        }
      })

    return NextResponse.json({ items })
  } catch (e) {
    console.error('[bayi-sepet GET] Sistem hatası:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST: Bayinin cihazındaki sepeti veritabanına anlık kaydeder
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthBayi(req)
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const body = await req.json()
    const rawItems = Array.isArray(body?.items) ? body.items : []
    const db = supabaseAdmin()

    if (rawItems.length === 0) {
      // Sepet boşaltılmış
      await db.from('sepet').delete().eq('user_id', auth.userId)
      return NextResponse.json({ success: true, count: 0 })
    }

    const validItems = rawItems
      .filter((i: any) => typeof i?.id === 'string' && i.id.length > 0)
      .map((i: any) => ({
        id: i.id,
        adet: Math.max(1, parseInt(i.adet, 10) || 1),
      }))

    const validIds = validItems.map((i: any) => i.id)

    // 1. Sepetten çıkarılan ürünleri veritabanından sil
    if (validIds.length > 0) {
      // PostgREST "not in" sözdizimi parantez gerektirir: (id1,id2)
      await db
        .from('sepet')
        .delete()
        .eq('user_id', auth.userId)
        .not('urun_id', 'in', `(${validIds.join(',')})`)
    }

    // 2. Güncel ürün ve adetleri kaydet (upsert)
    const upsertRows = validItems.map((i: any) => ({
      user_id: auth.userId,
      urun_id: i.id,
      adet: i.adet,
      updated_at: new Date().toISOString(),
    }))

    const { error: upsertErr } = await db
      .from('sepet')
      .upsert(upsertRows, { onConflict: 'user_id,urun_id' })

    if (upsertErr) {
      console.error('[bayi-sepet POST] Upsert hatası:', upsertErr)
      return NextResponse.json({ error: 'Sepet kaydedilemedi' }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: validItems.length })
  } catch (e) {
    console.error('[bayi-sepet POST] Sistem hatası:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE: Bayinin sepetini tüm cihazlarda sıfırlar
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthBayi(req)
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const db = supabaseAdmin()
    await db.from('sepet').delete().eq('user_id', auth.userId)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[bayi-sepet DELETE] Sistem hatası:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
