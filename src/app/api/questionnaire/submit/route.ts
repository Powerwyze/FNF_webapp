import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
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
    const classMapping: Record<keyof Weights, string> = {
      aesthetics_weight: 'Fighter',
      strength_weight: 'Tank',
      mobility_weight: 'Assassin',
      athletic_weight: 'Ranger',
      generalist_weight: 'Healer/Mage'
    }

    const entries = Object.entries(weights).sort((a, b) => b[1] - a[1])
    let className = classMapping[entries[0][0] as keyof Weights]
    
    // Check for tie (within 2 points)
    if (entries[1] && Math.abs(entries[0][1] - entries[1][1]) <= 2) {
      // Use OpenAI for tie-breaking
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      
      const tieBreakPrompt = `Based on the following fitness questionnaire responses and scoring, determine the most appropriate class for this user.

Top scoring axes:
1. ${entries[0][0].replace('_weight', '')}: ${entries[0][1]} points
2. ${entries[1][0].replace('_weight', '')}: ${entries[1][1]} points

Classes:
- Fighter: aesthetics-focused, lose weight & gain muscular physique
- Tank: strength-focused, bodybuilder/powerlifter strength
- Assassin: mobility-focused, flexibility, balance, endurance
- Ranger: athletic-focused, athletic performance & endurance
- Healer/Mage: generalist, well-rounded fitness

User's responses indicate preferences for both ${entries[0][0].replace('_weight', '')} and ${entries[1][0].replace('_weight', '')} training styles.

Return only the class name (Fighter, Tank, Assassin, Ranger, or Healer/Mage).`

      try {
        const completion = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: tieBreakPrompt }],
          max_tokens: 50
        })
        const suggestedClass = completion.choices[0]?.message?.content?.trim()
        if (suggestedClass && ['Fighter', 'Tank', 'Assassin', 'Ranger', 'Healer/Mage'].includes(suggestedClass)) {
          className = suggestedClass
        }
      } catch (e) {
        console.error('OpenAI tie-break failed:', e)
      }
    }

    // Generate goal summary
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    let goalSummary = 'Embark on your fitness journey'
    
    try {
      const summaryPrompt = `Create a 1-2 sentence motivating personal goal statement for a ${className} in the Fitness N Fighting program. Their top training priorities are ${entries[0][0].replace('_weight', '')} and ${entries[1][0].replace('_weight', '')}. Keep it inspiring and specific to their class archetype.`
      
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: summaryPrompt }],
        max_tokens: 100
      })
      goalSummary = completion.choices[0]?.message?.content?.trim() || goalSummary
    } catch (e) {
      console.error('Goal summary generation failed:', e)
    }

    // Create or update profile
    const now = new Date()
    const rankLockedUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    const qrPayload = `FNF|class=${className}|rank=E`

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


