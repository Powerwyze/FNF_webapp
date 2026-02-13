import { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { FileState, GoogleAIFileManager } from '@google/generative-ai/server'
import { requireUser } from '@/lib/serverAuth'

export const runtime = 'nodejs'

const MAX_VIDEO_BYTES = 100 * 1024 * 1024
const FILE_POLL_MS = 2000
const FILE_POLL_ATTEMPTS = 20

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
  let uploadedFileName: string | null = null
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
      return Response.json({ error: 'Video must be between 1 byte and 100 MB' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'Gemini key not configured' }, { status: 500 })
    }

    const bytes = Buffer.from(await clip.arrayBuffer())
    const fileManager = new GoogleAIFileManager(apiKey)
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    })

    const uploadResponse = await fileManager.uploadFile(bytes, {
      mimeType: clip.type || 'video/webm',
      displayName: `${workout}-upload-${Date.now()}`
    })
    uploadedFileName = uploadResponse.file.name

    let file = uploadResponse.file
    for (let i = 0; i < FILE_POLL_ATTEMPTS; i += 1) {
      if (file.state === FileState.ACTIVE) break
      if (file.state === FileState.FAILED) {
        return Response.json({ error: file.error?.message || 'Gemini failed to process the video' }, { status: 502 })
      }
      await sleep(FILE_POLL_MS)
      const refreshed = await fileManager.getFile(file.name)
      file = refreshed
    }

    if (file.state !== FileState.ACTIVE) {
      return Response.json({ error: 'Video is still processing in Gemini. Try again shortly.' }, { status: 504 })
    }

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
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri
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
    const message = error instanceof Error && error.message ? error.message : 'Failed to analyze video'
    return Response.json({ error: message }, { status: 500 })
  } finally {
    if (uploadedFileName && process.env.GEMINI_API_KEY) {
      try {
        const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY)
        await fileManager.deleteFile(uploadedFileName)
      } catch {
        // Best-effort cleanup only.
      }
    }
  }
}
