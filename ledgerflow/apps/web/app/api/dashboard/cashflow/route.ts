import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabaseAuth.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceSupabaseClient()

    const { data: user } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', session.user.id)
      .single()

    const tenantId = user?.tenant_id ?? session.user.user_metadata?.tenant_id
    if (!tenantId) {
      // Return empty 6-month structure
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const result = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        result.push({ month: months[d.getMonth()], income: 0, expenses: 0, balance: 0 })
      }
      return NextResponse.json(result)
    }

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, type, date')
      .eq('tenant_id', tenantId)
      .gte('date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: true })

    if (error) throw error

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const monthlyData: Record<string, { income: number; expenses: number }> = {}

    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = months[d.getMonth()]
      monthlyData[key] = { income: 0, expenses: 0 }
    }

    transactions?.forEach((t: any) => {
      const d = new Date(t.date)
      const key = months[d.getMonth()]
      if (monthlyData[key]) {
        if (t.type === 'income') {
          monthlyData[key].income += t.amount || 0
        } else {
          monthlyData[key].expenses += t.amount || 0
        }
      }
    })

    const result = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      income: Math.round(data.income),
      expenses: Math.round(data.expenses),
      balance: Math.round(data.income - data.expenses),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching cashflow:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cashflow' },
      { status: 500 }
    )
  }
}
