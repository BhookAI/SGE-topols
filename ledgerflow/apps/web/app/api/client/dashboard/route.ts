import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { message: 'Código requerido' },
        { status: 400 }
      )
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('access_code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { message: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    await supabase
      .from('clients')
      .update({
        last_access: new Date().toISOString(),
        access_count: (client.access_count || 0) + 1
      })
      .eq('id', client.id)

    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', client.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const { data: documents } = await supabase
      .from('documents')
      .select('id, file_name, document_type, created_at')
      .eq('client_id', client.id)
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(10)

    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .eq('client_id', client.id)
      .eq('is_visible_to_client', true)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      client: {
        full_name: client.full_name,
        company_name: client.company_name
      },
      project: project || {
        title: 'Sin proyecto activo',
        progress: 0,
        status: 'planning',
        spent: 0
      },
      documents: documents || [],
      activities: activities || []
    })

  } catch (error) {
    console.error('Error en client/dashboard:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
