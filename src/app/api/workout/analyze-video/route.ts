import { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { FileState, GoogleAIFileManager } from '@google/generative-ai/server'
import { requireUser } from '@/lib/serverAuth'

export const runtime = 'nodejs'

const MAX_VIDEO_BYTES = 100 * 1024 * 1024
const INLINE_FALLBACK_MAX_BYTES = 20 * 1024 * 1024
const FILE_POLL_MS = 2000
const FILE_POLL_ATTEMPTS = 20
const DEFAULT_MODEL_CANDIDATES = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite']

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

function parseAnalysis(text: string) {
  const jsonText = extractJson(text)
  if (!jsonText) {
    throw new Error('Gemini did not return JSON')
  }
  const parsed = JSON.parse(jsonText) as {
    reps?: number
    confidence?: string
    notes?: string
  }

  return {
    reps: Number.isFinite(parsed.reps) ? Math.max(0, Math.floor(Number(parsed.reps))) : 0,
    confidence: ['low', 'medium', 'high'].includes(String(parsed.confidence))
      ? String(parsed.confidence)
      : 'low',
    notes: String(parsed.notes ?? '').slice(0, 240)
  }
}

function getModelCandidates() {
  const envModel = process.env.GEMINI_VIDEO_MODEL?.trim()
  const models = envModel ? [envModel, ...DEFAULT_MODEL_CANDIDATES] : DEFAULT_MODEL_CANDIDATES
  return [...new Set(models)]
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function isMissingModelError(error: unknown) {
  const msg = getErrorMessage(error).toLowerCase()
  return msg.includes('404') && msg.includes('not found') && msg.includes('models/')
}

async function runAnalysisWithModelFallback(args: {
  genAI: GoogleGenerativeAI
  prompt: string
  part: { fileData: { mimeType: string; fileUri: string } } | { inlineData: { data: string; mimeType: string } }
}) {
  const tried: string[] = []
  const modelCandidates = getModelCandidates()

  for (const modelName of modelCandidates) {
    tried.push(modelName)
    const model = args.genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' }
    })

    try {
      const result = await model.generateContent([args.prompt, args.part])
      return parseAnalysis(result.response.text() ?? '')
    } catch (error) {
      if (isMissingModelError(error)) continue
      throw new Error(`[${modelName}] ${getErrorMessage(error)}`)
    }
  }

  throw new Error(`No supported Gemini model found. Tried: ${tried.join(', ')}`)
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
    try {
      const fileAnalysis = await runAnalysisWithModelFallback({
        genAI,
        prompt,
        part: {
          fileData: {
            mimeType: file.mimeType,
            fileUri: file.uri
          }
        }
      })
      return Response.json(fileAnalysis)
    } catch (fileError) {
      if (bytes.byteLength > INLINE_FALLBACK_MAX_BYTES) {
        const message = getErrorMessage(fileError)
        return Response.json({ error: message }, { status: 502 })
      }

      try {
        const inlineAnalysis = await runAnalysisWithModelFallback({
          genAI,
          prompt,
          part: {
            inlineData: {
              data: bytes.toString('base64'),
              mimeType: clip.type || 'video/webm'
            }
          }
        })
        return Response.json(inlineAnalysis)
      } catch (inlineError) {
        const fileMessage = getErrorMessage(fileError)
        const inlineMessage = getErrorMessage(inlineError)
        return Response.json({ error: `Gemini analysis failed. Files: ${fileMessage}. Inline: ${inlineMessage}` }, { status: 502 })
      }
    }
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
