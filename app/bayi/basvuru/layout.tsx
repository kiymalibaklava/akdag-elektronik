import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bayilik Başvurusu | B2B Ses Sistemleri',
  description: 'Akdağ Elektronik profesyonel ses, ışık ve sahne sistemleri toptan satışı için bayilik başvurusu yapın. Karlı iş ortaklıkları için hemen formu doldurun.',
}

export default function BayiBasvuruLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
