import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

/**
 * POST /api/auth/setup-tenant
 * Auto-provisions a tenant + user record for an authenticated admin
 * who doesn't yet have one in public.users.
 * Safe to call multiple times (idempotent).
 */
export async function POST() {
    try {
        const cookieStore = cookies()
        const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore })
        const { data: { session } } = await supabaseAuth.auth.getSession()

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createServiceSupabaseClient()
        const userId = session.user.id
        const userEmail = session.user.email ?? ''

        // Check if user already has a record
        const { data: existingUser } = await supabase
            .from('users')
            .select('id, tenant_id')
            .eq('id', userId)
            .single()

        if (existingUser?.tenant_id) {
            return NextResponse.json({
                message: 'Ya configurado',
                tenant_id: existingUser.tenant_id
            })
        }

        // Derive a slug from the email
        const emailPrefix = userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
        const slug = `${emailPrefix}-${Date.now().toString(36)}`
        const invitationCode = `${emailPrefix.toUpperCase().slice(0, 4)}-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`

        // Create tenant
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .insert({
                name: emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1),
                slug,
                invitation_code: invitationCode,
                plan: 'pro',
                is_active: true,
            })
            .select()
            .single()

        if (tenantError) {
            console.error('Error creating tenant:', tenantError)
            return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 })
        }

        // Upsert user record in public.users
        const { error: userError } = await supabase
            .from('users')
            .upsert({
                id: userId,
                tenant_id: tenant.id,
                email: userEmail,
                full_name: session.user.user_metadata?.full_name ?? emailPrefix,
                role: 'admin',
                is_active: true,
            })

        if (userError) {
            console.error('Error creating user record:', userError)
            return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 })
        }

        return NextResponse.json({
            message: 'Tenant y perfil creados correctamente',
            tenant_id: tenant.id,
            invitation_code: invitationCode,
        })
    } catch (error) {
        console.error('Error in setup-tenant:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
