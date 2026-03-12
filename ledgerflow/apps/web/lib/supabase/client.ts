import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para componentes de servidor
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para componentes de cliente
export const supabaseClient = createClientComponentClient()

// Tipos de la base de datos
export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          invitation_code: string
          plan: 'free' | 'pro' | 'enterprise'
          max_clients: number
          max_projects: number
          max_storage_mb: number
          is_active: boolean
          created_at: string
        }
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          email: string
          role: 'superadmin' | 'admin' | 'accountant' | 'viewer'
          full_name: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
        }
      }
      clients: {
        Row: {
          id: string
          tenant_id: string
          access_code: string
          full_name: string
          email: string | null
          phone: string | null
          company_name: string | null
          is_active: boolean
          last_access: string | null
          created_at: string
        }
      }
      projects: {
        Row: {
          id: string
          tenant_id: string
          client_id: string | null
          title: string
          description: string | null
          status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          budget: number | null
          spent: number
          progress: number
          start_date: string | null
          end_date: string | null
          created_at: string
        }
      }
      documents: {
        Row: {
          id: string
          tenant_id: string
          client_id: string | null
          project_id: string | null
          file_name: string
          file_type: string
          file_size: number
          storage_url: string
          status: 'uploaded' | 'processing' | 'processed' | 'verified' | 'error'
          document_type: string | null
          extracted_data: any
          confidence: number | null
          created_at: string
        }
      }
      transactions: {
        Row: {
          id: string
          tenant_id: string
          project_id: string | null
          document_id: string | null
          type: 'income' | 'expense' | 'transfer' | 'refund'
          category: string | null
          amount: number
          currency: string
          date: string
          description: string | null
          vendor_name: string | null
          is_reconciled: boolean
          created_at: string
        }
      }
    }
  }
}
