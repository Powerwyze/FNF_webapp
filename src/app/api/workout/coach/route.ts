import { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { requireUser } from '@/lib/serverAuth'

export async function POST(req: NextRequest) {
  try {
    const { userId, questTitle, workout, phase, reps, targetReps, leftElbowAngle, rightElbowAngle } = await req.json()

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

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({
        tip: `Keep steady pace. Reps: ${reps}/${targetReps}.`
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction:
        'You are a concise real-time workout coach. Respond with one short cue only, under 14 words.'
    })

    const prompt = [
      `Quest: ${questTitle}.`,
      `Workout: ${workout}.`,
      `Phase: ${phase}.`,
      `Reps: ${reps}/${targetReps}.`,
      `Elbow angles: left=${Math.round(Number(leftElbowAngle) || 0)}, right=${Math.round(Number(rightElbowAngle) || 0)}.`,
      'Give one immediate coaching cue for the next rep.'
    ].join(' ')

    const result = await model.generateContent(prompt)
    const tip = result.response.text()?.trim() || `Keep going. Reps: ${reps}/${targetReps}.`
    return Response.json({ tip })
  } catch (error) {
    return Response.json({ tip: 'Drive through the full range and keep your core tight.' })
  }
}

