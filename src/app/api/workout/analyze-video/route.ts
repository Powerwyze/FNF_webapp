import { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { requireUser } from '@/lib/serverAuth'

const MAX_VIDEO_BYTES = 20 * 1024 * 1024

function extractJson(text: string) {
  const trimmed = text.trim()
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fenceMatch?.[1]) return fenceMatch[1].trim()

  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1).trim()
  }

  return ''
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const userId = String(form.get('userId') ?? '')
    const workout = String(form.get('workout') ?? 'Push-ups')
    const targetReps = Number(form.get('targetReps') ?? 10)
    const clip = form.get('video')

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

    if (!(clip instanceof File)) {
      return Response.json({ error: 'Missing video file' }, { status: 400 })
    }
    if (!clip.type.startsWith('video/')) {
      return Response.json({ error: 'Invalid file type' }, { status: 400 })
    }
    if (clip.size <= 0 || clip.size > MAX_VIDEO_BYTES) {
      return Response.json({ error: 'Video must be between 1 byte and 20 MB' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'Gemini key not configured' }, { status: 500 })
    }

    const bytes = Buffer.from(await clip.arrayBuffer())
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    })

    const prompt = [
      'Analyze this workout video and estimate full reps completed by the person.',
      `Workout type: ${workout}.`,
      `Target reps: ${targetReps}.`,
      'Count only complete reps with visible range of motion.',
      'Return strict JSON with this shape:',
      '{"reps": number, "confidence": "low"|"medium"|"high", "notes": string}'
    ].join(' ')

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: bytes.toString('base64'),
          mimeType: clip.type || 'video/webm'
        }
      }
    ])

    const raw = result.response.text() ?? ''
    const jsonText = extractJson(raw)
    if (!jsonText) {
      return Response.json({ error: 'Gemini did not return JSON' }, { status: 502 })
    }

    const parsed = JSON.parse(jsonText) as {
      reps?: number
      confidence?: string
      notes?: string
    }
    const reps = Number.isFinite(parsed.reps) ? Math.max(0, Math.floor(Number(parsed.reps))) : 0
    const confidence = ['low', 'medium', 'high'].includes(String(parsed.confidence))
      ? String(parsed.confidence)
      : 'low'
    const notes = String(parsed.notes ?? '').slice(0, 240)

    return Response.json({
      reps,
      confidence,
      notes
    })
  } catch (error) {
    console.error('Analyze video error:', error)
    return Response.json({ error: 'Failed to analyze video' }, { status: 500 })
  }
}
