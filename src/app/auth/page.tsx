"use client"
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type FormValues = z.infer<typeof schema>

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [authError, setAuthError] = useState('')
  const { signUp, signIn } = useAuth()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setAuthError('')

    try {
      if (mode === 'signup') {
        const { error } = await signUp(values.email, values.password)
        if (error) {
          setAuthError(error.message)
          return
        }
      } else {
        const { error } = await signIn(values.email, values.password)
        if (error) {
          setAuthError(error.message)
          return
        }
      }
      router.push('/profile')
    } catch {
      setAuthError('Authentication failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 title-font">
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              {mode === 'signin' ? 'LOG IN' : 'CREATE ACCOUNT'}
            </span>
          </h1>

          <div className="glass p-8 rounded-lg border-t-4 border-red-600">
            {authError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                {authError}
              </div>
            )}

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMode('signin')}
                className={`flex-1 py-2 px-4 font-semibold uppercase tracking-wider transition-all ${
                  mode === 'signin'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                    : 'border border-gray-600 hover:border-red-600'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 px-4 font-semibold uppercase tracking-wider transition-all ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                    : 'border border-gray-600 hover:border-red-600'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-gray-400">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="hero@example.com"
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded focus:border-red-600 focus:outline-none transition-colors"
                  {...register('email')}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-gray-400">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="********"
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded focus:border-red-600 focus:outline-none transition-colors"
                  {...register('password')}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              <button disabled={isSubmitting} className="w-full btn-primary mt-6">
                {isSubmitting ? 'Please wait...' : mode === 'signin' ? 'LOG IN' : 'CREATE ACCOUNT'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

