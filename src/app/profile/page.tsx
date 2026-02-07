"use client"
import { Header } from '@/components/Header'
import { ProfileShell } from './ProfileShell'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Profile = {
  id: string
  email: string
  display_name: string
  class: 'Fighter' | 'Archer' | 'Wizard' | 'Cleric' | null
  rank: 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
  exp: number
  rank_locked_until: string | null
  goal_summary: string | null
  bio: string | null
  avatar_url: string | null
  qr_payload: string | null
  last_workout_at: string | null
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    loadProfile()
  }, [user, router])

  async function loadProfile() {
    if (!user) return
    
    try {
      console.log('Loading profile for user:', user.id)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      if (!data) {
        // Profile doesn't exist yet
        console.log('Profile not found, creating default profile...')
        await createDefaultProfile()
      } else {
        console.log('Profile loaded:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createDefaultProfile() {
    if (!user) return
    
    try {
      const fallbackEmail = user.email ?? `${user.id}@anon.local`
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: fallbackEmail,
          display_name: fallbackEmail.split('@')[0] || 'Hero',
          bio: 'New hero entering the guild.',
          rank: 'E',
          exp: 0
        })
        .select()
        .single()

      if (error) throw error
      console.log('Default profile created:', data)
      setProfile(data)
    } catch (error) {
      console.error('Error creating default profile:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">
            <div className="text-4xl font-bold title-font mb-4">
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Loading Your Hero Profile...
              </span>
            </div>
            <div className="text-gray-400 mb-8">Preparing your hero sheet</div>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">
            <div className="text-4xl font-bold title-font mb-4">
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Profile Not Found
              </span>
            </div>
            <div className="text-gray-400 mb-8">Complete the assessment to create your hero profile</div>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => router.push('/onboarding/questionnaire')} 
                className="btn-primary text-lg px-8 py-3"
              >
                🚀 Start Assessment
              </button>
              <button 
                onClick={loadProfile} 
                className="btn-secondary text-lg px-8 py-3"
              >
                🔄 Retry Loading
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <ProfileShell profile={profile} onUpdate={loadProfile} />
    </div>
  )
}


