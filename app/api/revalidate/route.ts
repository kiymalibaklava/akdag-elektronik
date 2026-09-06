import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { isAuthorizedAdminOrSecret } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const authorized = await isAuthorizedAdminOrSecret(request)
    if (!authorized) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Geçerli bir yönetici oturumu veya anahtar gereklidir.' }, { status: 401 })
    }
    const body = await request.json().catch(() => ({}))
    const { path } = body

    if (path) {
      revalidatePath(path)
    }

    // Her revalidation tetiklendiğinde anasayfa ve ürün kataloğunu
    // dinamik olarak güncelliyoruz.
    revalidatePath('/')
    revalidatePath('/urunler')
    
    // unstable_cache ile fetch edilen verileri sıfırlamak için tag kullanıyoruz
    revalidateTag('products')

    return NextResponse.json({
      revalidated: true,
      path: path || 'all',
      now: Date.now()
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
