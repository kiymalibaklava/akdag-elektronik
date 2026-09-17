export interface CartItem {
  id: string
  ad: string
  kategori: string
  fotograf: string
  fiyat: number           // TL karşılığı (ödeme için)
  fiyat_doviz?: number    // Orijinal döviz fiyatı (gösterim için)
  para_birimi?: string    // USD / EUR / TRY
  bayi_fiyati: number | null      // TL karşılığı
  bayi_fiyat_doviz?: number | null // Orijinal döviz
  bayi_para_birimi?: string
  adet: number
}

import { createClient } from '@/lib/supabase'

const CART_KEY = 'akdag-sepet'

let syncTimeout: any = null
let cachedUserId: string | null = null

export function setCartUserId(uid: string | null) {
  cachedUserId = uid
  if (!uid && typeof window !== 'undefined') {
    // Bayi oturumu kapandığında sepeti tamamen temizle
    localStorage.removeItem(CART_KEY)
    window.dispatchEvent(new Event('cart-updated'))
  }
}

// Veritabanındaki güncel sepeti çeker ve cihazlar arasında anında eşitler
export async function pullCartFromSupabase(): Promise<CartItem[]> {
  if (typeof window === 'undefined') return []

  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      // Giriş yapılmamışsa sepet temizlenir
      localStorage.removeItem(CART_KEY)
      window.dispatchEvent(new Event('cart-updated'))
      return []
    }

    const res = await fetch('/api/bayi/sepet', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem(CART_KEY)
        window.dispatchEvent(new Event('cart-updated'))
      }
      return getCart()
    }

    const data = await res.json()
    const serverItems: CartItem[] = Array.isArray(data.items) ? data.items : []

    // Veritabanındaki sepeti yerel belleğe yaz ve arayüzü anında güncelle
    localStorage.setItem(CART_KEY, JSON.stringify(serverItems))
    window.dispatchEvent(new Event('cart-updated'))
    return serverItems
  } catch (err) {
    console.error('[pullCartFromSupabase] Hata:', err)
    return getCart()
  }
}

// Cihazdaki sepet değişikliklerini veritabanına anlık kaydeder
function syncCartToSupabase(items: CartItem[]) {
  if (typeof window === 'undefined') return

  clearTimeout(syncTimeout)
  syncTimeout = setTimeout(async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      await fetch('/api/bayi/sepet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, adet: i.adet })),
        }),
      })
    } catch (err) {
      console.error('[syncCartToSupabase] Hata:', err)
    }
  }, 250) // Hızlı 250ms senkronizasyon
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]') }
  catch { return [] }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('cart-updated'))
  syncCartToSupabase(items)
}

export function addToCart(item: Omit<CartItem, 'adet'>) {
  const cart = getCart()
  const existing = cart.find((c) => c.id === item.id)
  if (existing) {
    existing.adet += 1
    existing.fiyat = item.fiyat
    existing.bayi_fiyati = item.bayi_fiyati
  } else {
    cart.push({ ...item, adet: 1 })
  }
  saveCart(cart)
}

export function addManyToCart(items: Array<Omit<CartItem, 'adet'> & { adet: number }>) {
  const cart = getCart()
  for (const incoming of items) {
    const existing = cart.find((c) => c.id === incoming.id)
    if (existing) {
      existing.adet += incoming.adet
      existing.fiyat = incoming.fiyat
      existing.bayi_fiyati = incoming.bayi_fiyati
    } else {
      cart.push({ ...incoming })
    }
  }
  saveCart(cart)
}

export function removeFromCart(id: string) {
  saveCart(getCart().filter((c) => c.id !== id))
}

export function updateQty(id: string, adet: number) {
  if (adet <= 0) { removeFromCart(id); return }
  const cart = getCart()
  const item = cart.find((c) => c.id === id)
  if (item) { item.adet = adet; saveCart(cart) }
}

export function clearCart() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CART_KEY)
  window.dispatchEvent(new Event('cart-updated'))

  // Veritabanını da sıfırla
  try {
    const supabase = createClient()
    supabase.auth.getSession().then((res: any) => {
      const session = res?.data?.session
      if (session?.access_token) {
        fetch('/api/bayi/sepet', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        }).catch(() => {})
      }
    })
  } catch {}
}

export function getCartCount(): number {
  return getCart().reduce((sum, i) => sum + i.adet, 0)
}

export function getCartTotal(isBayi: boolean): number {
  return Math.ceil(getCart().reduce((sum, i) => {
    const price = isBayi && i.bayi_fiyati ? i.bayi_fiyati : i.fiyat
    return sum + price * i.adet
  }, 0))
}
