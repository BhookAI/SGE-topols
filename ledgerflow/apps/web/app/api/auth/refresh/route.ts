import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: { session }, error } = await supabase.auth.refreshSession()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!session) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Error refreshing session:', error)
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    )
  }
}
