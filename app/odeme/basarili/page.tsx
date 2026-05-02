import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function OdemeBasarili() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-green-500/10 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle size={48} className="text-green-400" />
        </div>
        <div className="flex items-center gap-3 justify-center mb-4">
          <div className="w-8 h-px bg-brand-red" />
          <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Ödeme Onaylandı</span>
          <div className="w-8 h-px bg-brand-red" />
        </div>
        <h1 className="font-display font-black text-4xl uppercase text-white mb-4">
          Siparişiniz Alındı!
        </h1>
        <p className="font-body text-white/40 text-base leading-relaxed mb-8">
          Ödemeniz başarıyla tamamlandı. Sipariş detaylarınız e-posta adresinize gönderilecektir.
          En kısa sürede sizinle iletişime geçilecektir.
        </p>
        <div className="bg-[#141414] border border-white/8 p-5 mb-8 text-left">
          <p className="font-body text-white/30 text-sm">
            Sipariş takibi veya sorularınız için:
          </p>
          <a href="tel:+903522316915" className="font-display font-black text-lg text-brand-red mt-1 block hover:underline">
            +90 352 231 69 15
          </a>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/urunler" className="btn-primary text-sm">
            Alışverişe Devam
            <ArrowRight size={14} />
          </Link>
          <Link href="/" className="btn-outline text-sm">Ana Sayfa</Link>
        </div>
      </div>
    </div>
  )
}
