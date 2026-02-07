import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/serverAuth'

export async function POST(req: NextRequest) {
  const auth = await requireUser(req)
  if (!auth.user) {
    return Response.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
  }

  // Lazily create client at request time to avoid build-time env access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { userId, email } = await req.json()
  
  if (!userId || !email) {
    return Response.json({ error: 'Missing userId or email' }, { status: 400 })
  }
  if (auth.user.id !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Check if profile already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existing) {
      return Response.json({ message: 'Profile already exists', profileId: userId })
    }

    // Create new profile
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        display_name: email.split('@')[0], // Default display name from email
        bio: 'New hero entering the guild.'
      })

    if (error) throw error

    return Response.json({ success: true, profileId: userId })
  } catch (error) {
    console.error('Profile seed error:', error)
    return Response.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}
