'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FileText,
  Settings,
  LogOut,
  Wallet,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'
import { useResponsive } from '@/lib/hooks/use-responsive'
import { useTranslation } from '@/lib/i18n/use-translation'
import { LanguageSelector } from '@/components/ui/language-selector'

export function ResponsiveSidebar() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const { isMobile } = useResponsive()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.projects'), href: '/dashboard/projects', icon: FolderKanban },
    { name: t('nav.clients'), href: '/dashboard/clients', icon: Users },
    { name: t('nav.documents'), href: '/dashboard/documents', icon: FileText },
    { name: t('nav.finances'), href: '/dashboard/finances', icon: Wallet },
    { name: t('nav.agent'), href: '/dashboard/agent', icon: Sparkles, badge: 'IA' },
    { name: t('nav.settings'), href: '/dashboard/settings', icon: Settings },
  ]

  if (isMobile) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-secondary)]/95 backdrop-blur-lg border-b border-white/5">
          <div className="flex items-center justify-between px-4 h-14">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-black font-bold">L</span>
              </div>
              <span className="font-bold text-white font-[var(--font-space-mono)] tracking-[0.15em]">LedgerFlow</span>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg hover:bg-white/5 text-white">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            >
              <motion.nav
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="absolute right-0 top-14 bottom-0 w-72 bg-[var(--bg-secondary)] border-l border-white/5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                          isActive
                            ? 'bg-white/10 text-white border border-white/15'
                            : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="flex-1">{item.name}</span>
                        {(item as any).badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/15 text-gray-300 border border-white/15">{(item as any).badge}</span>
                        )}
                      </Link>
                    )
                  })}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 space-y-4">
                  <div className="flex items-center gap-3 px-4">
                    <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                      <span className="text-white font-medium">{user?.full_name?.charAt(0) || 'U'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user?.full_name || 'Usuario'}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                    </div>
                  </div>
                  <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                    <LogOut className="h-4 w-4" />
                    {t('settings.logout')}
                  </button>
                </div>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="h-14" />
      </>
    )
  }

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-white/5 bg-[var(--bg-secondary)] h-screen sticky top-0">
      <div className="flex items-center gap-3 h-16 px-6 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
          <span className="text-black font-bold text-lg">L</span>
        </div>
        <span className="text-xl font-bold text-white font-[var(--font-space-mono)] tracking-[0.15em]">LedgerFlow</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.name}</span>
              {(item as any).badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/15 text-gray-300 border border-white/15">{(item as any).badge}</span>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-white/5 p-4 space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t('settings.language')}</span>
          <LanguageSelector />
        </div>
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold">{user?.full_name?.charAt(0) || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.full_name || 'Usuario'}</p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
            <LogOut className="h-4 w-4" />
            {t('settings.logout')}
          </button>
        </div>
      </div>
    </aside>
  )
}
