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

export async function GET(request: Request) {
    try {
        const { session, tenantId, supabase } = await getSessionAndTenant()
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        if (!tenantId) return NextResponse.json([])

        const url = new URL(request.url)
        const type = url.searchParams.get('type') // 'income' | 'expense' | null (all)
        const limit = parseInt(url.searchParams.get('limit') ?? '50')

        let query = supabase!
            .from('transactions')
            .select(`
        *,
        project:projects(title),
        client:clients(full_name)
      `)
            .eq('tenant_id', tenantId)
            .order('date', { ascending: false })
            .limit(limit)

        if (type) query = query.eq('type', type)

        const { data, error } = await query
        if (error) throw error

        return NextResponse.json(data ?? [])
    } catch (error) {
        console.error('Error fetching transactions:', error)
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { session, tenantId, supabase } = await getSessionAndTenant()
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        if (!tenantId) return NextResponse.json({ error: 'No tenant found' }, { status: 403 })

        const body = await request.json()

        if (!body.description || !body.amount || !body.type || !body.date) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
        }

        const { data: transaction, error } = await supabase!
            .from('transactions')
            .insert({
                tenant_id: tenantId,
                description: body.description,
                amount: parseFloat(body.amount),
                amount_eur: parseFloat(body.amount),
                currency: 'EUR',
                type: body.type,
                date: body.date,
                category: body.category || 'General',
                project_id: body.project_id || null,
                client_id: body.client_id || null,
                source: 'manual',
                created_by: session.user.id,
            })
            .select()
            .single()

        if (error) throw error

        // Registrar actividad
        await supabase!.from('activities').insert({
            tenant_id: tenantId,
            user_id: session.user.id,
            type: 'transaction_created',
            title: body.type === 'income' ? 'Ingreso registrado' : 'Gasto registrado',
            description: `${body.description}: €${parseFloat(body.amount).toLocaleString('es-ES')}`,
        })

        return NextResponse.json(transaction)
    } catch (error) {
        console.error('Error creating transaction:', error)
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
    }
}
