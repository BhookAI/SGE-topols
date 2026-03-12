'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles, Shield, Zap, BarChart3, Mail, Loader2, Lock, Eye, EyeOff, KeyRound, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/store'
import { supabaseClient } from '@/lib/supabase/client'

/* ───────── 3D floating planet component — MONOCHROMATIC ───────── */
function FloatingPlanet({
  size, color1, color2, top, left, delay, duration, blur, opacity, ring
}: {
  size: number; color1: string; color2: string; top: string; left: string;
  delay: number; duration: number; blur?: number; opacity?: number; ring?: boolean
}) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top, left,
        width: size, height: size,
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
        filter: blur ? `blur(${blur}px)` : undefined,
        opacity: opacity ?? 1,
        zIndex: 0,
      }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color1}40, ${color2}20, transparent 70%)`,
          filter: 'blur(20px)',
          transform: 'scale(1.5)',
        }}
      />
      {/* Planet body */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 25%, ${color1}, ${color2} 60%, rgba(0,0,0,0.9))`,
          boxShadow: `inset -8px -8px 20px rgba(0,0,0,0.7), inset 4px 4px 15px ${color1}20, 0 0 ${size / 2}px ${color1}08`,
        }}
      />
      {/* Surface texture */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 40% 20%, transparent 40%, rgba(0,0,0,0.2) 60%),
            radial-gradient(ellipse at 60% 70%, ${color2}15 0%, transparent 50%)
          `,
        }}
      />
      {/* Specular highlight — white */}
      <div
        className="absolute rounded-full"
        style={{
          top: '12%', left: '20%',
          width: '35%', height: '25%',
          background: `radial-gradient(ellipse, rgba(255,255,255,0.18), transparent 70%)`,
          transform: 'rotate(-30deg)',
        }}
      />
      {/* Orbital ring — white/10 */}
      {ring && (
        <div
          className="absolute"
          style={{
            top: '35%', left: '-15%',
            width: '130%', height: '30%',
            border: `2px solid rgba(255,255,255,0.10)`,
            borderRadius: '50%',
            transform: 'rotateX(75deg)',
          }}
        />
      )}
    </div>
  )
}

/* ───────── Mini orbiting dot — MONOCHROMATIC ───────── */
function OrbitingDot({ radius, speed, color, size: dotSize, offsetAngle }: {
  radius: number; speed: number; color: string; size: number; offsetAngle: number
}) {
  return (
    <div
      className="absolute"
      style={{
        width: radius * 2, height: radius * 2,
        top: '50%', left: '50%',
        marginTop: -radius, marginLeft: -radius,
        animation: `spin-slow ${speed}s linear infinite`,
        animationDelay: `${offsetAngle / 360 * speed}s`,
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          width: dotSize, height: dotSize,
          top: 0, left: '50%',
          marginLeft: -dotSize / 2,
          background: color,
          boxShadow: `0 0 ${dotSize * 2}px ${color}`,
        }}
      />
    </div>
  )
}

/* ───────── Star field ───────── */
function StarField() {
  const [stars, setStars] = useState<Array<{ x: number; y: number; s: number; d: number }>>([])

  useEffect(() => {
    const arr = Array.from({ length: 60 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: Math.random() * 2 + 0.5,
      d: Math.random() * 4 + 2,
    }))
    setStars(arr)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.s,
            height: star.s,
            opacity: 0.3 + Math.random() * 0.4,
            animation: `pulse-glow ${star.d}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE 
   ═══════════════════════════════════════════════════ */

