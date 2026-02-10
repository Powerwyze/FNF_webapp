"use client"
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [checkingClass, setCheckingClass] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    async function validateClassGate() {
      if (loading) return
      if (!user) {
        setCheckingClass(false)
        return
      }

      const allowWithoutClass = pathname === '/onboarding/questionnaire' || pathname === '/onboarding/intake'
      if (allowWithoutClass) {
        setCheckingClass(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('class')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Class gate check failed:', error)
      }

      if (!data?.class) {
        router.replace('/onboarding/questionnaire')
        return
      }

      setCheckingClass(false)
    }

    void validateClassGate()
  }, [loading, user, pathname, router])

  if (loading || checkingClass) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold title-font mb-4">Loading...</div>
          <div className="text-gray-400">Preparing your quest</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return <>{children}</>
}
