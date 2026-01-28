import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { requireUser } from '@/lib/serverAuth'

export async function POST(req: NextRequest) {
  const { userId, bio } = await req.json()
  
  if (!userId) {
    return Response.json({ error: 'Missing userId' }, { status: 400 })
  }
  const auth = await requireUser(req)
  if (!auth.user) {
    return Response.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
  }
  if (auth.user.id !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ bio })
      .eq('id', userId)

    if (error) throw error

    return Response.json({ success: true, bio })
  } catch (error) {
    console.error('Bio update error:', error)
    return Response.json({ error: 'Failed to update bio' }, { status: 500 })
  }
}
