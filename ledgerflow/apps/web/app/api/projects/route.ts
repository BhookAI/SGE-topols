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
    .select('tenant_id')
    .eq('id', session.user.id)
    .single()

  const tenantId = user?.tenant_id ?? session.user.user_metadata?.tenant_id ?? null
  return { session, tenantId, supabase }
}

export async function GET() {
  try {
    const { session, tenantId, supabase } = await getSessionAndTenant()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!tenantId) return NextResponse.json([])

    const { data: projects, error } = await supabase!
      .from('projects')
      .select('*, client:clients(full_name)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(projects ?? [])
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { session, tenantId, supabase } = await getSessionAndTenant()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!tenantId) return NextResponse.json({ error: 'No tenant found' }, { status: 403 })

    const body = await request.json()

    const { data: project, error } = await supabase!
      .from('projects')
      .insert({
        tenant_id: tenantId,
        title: body.title,
        description: body.description,
        client_id: body.client_id || null,
        budget: body.budget || null,
        priority: body.priority || 'medium',
        status: 'planning',
        created_by: session.user.id,
      })
      .select()
      .single()

    if (error) throw error

    // Create activity log
    await supabase!.from('activities').insert({
      tenant_id: tenantId,
      project_id: project.id,
      user_id: session.user.id,
      type: 'project_created',
      title: 'Proyecto creado',
      description: `Se creó el proyecto "${project.title}"`,
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
