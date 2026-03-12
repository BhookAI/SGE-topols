'use client'

import { StatsCards } from '@/components/dashboard/stats-cards'
import { CashFlowChart } from '@/components/dashboard/cash-flow-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { useAuthStore } from '@/lib/store'

/* Mini floating decoration sphere — MONOCHROMATIC */
function MiniSphere({ size, color, className }: { size: number; color: string; className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className}`} style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full" style={{
        background: `radial-gradient(circle at 35% 25%, ${color}, rgba(0,0,0,0.6) 70%)`,
        boxShadow: `inset -3px -3px 8px rgba(0,0,0,0.5), 0 0 ${size / 3}px ${color}10`,
      }} />
      <div className="absolute rounded-full" style={{
        top: '15%', left: '22%', width: '28%', height: '18%',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.15), transparent 70%)',
      }} />
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const firstName = user?.full_name?.split(' ')[0] || 'usuario'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <div className="space-y-8 relative">
      {/* Floating decorative spheres — monochromatic */}
      <MiniSphere size={50} color="#3A3A3A" className="top-0 right-0 animate-float opacity-20" />
      <MiniSphere size={30} color="#2A2A2A" className="top-32 right-16 animate-float opacity-15" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">¡{getGreeting()}, {firstName}! 👋</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Aquí está el resumen de tu negocio.
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <CashFlowChart />
        </div>
        <div className="lg:col-span-3">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
