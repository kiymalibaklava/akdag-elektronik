'use client'

import { MapPin, Phone, Globe, Printer, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const TEKLIF_SARTLARI = [
  "Sipariş verebilmeniz için Firma kaşeniz, yetkilinizin ismi ve imzası KAŞE&İMZA yapılarak mail gönderilmelidir.",
  "Teklifimiz USD ve EURO bazında hazırlanmış olup teslimat tarihi için geçerli T.C. Merkez Bankası Efektif Satış kuru baz alınır.",
  "Fiyatlarımız 10 gün opsiyonludur.",
  "Sipariş verilmesi halinde, tarafınızdan onaylanan teklife göre iş yapılır. Farklı malzeme talep edilmesi durumunda ek fiyatlandırma yapılacaktır.",
  "Kablo, Kablo Kanalı ve kullanılacak konnektör fiyatları kurulum esnasında eklendiğinde ayrıca fiyata eklenecektir.",
  "Teklifin kabul olduğu anda ürünlerden bir veya birkaçının ithalatçı firmanın stoklarında olmaması halinde yurtdışı tedarik süreci nedeniyle tahmini süre 6-8 haftadır.",
  "Ürünler hazır olduğunda Kayseri içi teslimdir. Başka şehirlere teslimlerde kargo karşı ödemeli gönderilecektir.",
  "Ödeme: Siparişte %50'si, kalanı malzeme tesliminde Nakit olarak ödenecektir.",
]

interface Proposal {
  id: string; teklif_no: string; musteri_adi: string; tarih: string
  ozel_not?: string; urunler: any[]; ara_toplam: number; kdv: number
  genel_toplam: number; kur_usd: number; kur_eur: number
}

export default function ProposalPageClient({ proposal: p }: { proposal: Proposal }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ background: '#f0f0f0', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      {/* ÜST BAR — sadece ekranda */}
      <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'white', borderBottom: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="Akdağ Elektronik" style={{ height: 32, objectFit: 'contain' }} />
            <div style={{ borderLeft: '1px solid rgba(0,0,0,0.1)', paddingLeft: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: 2 }}>Fiyat Teklifi</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#c00000' }}>{p.teklif_no}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCopy} style={{ border: '1px solid rgba(0,0,0,0.15)', padding: '7px 16px', fontSize: 11, fontWeight: 700, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 4 }}>
              {copied ? <Check size={13} color="green" /> : <Copy size={13} />}
              {copied ? 'Kopyalandı' : 'Linki Kopyala'}
            </button>
            <button onClick={() => window.print()} style={{ background: 'black', color: 'white', padding: '7px 18px', fontSize: 11, fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
              <Printer size={13} /> Yazdır / PDF
            </button>
          </div>
        </div>
      </div>

      {/* TEKLIF KARTI — ekranda kart gibi, print'te düz sayfa */}
      <div id="print-area" style={{ maxWidth: 900, margin: '24px auto', background: 'white', borderRadius: 12, boxShadow: '0 4px 32px rgba(0,0,0,0.1)', overflow: 'hidden' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '28px 32px 22px', borderBottom: '2px solid black', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <img src="/logo.png" alt="Akdağ Elektronik" style={{ height: 56, objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: -0.5, lineHeight: 1 }}>AKDAĞ ELEKTRONİK</div>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 4, marginTop: 6, opacity: 0.35, textTransform: 'uppercase' }}>SES VE IŞIK SİSTEMLERİ</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 9, fontWeight: 600, opacity: 0.5, lineHeight: 1.9 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}><MapPin size={9} /> Cumhuriyet Mh. Sur Cd. No: 17/A Melikgazi / KAYSERİ</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}><Phone size={9} /> (352) 231 69 15 — (532) 393 43 70</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}><Globe size={9} /> akdagelektronik.com</div>
          </div>
        </div>

        {/* MÜŞTERİ BİLGİLERİ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '20px 32px', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', opacity: 0.3, letterSpacing: 3, marginBottom: 4 }}>SAYIN / KURUM</div>
            <div style={{ fontSize: 20, fontWeight: 900, textTransform: 'uppercase', borderLeft: '4px solid black', paddingLeft: 12, lineHeight: 1.2 }}>{p.musteri_adi}</div>
            {p.ozel_not && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(0,0,0,0.03)', borderLeft: '2px solid rgba(0,0,0,0.15)', fontStyle: 'italic', fontSize: 10, color: 'rgba(0,0,0,0.6)', lineHeight: 1.5 }}>
                &quot;{p.ozel_not}&quot;
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', fontSize: 10, fontWeight: 700 }}>
            <div style={{ opacity: 0.4, textTransform: 'uppercase', letterSpacing: 2 }}>Teklif No: <strong style={{ color: 'black' }}>{p.teklif_no}</strong></div>
            <div style={{ opacity: 0.4, textTransform: 'uppercase', letterSpacing: 2, marginTop: 3 }}>Tarih: <strong style={{ color: 'black' }}>{new Date(p.tarih).toLocaleDateString('tr-TR')}</strong></div>
          </div>
        </div>

        {/* ÜRÜN TABLOSU */}
        <div style={{ padding: '0 32px 20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, border: '1px solid rgba(0,0,0,0.15)' }}>
            <thead>
              <tr style={{ background: '#f8f8f8', color: 'black', fontWeight: 900, textTransform: 'uppercase', fontSize: 9, WebkitPrintColorAdjust: 'exact' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', width: 40, border: '1px solid rgba(0,0,0,0.1)' }}>Görsel</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', width: 56, border: '1px solid rgba(0,0,0,0.1)' }}>Miktar</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', width: 90, border: '1px solid rgba(0,0,0,0.1)' }}>Marka</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', border: '1px solid rgba(0,0,0,0.1)' }}>Ürün Açıklaması</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', width: 84, border: '1px solid rgba(0,0,0,0.1)' }}>Birim ($/€)</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', width: 84, border: '1px solid rgba(0,0,0,0.1)' }}>Birim (₺)</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', width: 96, border: '1px solid rgba(0,0,0,0.1)' }}>Toplam (₺)</th>
              </tr>
            </thead>
            <tbody>
              {p.urunler.map((item: any, idx: number) => {
                const kur = item.para_birimi === 'USD' ? p.kur_usd : item.para_birimi === 'EUR' ? p.kur_eur : 1
                const birimTl = item.fiyat_doviz * kur
                const toplamTl = birimTl * item.miktar
                return (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? 'white' : 'rgba(0,0,0,0.01)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                    <td style={{ padding: '10px 8px', verticalAlign: 'top', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <div style={{ width: 34, height: 34, background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {item.gorsel ? <img src={item.gorsel} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} alt="" /> : <span style={{ fontSize: 8, color: 'rgba(0,0,0,0.2)' }}>—</span>}
                      </div>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 900, verticalAlign: 'top', border: '1px solid rgba(0,0,0,0.05)' }}>{item.miktar} Adet</td>
                    <td style={{ padding: '10px 8px', verticalAlign: 'top', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <div style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: 8, lineHeight: 1.3 }}>{item.marka}</div>
                      {item.kod && <div style={{ fontSize: 7, opacity: 0.4, fontWeight: 700, letterSpacing: 1, marginTop: 2, lineHeight: 1.3 }}>{item.kod}</div>}
                    </td>
                    <td style={{ padding: '10px 8px', verticalAlign: 'top', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <div style={{ fontSize: 9, lineHeight: 1.45, fontWeight: 500 }}>{item.ad}</div>
                    </td>
                    <td style={{ padding: 8, textAlign: 'right', color: 'rgba(0,0,0,0.5)', verticalAlign: 'top' }}>
                      {item.fiyat_doviz.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}{item.para_birimi === 'USD' ? ' $' : item.para_birimi === 'EUR' ? ' €' : ' ₺'}
                    </td>
                    <td style={{ padding: 8, textAlign: 'right', verticalAlign: 'top' }}>{birimTl.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                    <td style={{ padding: 8, textAlign: 'right', fontWeight: 900, verticalAlign: 'top' }}>{toplamTl.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* TOPLAM + KUR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 32px 24px', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 180, padding: 14, background: 'rgba(0,0,0,0.02)', borderLeft: '4px solid black', fontSize: 10 }}>
            <div style={{ fontWeight: 700, textTransform: 'uppercase', opacity: 0.4, letterSpacing: 2, fontSize: 8, marginBottom: 8 }}>Kur (Teklif Tarihi)</div>
            <div style={{ fontWeight: 900, lineHeight: 1.9 }}>
              <div>1 USD = <span style={{ color: '#c00000' }}>{p.kur_usd} ₺</span></div>
              <div>1 EUR = <span style={{ color: '#c00000' }}>{p.kur_eur} ₺</span></div>
            </div>
            <div style={{ marginTop: 8, fontSize: 8, opacity: 0.4, lineHeight: 1.5 }}>* Fatura tarihindeki T.C.M.B. Efektif Satış Kuru geçerlidir.</div>
          </div>
          <div style={{ width: 280, fontSize: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
              <span style={{ opacity: 0.5, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }}>Ara Toplam (KDV Hariç)</span>
              <strong>{p.ara_toplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
              <span style={{ opacity: 0.5, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }}>%20 KDV</span>
              <strong>{p.kdv.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'black', color: 'white', padding: '12px 14px', fontWeight: 900, marginTop: 4 }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: 2, fontSize: 11 }}>GENEL TOPLAM</span>
              <span style={{ fontSize: 17 }}>{p.genel_toplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>
          </div>
        </div>

        {/* TEKLİF ŞARTLARI */}
        <div style={{ padding: '16px 32px', borderTop: '1px solid rgba(0,0,0,0.07)', background: 'rgba(0,0,0,0.01)' }}>
          <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 3, opacity: 0.3, marginBottom: 10 }}>Teklif Şartları ve Açıklamalar</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 32px' }}>
            {TEKLIF_SARTLARI.map((sart, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, fontSize: 8, color: 'rgba(0,0,0,0.55)', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 900, opacity: 0.3, flexShrink: 0 }}>{i + 1}.</span>
                <span>{sart}</span>
              </div>
            ))}
          </div>
        </div>

        {/* İMZA */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 32px 28px' }}>
          <div style={{ textAlign: 'center', width: 160 }}>
            <div style={{ border: '1px solid rgba(0,0,0,0.1)', height: 64, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontStyle: 'italic', opacity: 0.2 }}>Kaşe / İmza</div>
            <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>Akdağ Elektronik</div>
            <div style={{ fontSize: 8, opacity: 0.4, marginTop: 2, textTransform: 'uppercase' }}>Satış Departmanı</div>
          </div>
        </div>
      </div>

      {/* PRINT CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 1cm 1.2cm;
          }

          /* Gri arka planı ve üst barı gizle */
          .no-print {
            display: none !important;
          }

          /* Gri dış kapsayıcıyı sıfırla */
          body > div {
            background: white !important;
            min-height: unset !important;
            padding: 0 !important;
          }

          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Kart stilini sıfırla */
          #print-area {
            max-width: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
          }

          /* Tablo sayfa sonu kontrolü */
          table { page-break-inside: auto; width: 100% !important; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }

          /* Link URL gösterme */
          a::after { content: none !important; }
        }
      `}} />
    </div>
  )
}
