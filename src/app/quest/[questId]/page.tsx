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

type WorkoutMode =
  | 'pushup'
  | 'squat'
  | 'crunch'
  | 'back_extension'
  | 'jumping_jack'
  | 'mountain_climber'

type QuestPhase = 'find_start' | 'move_a' | 'move_b' | 'complete'

type KP = { x: number; y: number; score?: number; name?: string }

function distance(a: KP, b: KP) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function getAngle(a: KP, b: KP, c: KP) {
  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }
  const dot = ab.x * cb.x + ab.y * cb.y
  const magAb = Math.hypot(ab.x, ab.y)
  const magCb = Math.hypot(cb.x, cb.y)
  if (!magAb || !magCb) return null
  const cosine = Math.max(-1, Math.min(1, dot / (magAb * magCb)))
  return (Math.acos(cosine) * 180) / Math.PI
}

function toWorkoutMode(workout: string): WorkoutMode {
  const w = workout.toLowerCase()
  if (w.includes('push')) return 'pushup'
  if (w.includes('squat')) return 'squat'
  if (w.includes('crunch')) return 'crunch'
  if (w.includes('back extension')) return 'back_extension'
  if (w.includes('jumping')) return 'jumping_jack'
  return 'mountain_climber'
}

function findKeypoint(pose: poseDetection.Pose, name: string) {
  return pose.keypoints.find((k) => k.name === name && (k.score ?? 0) > 0.4) as KP | undefined
}

