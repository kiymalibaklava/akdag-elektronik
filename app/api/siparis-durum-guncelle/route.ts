import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  siparisOnaylandiHTML,
  siparisHazirlaniyorHTML,
  siparisKargolandiHTML,
  siparisTeslimEdildiHTML,
  siparisIptalHTML,
} from '@/lib/email'
import { sendEmail } from '@/lib/send-email'

const supabaseAdmin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

export async function POST(req: NextRequest) {
  try {
    const { id, durum, kargo_takip_no } = await req.json()
    const db = supabaseAdmin()

    // 1. Sipariş bilgilerini al
    const { data: siparis, error: getErr } = await db
      .from('siparisler')
      .select('siparis_no, email, ad_soyad, durum, urunler')
      .eq('id', id)
      .single()

    if (getErr || !siparis) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })
    }

    const eskiDurum = siparis.durum
    const yeniDurum = durum

    // 2. Stok Yönetimi
    if (eskiDurum !== 'iptal' && yeniDurum === 'iptal') {
      // Sipariş iptal: stokları geri yükle
      for (const item of (siparis.urunler as any[])) {
        if (!item.urun_id) continue
        const { data: urun } = await db.from('urunler').select('stok_adedi').eq('id', item.urun_id).single()
        if (urun) {
          const yeniStok = (urun.stok_adedi || 0) + item.adet
          await db.from('urunler').update({
            stok_adedi: yeniStok,
            stok_durumu: yeniStok > 0 ? 'stokta' : 'tukendi',
          }).eq('id', item.urun_id)
        }
      }
    } else if (eskiDurum === 'iptal' && yeniDurum !== 'iptal') {
      // İptal edilmiş sipariş tekrar aktif: stokları düş
      for (const item of (siparis.urunler as any[])) {
        if (!item.urun_id) continue
        const { data: urun } = await db.from('urunler').select('stok_adedi').eq('id', item.urun_id).single()
        if (urun) {
          const yeniStok = Math.max(0, (urun.stok_adedi || 0) - item.adet)
          await db.from('urunler').update({
            stok_adedi: yeniStok,
            stok_durumu: yeniStok > 0 ? 'stokta' : 'tukendi',
          }).eq('id', item.urun_id)
        }
      }
    }

    // 3. Durumu güncelle
    const updateData: any = { durum: yeniDurum, updated_at: new Date().toISOString() }
    if (kargo_takip_no) updateData.kargo_takip_no = kargo_takip_no

    const { error: updErr } = await db
      .from('siparisler')
      .update(updateData)
      .eq('id', id)

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 400 })
    }

    // 4. Durum e-postası gönder
    const emailParams = { siparis_no: siparis.siparis_no, ad_soyad: siparis.ad_soyad }

    const durumEmailMap: Record<string, { subject: string; html: string } | null> = {
      onaylandi: {
        subject: `Siparişiniz Onaylandı — ${siparis.siparis_no} | Akdağ Elektronik`,
        html: siparisOnaylandiHTML(emailParams),
      },
      hazirlaniyor: {
        subject: `Siparişiniz Hazırlanıyor — ${siparis.siparis_no} | Akdağ Elektronik`,
        html: siparisHazirlaniyorHTML(emailParams),
      },
      kargolandi: {
        subject: `Siparişiniz Kargoya Verildi — ${siparis.siparis_no} | Akdağ Elektronik`,
        html: siparisKargolandiHTML({ ...emailParams, kargo_takip_no: kargo_takip_no || undefined }),
      },
      teslim_edildi: {
        subject: `Siparişiniz Teslim Edildi 🎉 — ${siparis.siparis_no} | Akdağ Elektronik`,
        html: siparisTeslimEdildiHTML(emailParams),
      },
      iptal: {
        subject: `Siparişiniz İptal Edildi — ${siparis.siparis_no} | Akdağ Elektronik`,
        html: siparisIptalHTML(emailParams),
      },
    }

    const emailData = durumEmailMap[yeniDurum]
    if (emailData) {
      await sendEmail(siparis.email, emailData.subject, emailData.html)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Sipariş durum güncelleme hatası:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
