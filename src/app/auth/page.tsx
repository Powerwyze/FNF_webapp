"use client"
import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [authError, setAuthError] = useState<string>('')
  const { signInAnonymously, user, loading } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.push('/profile')
    }
  }, [loading, user, router])

  async function start() {
    setAuthError('')
    setSubmitting(true)
    try {
      const { error } = await signInAnonymously()
      if (error) {
        setAuthError(error.message || 'Failed to start session')
      } else {
        router.push('/onboarding/intake')
      }
    } catch {
      setAuthError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 title-font">
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              ENTER THE ARENA
            </span>
          </h1>

          <div className="glass p-8 rounded-lg border-t-4 border-red-600">
            {authError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                {authError}
              </div>
            )}
            <p className="text-sm text-gray-400 mb-6">
              Start instantly with a guest session. You can personalize your warrior profile once you enter.
            </p>
            <button
              onClick={start}
              disabled={submitting}
              className="w-full btn-primary"
            >
              {submitting ? 'Entering...' : 'Enter Arena'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
