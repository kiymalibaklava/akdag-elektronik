import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
      <div className="text-center px-6">
        <div className="font-display font-900 text-[200px] leading-none text-white/3 select-none">
          404
        </div>
        <div className="-mt-16 mb-6">
          <h1 className="font-display font-900 text-4xl uppercase text-white tracking-tight">Sayfa Bulunamadı</h1>
          <p className="font-body text-white/30 mt-3">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
        </div>
        <Link href="/" className="btn-primary text-sm inline-flex">
          Ana Sayfaya Dön
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}
