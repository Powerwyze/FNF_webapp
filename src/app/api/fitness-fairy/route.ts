import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: NextRequest) {
  const { message, userId } = await req.json()
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  // Default values if no profile found
  let className = 'Tank'
  let rank = 'E'
  let exp = 0
  let goalSummary = 'Getting started'

  // Try to fetch user profile if userId provided
  if (userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('class, rank, exp, goal_summary')
      .eq('id', userId)
      .single()
    
    if (profile) {
      className = profile.class || className
      rank = profile.rank
      exp = profile.exp
      goalSummary = profile.goal_summary || goalSummary
    }
  }

  const system = `You are **Fitness Fairy**, the playful guide for Fitness N Fighting (FNF). The user is class **${className}**, rank **${rank}**, EXP **${exp}**. Goal summary: **${goalSummary}**.
Provide: (1) this week's 3–5 workout focuses, (2) 1 warm-up + 2 mobility drills that fit their class, (3) 2–3 high-level dietary tips, (4) one 'challenge prep' tip for the next FNF popup. Keep answers specific and short. Use encouraging, game-like tone.
End every message with: *This is general guidance, not medical advice or a substitute for a certified trainer or dietitian.*`

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: String(message ?? '') }
      ]
    })
    const reply = completion.choices[0]?.message?.content ?? ''
    return Response.json({ reply })
  } catch (e) {
    return Response.json({ reply: 'The Fitness Fairy is resting. Try again later.' }, { status: 500 })
  }
}


