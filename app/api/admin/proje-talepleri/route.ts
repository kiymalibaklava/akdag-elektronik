import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split('Bearer ')[1]
  if (!token) return null

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await anonClient.auth.getUser(token)
  if (!user) return null

  const adminClient = createAdminClient()
  const { data } = await adminClient.from('site_admins').select('user_id').eq('user_id', user.id).maybeSingle()
  return data ? user : null
}

// GET: Tüm proje taleplerini listele
export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req)
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('proje_talepleri')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data || [])
}

// PATCH: Durum güncelle
export async function PATCH(req: NextRequest) {
  const user = await verifyAdmin(req)
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { id, durum } = await req.json()
  if (!id || !durum) return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 })

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('proje_talepleri')
    .update({ durum })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
