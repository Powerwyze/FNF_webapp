import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { requireUser } from '@/lib/serverAuth'

const RANK_THRESHOLDS = {
  E: 0,
  D: 50,
  C: 150,
  B: 350,
  A: 650,
  S: 1000
}

function getRankForExp(exp: number): string {
  if (exp >= RANK_THRESHOLDS.S) return 'S'
  if (exp >= RANK_THRESHOLDS.A) return 'A'
  if (exp >= RANK_THRESHOLDS.B) return 'B'
  if (exp >= RANK_THRESHOLDS.C) return 'C'
  if (exp >= RANK_THRESHOLDS.D) return 'D'
  return 'E'
}

export async function POST(req: NextRequest) {
  const { userId, expGain = 10 } = await req.json()
  
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
    // Fetch current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('exp, rank, rank_locked_until, class')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 })
    }

    const oldExp = profile.exp
    const newExp = oldExp + expGain
    const oldRank = profile.rank
    const newRank = getRankForExp(newExp)
    
    // Check if rank increased
    let rankLockedUntil = profile.rank_locked_until
    if (newRank !== oldRank && RANK_THRESHOLDS[newRank as keyof typeof RANK_THRESHOLDS] > RANK_THRESHOLDS[oldRank as keyof typeof RANK_THRESHOLDS]) {
      // Rank up! Reset 30-day invincibility
      const now = new Date()
      rankLockedUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        exp: newExp,
        rank: newRank,
        rank_locked_until: rankLockedUntil,
        last_workout_at: new Date().toISOString(),
        qr_payload: `PXH|class=${profile.class || 'Fighter'}|rank=${newRank}`
      })
      .eq('id', userId)

    if (updateError) throw updateError

    // Log EXP change
    const { error: logError } = await supabase
      .from('exp_log')
      .insert({
        user_id: userId,
        delta: expGain,
        reason: 'workout'
      })

    if (logError) throw logError

    return Response.json({
      success: true,
      oldExp,
      newExp,
      expGain,
      oldRank,
      newRank,
      rankUp: newRank !== oldRank,
      rankLockedUntil
    })
  } catch (error) {
    console.error('Workout log error:', error)
    return Response.json({ error: 'Failed to log workout' }, { status: 500 })
  }
}


