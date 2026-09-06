import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
  if (!token) return null

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user }, error } = await anonClient.auth.getUser(token)
  if (error || !user) return null

  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('site_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  return data ? user : null
}

export async function isAuthorizedAdminOrSecret(req: Request) {
  const secretHeader = req.headers.get('x-revalidate-secret')
  const secretEnv = process.env.REVALIDATION_SECRET
  if (secretEnv && secretHeader && secretHeader === secretEnv) {
    return true
  }

  const adminUser = await verifyAdmin(req)
  return !!adminUser
}
