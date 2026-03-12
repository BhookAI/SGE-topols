'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Mail, Phone, MoreHorizontal, Copy, CheckCircle, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

interface Client {
  id: string
  full_name: string
  email: string
  phone?: string
  company_name?: string
  access_code: string
  is_active: boolean
  project_count?: number
  last_access?: string
}

export default function ClientsPage() {
  const { t } = useTranslation()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newClient, setNewClient] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
  })

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function copyAccessCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(t('clients.copied'))
    setTimeout(() => setCopiedCode(null), 2000)
  }

  async function createClient() {
    if (!newClient.full_name.trim()) {
      toast.error(t('finances.requiredFields'))
      return
    }
    setIsCreating(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      })
      if (res.ok) {
        toast.success(t('clients.addSuccess'))
        setIsDialogOpen(false)
        setNewClient({ full_name: '', email: '', phone: '', company_name: '' })
        fetchClients()
      } else {
        const data = await res.json()
        toast.error(data.error || t('clients.addError'))
      }
    } catch (err) {
      toast.error(t('finances.connectionError'))
    } finally {
      setIsCreating(false)
    }
  }

  const filteredClients = clients.filter(c =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('clients.title')}</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {t('clients.subtitle')}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              {t('clients.newClient')}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0f111a] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>{t('clients.newClient')}</DialogTitle>
              <DialogDescription className="text-[var(--text-muted)]">
                {t('landing.aiDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">{t('clients.fullName')} *</label>
                <Input
                  placeholder={t('clients.name')}
                  value={newClient.full_name}
                  onChange={(e) => setNewClient({ ...newClient, full_name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">{t('clients.email')}</label>
                <Input
                  type="email"
                  placeholder={t('clients.emailPlaceholder')}
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">{t('clients.phone')}</label>
                <Input
                  placeholder={t('clients.phonePlaceholder')}
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">{t('clients.company')}</label>
                <Input
                  placeholder={t('clients.companyPlaceholder')}
                  value={newClient.company_name}
                  onChange={(e) => setNewClient({ ...newClient, company_name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating} className="text-white border-white/10 hover:bg-white/5">
                {t('finances.cancel')}
              </Button>
              <Button onClick={createClient} disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700">
                {isCreating ? t('finances.saving') : t('clients.newClient')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <Input
          placeholder={t('clients.search')}
          className="pl-10 bg-white/5 border-white/10 text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-white/10"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="h-12 w-12 text-[var(--text-muted)] mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">{t('clients.noClients')}</h3>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 mt-4">
            <Plus className="h-4 w-4 mr-2" />
            {t('clients.newClient')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="glass-card hover:border-indigo-500/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border border-white/10">
                      <AvatarFallback className="bg-indigo-500/10 text-indigo-400">
                        {client.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-white">{client.full_name}</h3>
                      {client.company_name && (
                        <p className="text-xs text-[var(--text-secondary)]">
                          {client.company_name}
                        </p>
                      )}
                    </div>
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

                <div className="mt-4 space-y-2">
                  {client.email && (
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <Mail className="h-3 w-3 text-indigo-400" />
                      {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <Phone className="h-3 w-3 text-indigo-400" />
                      {client.phone}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={client.is_active ? 'default' : 'secondary'} className={client.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}>
                        {client.is_active ? t('clients.active') : t('clients.inactive')}
                      </Badge>
                      {client.project_count !== undefined && (
                        <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                          {client.project_count} {t('clients.projectsCount')}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => copyAccessCode(client.access_code)}
                      className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/5 px-2 py-1 rounded-lg border border-indigo-500/10"
                    >
                      {copiedCode === client.access_code ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          {t('clients.copied').toUpperCase()}
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          {client.access_code}
                        </>
                      )}
                    </button>
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
