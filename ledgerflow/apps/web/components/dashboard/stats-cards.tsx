'use client'

import { TrendingUp, TrendingDown, Users, FolderKanban, FileText, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStore } from '@/lib/store'

const cardMeta = [
  {
    key: 'clients', icon: Users,
    gradient: 'from-white/5 to-white/10',
    iconColor: 'text-white/70',
    glowColor: 'rgba(255,255,255,0.06)',
    borderHover: 'hover:border-white/15',
  },
  {
    key: 'projects', icon: FolderKanban,
    gradient: 'from-white/5 to-white/10',
    iconColor: 'text-white/70',
    glowColor: 'rgba(255,255,255,0.06)',
    borderHover: 'hover:border-white/15',
  },
  {
    key: 'documents', icon: FileText,
    gradient: 'from-white/5 to-white/10',
    iconColor: 'text-white/70',
    glowColor: 'rgba(255,255,255,0.06)',
    borderHover: 'hover:border-white/15',
  },
  {
    key: 'balance', icon: Wallet,
    gradient: 'from-white/5 to-white/10',
    iconColor: 'text-white/70',
    glowColor: 'rgba(255,255,255,0.06)',
    borderHover: 'hover:border-white/15',
  },
]

export function StatsCards() {
  const { stats, isLoading } = useDashboardStore()

  const cards = [
    {
      title: 'Total Clientes',
      value: stats?.total_clients || 0,
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Proyectos Activos',
      value: stats?.active_projects || 0,
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Documentos',
      value: stats?.total_documents || 0,
      trend: stats?.pending_documents || 0,
      trendLabel: 'pendientes',
      trendUp: null,
    },
    {
      title: 'Balance',
      value: stats?.balance ? `€${stats.balance.toLocaleString()}` : '€0',
      trend: stats?.total_income ? `+€${stats.total_income.toLocaleString()}` : '+€0',
      trendUp: true,
      highlight: true,
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const meta = cardMeta[idx]
        const Icon = meta.icon
        return (
          <Card
            key={card.title}
            className={`relative overflow-hidden group transition-all duration-300 ${meta.borderHover}`}
          >
            {/* Background glow */}
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: meta.glowColor }}
            />
            {/* Mini sphere decoration */}
            <div
              className="absolute -top-3 -right-3 w-12 h-12 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle at 35% 25%, rgba(255,255,255,0.15) 20%, transparent 70%)`,
              }}
            />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
                {card.title}
              </CardTitle>
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${meta.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`h-4 w-4 ${meta.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-white">{card.value}</div>
              <div className="flex items-center text-xs mt-1">
                {card.trendUp === true && (
                  <>
                    <TrendingUp className="h-3 w-3 text-gray-300 mr-1" />
                    <span className="text-gray-300">{card.trend}</span>
                  </>
                )}
                {card.trendUp === false && (
                  <>
                    <TrendingDown className="h-3 w-3 text-gray-500 mr-1" />
                    <span className="text-gray-500">{card.trend}</span>
                  </>
                )}
                {card.trendUp === null && (
                  <span className="text-[var(--text-muted)]">
                    {card.trend} {card.trendLabel}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
