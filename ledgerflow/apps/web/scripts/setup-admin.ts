import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { join } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables! Check your .env.local file.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function setup() {
    console.log('🔄 Setting up Ledgflow Admin...')
    try {
        // 1. Create or verify the user in Supabase Auth
        const email = 'admin@demo.com'
        const password = 'password123'

        // Check if user already exists in auth
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) throw listError

        let user = users.find(u => u.email === email)

        if (user) {
            console.log(`✅ User ${email} already exists in Supabase Auth. Updating password to "password123".`)
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                user.id,
                { password: password, email_confirm: true }
            )
            if (updateError) throw updateError
        } else {
            console.log(`Creating user ${email} in Supabase Auth...`)
            const { data, error: createError } = await supabase.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true,
                user_metadata: { full_name: 'Admin Demo' }
            })
            if (createError) throw createError
            console.log(`✅ Created Auth user. ID: ${data.user.id}`)
            user = data.user
        }

        // 2. Link with public.users table mapping
        // We already have a demo user inserted via the schema.sql: "Juan Pérez" or "Admin Demo"
        // Let's first check if there is an existing tenant to assign to.
        console.log('Fetching tenant...')
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('*')
            .eq('slug', 'demo')
            .single()

        if (tenantError && tenantError.code !== 'PGRST116') throw tenantError

        if (!tenant) {
            console.warn('⚠️ No tenant found with slug "demo". You may need to run schema.sql in the Supabase SQL Editor.')
            return
        }

        // Now check if a public.users record exists.
        // If our script created a new Auth user id, we should ensure the public user has that same id, or update the existing one.
        // However, schema.sql inserts a user with a generated UUID, while Supabase Auth generated a different UUID.
        // Let's check public users
        const { data: currentPublicUser, error: publicDbError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle()

        if (publicDbError) throw publicDbError

        if (currentPublicUser) {
            if (currentPublicUser.id !== user.id) {
                console.log(`⚠️ Mismatch between public table ID (${currentPublicUser.id}) and Auth ID (${user.id}).`)
                console.log(`Updating public user ID to match Auth...`)

                // Delete old user and re-insert with the correct ID.
                await supabase.from('users').delete().eq('id', currentPublicUser.id)

                const { error: insertError } = await supabase.from('users').insert({
                    id: user.id, // Must match Auth ID
                    tenant_id: tenant.id,
                    email: email,
                    role: 'admin',
                    full_name: 'Admin Demo',
                    is_active: true
                })
                if (insertError) throw insertError
                console.log('✅ Public user synced with Auth.')
            } else {
                console.log('✅ Public user is already correctly linked with Auth.')
            }
        } else {
            console.log('User not found in public.users. Inserting...')
            const { error: insertError } = await supabase.from('users').insert({
                id: user.id,
                tenant_id: tenant.id,
                email: email,
                role: 'admin',
                full_name: 'Admin Demo',
                is_active: true
            })
            if (insertError) throw insertError
            console.log('✅ Inserted new Admin inside public.users')
        }

        console.log('\n🎉 Setup Complete! You can now login with:')
        console.log(`Email: ${email}`)
        console.log(`Password: ${password}`)

    } catch (error) {
        console.error('❌ Setup failed:', error)
    }
}

setup()
