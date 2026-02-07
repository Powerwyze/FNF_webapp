"use client"
import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting initial session:', error)
        }
        if (!isMounted) return
        setSession(data.session ?? null)
        setUser(data.session?.user ?? null)
      } catch (error) {
        console.error('Auth initialization failed:', error)
        if (!isMounted) return
        setSession(null)
        setUser(null)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    const ensureProfile = async (currentUser: User) => {
      try {
        // Create profile if it doesn't exist
        const { data: existingProfile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', currentUser.id)
          .maybeSingle()

        if (error) {
          console.error('Error checking profile:', error)
          return
        }

        if (!existingProfile) {
          const { error: insertError } = await supabase.from('profiles').insert({
            id: currentUser.id,
            email: currentUser.email,
            display_name: currentUser.email?.split('@')[0] || 'Hero',
            bio: 'New hero entering the guild.'
          })

          if (insertError) {
            console.error('Error creating profile:', insertError)
          }
        }
      } catch (error) {
        console.error('Error ensuring profile:', error)
      }
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN' && session?.user) {
          void ensureProfile(session.user)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
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
    signUp,
    signIn,
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