export default function QuestWorkoutPage() {
  const params = useParams<{ questId: string }>()
  const router = useRouter()
  const { user, session } = useAuth()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null)
  const intervalRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const requestInFlightRef = useRef(false)
  const questCompleteLoggedRef = useRef(false)
  const lastCoachAtRef = useRef(0)
  const phaseRef = useRef<QuestPhase>('find_start')
  const repCountRef = useRef(0)

  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [phase, setPhase] = useState<QuestPhase>('find_start')
  const [promptText, setPromptText] = useState('Get into start position')
  const [repCount, setRepCount] = useState(0)
  const [leftAngle, setLeftAngle] = useState(0)
  const [rightAngle, setRightAngle] = useState(0)
  const [coachTip, setCoachTip] = useState('Initializing pose tracker...')
  const [completionMessage, setCompletionMessage] = useState('')
  const [isMirrored, setIsMirrored] = useState(true)

  const quest = useMemo(
    () => QUESTS.find((q) => q.id === params.questId),
    [params.questId]
  )

  const workoutMode = useMemo(
    () => toWorkoutMode(quest?.workout ?? ''),
    [quest?.workout]
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
    setLeftAngle(0)
    setRightAngle(0)
    setCompletionMessage('')
    setCoachTip('Initializing pose tracker...')
    if (workoutMode === 'jumping_jack') setPromptText('Start closed stance')
    else if (workoutMode === 'mountain_climber') setPromptText('Hold plank start')
    else setPromptText('Get into start position')
  }, [quest?.id, workoutMode])

  useEffect(() => {
    if (!quest) return
    const questData = quest
    let cancelled = false

    function drawPoseOverlay(pose: poseDetection.Pose) {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const pairs = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet)
      ctx.lineWidth = 3
      ctx.strokeStyle = '#22d3ee'
      ctx.fillStyle = '#facc15'

      for (const [i, j] of pairs) {
        const a = pose.keypoints[i]
        const b = pose.keypoints[j]
        if (!a || !b || (a.score ?? 0) < 0.35 || (b.score ?? 0) < 0.35) continue
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }

      for (const point of pose.keypoints) {
        if ((point.score ?? 0) < 0.35) continue
        ctx.beginPath()
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    async function getWidestStream() {
      const candidates: MediaStreamConstraints[] = [
        {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 2560 },
            height: { ideal: 1440 },
            aspectRatio: { ideal: 16 / 9 }
          },
          audio: false
        },
        {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        },
        {
          video: {
            facingMode: { ideal: 'user' },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        },
        { video: true, audio: false }
      ]

      for (const constraints of candidates) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints)
          const track = stream.getVideoTracks()[0]
          if (track) {
            const capabilities = track.getCapabilities() as MediaTrackCapabilities & { zoom?: { min: number; max: number } }
            if (capabilities?.zoom && typeof capabilities.zoom.min === 'number') {
              try {
                await track.applyConstraints({ advanced: [{ zoom: capabilities.zoom.min } as any] })
              } catch {
                // ignore zoom adjustment failures
              }
            }

            const settings = track.getSettings()
            setIsMirrored(settings.facingMode !== 'environment')
          }
          return stream
        } catch {
          // try next candidate
        }
      }

      throw new Error('Unable to access camera stream')
    }

    async function startTracking() {
      try {
        await tf.setBackend('webgl')
        await tf.ready()

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        )
        detectorRef.current = detector

        const stream = await getWidestStream()
        streamRef.current = stream

        if (!videoRef.current || cancelled) return
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
        setCoachTip('Pose tracking live. Start moving through clean reps.')

        intervalRef.current = window.setInterval(async () => {
          if (!detectorRef.current || !videoRef.current || requestInFlightRef.current || phaseRef.current === 'complete') return
          requestInFlightRef.current = true
          try {
            const poses = await detectorRef.current.estimatePoses(videoRef.current, { flipHorizontal: true })
            const pose = poses[0]
            if (!pose?.keypoints?.length) return
            drawPoseOverlay(pose)

            const ls = findKeypoint(pose, 'left_shoulder')
            const rs = findKeypoint(pose, 'right_shoulder')
            const le = findKeypoint(pose, 'left_elbow')
            const re = findKeypoint(pose, 'right_elbow')
            const lw = findKeypoint(pose, 'left_wrist')
            const rw = findKeypoint(pose, 'right_wrist')
            const lh = findKeypoint(pose, 'left_hip')
            const rh = findKeypoint(pose, 'right_hip')
            const lk = findKeypoint(pose, 'left_knee')
            const rk = findKeypoint(pose, 'right_knee')
            const la = findKeypoint(pose, 'left_ankle')
            const ra = findKeypoint(pose, 'right_ankle')

            if (!ls || !rs || !lh || !rh || !lk || !rk || !la || !ra) return

            const leftElbow = le && lw ? getAngle(ls, le, lw) : null
            const rightElbow = re && rw ? getAngle(rs, re, rw) : null
            const leftKnee = getAngle(lh, lk, la)
            const rightKnee = getAngle(rh, rk, ra)
            const leftHip = getAngle(ls, lh, lk)
            const rightHip = getAngle(rs, rh, rk)

            const avgElbow = leftElbow && rightElbow ? (leftElbow + rightElbow) / 2 : null
            const avgKnee = leftKnee && rightKnee ? (leftKnee + rightKnee) / 2 : null
            const avgHip = leftHip && rightHip ? (leftHip + rightHip) / 2 : null

            const metricLeft = leftElbow ?? leftKnee ?? leftHip ?? 0
            const metricRight = rightElbow ?? rightKnee ?? rightHip ?? 0
            setLeftAngle(metricLeft)
            setRightAngle(metricRight)

            const currentPhase = phaseRef.current
            const currentReps = repCountRef.current

            if (workoutMode === 'pushup' && avgElbow) {
              const isUp = avgElbow >= 155
              const isDown = avgElbow <= 95
              if (currentPhase === 'find_start' && isUp) {
                phaseRef.current = 'move_a'; setPhase('move_a'); setPromptText('down')
              } else if (currentPhase === 'move_a' && isDown) {
                phaseRef.current = 'move_b'; setPhase('move_b'); setPromptText('up')
              } else if (currentPhase === 'move_b' && isUp) {
                const next = Math.min(TARGET_REPS, currentReps + 1)
                repCountRef.current = next; setRepCount(next)
                if (next >= TARGET_REPS) {
                  phaseRef.current = 'complete'; setPhase('complete'); setPromptText('Quest Complete')
                  setCompletionMessage('Monster defeated! Quest complete.')
                } else {
                  phaseRef.current = 'move_a'; setPhase('move_a'); setPromptText('down')
                }
              }
            }

            if (workoutMode === 'squat' && avgKnee) {
              const isUp = avgKnee >= 160
              const isDown = avgKnee <= 105
              if (currentPhase === 'find_start' && isUp) {
                phaseRef.current = 'move_a'; setPhase('move_a'); setPromptText('down')
              } else if (currentPhase === 'move_a' && isDown) {
                phaseRef.current = 'move_b'; setPhase('move_b'); setPromptText('up')
              } else if (currentPhase === 'move_b' && isUp) {
                const next = Math.min(TARGET_REPS, currentReps + 1)
                repCountRef.current = next; setRepCount(next)
                if (next >= TARGET_REPS) {
                  phaseRef.current = 'complete'; setPhase('complete'); setPromptText('Quest Complete')
                  setCompletionMessage('Monster defeated! Quest complete.')
                } else {
                  phaseRef.current = 'move_a'; setPhase('move_a'); setPromptText('down')
                }
              }
            }

            if (workoutMode === 'crunch' && avgHip) {
              const isDown = avgHip >= 155
              const isUp = avgHip <= 120
              if (currentPhase === 'find_start' && isDown) {
                phaseRef.current = 'move_a'; setPhase('move_a'); setPromptText('up')
              } else if (currentPhase === 'move_a' && isUp) {
                phaseRef.current = 'move_b'; setPhase('move_b'); setPromptText('down')
              } else if (currentPhase === 'move_b' && isDown) {
                const next = Math.min(TARGET_REPS, currentReps + 1)
                repCountRef.current = next; setRepCount(next)
                if (next >= TARGET_REPS) {
                  phaseRef.current = 'complete'; setPhase('complete'); setPromptText('Quest Complete')
                  setCompletionMessage('Monster defeated! Quest complete.')
                } else {
                  phaseRef.current = 'move_a'; setPhase('move_a'); setPromptText('up')
                }
              }
            }

            if (workoutMode === 'back_extension' && avgHip) {
              const isDown = avgHip <= 120
              const isUp = avgHip >= 155
              if (currentPhase === 'find_start' && isDown) {
                phaseRef.current = 'move_a'; setPhase('move_a'); setPromptText('up')
              } else if (currentPhase === 'move_a' && isUp) {
                phaseRef.current = 'move_b'; setPhase('move_b'); setPromptText('down')
              } else if (currentPhase === 'move_b' && isDown) {
                const next = Math.min(TARGET_REPS, currentReps + 1)
                repCountRef.current = next; setRepCount(next)
                if (next >= TARGET_REPS) {
                  phaseRef.current = 'complete'; setPhase('complete'); setPromptText('Quest Complete')
                  setCompletionMessage('Monster defeated! Quest complete.')
                } else {
                  phaseRef.current = 'move_a'; setPhase('move_a'); setPromptText('up')
                }
              }
            }

            const leftHand = lw ?? le
            const rightHand = rw ?? re
            if (workoutMode === 'jumping_jack' && leftHand && rightHand) {
              const shoulderWidth = Math.max(distance(ls, rs), 1)
              const hipWidth = Math.max(distance(lh, rh), 1)
              const wristDist = distance(leftHand, rightHand)
              const ankleDist = distance(la, ra)
              const wristsHigh = leftHand.y < ((ls.y + rs.y) / 2) && rightHand.y < ((ls.y + rs.y) / 2)
              const armSpread = wristDist / shoulderWidth
              const legSpread = ankleDist / hipWidth
              const isOpen = legSpread > 1.55 && (armSpread > 1.6 || wristsHigh)
              const isClosed = legSpread < 1.35 && armSpread < 1.55

              if (currentPhase === 'find_start' && isClosed) {
                phaseRef.current = 'move_a'; setPhase('move_a'); setPromptText('open')
              } else if (currentPhase === 'move_a' && isOpen) {
                phaseRef.current = 'move_b'; setPhase('move_b'); setPromptText('close')
              } else if (currentPhase === 'move_b' && isClosed) {
                const next = Math.min(TARGET_REPS, currentReps + 1)
                repCountRef.current = next; setRepCount(next)
                if (next >= TARGET_REPS) {
                  phaseRef.current = 'complete'; setPhase('complete'); setPromptText('Quest Complete')
                  setCompletionMessage('Monster defeated! Quest complete.')
                } else {
                  phaseRef.current = 'move_a'; setPhase('move_a'); setPromptText('open')
                }
              }
            }

            if (workoutMode === 'mountain_climber' && leftKnee && rightKnee) {
              const plankReady = leftKnee > 145 && rightKnee > 145
              const leftDrive = leftKnee < 100 && rightKnee > 135
              const rightDrive = rightKnee < 100 && leftKnee > 135

              if (currentPhase === 'find_start' && plankReady) {
                phaseRef.current = 'move_a'; setPhase('move_a'); setPromptText('left knee in')
              } else if (currentPhase === 'move_a' && leftDrive) {
                const next = Math.min(TARGET_REPS, currentReps + 1)
                repCountRef.current = next; setRepCount(next)
                if (next >= TARGET_REPS) {
                  phaseRef.current = 'complete'; setPhase('complete'); setPromptText('Quest Complete')
                  setCompletionMessage('Monster defeated! Quest complete.')
                } else {
                  phaseRef.current = 'move_b'; setPhase('move_b'); setPromptText('right knee in')
                }
              } else if (currentPhase === 'move_b' && rightDrive) {
                const next = Math.min(TARGET_REPS, currentReps + 1)
                repCountRef.current = next; setRepCount(next)
                if (next >= TARGET_REPS) {
                  phaseRef.current = 'complete'; setPhase('complete'); setPromptText('Quest Complete')
                  setCompletionMessage('Monster defeated! Quest complete.')
                } else {
                  phaseRef.current = 'move_a'; setPhase('move_a'); setPromptText('left knee in')
                }
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
                  leftElbowAngle: metricLeft,
                  rightElbowAngle: metricRight
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
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
      setCameraReady(false)
    }
  }, [quest, session?.access_token, user, workoutMode])

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
        setCompletionMessage(`Monster defeated. +${expGain} EXP awarded.`)
      } else {
        setCompletionMessage('Monster defeated, but EXP update failed. Try again from profile.')
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
              <div className="text-sm text-gray-400">Workout: {quest.workout} | Target: {TARGET_REPS} reps</div>
            </div>
            <button onClick={() => router.push('/quest-gallery')} className="btn-secondary text-sm">
              Exit Quest
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass rounded-lg p-4">
              <div className="relative bg-black rounded-lg overflow-hidden border border-red-900/40">
                <video
                  ref={videoRef}
                  className={`w-full aspect-video object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
                  muted
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full pointer-events-none ${isMirrored ? 'scale-x-[-1]' : ''}`}
                />

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
                  <div className="text-gray-400 text-xs uppercase">Left Joint Angle</div>
                  <div>{Math.round(leftAngle)} deg</div>
                </div>
                <div className="glass-dark rounded p-3">
                  <div className="text-gray-400 text-xs uppercase">Right Joint Angle</div>
                  <div>{Math.round(rightAngle)} deg</div>
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
