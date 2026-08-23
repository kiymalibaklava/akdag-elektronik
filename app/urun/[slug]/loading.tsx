export default function UrunDetayLoading() {
  return (
    <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center bg-[#0A0A0A]">
      <div className="w-10 h-10 border-2 border-white/10 border-t-brand-red rounded-full animate-spin mb-6" />
      <div className="font-display font-bold text-xs uppercase tracking-widest text-brand-red animate-pulse">
        Ürün Bilgileri Yükleniyor...
      </div>
    </div>
  )
}