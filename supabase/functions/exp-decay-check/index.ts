import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

Deno.serve(async (_req) => {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Find profiles eligible for decay
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, exp, rank, last_workout_at')
      .or(`rank_locked_until.is.null,rank_locked_until.lt.${now.toISOString()}`)
      .or(`last_workout_at.is.null,last_workout_at.lt.${thirtyDaysAgo.toISOString()}`)

    if (profilesError) throw profilesError

    const decayResults = []

    for (const profile of profiles || []) {
      // Check if already had decay in last 30 days
      const { data: recentDecay } = await supabase
        .from('exp_log')
        .select('id')
        .eq('user_id', profile.id)
        .eq('reason', 'decay')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .limit(1)

      if (recentDecay && recentDecay.length > 0) {
        continue // Skip if already decayed recently
      }

      // Apply decay
      const newExp = Math.max(0, profile.exp - 30)
      const newRank = getRankForExp(newExp)

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          exp: newExp, 
          rank: newRank,
          qr_payload: supabase.rpc('concat_strings', { 
            str1: 'FNF|class=', 
            str2: supabase.rpc('get_profile_class', { profile_id: profile.id }),
            str3: '|rank=',
            str4: newRank
          })
        })
        .eq('id', profile.id)

      if (!updateError) {
        // Log the decay
        await supabase
          .from('exp_log')
          .insert({
            user_id: profile.id,
            delta: -30,
            reason: 'decay'
          })

        decayResults.push({
          userId: profile.id,
          oldExp: profile.exp,
          newExp,
          oldRank: profile.rank,
          newRank
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: decayResults.length,
        results: decayResults
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
