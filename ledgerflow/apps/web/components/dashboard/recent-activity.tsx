'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  FileText,
  FolderKanban,
  Users,
  Wallet,
  MessageSquare,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const activityIcons: Record<string, React.ElementType> = {
  document_uploaded: FileText,
  project_created: FolderKanban,
  project_completed: CheckCircle2,
  client_added: Users,
  transaction_created: Wallet,
  message_received: MessageSquare,
  document_processed: CheckCircle2,
  error: AlertCircle,
}

const activityColors: Record<string, string> = {
  document_uploaded: 'text-gray-300 bg-white/8',
  project_created: 'text-gray-300 bg-white/8',
  project_completed: 'text-gray-300 bg-white/8',
  client_added: 'text-gray-300 bg-white/8',
  transaction_created: 'text-gray-300 bg-white/8',
  message_received: 'text-gray-300 bg-white/8',
  document_processed: 'text-gray-300 bg-white/8',
  error: 'text-gray-400 bg-white/5',
}

export function RecentActivity() {
  const { recentActivities, isLoading } = useDashboardStore()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const activities = recentActivities.length > 0 ? recentActivities : [
    {
      id: '1',
      type: 'document_uploaded',
      title: 'Documento subido',
      description: 'Factura-001.pdf procesado correctamente',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      project: { title: 'Rediseño Web' },
    },
    {
      id: '2',
      type: 'project_completed',
      title: 'Proyecto completado',
      description: 'El proyecto "App Móvil" ha sido marcado como completado',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '3',
      type: 'client_added',
      title: 'Nuevo cliente',
      description: 'María García se ha registrado como cliente',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: '4',
      type: 'transaction_created',
      title: 'Transacción registrada',
      description: 'Ingreso de €2,500 registrado',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      project: { title: 'Consultoría' },
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type] || AlertCircle
            const colorClass = activityColors[activity.type] || 'text-gray-400 bg-white/5'

            return (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={cn('p-2 rounded-lg', colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {activity.title}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] truncate">
                    {activity.description}
                  </p>
                  {activity.project && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Proyecto: {activity.project.title}
                    </p>
                  )}
                </div>
                <time className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                  {formatDistanceToNow(new Date(activity.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </time>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
