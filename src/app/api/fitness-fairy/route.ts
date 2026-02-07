import { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabaseClient'
import { requireUser } from '@/lib/serverAuth'

export async function POST(req: NextRequest) {
  const { message, userId } = await req.json()
  if (userId) {
    const auth = await requireUser(req)
    if (!auth.user) {
      return Response.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }
    if (auth.user.id !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return Response.json({ reply: 'The Fitness Fairy is resting. Try again later.' }, { status: 500 })
  }
  const genAI = new GoogleGenerativeAI(apiKey)

  // Default values if no profile found
  let className = 'Fighter'
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

  const system = `You are **Fitness Fairy**, the playful guide for Project X Hero. The user is class **${className}**, rank **${rank}**, EXP **${exp}**. Goal summary: **${goalSummary}**.
Provide: (1) this week's 3-5 workout focuses, (2) 1 warm-up + 2 mobility drills that fit their class, (3) 2-3 high-level dietary tips, (4) one 'challenge prep' tip for the next Project X Hero event. Keep answers specific and short. Use encouraging, game-like tone.
End every message with: *This is general guidance, not medical advice or a substitute for a certified trainer or dietitian.*`

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: system
    })
    const result = await model.generateContent(String(message ?? ''))
    const reply = result.response.text() ?? ''
    return Response.json({ reply })
  } catch (e) {
    return Response.json({ reply: 'The Fitness Fairy is resting. Try again later.' }, { status: 500 })
  }
}
