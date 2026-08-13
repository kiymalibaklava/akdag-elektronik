import Link from 'next/link'
import { ArrowLeft, Phone, Mail, RotateCcw, Clock, CheckCircle, XCircle, Package } from 'lucide-react'

export const metadata = {
  title: 'İptal ve İade Koşulları | Akdağ Elektronik',
  description: 'Akdağ Elektronik iptal ve iade koşulları — cayma hakkı, iade süreci ve para iadesi bilgileri.',
}

function Section({ title, num, children }: { title: string; num: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute -left-2 top-0 font-display font-black text-[60px] leading-none text-white/[0.025] select-none hidden md:block">{num}</div>
      <h2 className="font-display font-bold text-lg uppercase tracking-wide text-white mb-4 flex items-center gap-3">
        <div className="w-6 h-px bg-brand-red" />
        {title}
      </h2>
      <div className="font-body text-white/50 text-sm leading-relaxed pl-0 md:pl-2">{children}</div>
    </div>
  )
}

export default function IptalVeIade() {
  return (
    <div className="min-h-screen pb-24">
      <div className="bg-[#0A0A0A] border-b border-white/5 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-brand-red text-sm font-body mb-8 transition-colors">
            <ArrowLeft size={14} /> Ana Sayfa
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-brand-red" />
            <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Yasal Bilgiler</span>
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase text-white leading-tight">
            İPTAL VE İADE<br /><span className="text-brand-red">KOŞULLARI</span>
          </h1>
          <p className="font-body text-white/30 text-sm mt-4">Son güncelleme: Mayıs 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-12">
        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-12">
          <div className="bg-[#141414] border border-white/5 p-5 text-center">
            <Clock size={24} className="text-brand-red mx-auto mb-3" />
            <div className="font-display font-black text-2xl text-white">14 Gün</div>
            <div className="font-body text-white/40 text-xs mt-1">Cayma hakkı süresi</div>
          </div>
          <div className="bg-[#141414] border border-white/5 p-5 text-center">
            <RotateCcw size={24} className="text-brand-red mx-auto mb-3" />
            <div className="font-display font-black text-2xl text-white">Ücretsiz</div>
            <div className="font-body text-white/40 text-xs mt-1">İade kargo bedeli (ayıplı ürün)</div>
          </div>
          <div className="bg-[#141414] border border-white/5 p-5 text-center">
            <CheckCircle size={24} className="text-brand-red mx-auto mb-3" />
            <div className="font-display font-black text-2xl text-white">14 Gün</div>
            <div className="font-body text-white/40 text-xs mt-1">Para iadesi süresi</div>
          </div>
        </div>

        <div className="space-y-10">

          <Section title="Cayma Hakkı" num="01">
            <p>
              6502 sayılı Tüketicinin Korunması Hakkında Kanun gereğince, tüketici mesafeli sözleşmenin kurulduğu tarihten itibaren veya malın teslimine ilişkin sözleşmelerde, tüketicinin veya tüketici tarafından belirlenen üçüncü kişinin malı teslim aldığı günden itibaren <strong className="text-brand-red">14 (on dört) gün</strong> içerisinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.
            </p>
            <p className="mt-3">
              Cayma hakkı süresinin belirlenmesinde; tek sipariş konusu olup ayrı ayrı teslim edilen mallarda, son malın teslim alındığı gün esas alınır.
            </p>
          </Section>

          <Section title="Cayma Hakkının Kullanımı" num="02">
            <p>Cayma hakkını kullanmak isteyen ALICI, aşağıdaki yöntemlerden biri ile SATICI&apos;ya bildirimde bulunmalıdır:</p>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <div className="bg-[#141414] border border-white/5 p-4 flex items-start gap-3">
                <Phone size={16} className="text-brand-red shrink-0 mt-0.5" />
                <div>
                  <div className="font-display font-bold text-xs uppercase text-white mb-1">Telefon</div>
                  <div className="text-white/40">+90 352 231 69 15</div>
                </div>
              </div>
              <div className="bg-[#141414] border border-white/5 p-4 flex items-start gap-3">
                <Mail size={16} className="text-brand-red shrink-0 mt-0.5" />
                <div>
                  <div className="font-display font-bold text-xs uppercase text-white mb-1">E-posta</div>
                  <div className="text-white/40">info@akdagelektronik.com.tr</div>
                </div>
              </div>
            </div>
          </Section>

          <Section title="İade Şartları" num="03">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle size={14} className="text-green-400 shrink-0 mt-0.5" />
                <span>Ürün kullanılmamış ve orijinal ambalajında olmalıdır</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={14} className="text-green-400 shrink-0 mt-0.5" />
                <span>Tüm aksesuarları, garanti belgesi ve faturası ile birlikte iade edilmelidir</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={14} className="text-green-400 shrink-0 mt-0.5" />
                <span>Ürün, teslim alındığı şekliyle ve hasarsız olmalıdır</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={14} className="text-green-400 shrink-0 mt-0.5" />
                <span>Cayma bildirimi 14 gün içinde yapılmış olmalıdır</span>
              </div>
            </div>
          </Section>

          <Section title="İade Edilemeyecek Ürünler" num="04">
            <div className="bg-brand-red/5 border border-brand-red/20 p-5">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <XCircle size={14} className="text-brand-red shrink-0 mt-0.5" />
                  <span>Tüketici talebine göre özel olarak üretilmiş veya kişiye özel hale getirilmiş ürünler</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle size={14} className="text-brand-red shrink-0 mt-0.5" />
                  <span>Ambalajı açılmış, kullanılmış veya hasar görmüş ürünler</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle size={14} className="text-brand-red shrink-0 mt-0.5" />
                  <span>Koruyucu unsurları açılmış yazılım, dijital içerik ve programlar</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle size={14} className="text-brand-red shrink-0 mt-0.5" />
                  <span>Fiyatı finansal piyasadaki dalgalanmalara bağlı olarak değişen ürünler</span>
                </div>
              </div>
            </div>
          </Section>

          <Section title="İade Süreci" num="05">
            <div className="relative pl-6 border-l-2 border-brand-red/20 space-y-6">
              {[
                { step: '1', title: 'Bildirim', desc: 'Cayma iradenizi telefon veya e-posta ile tarafımıza bildirin.' },
                { step: '2', title: 'Onay', desc: 'İade talebiniz incelendikten sonra onay ve kargo bilgileri iletilir.' },
                { step: '3', title: 'Kargolama', desc: 'Ürünü orijinal ambalajında, eksiksiz olarak belirtilen adrese gönderin.' },
                { step: '4', title: 'Kontrol', desc: 'Ürün tarafımıza ulaştığında kontrol edilir.' },
                { step: '5', title: 'Para İadesi', desc: 'Onay sonrası 14 gün içinde ödeme yönteminize iade yapılır.' },
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="absolute -left-[31px] w-4 h-4 bg-brand-red border-2 border-[#0F0F0F] rounded-full" />
                  <div className="font-display font-bold text-sm uppercase text-white">{item.title}</div>
                  <p className="text-white/40 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Para İadesi" num="06">
            <p>Cayma hakkının kullanılması durumunda SATICI, cayma bildiriminin kendisine ulaştığı tarihten itibaren en geç <strong className="text-brand-red">14 (on dört) gün</strong> içerisinde almış olduğu toplam bedeli ALICI&apos;ya iade eder.</p>
            <ul className="list-disc list-inside space-y-1 mt-3">
              <li><strong className="text-white">Kredi kartı:</strong> İade tutarı bankanız tarafından 1-4 hafta içinde yansıtılır.</li>
              <li><strong className="text-white">Havale/EFT:</strong> İade tutarı belirtilen banka hesabına aktarılır.</li>
              <li><strong className="text-white">Kapıda ödeme:</strong> İade tutarı ALICI&apos;nın bildireceği banka hesabına havale edilir.</li>
            </ul>
          </Section>

          <Section title="Ayıplı Ürün" num="07">
            <p>Teslim alınan üründe herhangi bir ayıp/kusur bulunması halinde, ALICI ürünü teslim aldığı tarihten itibaren 30 gün içinde SATICI&apos;ya bildirimde bulunmalıdır.</p>
            <p className="mt-3">Ayıplı ürün iade kargo bedeli <strong className="text-brand-red">SATICI</strong> tarafından karşılanır. ALICI, ücretsiz onarım, ürün değişimi veya bedel iadesi haklarından birini kullanabilir.</p>
          </Section>

          <div className="border border-brand-red/20 bg-[#141414] p-8 text-center mt-12">
            <Package size={28} className="text-brand-red mx-auto mb-3" />
            <div className="font-display font-bold text-sm uppercase tracking-widest text-white mb-3">İade Talebi Oluşturmak İçin</div>
            <p className="font-body text-white/40 text-sm mb-4">Lütfen sipariş numaranız ile birlikte bizimle iletişime geçin.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="tel:+903522316915" className="btn-primary text-sm"><Phone size={14} />+90 352 231 69 15</a>
              <a href="mailto:info@akdagelektronik.com.tr" className="btn-outline text-sm"><Mail size={14} />info@akdagelektronik.com.tr</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
