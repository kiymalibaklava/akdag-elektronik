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

const CART_KEY = 'akdag-sepet'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]') }
  catch { return [] }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('cart-updated'))
}

export function addToCart(item: Omit<CartItem, 'adet'>) {
  const cart = getCart()
  const existing = cart.find(c => c.id === item.id)
  if (existing) {
    // Kur güncellenmiş olabilir, fiyatı güncelle
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
    const existing = cart.find(c => c.id === incoming.id)
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
  saveCart(getCart().filter(c => c.id !== id))
}

export function updateQty(id: string, adet: number) {
  if (adet <= 0) { removeFromCart(id); return }
  const cart = getCart()
  const item = cart.find(c => c.id === id)
  if (item) { item.adet = adet; saveCart(cart) }
}

export function clearCart() { saveCart([]) }

export function getCartCount(): number {
  return getCart().reduce((sum, i) => sum + i.adet, 0)
}

export function getCartTotal(isBayi: boolean): number {
  return Math.ceil(getCart().reduce((sum, i) => {
    const price = isBayi && i.bayi_fiyati ? i.bayi_fiyati : i.fiyat
    return sum + price * i.adet
  }, 0))
}
