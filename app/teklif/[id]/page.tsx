import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ProposalPageClient from './ProposalPageClient'

// Bu sayfa public (müşteri erişimli) olduğundan
// anon key'le RLS engeli yaşamamak için service_role kullanıyoruz.
// Güvenli: Bu kod sadece server-side'da çalışır, client'a key sızmaz.
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getProposal(id: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from('teklifler').select('id, teklif_no, musteri_adi, tarih, genel_toplam, ara_toplam, kdv, kur_usd, kur_eur, ozel_not, urunler').eq('id', id).single()
  return data
}

export default async function ProposalPage({ params }: { params: { id: string } }) {
  const p = await getProposal(params.id)
  if (!p) notFound()
  return <ProposalPageClient proposal={p} />
}
