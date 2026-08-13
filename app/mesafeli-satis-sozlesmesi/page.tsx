import Link from 'next/link'
import { ArrowLeft, FileText, Phone, Mail, MapPin } from 'lucide-react'

export const metadata = {
  title: 'Mesafeli Satış Sözleşmesi | Akdağ Elektronik',
  description: 'Akdağ Elektronik mesafeli satış sözleşmesi — alıcı ve satıcı hakları, ürün teslimat koşulları.',
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

export default function MesafeliSatisSozlesmesi() {
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
            MESAFELİ SATIŞ<br /><span className="text-brand-red">SÖZLEŞMESİ</span>
          </h1>
          <p className="font-body text-white/30 text-sm mt-4">Son güncelleme: Mayıs 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-12">
        <div className="space-y-10">

          <Section title="Madde 1 — Taraflar" num="01">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#141414] border border-white/5 p-5">
                <div className="font-display font-bold text-sm uppercase text-brand-red mb-3">SATICI</div>
                <ul className="space-y-2 text-sm font-body text-white/50">
                  <li className="flex gap-2"><FileText size={13} className="text-brand-red shrink-0 mt-0.5" />Unvan: Akdağ Elektronik</li>
                  <li className="flex gap-2"><MapPin size={13} className="text-brand-red shrink-0 mt-0.5" />Adres: Cumhuriyet Mah. Sur Cad. No:17/A, Melikgazi / Kayseri</li>
                  <li className="flex gap-2"><Phone size={13} className="text-brand-red shrink-0 mt-0.5" />Telefon: +90 352 231 69 15</li>
                  <li className="flex gap-2"><Mail size={13} className="text-brand-red shrink-0 mt-0.5" />E-posta: info@akdagelektronik.com.tr</li>
                </ul>
              </div>
              <div className="bg-[#141414] border border-white/5 p-5">
                <div className="font-display font-bold text-sm uppercase text-brand-red mb-3">ALICI</div>
                <p className="text-sm font-body text-white/50 leading-relaxed">
                  Sipariş esnasında beyan edilen ad-soyad, adres, telefon ve e-posta bilgileri ile tanımlanan gerçek veya tüzel kişidir.
                </p>
              </div>
            </div>
          </Section>

          <Section title="Madde 2 — Tanımlar" num="02">
            <p>İşbu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümlerine uygun olarak düzenlenmiştir.</p>
            <ul className="list-disc list-inside space-y-1 mt-3">
              <li><strong className="text-white">Hizmet:</strong> Bir ücret karşılığında yapılan her türlü tüketici işlemi.</li>
              <li><strong className="text-white">Satıcı:</strong> Ticari amaçlarla tüketiciye mal sunan gerçek veya tüzel kişi.</li>
              <li><strong className="text-white">Alıcı:</strong> Ticari veya mesleki olmayan amaçlarla hareket eden gerçek veya tüzel kişi.</li>
              <li><strong className="text-white">Site:</strong> akdagelektronik.com alan adlı web sitesi.</li>
            </ul>
          </Section>

          <Section title="Madde 3 — Sözleşmenin Konusu" num="03">
            <p>İşbu sözleşmenin konusu; ALICI&apos;nın SATICI&apos;ya ait akdagelektronik.com internet sitesinden elektronik ortamda sipariş verdiği ürün/ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.</p>
          </Section>

          <Section title="Madde 4 — Ürün Bilgileri" num="04">
            <p>Malın türü ve miktarı, rengi, tüm vergiler dahil satış bedeli, ödeme şekli sipariş sayfasında ve sipariş onay e-postasında yer almaktadır.</p>
          </Section>

          <Section title="Madde 5 — Genel Hükümler" num="05">
            <ol className="list-decimal list-inside space-y-2">
              <li>ALICI, sipariş konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimat ve iade şartlarına ilişkin ön bilgileri okuyup bilgi sahibi olduğunu kabul eder.</li>
              <li>Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile ALICI&apos;nın yerleşim yerine teslim edilir.</li>
              <li>SATICI, ürünün sağlam, eksiksiz, siparişte belirtilen niteliklere uygun ve varsa garanti belgeleri ile teslim edilmesinden sorumludur.</li>
            </ol>
          </Section>

          <Section title="Madde 6 — Teslimat Koşulları" num="06">
            <ol className="list-decimal list-inside space-y-2">
              <li>Teslimat, stokun müsait olması ve ödemenin gerçekleşmesinden sonra en kısa sürede yapılır.</li>
              <li>Teslimat, ALICI&apos;nın sipariş formunda belirttiği adrese yapılacaktır.</li>
              <li>Kargo ücreti aksine bir bilgilendirme yapılmadıkça ALICI&apos;ya aittir.</li>
              <li>SATICI, ürünün teslim anına kadar tüm riskleri üzerine alır.</li>
            </ol>
          </Section>

          <Section title="Madde 7 — Cayma Hakkı" num="07">
            <p>ALICI, ürünün teslim tarihinden itibaren <strong className="text-brand-red">14 (on dört) gün</strong> içerisinde cayma hakkını kullanabilir.</p>
            <div className="bg-brand-red/5 border border-brand-red/20 p-4 mt-4">
              <div className="font-display font-bold text-xs uppercase tracking-widest text-brand-red mb-2">Cayma hakkı kullanılamayacak ürünler</div>
              <ul className="space-y-1 text-sm font-body text-white/50">
                <li>• Fiyatı finansal piyasadaki dalgalanmalara bağlı olan ürünler</li>
                <li>• Tüketici talebine göre özel olarak üretilen ürünler</li>
                <li>• Koruyucu unsurları açılan, iade edilmesi hijyen açısından uygun olmayan ürünler</li>
                <li>• Açılmış dijital içerik, yazılım ve programlar</li>
              </ul>
            </div>
          </Section>

          <Section title="Madde 8 — İade Koşulları" num="08">
            <p>Cayma hakkının kullanılması halinde iade edilecek ürünün kullanılmamış, orijinal ambalajında ve tüm aksesuarları ile birlikte eksiksiz olarak teslim edilmesi gerekmektedir.</p>
            <p className="mt-3">Detaylı bilgi için <Link href="/iptal-ve-iade" className="text-brand-red hover:underline">İptal ve İade Koşulları</Link> sayfasını inceleyiniz.</p>
          </Section>

          <Section title="Madde 9 — Ödeme ve Güvenlik" num="09">
            <p>Kredi kartı bilgileri SATICI tarafından saklanmamakta olup, ödeme altyapısı PayTR güvenli ödeme sistemi üzerinden gerçekleştirilmektedir.</p>
          </Section>

          <Section title="Madde 10 — Yetkili Mahkeme" num="10">
            <p>İşbu sözleşmeden doğan uyuşmazlıklarda Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir. ALICI, siparişi onaylayarak işbu sözleşmenin tüm koşullarını kabul etmiş sayılır.</p>
          </Section>

          <div className="border border-brand-red/20 bg-[#141414] p-8 text-center mt-12">
            <div className="font-display font-bold text-sm uppercase tracking-widest text-white mb-3">Sorularınız İçin</div>
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
