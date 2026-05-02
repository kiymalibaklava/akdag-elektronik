import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const merchant_oid = formData.get('merchant_oid') as string
    const status = formData.get('status') as string
    const total_amount = formData.get('total_amount') as string
    const hash = formData.get('hash') as string

    // Hash doğrula
    const hashStr = merchant_oid + PAYTR_MERCHANT_SALT + status + total_amount
    const expectedHash = crypto
      .createHmac('sha256', PAYTR_MERCHANT_KEY)
      .update(hashStr)
      .digest('base64')

    if (hash !== expectedHash) {
      return new NextResponse('PAYTR_INVALID_HASH', { status: 400 })
    }

    // Sipariş durumunu güncelle
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const odeme_durumu = status === 'success' ? 'odendi' : 'iptal'
    const siparis_durumu = status === 'success' ? 'onaylandi' : 'iptal'

    await supabase
      .from('siparisler')
      .update({
        odeme_durumu,
        durum: siparis_durumu,
        updated_at: new Date().toISOString(),
      })
      .eq('siparis_no', merchant_oid)

    // PayTR OK yanıtı bekler
    return new NextResponse('OK', { status: 200 })
  } catch (e) {
    console.error('PayTR callback hata:', e)
    return new NextResponse('ERROR', { status: 500 })
  }
}
