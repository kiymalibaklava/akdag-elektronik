import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bayi Girişi ve B2B Toptan Ses Sistemleri',
  description: 'Elektrikçiler, organizatörler ve kurumsal firmalar için Akdağ Elektronik bayilik portalı. Özel iskonto oranları ve toptan profesyonel ses sistemi fiyatları için giriş yapın.',
}

export default function BayiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
