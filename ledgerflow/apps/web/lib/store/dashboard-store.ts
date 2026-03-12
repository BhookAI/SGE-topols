import { create } from 'zustand'

interface DashboardStats {
  total_clients: number
  total_projects: number
  active_projects: number
  total_documents: number
  pending_documents: number
  total_income: number
  total_expenses: number
  balance: number
}

interface RecentActivity {
  id: string
  type: string
  title: string
  description: string
  created_at: string
  project?: {
    title: string
  }
  client?: {
    full_name: string
  }
}

interface CashFlowData {
  month: string
  income: number
  expenses: number
  balance: number
}

interface DashboardState {
  stats: DashboardStats | null
  recentActivities: RecentActivity[]
  cashFlowData: CashFlowData[]
  isLoading: boolean
  
  // Actions
  setStats: (stats: DashboardStats) => void
  setRecentActivities: (activities: RecentActivity[]) => void
  setCashFlowData: (data: CashFlowData[]) => void
  setLoading: (loading: boolean) => void
  refreshDashboard: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  recentActivities: [],
  cashFlowData: [],
  isLoading: false,
  
  setStats: (stats) => set({ stats }),
  setRecentActivities: (activities) => set({ recentActivities: activities }),
  setCashFlowData: (data) => set({ cashFlowData: data }),
  setLoading: (isLoading) => set({ isLoading }),
  
  refreshDashboard: async () => {
    set({ isLoading: true })
    try {
      const [statsRes, activitiesRes, cashFlowRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activities'),
        fetch('/api/dashboard/cashflow'),
      ])
      
      if (statsRes.ok) {
        const stats = await statsRes.json()
        set({ stats })
      }
      
      if (activitiesRes.ok) {
        const activities = await activitiesRes.json()
        set({ recentActivities: activities })
      }
      
      if (cashFlowRes.ok) {
        const cashFlow = await cashFlowRes.json()
        set({ cashFlowData: cashFlow })
      }
    } catch (error) {
      console.error('Error refreshing dashboard:', error)
    } finally {
      set({ isLoading: false })
    }
  },
}))