export default function LandingPage() {
  const router = useRouter()
  const { setUser, setLoading } = useAuthStore()

  // Admin login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isAdminLoading, setIsAdminLoading] = useState(false)

  // Client login
  const [clientCode, setClientCode] = useState('')
  const [isClientLoading, setIsClientLoading] = useState(false)

  // Active panel
  const [activePanel, setActivePanel] = useState<'admin' | 'client'>('admin')

  async function handleAdminLogin() {
    if (!email || !password) {
      toast.error('Ingresa email y contraseña')
      return
    }

    setIsAdminLoading(true)
    try {
      const supabase = supabaseClient

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message === 'Invalid login credentials'
          ? 'Credenciales incorrectas'
          : error.message)
        return
      }

      if (data.user) {
        // Get user's profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
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
        }

        toast.success('¡Bienvenido!')
        router.push('/dashboard')
      }
    } catch (err) {
      toast.error('Error al iniciar sesión')
      console.error(err)
    } finally {
      setIsAdminLoading(false)
    }
  }

  async function handleClientAccess() {
    if (!clientCode.trim()) {
      toast.error('Ingresa un código de acceso')
      return
    }

    setIsClientLoading(true)
    try {
      const res = await fetch('/api/auth/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clientCode.toUpperCase() }),
      })

      const data = await res.json()

      if (res.ok && data.valid) {
        document.cookie = `client_code=${clientCode.toUpperCase()}; path=/; max-age=2592000`
        if (data.clientExists) {
          toast.success(`¡Bienvenido, ${data.client?.full_name}!`)
          router.push(`/portal/${clientCode.toUpperCase()}`)
        } else {
          router.push(`/access?code=${clientCode.toUpperCase()}`)
        }
      } else {
        toast.error(data.message || 'Código inválido')
      }
    } catch (error) {
      toast.error('Error al validar el código')
    } finally {
      setIsClientLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Background layers */}
      <StarField />

      {/* Cosmic fog — monocromático */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.03) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.02) 0%, transparent 50%),
          radial-gradient(ellipse at 60% 80%, rgba(255,255,255,0.025) 0%, transparent 50%)
        `
      }} />

      {/* 3D Planets — MONOCHROMATIC grays */}
      <FloatingPlanet size={180} color1="#3A3A3A" color2="#1A1A1A" top="8%" left="5%" delay={0} duration={8} ring />
      <FloatingPlanet size={120} color1="#2E2E2E" color2="#0F0F0F" top="60%" left="85%" delay={1.5} duration={10} />
      <FloatingPlanet size={70} color1="#4A4A4A" color2="#1E1E1E" top="25%" left="88%" delay={0.8} duration={7} />
      <FloatingPlanet size={50} color1="#333333" color2="#111111" top="75%" left="8%" delay={2} duration={9} />
      <FloatingPlanet size={35} color1="#505050" color2="#222222" top="15%" left="55%" delay={1} duration={6} opacity={0.7} />
      <FloatingPlanet size={200} color1="#2A2A2A" color2="#0A0A0A" top="80%" left="45%" delay={0.5} duration={12} blur={2} opacity={0.3} ring />

      {/* Orbiting dots — white/gray */}
      <div className="absolute pointer-events-none" style={{ top: 'calc(8% + 90px)', left: 'calc(5% + 90px)' }}>
        <OrbitingDot radius={130} speed={15} color="#FFFFFF" size={4} offsetAngle={0} />
        <OrbitingDot radius={130} speed={15} color="#8A8A8A" size={3} offsetAngle={180} />
        <OrbitingDot radius={160} speed={20} color="#CCCCCC" size={3} offsetAngle={90} />
      </div>

      {/* Navigation — deep space navbar */}
      <nav className="relative z-50 border-b border-white/5 backdrop-blur-md bg-black/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-white/10">
                <span className="text-black font-bold text-xl">L</span>
              </div>
              <span className="text-xl font-bold text-white font-[var(--font-space-mono)] tracking-[0.15em]">LedgerFlow</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-[var(--text-secondary)] hover:text-white transition-colors text-sm">Características</a>
              <a href="#stats" className="text-[var(--text-secondary)] hover:text-white transition-colors text-sm">Métricas</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-8 md:pt-16 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] text-[#D0D0D0] text-sm mb-6 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span>Plataforma impulsada por IA</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 font-[var(--font-space-mono)]">
              Gestión empresarial
              <br />
              <span className="gradient-text-animated">inteligente</span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Contabilidad automatizada, gestión de proyectos y comunicación proactiva
              con tus clientes. Todo en una plataforma intuitiva.
            </p>
          </div>

          {/* Login Panels */}
          <div className="max-w-4xl mx-auto">
            {/* Panel Selector */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                <button
                  onClick={() => setActivePanel('admin')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${activePanel === 'admin'
                    ? 'bg-white text-black shadow-lg shadow-white/10'
                    : 'text-[var(--text-secondary)] hover:text-white'
                    }`}
                >
                  <Shield className="h-4 w-4" />
                  Administrador
                </button>
                <button
                  onClick={() => setActivePanel('client')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${activePanel === 'client'
                    ? 'bg-white text-black shadow-lg shadow-white/10'
                    : 'text-[var(--text-secondary)] hover:text-white'
                    }`}
                >
                  <Globe className="h-4 w-4" />
                  Cliente
                </button>
              </div>
            </div>

            {/* Login Cards */}
            <div className="grid md:grid-cols-2 gap-6 items-start">
              {/* Admin Panel */}
              <div className={`transition-all duration-500 ${activePanel === 'admin'
                ? 'opacity-100 scale-100 order-1'
                : 'opacity-40 scale-95 order-2 pointer-events-none md:pointer-events-auto md:opacity-60'
                }`}>
                <div className="glass-card p-8 relative overflow-hidden group hover:border-white/20">
                  {/* Card glow */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/5 blur-3xl group-hover:bg-white/8 transition-colors duration-500" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Acceso Administrador</h3>
                        <p className="text-xs text-[var(--text-muted)]">Panel de gestión completo</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                          <Input
                            id="admin-email"
                            type="email"
                            placeholder="admin@empresa.com"
                            className="pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && document.getElementById('admin-password')?.focus()}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Contraseña</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                          <Input
                            id="admin-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        id="admin-login-btn"
                        className="w-full gap-2 h-11 text-base"
                        onClick={handleAdminLogin}
                        disabled={isAdminLoading}
                      >
                        {isAdminLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Iniciar Sesión
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Panel */}
              <div className={`transition-all duration-500 ${activePanel === 'client'
                ? 'opacity-100 scale-100 order-1'
                : 'opacity-40 scale-95 order-2 pointer-events-none md:pointer-events-auto md:opacity-60'
                }`}>
                <div className="glass-card p-8 relative overflow-hidden group hover:border-white/20">
                  {/* Card glow */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/5 blur-3xl group-hover:bg-white/8 transition-colors duration-500" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <KeyRound className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Portal de Cliente</h3>
                        <p className="text-xs text-[var(--text-muted)]">Accede con tu código personal</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Código de Acceso</label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                          <Input
                            id="client-code"
                            placeholder="Ej: ACME-2026-XYZ"
                            className="pl-10 text-center text-lg tracking-wider uppercase font-mono"
                            value={clientCode}
                            onChange={(e) => setClientCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleClientAccess()}
                          />
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/5 rounded-lg p-3">
                        <p className="text-xs text-[var(--text-muted)] text-center">
                          💡 Ingresa el código que recibiste de tu gestor para ver el estado de tu proyecto
                        </p>
                      </div>

                      <Button
                        id="client-login-btn"
                        className="w-full gap-2 h-11 text-base bg-white text-black hover:bg-[#E0E0E0] rounded-lg"
                        onClick={handleClientAccess}
                        disabled={isClientLoading}
                      >
                        {isClientLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Acceder al Portal
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Todo lo que necesitas para gestionar tu negocio
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">
              Herramientas potentes con una experiencia simple
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Procesamiento con IA',
                description: 'Extrae automáticamente datos de facturas, recibos y documentos. Soporta PDF, imágenes, Excel y más.',
              },
              {
                icon: Shield,
                title: 'Acceso por Códigos',
                description: 'Tus clientes acceden sin contraseñas complejas. Solo un código simple tipo ACME-2026-ABC.',
              },
              {
                icon: BarChart3,
                title: 'Dashboard en Tiempo Real',
                description: 'Visualiza el estado de tu negocio con métricas claras y reportes automáticos.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="glass-card rounded-2xl p-8 transition-all duration-300 hover:border-white/20 group"
              >
                <div className="w-14 h-14 rounded-xl bg-white/8 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-7 w-7 text-white/70" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="relative py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10x', label: 'Más rápido procesando documentos' },
              { value: '50%', label: 'Reducción en tareas administrativas' },
              { value: '99%', label: 'Precisión en extracción de datos' },
              { value: '24/7', label: 'Disponibilidad del sistema' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-6 rounded-2xl">
                <div className="text-4xl font-bold text-white mb-2 font-[var(--font-space-mono)]">
                  {stat.value}
                </div>
                <div className="text-[var(--text-secondary)] text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-8 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-black font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-white font-[var(--font-space-mono)] tracking-[0.15em]">LedgerFlow</span>
            </div>
            <p className="text-[#404040] text-sm">
              © 2026 LedgerFlow. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
