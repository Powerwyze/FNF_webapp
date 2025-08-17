import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: NextRequest) {
  const { userId, bio } = await req.json()
  
  if (!userId) {
    return Response.json({ error: 'Missing userId' }, { status: 400 })
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
