import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function getSessionAndTenant() {
  const cookieStore = cookies()
  const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore })
  const { data: { session } } = await supabaseAuth.auth.getSession()
  if (!session) return { session: null, tenantId: null, supabase: null }

  const supabase = createServiceSupabaseClient()
  const { data: user } = await supabase
    .from('users')
    .select('tenant_id, tenant:tenants(slug)')
    .eq('id', session.user.id)
    .single()

  const tenantId = user?.tenant_id ?? session.user.user_metadata?.tenant_id ?? null
  const tenantSlug = (user as any)?.tenant?.slug ?? null
  return { session, tenantId, tenantSlug, supabase }
}

export async function GET() {
  try {
    const { session, tenantId, supabase } = await getSessionAndTenant()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!tenantId) return NextResponse.json([])

    const { data: clients, error } = await supabase!
      .from('clients')
      .select('*, projects:projects(count)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const transformedClients = (clients ?? []).map((c: any) => ({
      ...c,
      project_count: c.projects?.[0]?.count || 0,
    }))

    return NextResponse.json(transformedClients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { session, tenantId, tenantSlug, supabase } = await getSessionAndTenant() as any
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!tenantId) return NextResponse.json({ error: 'No tenant found' }, { status: 403 })

    const body = await request.json()

    // Generate access code using DB function
    const { data: codeData } = await supabase!.rpc('generate_access_code', {
      p_tenant_id: tenantId,
    })

    const { data: client, error } = await supabase!
      .from('clients')
      .insert({
        tenant_id: tenantId,
        full_name: body.full_name,
        email: body.email || null,
        phone: body.phone || null,
        company_name: body.company_name || null,
        access_code: codeData,
      })
      .select()
      .single()

    if (error) throw error

    // Create activity log
    await supabase!.from('activities').insert({
      tenant_id: tenantId,
      client_id: client.id,
      user_id: session.user.id,
      type: 'client_added',
      title: 'Cliente agregado',
      description: `Se agregó el cliente "${client.full_name}"`,
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
