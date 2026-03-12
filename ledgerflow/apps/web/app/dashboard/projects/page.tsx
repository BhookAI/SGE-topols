'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, Filter, MoreHorizontal, Calendar, DollarSign, Users,
  Copy, RefreshCw, CheckCircle2, Loader2, Sparkles, FolderKanban,
  ArrowRight, Clipboard, ClipboardCheck, KeyRound
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n/use-translation'

interface Project {
  id: string
  title: string
  description: string
  status: string
  priority: string
  progress: number
  budget?: number
  spent?: number
  access_code?: string
  client?: {
    full_name: string
  }
  start_date?: string
  end_date?: string
}

/* ─────── Code Generator ─────── */
function generateAccessCode(prefix: string = '') {
  const year = new Date().getFullYear()
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const rand = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  const num = Math.floor(Math.random() * 900 + 100)
  const cleanPrefix = prefix.replace(/\s+/g, '-').toUpperCase().slice(0, 8) || 'PRJ'
  return `${cleanPrefix}-${year}-${rand}${num}`
}

/* ─────── Floating 3D Sphere decoration ─────── */
function FloatingSphere({ size, color1, color2, className, style }: {
  size: number; color1: string; color2: string; className?: string; style?: React.CSSProperties
}) {
  return (
    <div className={`absolute pointer-events-none ${className}`} style={{ width: size, height: size, ...style }}>
      <div className="absolute inset-0 rounded-full" style={{
        background: `radial-gradient(circle at 30% 30%, ${color1}60, transparent 70%)`,
        filter: 'blur(12px)', transform: 'scale(1.4)',
      }} />
      <div className="absolute inset-0 rounded-full" style={{
        background: `radial-gradient(circle at 35% 25%, ${color1}, ${color2} 60%, rgba(0,0,0,0.7))`,
        boxShadow: `inset -5px -5px 12px rgba(0,0,0,0.5), 0 0 ${size / 3}px ${color1}15`,
      }} />
      <div className="absolute rounded-full" style={{
        top: '15%', left: '22%', width: '28%', height: '18%',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.15), transparent 70%)',
        transform: 'rotate(-25deg)',
      }} />
    </div>
  )
}

