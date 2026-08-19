export interface SavedProduct {
  id: string
  slug?: string
  ad: string
  kategori: string
  fiyat?: number
  para_birimi?: string
  stok_durumu?: string
  stok_adedi?: number | null
  kritik_stok?: number | null
  marka?: string | null
  kullanim_alani?: string | null
}

const FAV_KEY = 'akdag-favoriler'

function getList(key: string): SavedProduct[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

function setList(key: string, items: SavedProduct[]) {
  localStorage.setItem(key, JSON.stringify(items))
  window.dispatchEvent(new Event('product-lists-updated'))
}

export function getFavorites() {
  return getList(FAV_KEY)
}

export function isFavorite(id: string) {
  return getFavorites().some((x) => x.id === id)
}

export function toggleFavorite(product: SavedProduct) {
  const list = getFavorites()
  if (list.some((x) => x.id === product.id)) {
    setList(
      FAV_KEY,
      list.filter((x) => x.id !== product.id)
    )
    return false
  }
  setList(FAV_KEY, [product, ...list])
  return true
}
