import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type AuthResult = { user: { id: string } | null; error?: string }

export async function requireUser(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return { user: null, error: 'Missing auth token' }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return { user: null, error: 'Supabase config missing' }
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return { user: null, error: 'Invalid auth token' }
  }

  return { user: { id: data.user.id } }
}
