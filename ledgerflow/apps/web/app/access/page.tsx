'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { KeyRound, ArrowRight, ArrowLeft, Loader2, User, Mail, Phone, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

/* ───────── 3D Planet for this page ───────── */
function MiniPlanet({ size, color1, color2, style }: {
  size: number; color1: string; color2: string; style?: React.CSSProperties
}) {
  return (
    <div className="absolute pointer-events-none" style={{ width: size, height: size, ...style }}>
      <div className="absolute inset-0 rounded-full" style={{
        background: `radial-gradient(circle at 30% 30%, ${color1}50, transparent 70%)`,
        filter: 'blur(15px)', transform: 'scale(1.5)',
      }} />
      <div className="absolute inset-0 rounded-full" style={{
        background: `radial-gradient(circle at 35% 25%, ${color1}, ${color2} 60%, rgba(0,0,0,0.8))`,
        boxShadow: `inset -6px -6px 15px rgba(0,0,0,0.6), inset 3px 3px 10px ${color1}30, 0 0 ${size / 3}px ${color1}15`,
      }} />
      <div className="absolute rounded-full" style={{
        top: '15%', left: '22%', width: '30%', height: '20%',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.2), transparent 70%)',
        transform: 'rotate(-25deg)',
      }} />
    </div>
  )
}

function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; s: number; d: number }>>([])
  useEffect(() => {
    setParticles(Array.from({ length: 30 }, () => ({
      x: Math.random() * 100, y: Math.random() * 100,
      s: Math.random() * 2 + 0.5, d: Math.random() * 5 + 2,
    })))
  }, [])
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div key={i} className="absolute rounded-full bg-white" style={{
          left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s,
          opacity: 0.2 + Math.random() * 0.3,
          animation: `float ${p.d}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  )
}

export default function AccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefilledCode = searchParams.get('code') || ''

  const [code, setCode] = useState(prefilledCode)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'code' | 'details'>(prefilledCode ? 'details' : 'code')
  const [clientData, setClientData] = useState({
    full_name: '',
    email: '',
    phone: '',
  })

  async function validateCode() {
    if (!code.trim()) {
      toast.error('Ingresa un código de acceso')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() }),
      })

      const data = await res.json()

      if (res.ok && data.valid) {
        if (data.clientExists) {
          document.cookie = `client_code=${code.toUpperCase()}; path=/; max-age=2592000`
          toast.success(`¡Bienvenido, ${data.client?.full_name}!`)
          router.push(`/portal/${code.toUpperCase()}`)
        } else {
          setStep('details')
        }
      } else {
        toast.error(data.message || 'Código inválido')
      }
    } catch (error) {
      toast.error('Error al validar el código')
    } finally {
      setIsLoading(false)
    }
  }

  async function registerClient() {
    if (!clientData.full_name || !clientData.email) {
      toast.error('Completa los campos requeridos')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/client-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          name: clientData.full_name,
          email: clientData.email,
          phone: clientData.phone,
        }),
      })

      if (res.ok) {
        document.cookie = `client_code=${code.toUpperCase()}; path=/; max-age=2592000`
        toast.success('¡Bienvenido!')
        router.push(`/portal/${code.toUpperCase()}`)
      } else {
        const data = await res.json()
        toast.error(data.message || 'Error al registrar')
      }
    } catch (error) {
      toast.error('Error al registrar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Background effects */}
      <FloatingParticles />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse at 30% 60%, rgba(6,182,212,0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 30%, rgba(99,102,241,0.06) 0%, transparent 50%)
        `
      }} />

      {/* Orbiting planets */}
      <MiniPlanet size={100} color1="#06b6d4" color2="#164e63" style={{ top: '10%', right: '10%', animation: 'float 8s ease-in-out infinite' }} />
      <MiniPlanet size={60} color1="#8b5cf6" color2="#4c1d95" style={{ bottom: '15%', left: '8%', animation: 'float 10s ease-in-out 1s infinite' }} />
      <MiniPlanet size={40} color1="#f59e0b" color2="#78350f" style={{ top: '20%', left: '15%', animation: 'float 7s ease-in-out 0.5s infinite' }} />
      <MiniPlanet size={30} color1="#ec4899" color2="#831843" style={{ bottom: '25%', right: '15%', animation: 'float 6s ease-in-out 2s infinite' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-5">
            {/* Logo glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 blur-xl opacity-40" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <KeyRound className="h-9 w-9 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Portal de Clientes</h1>
          <p className="text-[var(--text-secondary)]">LedgerFlow</p>
        </div>

        <div className="glass-card p-8 relative overflow-hidden">
          {/* Card top glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-40 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`w-8 h-1 rounded-full transition-colors duration-300 ${step === 'code' ? 'bg-cyan-500' : 'bg-white/20'}`} />
              <div className={`w-8 h-1 rounded-full transition-colors duration-300 ${step === 'details' ? 'bg-cyan-500' : 'bg-white/20'}`} />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-white mb-1">
                {step === 'code' ? 'Acceso con Código' : 'Completa tu Perfil'}
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                {step === 'code'
                  ? 'Ingresa el código de acceso que recibiste'
                  : 'Solo necesitamos unos datos básicos'
                }
              </p>
            </div>

            {step === 'code' ? (
              <div className="space-y-4">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <Input
                    id="access-code-input"
                    placeholder="Ej: ACME-2026-ABC"
                    className="pl-10 text-center text-lg tracking-wider uppercase font-mono h-12"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && validateCode()}
                  />
                </div>

                <div className="bg-white/5 border border-white/5 rounded-lg p-3">
                  <p className="text-xs text-[var(--text-muted)] text-center flex items-center justify-center gap-2">
                    <Sparkles className="h-3 w-3 text-cyan-400" />
                    Tu gestor te proporcionará este código al crear tu proyecto
                  </p>
                </div>

                <Button
                  id="validate-code-btn"
                  className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  onClick={validateCode}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Continuar
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 mb-2">
                  <p className="text-xs text-cyan-300 text-center font-mono">
                    Código: {code.toUpperCase()}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Nombre completo *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <Input
                      id="client-name"
                      placeholder="Tu nombre completo"
                      className="pl-10"
                      value={clientData.full_name}
                      onChange={(e) => setClientData({ ...clientData, full_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <Input
                      id="client-email"
                      type="email"
                      placeholder="tu@email.com"
                      className="pl-10"
                      value={clientData.email}
                      onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <Input
                      id="client-phone"
                      placeholder="+52 55 1234 5678"
                      className="pl-10"
                      value={clientData.phone}
                      onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-shrink-0"
                    onClick={() => setStep('code')}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    id="register-btn"
                    className="flex-1 h-11 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    onClick={registerClient}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Comenzar'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          ¿Eres administrador?{' '}
          <a href="/" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  )
}
