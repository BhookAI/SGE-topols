'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ResponsiveSidebar } from '@/components/layout/responsive-sidebar'
import { useAuthStore, useDashboardStore } from '@/lib/store'
import { useResponsive } from '@/lib/hooks/use-responsive'
import { supabaseClient } from '@/lib/supabase/client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, setUser, isLoading, setLoading } = useAuthStore()
  const { refreshDashboard } = useDashboardStore()
  const { isMobile } = useResponsive()
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  // Sincronizar con Supabase Auth al cargar
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)
      try {
        const supabase = supabaseClient

        // Obtener sesión actual
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          // Intentar obtener perfil del usuario desde la tabla users
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              role: profile.role,
              tenant_id: profile.tenant_id,
              avatar_url: profile.avatar_url,
            })
          } else {
            // Si no hay perfil en public.users, auto-provisionar tenant
            console.warn('Profile not found in public.users, auto-provisioning tenant...')
            try {
              const setupRes = await fetch('/api/auth/setup-tenant', { method: 'POST' })
              if (setupRes.ok) {
                // Reintentar obtener el perfil
                const { data: newProfile } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', session.user.id)
                  .single()

                if (newProfile) {
                  setUser({
                    id: newProfile.id,
                    email: newProfile.email,
                    full_name: newProfile.full_name,
                    role: newProfile.role,
                    tenant_id: newProfile.tenant_id,
                    avatar_url: newProfile.avatar_url,
                  })
                }
              }
            } catch (setupErr) {
              console.error('Auto-provision failed:', setupErr)
            }
            // Fallback final con datos del token de auth
            setUser(prev => prev ?? {
              id: session.user.id,
              email: session.user.email ?? '',
              full_name: session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? 'Admin',
              role: session.user.user_metadata?.role ?? 'admin',
              tenant_id: session.user.user_metadata?.tenant_id ?? '',
              avatar_url: session.user.user_metadata?.avatar_url ?? null,
            })
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
        setIsAuthChecked(true)
      }
    }

    checkAuth()

    // Suscribirse a cambios de auth
    const supabase = supabaseClient
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              role: profile.role,
              tenant_id: profile.tenant_id,
              avatar_url: profile.avatar_url,
            })
          } else {
            // Fallback a datos de sesión
            setUser({
              id: session.user.id,
              email: session.user.email ?? '',
              full_name: session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? 'Admin',
              role: session.user.user_metadata?.role ?? 'admin',
              tenant_id: session.user.user_metadata?.tenant_id ?? '',
              avatar_url: session.user.user_metadata?.avatar_url ?? null,
            })
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setLoading])

  // Redirigir si no hay usuario después de verificar auth
  useEffect(() => {
    if (isAuthChecked && !isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, isAuthChecked, router])

  // Cargar datos del dashboard cuando hay usuario
  useEffect(() => {
    if (user) {
      refreshDashboard()
    }
  }, [user, refreshDashboard])

  // Mostrar loading mientras se verifica la autenticación
  if (!isAuthChecked || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
        <motion.div
          className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  // No renderizar nada si no hay usuario (se redirigirá)
  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <ResponsiveSidebar />
      <main className={`flex-1 overflow-auto ${isMobile ? 'pt-2' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`${isMobile ? 'p-4' : 'p-6 lg:p-8'} max-w-7xl mx-auto`}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
