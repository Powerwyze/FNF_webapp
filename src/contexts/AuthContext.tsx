"use client"
import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signInAnonymously: () => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)

  useEffect(() => {
    if (initializing) return
    setInitializing(true)
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)

      if (!session) {
        const { error } = await supabase.auth.signInAnonymously()
        if (error) {
          console.error('Anonymous sign-in failed:', error)
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    })()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN' && session?.user) {
          // Create profile if it doesn't exist
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle()

          if (!existingProfile) {
            const fallbackEmail = session.user.email ?? `${session.user.id}@anon.local`
            await supabase.from('profiles').insert({
              id: session.user.id,
              email: fallbackEmail,
              display_name: fallbackEmail.split('@')[0] || 'Warrior',
              bio: 'New challenger entering the arena.'
            })
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [initializing])

  const signInAnonymously = async () => {
    const { error } = await supabase.auth.signInAnonymously()
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: any) => {
    if (!user) return { error: 'No user logged in' }
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
    
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signInAnonymously,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
