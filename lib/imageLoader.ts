'use client'

export default function imageLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
  // Eğer görsel Supabase'den geliyorsa, ücretsiz, sınırsız ve Cloudflare destekli 
  // wsrv.nl proxy'si üzerinden WebP formatında ve tam istenen boyutta küçülterek çek.
  // Bu Vercel limitlerini %100 korur ve sayfa hızını uçurur.
  if (src.includes('supabase.co')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}&output=webp`
  }
  
  // Yerel dosyalar veya diğer kaynaklar için orijinal URL'yi döndür
  return src
}
