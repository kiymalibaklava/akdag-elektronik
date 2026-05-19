import Link from 'next/link'
import { ArrowLeft, Phone, Mail, Shield, Eye, Lock, Database, UserCheck, Trash2 } from 'lucide-react'

export const metadata = {
  title: 'KVKK ve Gizlilik Politikası | Akdağ Elektronik',
  description: 'Akdağ Elektronik kişisel verilerin korunması ve gizlilik politikası — KVKK aydınlatma metni.',
}

function Section({ title, num, icon: Icon, children }: { title: string; num: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute -left-2 top-0 font-display font-black text-[60px] leading-none text-white/[0.025] select-none hidden md:block">{num}</div>
      <h2 className="font-display font-bold text-lg uppercase tracking-wide text-white mb-4 flex items-center gap-3">
        <Icon size={16} className="text-brand-red" />
        {title}
      </h2>
      <div className="font-body text-white/50 text-sm leading-relaxed pl-0 md:pl-2">{children}</div>
    </div>
  )
}

export default function GizlilikPolitikasi() {
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
            KVKK VE GİZLİLİK<br /><span className="text-brand-red">POLİTİKASI</span>
          </h1>
          <p className="font-body text-white/30 text-sm mt-4">Son güncelleme: Mayıs 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-12">
        {/* Başlık Kartı */}
        <div className="bg-[#141414] border border-brand-red/20 p-6 mb-12">
          <div className="flex items-start gap-4">
            <Shield size={28} className="text-brand-red shrink-0 mt-1" />
            <div>
              <div className="font-display font-bold text-sm uppercase text-white mb-2">6698 Sayılı KVKK Aydınlatma Metni</div>
              <p className="font-body text-white/40 text-sm leading-relaxed">
                Akdağ Elektronik olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu aydınlatma metni, kişisel verilerinizin nasıl toplandığı, işlendiği ve korunduğu hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-10">

          <Section title="Veri Sorumlusu" num="01" icon={UserCheck}>
            <div className="bg-[#141414] border border-white/5 p-5">
              <ul className="space-y-2">
                <li><strong className="text-white">Unvan:</strong> Akdağ Elektronik</li>
                <li><strong className="text-white">Adres:</strong> Cumhuriyet Mah. Sur Cad. No:17/A, Melikgazi / Kayseri</li>
                <li><strong className="text-white">Telefon:</strong> +90 352 231 69 15</li>
                <li><strong className="text-white">E-posta:</strong> info@akdagelektronik.com</li>
              </ul>
            </div>
          </Section>

          <Section title="Toplanan Kişisel Veriler" num="02" icon={Database}>
            <p>Sitemiz üzerinden aşağıdaki kişisel veriler toplanabilmektedir:</p>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              {[
                { cat: 'Kimlik Bilgileri', items: 'Ad, soyad' },
                { cat: 'İletişim Bilgileri', items: 'E-posta, telefon, adres' },
                { cat: 'Müşteri İşlem Bilgileri', items: 'Sipariş bilgileri, ödeme kayıtları' },
                { cat: 'Dijital İz Bilgileri', items: 'IP adresi, çerez verileri, tarayıcı bilgileri' },
              ].map((item) => (
                <div key={item.cat} className="bg-[#141414] border border-white/5 p-4">
                  <div className="font-display font-bold text-xs uppercase text-brand-red mb-1">{item.cat}</div>
                  <div className="text-white/40">{item.items}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Verilerin İşlenme Amaçları" num="03" icon={Eye}>
            <ul className="space-y-2">
              {[
                'Sipariş süreçlerinin yürütülmesi ve teslimat işlemlerinin gerçekleştirilmesi',
                'Müşteri ilişkileri yönetimi ve iletişim faaliyetlerinin sürdürülmesi',
                'Fatura düzenleme ve muhasebe kayıtlarının tutulması',
                'Yasal yükümlülüklerin yerine getirilmesi',
                'İletişim formu aracılığıyla gelen talep ve şikayetlerin cevaplanması',
                'Bayi başvuru süreçlerinin yönetimi',
                'Web sitesi performansının analiz edilmesi ve iyileştirilmesi',
                'Bilgi güvenliği süreçlerinin yürütülmesi',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-brand-red rounded-full shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Verilerin Hukuki Sebepleri" num="04" icon={Shield}>
            <p>Kişisel verileriniz, KVKK&apos;nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:</p>
            <ul className="list-disc list-inside space-y-1 mt-3">
              <li>Kanunlarda açıkça öngörülmesi</li>
              <li>Sözleşmenin kurulması veya ifası için gerekli olması</li>
              <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi</li>
              <li>İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri</li>
              <li>Açık rızanızın bulunması (pazarlama faaliyetleri için)</li>
            </ul>
          </Section>

          <Section title="Verilerin Aktarılması" num="05" icon={Lock}>
            <p>Kişisel verileriniz, aşağıdaki taraflarla paylaşılabilir:</p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand-red rounded-full shrink-0 mt-1.5" />
                <span><strong className="text-white">Kargo şirketleri:</strong> Sipariş teslimatı amacıyla</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand-red rounded-full shrink-0 mt-1.5" />
                <span><strong className="text-white">Ödeme kuruluşları:</strong> Ödeme işlemlerinin güvenli şekilde gerçekleştirilmesi için (PayTR)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand-red rounded-full shrink-0 mt-1.5" />
                <span><strong className="text-white">Yasal otoriteler:</strong> Mevzuat gereği talep edilmesi halinde yetkili kamu kurum ve kuruluşlarına</span>
              </li>
            </ul>
            <p className="mt-3">Kişisel verileriniz, yukarıda belirtilen amaçlar ve hukuki sebepler dışında üçüncü kişilerle paylaşılmamaktadır.</p>
          </Section>

          <Section title="Veri Saklama Süresi" num="06" icon={Database}>
            <p>Kişisel verileriniz, işlenme amaçlarının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen zamanaşımı süreleri boyunca saklanmaktadır. Yasal saklama süresi sona erdikten sonra verileriniz silinir, yok edilir veya anonim hale getirilir.</p>
          </Section>

          <Section title="Çerez Politikası" num="07" icon={Eye}>
            <p>Web sitemiz, hizmet kalitesini artırmak ve kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanmaktadır.</p>
            <div className="mt-4 space-y-3">
              {[
                { type: 'Zorunlu Çerezler', desc: 'Sitenin temel işlevlerinin çalışması için gerekli çerezlerdir. Devre dışı bırakılamaz.' },
                { type: 'Analitik Çerezler', desc: 'Ziyaretçi istatistikleri ve site performansı analizi için kullanılır.' },
                { type: 'İşlevsel Çerezler', desc: 'Kullanıcı tercihlerini (dil, sepet, favoriler vb.) hatırlamak için kullanılır.' },
              ].map((cookie) => (
                <div key={cookie.type} className="bg-[#141414] border border-white/5 p-4">
                  <div className="font-display font-bold text-xs uppercase text-white mb-1">{cookie.type}</div>
                  <p className="text-white/40">{cookie.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="KVKK Kapsamında Haklarınız" num="08" icon={UserCheck}>
            <p>KVKK&apos;nın 11. maddesi gereğince aşağıdaki haklara sahipsiniz:</p>
            <div className="grid md:grid-cols-2 gap-2 mt-4">
              {[
                'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
                'İşlenmiş ise buna ilişkin bilgi talep etme',
                'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme',
                'Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme',
                'Eksik veya yanlış işlenmiş ise düzeltilmesini isteme',
                "KVKK'nın 7. maddesi kapsamında silinmesini/yok edilmesini isteme",
                'Düzeltme ve silme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme',
                'Münhasıran otomatik sistemler aracılığıyla analiz sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme',
                'Kanuna aykırı işleme sebebiyle zararın giderilmesini talep etme',
              ].map((right) => (
                <div key={right} className="flex items-start gap-2 bg-[#141414] border border-white/5 p-3">
                  <Trash2 size={12} className="text-brand-red shrink-0 mt-0.5" />
                  <span className="text-xs">{right}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Başvuru Yöntemi" num="09" icon={Mail}>
            <p>KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki yöntemlerle tarafımıza başvurabilirsiniz:</p>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <div className="bg-[#141414] border border-white/5 p-4 flex items-start gap-3">
                <Mail size={16} className="text-brand-red shrink-0 mt-0.5" />
                <div>
                  <div className="font-display font-bold text-xs uppercase text-white mb-1">E-posta</div>
                  <div className="text-white/40">info@akdagelektronik.com</div>
                </div>
              </div>
              <div className="bg-[#141414] border border-white/5 p-4 flex items-start gap-3">
                <Phone size={16} className="text-brand-red shrink-0 mt-0.5" />
                <div>
                  <div className="font-display font-bold text-xs uppercase text-white mb-1">Telefon</div>
                  <div className="text-white/40">+90 352 231 69 15</div>
                </div>
              </div>
            </div>
            <p className="mt-4">Başvurunuz, talebin niteliğine göre en kısa sürede ve en geç 30 (otuz) gün içinde ücretsiz olarak sonuçlandırılacaktır.</p>
          </Section>

          <div className="border border-brand-red/20 bg-[#141414] p-8 text-center mt-12">
            <Shield size={28} className="text-brand-red mx-auto mb-3" />
            <div className="font-display font-bold text-sm uppercase tracking-widest text-white mb-3">Verileriniz Güvende</div>
            <p className="font-body text-white/40 text-sm mb-4">KVKK kapsamında tüm haklarınız saklıdır.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="mailto:info@akdagelektronik.com" className="btn-primary text-sm"><Mail size={14} />KVKK Başvurusu</a>
              <Link href="/iletisim" className="btn-outline text-sm">İletişim Formu</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
