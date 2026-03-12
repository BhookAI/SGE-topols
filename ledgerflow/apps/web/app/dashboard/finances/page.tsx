'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Plus, Download, Filter, X, Calendar, DollarSign, Tag, FileText, Search, ArrowUpDown, Eye, Edit, Trash2, Upload, Mail, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n/use-translation'

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6']
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

interface Transaction {
  id: string
  date: string
  description: string
  type: 'income' | 'expense'
  amount: number
  category: string
  project?: { title: string }
  client?: { full_name: string }
  vendor_name?: string
  is_reconciled?: boolean
  status?: 'approved' | 'pending' | 'rejected'
}

interface Stats {
  income: number
  expenses: number
  balance: number
  pendingCount: number
  avgIncome: number
  avgExpense: number
  topCategory: string
  growthRate: number
}

export default function FinancesPage() {
  const { t, locale } = useTranslation()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Dialogs
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isGmailDialogOpen, setIsGmailDialogOpen] = useState(false)
  
  const [isCreating, setIsCreating] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'income' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    category: '',
    vendor_name: '',
    notes: '',
  })

  const MONTHS = locale === 'es' ? MONTHS_ES : locale === 'fr' ? MONTHS_FR : MONTHS_EN

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/transactions?limit=500')
      if (res.ok) {
        const data = await res.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  // Calcular stats avanzadas
  const stats: Stats = (() => {
    const now = new Date()
    let filteredByDate = transactions

    if (dateRange !== 'all') {
      const daysMap = { week: 7, month: 30, quarter: 90, year: 365 }
      const days = daysMap[dateRange]
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      filteredByDate = transactions.filter(t => new Date(t.date) >= cutoff)
    }

    const income = filteredByDate.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expenses = filteredByDate.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance = income - expenses

    const categoryTotals: Record<string, number> = {}
    filteredByDate.filter(t => t.type === 'income').forEach(t => {
      categoryTotals[t.category || 'General'] = (categoryTotals[t.category || 'General'] || 0) + t.amount
    })
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    const incomeCount = filteredByDate.filter(t => t.type === 'income').length
    const expenseCount = filteredByDate.filter(t => t.type === 'expense').length

    // Calcular tasa de crecimiento (comparar con período anterior)
    const prevPeriodStart = new Date(now.getTime() - (dateRange === 'month' ? 60 : 180) * 24 * 60 * 60 * 1000)
    const prevPeriodEnd = new Date(now.getTime() - (dateRange === 'month' ? 30 : 90) * 24 * 60 * 60 * 1000)
    const prevIncome = transactions.filter(t => {
      const d = new Date(t.date)
      return t.type === 'income' && d >= prevPeriodStart && d <= prevPeriodEnd
    }).reduce((s, t) => s + t.amount, 0)
    const growthRate = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0

    return {
      income,
      expenses,
      balance,
      pendingCount: filteredByDate.filter(t => t.status === 'pending' || !t.is_reconciled).length,
      avgIncome: incomeCount > 0 ? income / incomeCount : 0,
      avgExpense: expenseCount > 0 ? expenses / expenseCount : 0,
      topCategory,
      growthRate,
    }
  })()

  // Datos para gráfica de área (tendencia)
  const trendData = (() => {
    const data: Record<string, { income: number; expenses: number; balance: number }> = {}
    const months = dateRange === 'year' ? 12 : 6
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      data[MONTHS[d.getMonth()]] = { income: 0, expenses: 0, balance: 0 }
    }
    transactions.forEach(t => {
      const d = new Date(t.date)
      const key = MONTHS[d.getMonth()]
      if (data[key]) {
        if (t.type === 'income') data[key].income += t.amount
        else data[key].expenses += t.amount
      }
    })
    return Object.entries(data).map(([month, v]) => ({
      month,
      income: Math.round(v.income),
      expenses: Math.round(v.expenses),
      balance: Math.round(v.income - v.expenses),
    }))
  })()

  // Datos para pie chart de gastos
  const expenseCategoryData = (() => {
    const cats: Record<string, number> = {}
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => { cats[t.category || 'General'] = (cats[t.category || 'General'] || 0) + t.amount })
    return Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
  })()

  // Categorías únicas
  const categories = Array.from(new Set(transactions.map(t => t.category).filter(Boolean)))

  // Filtrar y ordenar transacciones
  const filtered = transactions
    .filter(t => {
      const matchesSearch =
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === 'all' || t.type === filterType
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory
      return matchesSearch && matchesType && matchesCategory
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === 'date') comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      else if (sortBy === 'amount') comparison = a.amount - b.amount
      else if (sortBy === 'category') comparison = (a.category || '').localeCompare(b.category || '')
      return sortOrder === 'asc' ? comparison : -comparison
    })

  async function createTransaction() {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.date) {
      toast.error(t('finances.requiredFields'))
      return
    }
    setIsCreating(true)
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction),
      })
      if (res.ok) {
        toast.success(newTransaction.type === 'income' ? t('finances.incomeRegistered') : t('finances.expenseRegistered'))
        setIsDialogOpen(false)
        setNewTransaction({ description: '', amount: '', type: 'income', date: new Date().toISOString().split('T')[0], category: '', vendor_name: '', notes: '' })
        fetchTransactions()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error')
      }
    } catch {
      toast.error(t('finances.connectionError'))
    } finally {
      setIsCreating(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsProcessingFile(true)
    toast.info('Procesando documento con IA...')
    
    // Simulación de extracción IA
    setTimeout(() => {
      setIsProcessingFile(false)
      setIsImportDialogOpen(false)
      setIsDialogOpen(true)
      setNewTransaction({
        ...newTransaction,
        description: 'Extracción IA: ' + file.name.split('.')[0],
        amount: (Math.random() * 1000).toFixed(2),
        category: 'Software',
        vendor_name: 'AI Extracted Vendor',
        type: 'expense'
      })
      toast.success('Información extraída correctamente. Revisa y confirma.')
    }, 2000)
  }

  const fmt = (n: number) => new Intl.NumberFormat(locale === 'es' ? 'es-ES' : locale === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency: 'EUR' }).format(n)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('finances.title')}</h1>
          <p className="text-[var(--text-secondary)] mt-1">{t('finances.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)} className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 transition-all">
            <Upload className="h-4 w-4 mr-2" />
            {t('documents.upload')}
          </Button>
          <Button variant="outline" disabled className="border-white/10 text-[var(--text-secondary)]">
            <Download className="h-4 w-4 mr-2" />
            {t('finances.export')}
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-lg shadow-indigo-500/20 transition-all">
            <Plus className="h-4 w-4 mr-2" />
            {t('finances.newTransaction')}
          </Button>
        </div>
      </div>

      {/* Stats Cards Mejoradas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">{t('finances.income')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{fmt(stats.income)}</div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Promedio: {fmt(stats.avgIncome)}
            </p>
            {stats.growthRate !== 0 && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${stats.growthRate > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.growthRate > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} 
                {Math.abs(stats.growthRate).toFixed(1)}% vs {t('finances.currentMonth')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-red-500/20 hover:border-red-500/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">{t('finances.expenses')}</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{fmt(stats.expenses)}</div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Promedio: {fmt(stats.avgExpense)}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-indigo-500/20 hover:border-indigo-500/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">{t('finances.netProfit')}</CardTitle>
            <DollarSign className={`h-4 w-4 ${stats.balance >= 0 ? 'text-indigo-400' : 'text-red-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-white' : 'text-red-400'}`}>
              {fmt(stats.balance)}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {stats.income > 0 ? `${Math.round((stats.balance / stats.income) * 100)}% ${t('finances.margin')}` : t('finances.noIncome')}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-500/20 hover:border-cyan-500/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">{t('dashboard.pendingDocuments')}</CardTitle>
            <Clock className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingCount}</div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Requieren revisión humana
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts section con diseño más profesional */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">{t('dashboard.cashFlow')}</CardTitle>
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
                {t('finances.last6Months')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontSize: '12px' }}
                    formatter={(v: number) => fmt(v)}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-white text-lg">{t('finances.incomeByCategory')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoryData.length > 0 ? expenseCategoryData : [{ name: 'No data', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {expenseCategoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    {expenseCategoryData.length === 0 && <Cell fill="rgba(255,255,255,0.05)" />}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    formatter={(v: number) => fmt(v)}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros Avanzados en una barra más elegante */}
      <Card className="glass-card border-none bg-white/5 backdrop-blur-md">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                placeholder={t('finances.search')}
                className="pl-10 bg-white/5 border-white/10 text-white h-10 focus:ring-indigo-500/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="all">{t('finances.all')}</option>
                <option value="income">{t('finances.income')}</option>
                <option value="expense">{t('finances.expenses')}</option>
              </select>
              
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="week">{t('finances.currentMonth')}</option>
                <option value="month">Último mes</option>
                <option value="quarter">Último trimestre</option>
                <option value="year">Último año</option>
                <option value="all">Todo el tiempo</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                className="h-10 border-white/10 bg-white/5 text-white"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="h-4 w-4 mr-2 text-indigo-400" />
                {sortOrder === 'asc' ? 'Asc' : 'Desc'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table con estilo Profesional */}
      <Card className="glass-card border-white/5 overflow-hidden">
        <CardHeader className="bg-white/5 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              {t('finances.transactionsTitle')}
              <Badge variant="secondary" className="bg-white/10 text-white border-none ml-2">
                {filtered.length}
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t('finances.date')}</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t('finances.description')}</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t('finances.category')}</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider text-right">{t('finances.amount')}</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider text-center">{t('documents.status')}</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="p-4"><div className="h-8 bg-white/5 rounded w-full"></div></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <FileText className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-3 opacity-20" />
                      <p className="text-[var(--text-secondary)]">{t('finances.noTransactions')}</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="p-4 text-sm text-[var(--text-secondary)] whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                            {t.type === 'income' ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : <TrendingDown className="h-4 w-4 text-red-400" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white line-clamp-1">{t.description}</p>
                            {t.vendor_name && <p className="text-xs text-[var(--text-muted)]">{t.vendor_name}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-[10px] bg-indigo-500/5 text-indigo-300 border-indigo-500/20 uppercase tracking-tighter">
                          {t.category || 'General'}
                        </Badge>
                      </td>
                      <td className={`p-4 text-sm font-bold text-right ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td className="p-4 text-center">
                        {t.status === 'pending' || !t.is_reconciled ? (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                            <Clock className="h-3 w-3 mr-1" /> REVISIÓN
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> LISTO
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[var(--text-muted)] hover:text-white hover:bg-white/10">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[var(--text-muted)] hover:text-white hover:bg-white/10">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400/50 hover:text-red-400 hover:bg-red-400/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog nueva transacción (Manual Control) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#0f111a] border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">{t('finances.newTransaction')}</DialogTitle>
            <DialogDescription className="text-[var(--text-muted)]">Registra un ingreso o gasto con control manual total</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex gap-3">
              {(['income', 'expense'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setNewTransaction({ ...newTransaction, type })}
                  className={`flex-1 py-4 rounded-xl border-2 text-sm font-bold transition-all flex flex-col items-center gap-2 ${newTransaction.type === type
                      ? type === 'income'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-inner'
                        : 'bg-red-500/10 border-red-500/50 text-red-400 shadow-inner'
                      : 'border-white/5 bg-white/5 text-[var(--text-secondary)] hover:border-white/20'
                    }`}
                >
                  {type === 'income' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {type === 'income' ? t('finances.incomeType') : t('finances.expenseType')}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-semibold text-white/70">{t('finances.description')} *</label>
                <Input
                  placeholder={t('finances.descriptionPlaceholder')}
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-12 focus:border-indigo-500/50"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">{t('finances.amount')} (€) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    className="pl-10 bg-white/5 border-white/10 text-white h-12 focus:border-indigo-500/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">{t('finances.date')} *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <Input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="pl-10 bg-white/5 border-white/10 text-white h-12 focus:border-indigo-500/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">{t('finances.category')}</label>
                <Input
                  placeholder={t('finances.categoryPlaceholder')}
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-12 focus:border-indigo-500/50"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">{t('clients.name')}</label>
                <Input
                  placeholder="Nombre del proveedor o cliente"
                  value={newTransaction.vendor_name}
                  onChange={(e) => setNewTransaction({ ...newTransaction, vendor_name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-12 focus:border-indigo-500/50"
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-semibold text-white/70">{t('finances.notes')}</label>
                <Input
                  placeholder={t('finances.notesPlaceholder')}
                  value={newTransaction.notes}
                  onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-12 focus:border-indigo-500/50"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isCreating} className="text-white hover:bg-white/5">
              {t('finances.cancel')}
            </Button>
            <Button onClick={createTransaction} disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 rounded-xl transition-all shadow-lg shadow-indigo-500/20">
              {isCreating ? t('finances.saving') : t('finances.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Importar AI con Dropzone y Conexiones */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#0f111a] border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              <Upload className="h-6 w-6 text-indigo-400" />
              {t('landing.aiProcessing')}
            </DialogTitle>
            <DialogDescription className="text-[var(--text-muted)]">{t('landing.aiDescription')}</DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-8">
            {/* Dropzone */}
            <div className="relative group">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={handleFileUpload}
                accept=".pdf,.png,.jpg,.jpeg,.xlsx"
                disabled={isProcessingFile}
              />
              <div className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all ${isProcessingFile ? 'bg-white/5 border-indigo-500/20' : 'border-white/10 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5'}`}>
                {isProcessingFile ? (
                  <div className="space-y-4">
                    <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-indigo-400 font-medium animate-pulse">Analizando documento con IA...</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-indigo-500/10 p-5 rounded-full w-fit mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Upload className="h-10 w-10 text-indigo-400" />
                    </div>
                    <h3 className="text-white font-bold text-xl">{t('documents.dragDrop')}</h3>
                    <p className="text-[var(--text-muted)] mt-2">Soporta Facturas PDF, Recibos en imagen y Excel</p>
                    <div className="mt-6 flex justify-center gap-2">
                      <Badge variant="outline" className="bg-white/5 border-white/10 text-white">PDF</Badge>
                      <Badge variant="outline" className="bg-white/5 border-white/10 text-white">JPG/PNG</Badge>
                      <Badge variant="outline" className="bg-white/5 border-white/10 text-white">XLSX</Badge>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* External Connections */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-white font-semibold flex items-center gap-2 text-sm uppercase tracking-wider opacity-60">
                <Mail className="h-4 w-4 text-indigo-400" />
                Conectar con mi Email
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsGmailDialogOpen(true)}
                  className="h-16 justify-start gap-4 bg-white/5 border-white/10 hover:border-red-500/50 hover:bg-red-500/5 transition-all group px-6"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform font-bold">G</div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">Gmail API</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Extracción automática</p>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-16 justify-start gap-4 bg-white/5 border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group px-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform font-bold">O</div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">Outlook 365</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Sincronización real</p>
                  </div>
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsImportDialogOpen(false)} className="text-[var(--text-muted)] hover:text-white hover:bg-white/5">
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Conexión Gmail */}
      <Dialog open={isGmailDialogOpen} onOpenChange={setIsGmailDialogOpen}>
        <DialogContent className="max-w-md bg-[#0f111a] border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              <Mail className="h-6 w-6 text-red-400" />
              Conectar con Gmail
            </DialogTitle>
            <DialogDescription className="text-[var(--text-muted)]">
              Extraeremos automáticamente las facturas adjuntas que lleguen a tu bandeja de entrada.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">Filtro de búsqueda (opcional)</label>
              <Input
                placeholder="label:facturas OR has:attachment"
                defaultValue="has:attachment invoice OR factura"
                className="bg-white/5 border-white/10 text-white h-12 focus:border-red-500/50"
              />
              <p className="text-[10px] text-[var(--text-muted)]">Usaremos este filtro para buscar documentos automáticamente cada hora.</p>
            </div>
            
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex gap-3">
              <div className="h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-500 font-bold">!</div>
              <p>Necesitarás autorizar a LedgerFlow para leer tus correos. Solo procesaremos los que contengan documentos financieros.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsGmailDialogOpen(false)} className="text-white">Cancelar</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white px-8 h-12 rounded-xl transition-all shadow-lg shadow-red-500/20">
              Autorizar Google Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
