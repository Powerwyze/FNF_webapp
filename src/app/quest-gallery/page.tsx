"use client"
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { QUESTS } from '@/data/quests'

export default function QuestGalleryPage() {
  const sectionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.quest-card',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <section ref={sectionRef} className="container mx-auto px-6 py-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold title-font mb-4">
              <span className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-500 bg-clip-text text-transparent">
                QUEST GALLERY
              </span>
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Choose a monster and complete its workout to claim EXP for your guild. Each quest is a
              focused training battle built for heroes of every class.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {QUESTS.map((quest) => (
              <article
                key={quest.id}
                className="quest-card glass rounded-lg overflow-hidden border border-red-900/30 hover:border-red-500/60 transition-colors"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={quest.image}
                    alt={`${quest.monster} quest`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold title-font">{quest.title}</h2>
                    <span className="text-xs uppercase tracking-wider text-gray-400">{quest.difficulty}</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    <span className="font-semibold text-white">{quest.monster}</span> - {quest.workout}
                  </div>
                  <div className="text-sm text-gray-400">Rep Goal: {quest.repGoal}</div>
                  <p className="text-sm text-gray-400">{quest.blurb}</p>
                  <button className="btn-primary text-sm w-full">Accept Quest</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </ProtectedRoute>
  )
}

