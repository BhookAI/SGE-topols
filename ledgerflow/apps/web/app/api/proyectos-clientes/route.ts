import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServiceSupabaseClient()

    // Obtener proyectos
    const { data: proyectos, error: proyectosError } = await supabase
      .from('proyectos')
      .select('id, nombre_proyecto, cliente_id, estado')
      .order('created_at', { ascending: false })

    if (proyectosError) {
      console.error('Error obteniendo proyectos:', proyectosError)
      return NextResponse.json(
        { error: 'Error obteniendo proyectos' },
        { status: 500 }
      )
    }

    // Obtener clientes
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('id, nombre, correo, empresa')
      .order('nombre')

    if (clientesError) {
      console.error('Error obteniendo clientes:', clientesError)
      return NextResponse.json(
        { error: 'Error obteniendo clientes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      proyectos: proyectos || [],
      clientes: clientes || []
    })

  } catch (error) {
    console.error('Error en API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
