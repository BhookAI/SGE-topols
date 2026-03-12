import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { message: 'Código requerido' },
        { status: 400 }
      )
    }

    const cleanCode = code.trim().toUpperCase()

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('access_code', cleanCode)
      .eq('is_active', true)
      .single()

    if (clientError && clientError.code !== 'PGRST116') {
      console.error('Error buscando cliente:', clientError)
      return NextResponse.json(
        { message: 'Error interno' },
        { status: 500 }
      )
    }

    if (client) {
      return NextResponse.json({
        valid: true,
        tenantId: client.tenant_id,
        clientId: client.id,
        clientExists: true,
        client: {
          full_name: client.full_name,
          email: client.email,
          phone: client.phone
        }
      })
    }

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('invitation_code', cleanCode)
      .eq('is_active', true)
      .single()

    if (tenantError && tenantError.code !== 'PGRST116') {
      console.error('Error buscando tenant:', tenantError)
      return NextResponse.json(
        { message: 'Error interno' },
        { status: 500 }
      )
    }

    if (tenant) {
      return NextResponse.json({
        valid: true,
        tenantId: tenant.id,
        clientExists: false
      })
    }

    return NextResponse.json(
      { message: 'Código inválido o expirado' },
      { status: 404 }
    )

  } catch (error) {
    console.error('Error en validate-code:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
