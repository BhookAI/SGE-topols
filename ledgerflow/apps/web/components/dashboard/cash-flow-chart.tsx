'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStore } from '@/lib/store'

export function CashFlowChart() {
  const { cashFlowData, isLoading } = useDashboardStore()

  const data = cashFlowData.length > 0 ? cashFlowData : [
    { month: 'Ene', income: 4000, expenses: 2400, balance: 1600 },
    { month: 'Feb', income: 3000, expenses: 1398, balance: 1602 },
    { month: 'Mar', income: 2000, expenses: 9800, balance: -7800 },
    { month: 'Abr', income: 2780, expenses: 3908, balance: -1128 },
    { month: 'May', income: 1890, expenses: 4800, balance: -2910 },
    { month: 'Jun', income: 2390, expenses: 3800, balance: -1410 },
  ]

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Flujo de Caja</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4A4A4A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4A4A4A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                stroke="var(--text-muted)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'var(--text-primary)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="#FFFFFF"
                fill="url(#colorIncome)"
                name="Ingresos"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="1"
                stroke="#4A4A4A"
                fill="url(#colorExpenses)"
                name="Gastos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
