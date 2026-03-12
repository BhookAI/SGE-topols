import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { code, name, email, phone } = await request.json()

    if (!code || !name) {
      return NextResponse.json(
        { message: 'Código y nombre requeridos' },
        { status: 400 }
      )
    }

    const cleanCode = code.trim().toUpperCase()

    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('access_code', cleanCode)
      .single()

    if (existingClient) {
      await supabase
        .from('clients')
        .update({
          last_access: new Date().toISOString(),
          access_count: (existingClient.access_count || 0) + 1
        })
        .eq('id', existingClient.id)

      return NextResponse.json({
        success: true,
        client: existingClient
      })
    }

    const { data: tenant } = await supabase
      .from('tenants')
      .select('*')
      .eq('invitation_code', cleanCode)
      .single()

    if (!tenant) {
      return NextResponse.json(
        { message: 'Código inválido' },
        { status: 404 }
      )
    }

    // Generate unique access code for the new client
    const newAccessCode = `CLI-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    const { data: newClient, error: createError } = await supabase
      .from('clients')
      .insert({
        tenant_id: tenant.id,
        access_code: newAccessCode,
        full_name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        last_access: new Date().toISOString(),
        access_count: 1
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creando cliente:', createError)
      return NextResponse.json(
        { message: 'Error al crear cliente' },
        { status: 500 }
      )
    }

    await supabase.from('activities').insert({
      tenant_id: tenant.id,
      client_id: newClient.id,
      type: 'client_registered',
      title: 'Nuevo cliente registrado',
      description: `${name} se registró mediante código ${cleanCode}`,
      is_visible_to_client: false
    })

    return NextResponse.json({
      success: true,
      client: newClient
    })

  } catch (error) {
    console.error('Error en client-login:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
