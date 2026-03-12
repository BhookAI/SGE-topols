import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  tenant_id: string
  avatar_url?: string
}

interface Client {
  id: string
  access_code: string
  full_name: string
  email: string
  phone?: string
  company_name?: string
  tenant_id: string
}

interface AuthState {
  user: User | null
  client: Client | null
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setClient: (client: Client | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  clearClient: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      client: null,
      isLoading: true,
      
      setUser: (user) => set({ user }),
      setClient: (client) => set({ client }),
      setLoading: (isLoading) => set({ isLoading }),
      
      logout: () => {
        set({ user: null, client: null })
        // Limpiar cookies
        if (typeof document !== 'undefined') {
          document.cookie = 'client_code=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        }
      },
      
      clearClient: () => {
        set({ client: null })
        if (typeof document !== 'undefined') {
          document.cookie = 'client_code=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
