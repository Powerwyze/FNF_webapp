"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { QUESTS } from '@/data/quests'
import { MONSTER_PHASE_MEDIA } from '@/data/monsterPhases'
import { useAuth } from '@/contexts/AuthContext'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import * as tf from '@tensorflow/tfjs-core'

const TARGET_REPS = 10
const HALF_HEALTH_REP = 3

type Mode = 'pushup' | 'jumping_jack'

function getAngle(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) {
  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }
  const dot = ab.x * cb.x + ab.y * cb.y
  const magAb = Math.hypot(ab.x, ab.y)
  const magCb = Math.hypot(cb.x, cb.y)
  if (!magAb || !magCb) return null
  const cosine = Math.max(-1, Math.min(1, dot / (magAb * magCb)))
  return (Math.acos(cosine) * 180) / Math.PI
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function findKeypoint(pose: poseDetection.Pose, name: string) {
  return pose.keypoints.find((k) => k.name === name && (k.score ?? 0) > 0.35)
}

function getModeFromWorkout(workout: string): Mode {
  return workout.toLowerCase().includes('jumping') ? 'jumping_jack' : 'pushup'
}

async function waitForSeek(video: HTMLVideoElement, t: number) {
  await new Promise<void>((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked)
      resolve()
    }
    video.addEventListener('seeked', onSeeked)
    video.currentTime = t
  })
}

export default function VideoUploadQuestPage() {
  const params = useParams<{ questId: string }>()
  const router = useRouter()
  const { user, session } = useAuth()

  const previewRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

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
  const mode: Mode = getModeFromWorkout(quest?.workout ?? 'Push-ups')

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
          audio: true
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
    const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' })
    recorderRef.current = recorder

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunksRef.current.push(event.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      setRecordedBlob(blob)
      setRecordedUrl(url)
      setShowSubmitPrompt(true)
      setStatusText('Recording stopped. Submit this workout for analysis?')
    }

    recorder.start()
    setIsRecording(true)
  }

  function stopRecording() {
    if (!recorderRef.current || recorderRef.current.state === 'inactive') return
    recorderRef.current.stop()
    setIsRecording(false)
  }

  async function analyzeRecording() {
    if (!quest || !recordedBlob || !user || !session?.access_token) return
    setShowSubmitPrompt(false)
    setAnalyzing(true)
    setStatusText('Analyzing video with TensorFlow Pose Detection...')

    let reps = 0
    let phase: 'start' | 'a' | 'b' = 'start'

    try {
      await tf.setBackend('webgl')
      await tf.ready()

      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      )

      const url = URL.createObjectURL(recordedBlob)
      const video = document.createElement('video')
      video.src = url
      video.muted = true
      video.playsInline = true

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve()
        video.onerror = () => reject(new Error('Failed to load recorded video'))
      })

      const step = 0.12
      for (let t = 0; t <= video.duration; t += step) {
        await waitForSeek(video, Math.min(t, video.duration))
        const poses = await detector.estimatePoses(video)
        const pose = poses[0]
        if (!pose) continue

        const ls = findKeypoint(pose, 'left_shoulder')
        const rs = findKeypoint(pose, 'right_shoulder')
        const le = findKeypoint(pose, 'left_elbow')
        const re = findKeypoint(pose, 'right_elbow')
        const lw = findKeypoint(pose, 'left_wrist')
        const rw = findKeypoint(pose, 'right_wrist')
        const lh = findKeypoint(pose, 'left_hip')
        const rh = findKeypoint(pose, 'right_hip')
        const la = findKeypoint(pose, 'left_ankle')
        const ra = findKeypoint(pose, 'right_ankle')

        if (mode === 'pushup') {
          if (!ls || !rs || !le || !re || !lw || !rw) continue
          const leftElbow = getAngle(ls, le, lw)
          const rightElbow = getAngle(rs, re, rw)
          if (!leftElbow || !rightElbow) continue
          const avg = (leftElbow + rightElbow) / 2
          const isUp = avg >= 155
          const isDown = avg <= 95

          if (phase === 'start' && isUp) phase = 'a'
          else if (phase === 'a' && isDown) phase = 'b'
          else if (phase === 'b' && isUp) {
            reps = Math.min(TARGET_REPS, reps + 1)
            setRepCount(reps)
            phase = 'a'
          }
        }

        if (mode === 'jumping_jack') {
          if (!ls || !rs || !lh || !rh || !la || !ra) continue
          const leftHand = lw ?? le
          const rightHand = rw ?? re
          if (!leftHand || !rightHand) continue
          const shoulderWidth = Math.max(distance(ls, rs), 1)
          const hipWidth = Math.max(distance(lh, rh), 1)
          const armSpread = distance(leftHand, rightHand) / shoulderWidth
          const legSpread = distance(la, ra) / hipWidth
          const wristsHigh = leftHand.y < ((ls.y + rs.y) / 2) && rightHand.y < ((ls.y + rs.y) / 2)
          const isOpen = legSpread > 1.55 && (armSpread > 1.6 || wristsHigh)
          const isClosed = legSpread < 1.35 && armSpread < 1.55

          if (phase === 'start' && isClosed) phase = 'a'
          else if (phase === 'a' && isOpen) phase = 'b'
          else if (phase === 'b' && isClosed) {
            reps = Math.min(TARGET_REPS, reps + 1)
            setRepCount(reps)
            phase = 'a'
          }
        }
      }

      detector.dispose()
      URL.revokeObjectURL(url)

      const authHeaders: Record<string, string> = { Authorization: `Bearer ${session.access_token}` }
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
        if (expRes.ok) setStatusText(`Quest complete. ${reps} reps counted. Monster defeated.`)
        else setStatusText(`Workout analyzed (${reps} reps), but EXP update failed.`)
      } else {
        setStatusText(`Workout analyzed. ${reps} reps counted. Need ${TARGET_REPS} to slay the monster.`)
      }
    } catch (error) {
      console.error(error)
      setStatusText('Video analysis failed. Try recording again with full body visible.')
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
              <div className="text-sm text-gray-400">Record clip -> Submit -> TensorFlow + Gemini analysis</div>
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
                Submit this recorded clip to run TensorFlow pose analysis and apply damage to the monster.
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

