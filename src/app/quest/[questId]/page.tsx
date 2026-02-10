"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { QUESTS } from '@/data/quests'
import { useAuth } from '@/contexts/AuthContext'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import * as tf from '@tensorflow/tfjs-core'

const TARGET_REPS = 10
const HALF_HEALTH_REP = 3
const EXP_BY_DIFFICULTY: Record<string, number> = {
  Novice: 10,
  Adept: 20,
  Veteran: 30,
  Boss: 50
}

type PushupPhase = 'find_start' | 'go_down' | 'go_up' | 'complete'

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

export default function QuestWorkoutPage() {
  const params = useParams<{ questId: string }>()
  const router = useRouter()
  const { user, session } = useAuth()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null)
  const intervalRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const requestInFlightRef = useRef(false)
  const questCompleteLoggedRef = useRef(false)
  const lastCoachAtRef = useRef(0)
  const phaseRef = useRef<PushupPhase>('find_start')
  const repCountRef = useRef(0)

  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [phase, setPhase] = useState<PushupPhase>('find_start')
  const [promptText, setPromptText] = useState('Get into push-up start position')
  const [repCount, setRepCount] = useState(0)
  const [leftElbowAngle, setLeftElbowAngle] = useState(0)
  const [rightElbowAngle, setRightElbowAngle] = useState(0)
  const [coachTip, setCoachTip] = useState('Initializing pose tracker...')
  const [completionMessage, setCompletionMessage] = useState('')

  const quest = useMemo(
    () => QUESTS.find((q) => q.id === params.questId),
    [params.questId]
  )

  const monsterStage = repCount >= TARGET_REPS ? 'dead' : repCount >= HALF_HEALTH_REP ? 'half' : 'full'

  const monsterPanel = monsterStage === 'dead'
    ? (
      <Image
        src="/quests/Goblin_dead.png"
        alt="Goblin defeated"
        width={960}
        height={540}
        className="w-full h-full object-cover"
      />
    )
    : (
      <video
        key={monsterStage}
        src={monsterStage === 'half' ? '/quests/Goblin_halfHealth.mp4' : '/quests/Goblin_fullHealth.mp4'}
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />
    )

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    repCountRef.current = repCount
  }, [repCount])

  useEffect(() => {
    questCompleteLoggedRef.current = false
    phaseRef.current = 'find_start'
    repCountRef.current = 0
    setPhase('find_start')
    setRepCount(0)
    setPromptText('Get into push-up start position')
    setCompletionMessage('')
    setCoachTip('Initializing pose tracker...')
  }, [quest?.id])

  useEffect(() => {
    if (!quest) return
    const questData = quest
    let cancelled = false

    async function startTracking() {
      try {
        await tf.setBackend('webgl')
        await tf.ready()

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        )
        detectorRef.current = detector

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
          audio: false
        })
        streamRef.current = stream

        if (!videoRef.current || cancelled) return
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
        setCoachTip('Pose tracking live. Hold a strong plank to begin.')

        intervalRef.current = window.setInterval(async () => {
          if (!detectorRef.current || !videoRef.current || requestInFlightRef.current || phaseRef.current === 'complete') return
          requestInFlightRef.current = true
          try {
            const poses = await detectorRef.current.estimatePoses(videoRef.current, { flipHorizontal: true })
            const pose = poses[0]
            if (!pose?.keypoints?.length) return

            const findKeypoint = (name: string) =>
              pose.keypoints.find((k) => k.name === name && (k.score ?? 0) > 0.4)

            const leftShoulder = findKeypoint('left_shoulder')
            const leftElbow = findKeypoint('left_elbow')
            const leftWrist = findKeypoint('left_wrist')
            const rightShoulder = findKeypoint('right_shoulder')
            const rightElbow = findKeypoint('right_elbow')
            const rightWrist = findKeypoint('right_wrist')

            if (!leftShoulder || !leftElbow || !leftWrist || !rightShoulder || !rightElbow || !rightWrist) return

            const left = getAngle(leftShoulder, leftElbow, leftWrist)
            const right = getAngle(rightShoulder, rightElbow, rightWrist)
            if (!left || !right) return

            setLeftElbowAngle(left)
            setRightElbowAngle(right)

            const avg = (left + right) / 2
            const isUp = avg >= 155
            const isDown = avg <= 95

            const currentPhase = phaseRef.current

            if (currentPhase === 'find_start' && isUp) {
              phaseRef.current = 'go_down'
              setPhase('go_down')
              setPromptText('down')
            } else if (currentPhase === 'go_down' && isDown) {
              phaseRef.current = 'go_up'
              setPhase('go_up')
              setPromptText('up')
            } else if (currentPhase === 'go_up' && isUp) {
              const next = Math.min(TARGET_REPS, repCountRef.current + 1)
              repCountRef.current = next
              setRepCount(next)

              if (next >= TARGET_REPS) {
                phaseRef.current = 'complete'
                setPhase('complete')
                setPromptText('Quest Complete')
                setCompletionMessage('Goblin defeated! Quest complete.')
              } else {
                phaseRef.current = 'go_down'
                setPhase('go_down')
                setPromptText('down')
              }
            }

            const now = Date.now()
            if (now - lastCoachAtRef.current > 4500 && user && session?.access_token) {
              lastCoachAtRef.current = now
              const authHeaders: Record<string, string> = { Authorization: `Bearer ${session.access_token}` }
              const coachRes = await fetch('/api/workout/coach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({
                  userId: user.id,
                  questTitle: questData.title,
                  workout: questData.workout,
                  phase: phaseRef.current,
                  reps: repCountRef.current,
                  targetReps: TARGET_REPS,
                  leftElbowAngle: left,
                  rightElbowAngle: right
                })
              })
              if (coachRes.ok) {
                const data = await coachRes.json()
                if (data?.tip) setCoachTip(data.tip)
              }
            }
          } finally {
            requestInFlightRef.current = false
          }
        }, 220)
      } catch (error) {
        console.error(error)
        setCameraError('Camera or pose model failed to start. Check camera permissions and reload.')
      }
    }

    void startTracking()

    return () => {
      cancelled = true
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      detectorRef.current?.dispose()
      detectorRef.current = null
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      setCameraReady(false)
    }
  }, [quest, session?.access_token, user])

  useEffect(() => {
    async function awardQuestCompletion() {
      if (!quest || !user || !session?.access_token) return
      if (repCount < TARGET_REPS || questCompleteLoggedRef.current) return
      questCompleteLoggedRef.current = true

      const expGain = EXP_BY_DIFFICULTY[quest.difficulty] ?? 10
      const authHeaders: Record<string, string> = { Authorization: `Bearer ${session.access_token}` }
      const response = await fetch('/api/workout/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ userId: user.id, expGain })
      })
      if (response.ok) {
        setCompletionMessage(`Goblin defeated. +${expGain} EXP awarded.`)
      } else {
        setCompletionMessage('Goblin defeated, but EXP update failed. Try again from profile.')
      }
    }
    void awardQuestCompletion()
  }, [quest, repCount, session?.access_token, user])

  if (!quest) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen">
          <Header />
          <section className="container mx-auto px-6 py-10">
            <div className="glass rounded-lg p-6">
              <div className="text-2xl title-font mb-2">Quest Not Found</div>
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
              <div className="text-sm text-gray-400">Target: {TARGET_REPS} reps</div>
            </div>
            <button onClick={() => router.push('/quest-gallery')} className="btn-secondary text-sm">
              Exit Quest
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass rounded-lg p-4">
              <div className="relative bg-black rounded-lg overflow-hidden border border-red-900/40">
                <video ref={videoRef} className="w-full aspect-video object-cover scale-x-[-1]" muted playsInline />

                <div className="absolute left-3 top-3 bg-black/70 border border-red-700/50 px-4 py-2 rounded">
                  <div className="text-xs uppercase text-gray-400">Prompt</div>
                  <div className="text-2xl title-font text-yellow-300">{promptText}</div>
                </div>

                <div className="absolute right-3 top-3 bg-black/70 border border-red-700/50 px-4 py-2 rounded text-right">
                  <div className="text-xs uppercase text-gray-400">Reps</div>
                  <div className="text-2xl title-font text-white">{repCount}/{TARGET_REPS}</div>
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
                <div className="glass-dark rounded p-3">
                  <div className="text-gray-400 text-xs uppercase">Camera</div>
                  <div>{cameraError ? 'Error' : cameraReady ? 'Live' : 'Starting...'}</div>
                </div>
                <div className="glass-dark rounded p-3">
                  <div className="text-gray-400 text-xs uppercase">Left Elbow</div>
                  <div>{Math.round(leftElbowAngle)} deg</div>
                </div>
                <div className="glass-dark rounded p-3">
                  <div className="text-gray-400 text-xs uppercase">Right Elbow</div>
                  <div>{Math.round(rightElbowAngle)} deg</div>
                </div>
              </div>

              {cameraError && (
                <div className="mt-4 text-sm text-red-400">{cameraError}</div>
              )}
            </div>

            <div className="glass rounded-lg p-4 space-y-4">
              <div className="text-lg title-font">Gemini Coach</div>
              <div className="text-sm text-gray-300">{coachTip}</div>
              {completionMessage && <div className="text-sm text-emerald-300">{completionMessage}</div>}
            </div>
          </div>

          <div className="glass rounded-lg p-4">
            <div className="text-sm uppercase tracking-wider text-gray-400 mb-2">Monster Window</div>
            <div className="rounded-lg overflow-hidden border border-red-900/40 bg-black aspect-video">
              {monsterPanel}
            </div>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  )
}
