'use client'

import { useState } from 'react'
import { User, Building, Bell, Shield, CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n/use-translation'

export default function SettingsPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [isSaving, setIsSaving] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{t('settings.title')}</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <User className="h-4 w-4 mr-2" />
            {t('settings.profile')}
          </TabsTrigger>
          <TabsTrigger value="company" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Building className="h-4 w-4 mr-2" />
            {t('settings.company')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Bell className="h-4 w-4 mr-2" />
            {t('settings.notifications')}
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Shield className="h-4 w-4 mr-2" />
            {t('settings.security')}
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <CreditCard className="h-4 w-4 mr-2" />
            {t('settings.billing')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">{t('settings.profileInfo')}</CardTitle>
              <CardDescription className="text-[var(--text-muted)]">
                {t('settings.profileDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">{t('clients.fullName')}</label>
                  <Input defaultValue={user?.full_name} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">{t('clients.email')}</label>
                  <Input defaultValue={user?.email} disabled className="bg-white/5 border-white/10 text-white opacity-50" />
                </div>
              </div>
              <Button disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
                {isSaving ? t('finances.saving') : t('settings.saveChanges')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">{t('settings.companyInfo')}</CardTitle>
              <CardDescription className="text-[var(--text-muted)]">
                {t('settings.companyDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">{t('settings.company')}</label>
                  <Input placeholder="Mi Empresa S.L." className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">CIF/NIF</label>
                  <Input placeholder="B12345678" className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">{t('projects.description')}</label>
                  <Input placeholder="Calle Principal 123" className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">{t('clients.phone')}</label>
                  <Input placeholder="+34 600 000 000" className="bg-white/5 border-white/10 text-white" />
                </div>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700">{t('settings.saveChanges')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">{t('settings.notificationPrefs')}</CardTitle>
              <CardDescription className="text-[var(--text-muted)]">
                {t('settings.notificationDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'email_documents', label: t('nav.documents'), desc: 'Recibe un email cuando un documento se procese' },
                  { id: 'email_projects', label: t('nav.projects'), desc: 'Notificaciones sobre cambios en proyectos' },
                  { id: 'email_clients', label: t('nav.clients'), desc: 'Alerta cuando un nuevo cliente se registre' },
                  { id: 'weekly_report', label: 'Weekly Report', desc: 'Resumen semanal por email' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-[var(--bg-tertiary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">{t('settings.securityInfo')}</CardTitle>
              <CardDescription className="text-[var(--text-muted)]">
                {t('settings.securityDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">{t('settings.currentPassword')}</label>
                <Input type="password" className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">{t('settings.newPassword')}</label>
                <Input type="password" className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">{t('settings.confirmPassword')}</label>
                <Input type="password" className="bg-white/5 border-white/10 text-white" />
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700">{t('settings.changePassword')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">{t('settings.billingInfo')}</CardTitle>
              <CardDescription className="text-[var(--text-muted)]">
                {t('settings.billingDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent border border-indigo-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 mb-2">PLAN PRO</Badge>
                    <p className="font-bold text-white text-xl">€29 / {t('finances.currentMonth')}</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      Renueva el 15 de cada mes
                    </p>
                  </div>
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                    {t('common.edit')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
