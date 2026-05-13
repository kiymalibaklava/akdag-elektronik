import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { path, tag } = await request.json()
    
    // Spesifik tag temizleme (products etiketi getProduct içinde kullanılıyor)
    if (tag) {
      revalidateTag(tag)
    } else {
      revalidateTag('products')
    }

    if (path) {
      revalidatePath(path, 'layout')
    } else {
      revalidatePath('/', 'layout')
      revalidatePath('/urunler', 'layout')
    }
    
    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
