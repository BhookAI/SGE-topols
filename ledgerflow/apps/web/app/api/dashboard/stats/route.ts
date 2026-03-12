import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    // Use anon client just for session validation
    const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabaseAuth.auth.getSession()

    if (!session?.user) {
      return NextResponse.json(
        { message: 'No autenticado' },
        { status: 401 }
      )
    }

    // Use service client to bypass RLS for data queries
    const supabase = createServiceSupabaseClient()

    // Intentar obtener el perfil del usuario para saber su tenant
    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', session.user.id)
      .single()

    // Fallback: usar tenant_id del user_metadata si no está en public.users
    const tenantId = userProfile?.tenant_id ?? session.user.user_metadata?.tenant_id

    if (!tenantId) {
      // Si no hay tenant, devolver datos vacíos en lugar de error
      return NextResponse.json({
        total_clients: 0,
        total_projects: 0,
        active_projects: 0,
        total_documents: 0,
        pending_documents: 0,
        total_income: 0,
        total_expenses: 0,
        balance: 0
      })
    }

    const [
      { count: totalClients },
      { count: totalProjects },
      { count: activeProjects },
      { count: totalDocuments },
      { count: pendingDocuments },
      { data: transactions }
    ] = await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'active'),
      supabase.from('documents').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('documents').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'processing'),
      supabase
        .from('transactions')
        .select('type, amount, currency')
        .eq('tenant_id', tenantId)
        .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    ])

    const totalIncome = transactions
      ?.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0) || 0

    const totalExpenses = transactions
      ?.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0) || 0

    return NextResponse.json({
      total_clients: totalClients || 0,
      total_projects: totalProjects || 0,
      active_projects: activeProjects || 0,
      total_documents: totalDocuments || 0,
      pending_documents: pendingDocuments || 0,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      balance: totalIncome - totalExpenses
    })

  } catch (error) {
    console.error('Error en dashboard/stats:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