export default function ProjectsPage() {
  const { t, locale } = useTranslation()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  // New project form
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    budget: '',
    priority: 'medium',
  })
  const [generatedCode, setGeneratedCode] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [])

  // Generate code when title changes
  useEffect(() => {
    if (newProject.title.length >= 2) {
      setGeneratedCode(generateAccessCode(newProject.title))
    }
  }, [newProject.title])

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const regenerateCode = useCallback(() => {
    setGeneratedCode(generateAccessCode(newProject.title))
    setCodeCopied(false)
  }, [newProject.title])

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(generatedCode)
      setCodeCopied(true)
      toast.success(t('common.success'))
      setTimeout(() => setCodeCopied(false), 2000)
    } catch {
      toast.error(t('common.error'))
    }
  }

  async function handleCreateProject() {
    if (!newProject.title.trim()) {
      toast.error(t('finances.requiredFields'))
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProject.title,
          description: newProject.description,
          budget: newProject.budget ? parseFloat(newProject.budget) : undefined,
          priority: newProject.priority,
          access_code: generatedCode,
        }),
      })

      if (res.ok) {
        toast.success(t('common.success'))
        setIsDialogOpen(false)
        setNewProject({ title: '', description: '', budget: '', priority: 'medium' })
        setGeneratedCode('')
        fetchProjects()
      } else {
        const data = await res.json()
        toast.error(data.error || t('common.error'))
      }
    } catch (error) {
      toast.error(t('common.error'))
    } finally {
      setIsCreating(false)
    }
  }

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusColors: Record<string, string> = {
    planning: 'secondary',
    active: 'default',
    paused: 'warning',
    completed: 'success',
    cancelled: 'destructive',
  }

  return (
    <div className="space-y-6 relative">
      {/* Background decoration */}
      <FloatingSphere size={60} color1="#6366f1" color2="#312e81" className="top-0 right-0 animate-float opacity-30" />
      <FloatingSphere size={40} color1="#06b6d4" color2="#164e63" className="top-40 right-20 animate-float opacity-20" style={{ animationDelay: '2s' }} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">{t('projects.title')}</h1>
          </div>
          <p className="text-[var(--text-secondary)] mt-1 ml-[52px]">
            {t('projects.subtitle')}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (open && !generatedCode) {
            setGeneratedCode(generateAccessCode('PRJ'))
          }
        }}>
          <DialogTrigger asChild>
            <Button id="new-project-btn" className="gap-2 shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4" />
              {t('projects.newProject')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px] bg-[#0f111a] border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                {t('projects.newProject')}
              </DialogTitle>
              <DialogDescription className="text-[var(--text-muted)]">
                {t('projects.subtitle')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">{t('clients.name')} *</label>
                <Input
                  id="project-title"
                  placeholder="Ej: Sitio Web ACME Corp"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">{t('projects.description')}</label>
                <Input
                  id="project-description"
                  placeholder="Descripción breve del proyecto"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Budget */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">{t('projects.budget')}</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <Input
                      id="project-budget"
                      type="number"
                      placeholder="0.00"
                      className="pl-9 bg-white/5 border-white/10 text-white"
                      value={newProject.budget}
                      onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    />
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">{t('projects.priority')}</label>
                  <select
                    id="project-priority"
                    className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                    value={newProject.priority}
                    onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                  >
                    <option value="low">{t('projects.low')}</option>
                    <option value="medium">{t('projects.medium')}</option>
                    <option value="high">{t('projects.high')}</option>
                    <option value="critical">{t('projects.critical')}</option>
                  </select>
                </div>
              </div>

              {/* Generated Code Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-cyan-400" />
                    {t('projects.accessCode')}
                  </label>
                  <button
                    type="button"
                    onClick={regenerateCode}
                    className="text-xs text-[var(--text-muted)] hover:text-cyan-400 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {t('common.info')}
                  </button>
                </div>

                <div className="relative">
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-indigo-500/10 border border-cyan-500/20">
                    <div className="flex-1 text-center">
                      <p className="text-xl font-mono font-bold tracking-wider text-cyan-300">
                        {generatedCode || '—'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={copyCode}
                      className="flex-shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-cyan-400 hover:text-cyan-300"
                    >
                      {codeCopied ? (
                        <ClipboardCheck className="h-5 w-5" />
                      ) : (
                        <Clipboard className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="text-white border-white/10 hover:bg-white/5">
                {t('finances.cancel')}
              </Button>
              <Button
                id="create-project-btn"
                onClick={handleCreateProject}
                disabled={isCreating}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {t('finances.save')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            id="search-projects"
            placeholder={t('projects.search')}
            className="pl-10 bg-white/5 border-white/10 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 border-white/10 text-white hover:bg-white/5">
          <Filter className="h-4 w-4" />
          {t('projects.filters')}
        </Button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse glass-card">
              <CardHeader>
                <div className="h-5 bg-white/10 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-white/10 rounded w-full mb-4"></div>
                <div className="h-2 bg-white/10 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative mb-6">
            <FloatingSphere size={80} color1="#6366f1" color2="#312e81" className="relative animate-float" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery ? t('common.error') : t('projects.noProjects')}
          </h3>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 mt-4">
            <Plus className="h-4 w-4" />
            {t('projects.newProject')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="glass-card hover:border-indigo-500/30 transition-all duration-300 group relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg text-white truncate font-bold">
                      {project.title}
                    </CardTitle>
                    {project.client && (
                      <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {project.client.full_name}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1d2e] border-white/10 text-white">
                      <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">{t('common.view')}</DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">{t('common.edit')}</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400 hover:bg-red-400/10 cursor-pointer">{t('common.delete')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                  {project.description || '...'}
                </p>

                {project.access_code && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                    <KeyRound className="h-3 w-3 text-cyan-400 flex-shrink-0" />
                    <span className="text-xs font-mono text-cyan-300 truncate font-bold">{project.access_code}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Badge variant={statusColors[project.status] as any || 'outline'} className="uppercase text-[10px]">
                    {t(`projects.${project.status}`) || project.status}
                  </Badge>
                  <Badge variant="outline" className="uppercase text-[10px] border-white/10 text-[var(--text-muted)]">
                    {t(`projects.${project.priority}`) || project.priority}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">{t('projects.progress')}</span>
                    <span className="text-white font-bold">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5 bg-white/5" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                    {project.budget && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        €{project.budget.toLocaleString()}
                      </span>
                    )}
                    {project.end_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(project.end_date).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US')}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
