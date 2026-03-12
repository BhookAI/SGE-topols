'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LogOut, FileText, Activity, Clock, Download,
  MessageSquare, TrendingUp, Folder, ChevronRight
} from 'lucide-react'

interface ClientData {
  client: {
    full_name: string
    company_name?: string
  }
  project: {
    title: string
    description?: string
    progress: number
    status: string
    budget?: number
    spent: number
  }
  documents: Array<{
    id: string
    file_name: string
    document_type: string
    created_at: string
  }>
  activities: Array<{
    id: string
    title: string
    description?: string
    created_at: string
  }>
}

/* ───── Mini Planet ───── */
function Planet({ size, color1, color2, style }: {
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
        boxShadow: `inset -6px -6px 15px rgba(0,0,0,0.6), 0 0 ${size / 3}px ${color1}15`,
      }} />
      <div className="absolute rounded-full" style={{
        top: '15%', left: '22%', width: '30%', height: '20%',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.2), transparent 70%)',
        transform: 'rotate(-25deg)',
      }} />
    </div>
  )
}

export default function ClientPortalPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [data, setData] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchClientData()
  }, [code])

  const fetchClientData = async () => {
    try {
      const response = await fetch(`/api/client/dashboard?code=${code}`)
      if (!response.ok) throw new Error('No se pudo cargar la información')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    document.cookie = 'client_code=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030305] flex items-center justify-center relative overflow-hidden">
        <Planet size={120} color1="#6366f1" color2="#312e81" style={{ top: '15%', left: '10%', animation: 'float 8s ease-in-out infinite' }} />
        <Planet size={80} color1="#06b6d4" color2="#164e63" style={{ bottom: '20%', right: '15%', animation: 'float 10s ease-in-out 1s infinite' }} />
        <div className="text-center relative z-10">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 animate-spin" style={{ animationDuration: '2s' }}>
              <div className="absolute inset-[3px] rounded-full bg-[#030305]" />
            </div>
          </div>
          <p className="text-[#94a3b8]">Cargando tu proyecto...</p>
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#030305] flex items-center justify-center p-4 relative overflow-hidden">
        <Planet size={90} color1="#ef4444" color2="#7f1d1d" style={{ top: '20%', right: '20%', animation: 'float 8s ease-in-out infinite' }} />
        <div className="text-center relative z-10 glass-card p-8 max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-red-400 mb-2 font-medium">{error || 'No se encontró el proyecto'}</p>
          <p className="text-[var(--text-muted)] text-sm mb-6">Verifica que tu código de acceso sea correcto</p>
          <Link href="/access" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl hover:from-indigo-600 hover:to-violet-600 transition-all">
            Volver al acceso
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    )
  }

  const { client, project, documents, activities } = data

  const progressColor = project.progress >= 75
    ? 'from-emerald-500 to-green-400'
    : project.progress >= 40
      ? 'from-cyan-500 to-blue-400'
      : 'from-indigo-500 to-violet-400'

  return (
    <main className="min-h-screen bg-[#030305] relative overflow-hidden">
      {/* Background cosmic effects */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse at 10% 20%, rgba(99,102,241,0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 90% 80%, rgba(6,182,212,0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.03) 0%, transparent 60%)
        `
      }} />

      {/* Floating planets decoration */}
      <Planet size={100} color1="#6366f1" color2="#312e81" style={{ top: '5%', right: '5%', animation: 'float 10s ease-in-out infinite', opacity: 0.4 }} />
      <Planet size={60} color1="#06b6d4" color2="#164e63" style={{ top: '50%', left: '3%', animation: 'float 8s ease-in-out 2s infinite', opacity: 0.3 }} />
      <Planet size={40} color1="#f59e0b" color2="#78350f" style={{ bottom: '10%', right: '10%', animation: 'float 7s ease-in-out 1s infinite', opacity: 0.25 }} />

      {/* Header */}
      <header className="border-b border-white/5 bg-[#030305]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-lg font-bold gradient-text">LedgerFlow</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-xs text-[var(--text-muted)]">Código</span>
              <span className="font-mono text-sm text-cyan-300 font-medium">{code}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-2xl">
              👋
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Hola, {client.full_name}
              </h1>
              <p className="text-[var(--text-secondary)] text-sm">
                Bienvenido a tu portal de proyecto
              </p>
            </div>
          </div>
        </div>

        {/* Project Card - Main */}
        <div className="glass-card p-6 md:p-8 mb-8 relative overflow-hidden">
          {/* Card decoration */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                  <Folder className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">{project.title}</h2>
                  {project.description && (
                    <p className="text-[var(--text-secondary)] text-sm">{project.description}</p>
                  )}
                </div>
              </div>
              <span className={`inline-flex px-4 py-1.5 rounded-full text-sm font-medium self-start ${project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  project.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}>
                {project.status === 'active' ? '🟢 En progreso' :
                  project.status === 'completed' ? '✅ Completado' : '⏸ En pausa'}
              </span>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-secondary)]">Progreso del proyecto</span>
                </div>
                <span className="text-lg font-bold text-white">{project.progress}%</span>
              </div>
              <div className="h-3 bg-[#1a1a25] rounded-full overflow-hidden relative">
                <div
                  className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-1000 relative`}
                  style={{ width: `${project.progress}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
                <span>Inicio</span>
                <span>Finalización</span>
              </div>
            </div>

            {/* Budget */}
            {project.budget && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0a0a0f]/80 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    <p className="text-sm text-[var(--text-muted)]">Presupuesto</p>
                  </div>
                  <p className="text-xl font-semibold text-white">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(project.budget)}
                  </p>
                </div>
                <div className="bg-[#0a0a0f]/80 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-cyan-400" />
                    <p className="text-sm text-[var(--text-muted)]">Invertido</p>
                  </div>
                  <p className="text-xl font-semibold text-white">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(project.spent)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Documents */}
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-indigo-500/5 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Documentos compartidos</h3>
              </div>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-[var(--text-muted)]" />
                  </div>
                  <p className="text-[var(--text-muted)] text-sm">No hay documentos compartidos aún</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                        {doc.document_type === 'invoice' ? '🧾' :
                          doc.document_type === 'contract' ? '📋' : '📄'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate font-medium">{doc.file_name}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {new Date(doc.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download className="h-4 w-4 text-indigo-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-cyan-500/5 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Actividad reciente</h3>
              </div>
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Activity className="h-6 w-6 text-[var(--text-muted)]" />
                  </div>
                  <p className="text-[var(--text-muted)] text-sm">No hay actividad reciente</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 mt-1.5 flex-shrink-0" />
                        {index < activities.length - 1 && (
                          <div className="w-px h-full bg-white/5 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm text-white font-medium">{activity.title}</p>
                        {activity.description && (
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{activity.description}</p>
                        )}
                        <div className="flex items-center gap-1 mt-1.5">
                          <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                          <p className="text-xs text-[var(--text-muted)]">
                            {new Date(activity.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-8">
          <div className="glass-card p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-cyan-500/5" />
            <div className="relative z-10">
              <p className="text-[var(--text-secondary)] mb-4">¿Tienes alguna pregunta sobre tu proyecto?</p>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-white/10 text-white rounded-xl hover:from-indigo-500/20 hover:to-cyan-500/20 hover:border-white/20 transition-all">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
                Enviar mensaje al equipo
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function DollarSign({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
