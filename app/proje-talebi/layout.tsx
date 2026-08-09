import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sistem Kurulum Talebi | Akdağ Elektronik',
  description: 'Okul, cami, konferans salonu ve daha fazlası için profesyonel ses, ışık ve görüntü sistemi kurulum talebi oluşturun. Ücretsiz keşif ve teklif için formu doldurun.',
}

export default function ProjeTalebiLayout({ children }: { children: React.ReactNode }) {
  return children
}
