import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'mistralai/mistral-small-3.1-24b-instruct'
const KIMI_API_KEY = process.env.KIMI_API_KEY

async function getContext(supabase: any, tenantId: string) {
    const [
        { data: clients },
        { data: projects },
        { data: transactions },
        { data: documents },
    ] = await Promise.all([
        supabase.from('clients').select('full_name, email, is_active, access_code').eq('tenant_id', tenantId).limit(20),
        supabase.from('projects').select('title, status, budget, progress, description').eq('tenant_id', tenantId).limit(20),
        supabase.from('transactions').select('description, amount, type, date, category').eq('tenant_id', tenantId).order('date', { ascending: false }).limit(30),
        supabase.from('documents').select('file_name, document_type, status, created_at').eq('tenant_id', tenantId).limit(20),
    ])

    const totalIncome = (transactions ?? []).filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0)
    const totalExpenses = (transactions ?? []).filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0)

    return `
=== CONTEXTO DEL NEGOCIO ===

CLIENTES (${clients?.length ?? 0} total):
${(clients ?? []).map((c: any) => `- ${c.full_name} (${c.email || 'sin email'}) — ${c.is_active ? 'activo' : 'inactivo'}, código: ${c.access_code}`).join('\n') || 'Sin clientes'}

PROYECTOS (${projects?.length ?? 0} total):
${(projects ?? []).map((p: any) => `- "${p.title}" — Estado: ${p.status}, Progreso: ${p.progress ?? 0}%, Presupuesto: €${p.budget || 0}`).join('\n') || 'Sin proyectos'}

FINANZAS (últimas 30 transacciones):
- Total ingresos: €${totalIncome.toLocaleString('es-ES')}
- Total gastos: €${totalExpenses.toLocaleString('es-ES')}
- Balance: €${(totalIncome - totalExpenses).toLocaleString('es-ES')}
${(transactions ?? []).map((t: any) => `- ${t.date}: ${t.type === 'income' ? '+' : '-'}€${t.amount} — ${t.description} (${t.category || 'General'})`).join('\n') || 'Sin transacciones'}

DOCUMENTOS (${documents?.length ?? 0} total):
${(documents ?? []).map((d: any) => `- ${d.file_name} — Tipo: ${d.document_type || 'desconocido'}, Estado: ${d.status}`).join('\n') || 'Sin documentos'}
`.trim()
}

async function callKimiAI(messages: any[], systemPrompt: string) {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${KIMI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'kimi-k2-coder',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages.map((m: any) => ({ role: m.role, content: m.content })),
            ],
            max_tokens: 4096,
            temperature: 0.7,
        }),
    })

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`Kimi API error: ${err}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content ?? 'No se recibió respuesta del agente.'
}

async function callOpenRouter(messages: any[], systemPrompt: string) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ledgerflow.app',
            'X-Title': 'LedgerFlow AI Agent',
        },
        body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages.map((m: any) => ({ role: m.role, content: m.content })),
            ],
            max_tokens: 1024,
            temperature: 0.7,
        }),
    })

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`OpenRouter error: ${err}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content ?? 'No se recibió respuesta del agente.'
}

export async function POST(request: Request) {
    try {
        // Verificar API keys disponibles
        const hasKimi = !!KIMI_API_KEY
        const hasOpenRouter = !!OPENROUTER_API_KEY
        
        if (!hasKimi && !hasOpenRouter) {
            return NextResponse.json(
                { error: 'El agente IA no está configurado. Añade KIMI_API_KEY u OPENROUTER_API_KEY en las variables de entorno de Vercel.' },
                { status: 503 }
            )
        }

        const cookieStore = await cookies()
        const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore })
        const { data: { session } } = await supabaseAuth.auth.getSession()
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const supabase = createServiceSupabaseClient()
        const { data: user } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', session.user.id)
            .single()
        const tenantId = user?.tenant_id ?? session.user.user_metadata?.tenant_id

        const body = await request.json()
        const { messages } = body

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'Mensajes requeridos' }, { status: 400 })
        }

        // Obtener contexto de negocio
        let businessContext = ''
        if (tenantId) {
            try {
                businessContext = await getContext(supabase, tenantId)
            } catch (e) {
                console.warn('Could not get business context:', e)
            }
        }

        const systemPrompt = `Eres Vex, el asistente IA de LedgerFlow PRO, una plataforma avanzada de gestión empresarial.
Ayudas al usuario con análisis financiero, gestión de clientes, proyectos, documentos y estudios geotécnicos.
Responde siempre en español, de forma clara, precisa y profesional.
Cuando el usuario pregunte sobre sus datos, usa el contexto proporcionado para dar respuestas específicas.
Si no tienes suficiente información, dilo claramente y sugiere al usuario qué datos necesita cargar en el sistema.

${businessContext ? `DATOS ACTUALES DEL NEGOCIO:\n${businessContext}` : 'No hay datos disponibles aún en el sistema. El usuario necesita cargar clientes, proyectos y transacciones.'}

Fecha actual: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`

        // Intentar con Kimi primero, luego OpenRouter
        let reply: string
        try {
            if (hasKimi) {
                reply = await callKimiAI(messages, systemPrompt)
            } else {
                reply = await callOpenRouter(messages, systemPrompt)
            }
        } catch (aiError: any) {
            console.error('AI Error:', aiError)
            return NextResponse.json(
                { error: `Error con el proveedor de IA: ${aiError.message}` },
                { status: 502 }
            )
        }

        return NextResponse.json({ reply })
    } catch (error: any) {
        console.error('Error in agent route:', error)
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 })
    }
}
