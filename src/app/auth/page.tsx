"use client"
import { useState } from 'react'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [authError, setAuthError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signInAsGuest, signOut, user, loading } = useAuth()
  const router = useRouter()

  async function enterGuild() {
    setAuthError('')
    setIsSubmitting(true)

    try {
      const { error } = await signInAsGuest()
      if (error) {
        setAuthError(error.message)
      } else {
        router.push('/profile')
      }
    } catch {
      setAuthError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 title-font">
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">ENTER THE GUILD</span>
          </h1>

          <div className="glass p-8 rounded-lg border-t-4 border-red-600">
            {authError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                {authError}
              </div>
            )}
            {!loading && !user && (
              <>
                <p className="text-sm text-gray-300 text-center mb-6">
                  Email login is disabled. Use guest login to continue.
                </p>
                <div className="flex justify-center">
                  <button onClick={enterGuild} disabled={isSubmitting} className="btn-primary w-full">
                    {isSubmitting ? 'Logging In...' : 'Log In'}
                  </button>
                </div>
              </>
            )}
            {!loading && user && (
              <div className="space-y-3">
                <p className="text-sm text-gray-300 text-center">
                  You are already logged in.
                </p>
                <button onClick={() => router.push('/profile')} className="btn-primary w-full">
                  Continue To Profile
                </button>
                <button onClick={() => signOut()} className="btn-secondary w-full">
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
