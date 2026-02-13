"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { QUESTS } from '@/data/quests'
import { MONSTER_PHASE_MEDIA } from '@/data/monsterPhases'
import { useAuth } from '@/contexts/AuthContext'

const TARGET_REPS = 10
const HALF_HEALTH_REP = 3
const MAX_RECORDING_MS = 15000
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
const RECORDER_VIDEO_BPS = 350000
const RECORDER_AUDIO_BPS = 16000

export default function VideoUploadQuestPage() {
  const params = useParams<{ questId: string }>()
  const router = useRouter()
  const { user, session } = useAuth()

  const previewRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingTimeoutRef = useRef<number | null>(null)

  const [cameraError, setCameraError] = useState('')
  const [cameraReady, setCameraReady] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState('')
  const [showSubmitPrompt, setShowSubmitPrompt] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [repCount, setRepCount] = useState(0)
  const [statusText, setStatusText] = useState('Record your workout clip, then submit for analysis.')
  const [coachTip, setCoachTip] = useState('Gemini coach tip will appear after analysis.')
  const [isMirrored, setIsMirrored] = useState(true)

  const quest = useMemo(
    () => QUESTS.find((q) => q.id === params.questId && q.mode === 'videoUpload'),
    [params.questId]
  )

  const monsterStage: 'full' | 'half' | 'dead' =
    repCount >= TARGET_REPS ? 'dead' : repCount >= HALF_HEALTH_REP ? 'half' : 'full'
  const monsterMediaSet = MONSTER_PHASE_MEDIA[quest?.monster ?? 'Goblin'] ?? MONSTER_PHASE_MEDIA.Goblin
  const monsterMedia = monsterMediaSet[monsterStage]

  useEffect(() => {
    let cancelled = false

    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'user' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        })
        if (cancelled) return
        streamRef.current = stream
        if (previewRef.current) {
          previewRef.current.srcObject = stream
          await previewRef.current.play()
        }
        setIsMirrored(true)
        setCameraReady(true)
      } catch (error) {
        console.error(error)
        setCameraError('Unable to access camera/microphone.')
      }
    }

    void initCamera()

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      if (recordingTimeoutRef.current) {
        window.clearTimeout(recordingTimeoutRef.current)
        recordingTimeoutRef.current = null
      }
      if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    }
  }, [])

  async function startRecording() {
    if (!streamRef.current) return
    setRecordedBlob(null)
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
      setRecordedUrl('')
    }
    setRepCount(0)
    setStatusText('Recording... perform controlled reps at moderate speed.')
    setShowSubmitPrompt(false)

    chunksRef.current = []
    const recorderMimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
      ? 'video/webm;codecs=vp8'
      : 'video/webm'
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: recorderMimeType,
      videoBitsPerSecond: RECORDER_VIDEO_BPS,
      audioBitsPerSecond: RECORDER_AUDIO_BPS
    })
    recorderRef.current = recorder

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunksRef.current.push(event.data)
    }
    recorder.onstop = () => {
      if (recordingTimeoutRef.current) {
        window.clearTimeout(recordingTimeoutRef.current)
        recordingTimeoutRef.current = null
      }
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      setRecordedBlob(blob)
      setRecordedUrl(url)
      setShowSubmitPrompt(true)
      const mb = (blob.size / (1024 * 1024)).toFixed(2)
      setStatusText(`Recording stopped (${mb} MB). Submit this workout for analysis?`)
    }

    recorder.start()
    setIsRecording(true)
    recordingTimeoutRef.current = window.setTimeout(() => {
      if (recorderRef.current && recorderRef.current.state === 'recording') {
        recorderRef.current.stop()
        setIsRecording(false)
        setStatusText('Auto-stopped at 15s to keep upload size small.')
      }
    }, MAX_RECORDING_MS)
  }

  function stopRecording() {
    if (!recorderRef.current || recorderRef.current.state === 'inactive') return
    if (recordingTimeoutRef.current) {
      window.clearTimeout(recordingTimeoutRef.current)
      recordingTimeoutRef.current = null
    }
    recorderRef.current.stop()
    setIsRecording(false)
  }

  async function analyzeRecording() {
    if (!quest || !recordedBlob || !user || !session?.access_token) return
    setShowSubmitPrompt(false)
    setAnalyzing(true)
    setStatusText('Analyzing video with Gemini...')

    try {
      if (recordedBlob.size > MAX_UPLOAD_BYTES) {
        const size = (recordedBlob.size / (1024 * 1024)).toFixed(2)
        throw new Error(`Clip too large (${size} MB). Keep the set under 15 seconds and record again.`)
      }

      const authHeaders: Record<string, string> = { Authorization: `Bearer ${session.access_token}` }
      const formData = new FormData()
      formData.set('userId', user.id)
      formData.set('workout', quest.workout)
      formData.set('targetReps', String(TARGET_REPS))
      formData.set('video', new File([recordedBlob], `${quest.id}.webm`, { type: recordedBlob.type || 'video/webm' }))

      const analyzeRes = await fetch('/api/workout/analyze-video', {
        method: 'POST',
        headers: authHeaders,
        body: formData
      })
      if (!analyzeRes.ok) {
        const raw = await analyzeRes.text()
        let detail = ''
        try {
          const parsed = JSON.parse(raw)
          detail = parsed?.error || raw
        } catch {
          detail = raw
        }
        throw new Error(detail ? `Gemini analysis failed (${analyzeRes.status}): ${detail}` : `Gemini analysis failed (${analyzeRes.status})`)
      }
      const analyzeData = await analyzeRes.json()
      const reps = Math.min(TARGET_REPS, Math.max(0, Number(analyzeData?.reps) || 0))
      const confidence = typeof analyzeData?.confidence === 'string' ? analyzeData.confidence : 'low'
      const notes = typeof analyzeData?.notes === 'string' ? analyzeData.notes.trim() : ''
      setRepCount(reps)

      const coachRes = await fetch('/api/workout/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          userId: user.id,
          questTitle: `${quest.title} videoUpload`,
          workout: quest.workout,
          phase: 'analyzed',
          reps,
          targetReps: TARGET_REPS,
          leftElbowAngle: 0,
          rightElbowAngle: 0
        })
      })
      if (coachRes.ok) {
        const data = await coachRes.json()
        if (data?.tip) setCoachTip(data.tip)
      }

      if (reps >= TARGET_REPS) {
        const expRes = await fetch('/api/workout/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ userId: user.id, expGain: 20 })
        })
        const detail = notes ? ` ${notes}` : ''
        if (expRes.ok) setStatusText(`Quest complete. ${reps} reps counted (${confidence} confidence). Monster defeated.${detail}`)
        else setStatusText(`Workout analyzed (${reps} reps), but EXP update failed.`)
      } else {
        const detail = notes ? ` ${notes}` : ''
        setStatusText(`Workout analyzed (${confidence} confidence). ${reps} reps counted. Need ${TARGET_REPS} to slay the monster.${detail}`)
      }
    } catch (error) {
      console.error(error)
      const message = error instanceof Error && error.message
        ? error.message
        : 'Video analysis failed. Try recording again with full body visible.'
      setStatusText(message)
    } finally {
      setAnalyzing(false)
    }
  }

  if (!quest) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen">
          <Header />
          <section className="container mx-auto px-6 py-10">
            <div className="glass rounded-lg p-6">
              <div className="text-2xl title-font mb-2">videoUpload Quest Not Found</div>
              <button onClick={() => router.push('/quest-gallery')} className="btn-primary mt-4">
                Back To Quest Gallery
              </button>
            </div>
          </section>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <section className="container mx-auto px-6 py-6 space-y-6">
          <div className="glass rounded-lg p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-3xl title-font">{quest.title}</div>
              <div className="text-sm text-cyan-300 uppercase tracking-wider">videoUpload mode</div>
              <div className="text-sm text-gray-400">Record clip, submit it, then run Gemini video analysis.</div>
            </div>
            <button onClick={() => router.push('/quest-gallery')} className="btn-secondary text-sm">
              Exit Quest
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass rounded-lg p-4 space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden border border-red-900/40">
                {!recordedUrl ? (
                  <video
                    ref={previewRef}
                    className={`w-full aspect-video object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
                    muted
                    playsInline
                  />
                ) : (
                  <video src={recordedUrl} className="w-full aspect-video object-cover" controls />
                )}
              </div>

              <div className="flex gap-3">
                {!isRecording ? (
                  <button onClick={startRecording} disabled={!cameraReady || analyzing} className="btn-primary flex-1 disabled:opacity-50">
                    Start Recording
                  </button>
                ) : (
                  <button onClick={stopRecording} className="btn-primary flex-1">
                    Stop Recording
                  </button>
                )}
                <button onClick={() => { setRecordedBlob(null); setRecordedUrl('') }} className="btn-secondary flex-1">
                  Reset
                </button>
              </div>

              <div className="text-sm text-gray-300">{statusText}</div>
              {cameraError && <div className="text-sm text-red-400">{cameraError}</div>}
            </div>

            <div className="glass rounded-lg p-4 space-y-4">
              <div className="text-sm uppercase tracking-wider text-gray-400">Monster Window</div>
              <div className="rounded-lg overflow-hidden border border-red-900/40 bg-black aspect-video">
                {monsterMedia.type === 'video' ? (
                  <video key={monsterStage} src={monsterMedia.src} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                ) : (
                  <Image src={monsterMedia.src} alt={`${quest.monster} ${monsterStage}`} width={960} height={540} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="text-sm text-gray-300">Reps counted: <span className="font-semibold text-white">{repCount}/{TARGET_REPS}</span></div>
              <div className="text-sm text-gray-300">{coachTip}</div>
            </div>
          </div>
        </section>

        {showSubmitPrompt && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center px-6">
            <div className="glass rounded-lg border border-red-700/50 max-w-md w-full p-6 space-y-4">
              <h2 className="text-2xl title-font text-center">Submit Workout?</h2>
              <p className="text-sm text-gray-200 text-center">
                Submit this recorded clip to run Gemini rep analysis and apply damage to the monster.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowSubmitPrompt(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={analyzeRecording} disabled={analyzing} className="btn-primary flex-1 disabled:opacity-50">
                  {analyzing ? 'Analyzing...' : 'Submit Workout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
