import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { requireUser } from '@/lib/serverAuth'

// Create admin client for profile operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Create regular client for questionnaire operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Weights = {
  aesthetics_weight: number
  strength_weight: number
  mobility_weight: number
  athletic_weight: number
  generalist_weight: number
}

async function generateText(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const result = await model.generateContent(prompt)
  return result.response.text()?.trim() || null
}

export async function POST(req: NextRequest) {
  const { userId, responses } = await req.json()

  if (!userId || !responses) {
    return Response.json({ error: 'Missing userId or responses' }, { status: 400 })
  }
  const auth = await requireUser(req)
  if (!auth.user) {
    return Response.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
  }
  if (auth.user.id !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Save responses to database
    for (const [questionId, choiceKey] of Object.entries(responses)) {
      await supabase
        .from('questionnaire_responses')
        .upsert({
          user_id: userId,
          question_id: parseInt(questionId),
          choice_key: choiceKey as string
        })
    }

    // Fetch questions with weight mappings
    const { data: questions } = await supabase
      .from('questionnaire_questions')
      .select('id, weight_keys')
      .order('order_index')

    // Calculate weights
    const weights: Weights = {
      aesthetics_weight: 0,
      strength_weight: 0,
      mobility_weight: 0,
      athletic_weight: 0,
      generalist_weight: 0
    }

    for (const question of questions || []) {
      const choiceKey = responses[question.id]
      if (choiceKey && question.weight_keys?.[choiceKey]) {
        const increments = question.weight_keys[choiceKey]
        for (const [axis, value] of Object.entries(increments)) {
          weights[axis as keyof Weights] += value as number
        }
      }
    }

    // Determine class
    const classScores: Record<string, number> = {
      Fighter: weights.aesthetics_weight + weights.strength_weight,
      Archer: weights.athletic_weight,
      Wizard: weights.mobility_weight,
      Cleric: weights.generalist_weight
    }

    const entries = Object.entries(classScores).sort((a, b) => b[1] - a[1])
    let className = entries[0][0]

    // Check for tie (within 2 points)
    if (entries[1] && Math.abs(entries[0][1] - entries[1][1]) <= 2) {
      const tieBreakPrompt = `Based on the following Project X Hero questionnaire scoring, determine the most appropriate class for this user.

Top scoring classes:
1. ${entries[0][0]}: ${entries[0][1]} points
2. ${entries[1][0]}: ${entries[1][1]} points

Classes:
- Fighter: strength and physique focus
- Archer: athletic performance and conditioning
- Wizard: mobility, skill, and technique focus
- Cleric: balanced, well-rounded fitness

User's responses indicate preferences for both ${entries[0][0]} and ${entries[1][0]} training styles.

Return only the class name (Fighter, Archer, Wizard, or Cleric).`

      try {
        const suggestedClass = await generateText(tieBreakPrompt)
        if (suggestedClass && ['Fighter', 'Archer', 'Wizard', 'Cleric'].includes(suggestedClass)) {
          className = suggestedClass
        }
      } catch (e) {
        console.error('Gemini tie-break failed:', e)
      }
    }

    // Generate goal summary
    let goalSummary = 'Embark on your fitness journey'

    try {
      const summaryPrompt = `Create a 1-2 sentence motivating personal goal statement for a ${className} in Project X Hero. Their top training priorities are ${entries[0][0]} and ${entries[1][0]}. Keep it inspiring and specific to their class archetype.`
      const summary = await generateText(summaryPrompt)
      goalSummary = summary || goalSummary
    } catch (e) {
      console.error('Goal summary generation failed:', e)
    }

    // Create or update profile
    const now = new Date()
    const rankLockedUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    const qrPayload = `PXH|class=${className}|rank=E`

    // First check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    let profileError
    if (existingProfile) {
      // Update existing profile
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          class: className,
          rank: 'E',
          exp: 0,
          rank_locked_until: rankLockedUntil.toISOString(),
          goal_summary: goalSummary,
          qr_payload: qrPayload
        })
        .eq('id', userId)
      profileError = error
    } else {
      // Create new profile
      const { error } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          class: className,
          rank: 'E',
          exp: 0,
          rank_locked_until: rankLockedUntil.toISOString(),
          goal_summary: goalSummary,
          qr_payload: qrPayload,
          created_at: now.toISOString()
        })
      profileError = error
    }

    if (profileError) throw profileError

    return Response.json({
      class: className,
      rank: 'E',
      exp: 0,
      goal_summary: goalSummary,
      qr_payload: qrPayload,
      rank_locked_until: rankLockedUntil.toISOString()
    })
  } catch (error) {
    console.error('Questionnaire submission error:', error)
    console.error('User ID:', userId)
    console.error('Responses count:', Object.keys(responses).length)
    return Response.json({
      error: 'Failed to process questionnaire',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
