"use client"
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

type FormValues = z.infer<typeof schema>

export default function AuthPage() {
  const [mode, setMode] = useState<'signin'|'signup'>('signup')
  const [authError, setAuthError] = useState<string>('')
  const { signUp, signIn } = useAuth()
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setAuthError('')

    try {
      if (mode === 'signup') {
        const { error } = await signUp(values.email, values.password)
        if (error) {
          setAuthError(error.message)
        } else {
          // Redirect to intake form for new users
          router.push('/onboarding/intake')
        }
      } else {
        const { error } = await signIn(values.email, values.password)
        if (error) {
          setAuthError(error.message)
        } else {
          // Redirect to profile for existing users
          router.push('/profile')
        }
      }
    } catch (error) {
      setAuthError('An unexpected error occurred')
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 title-font">
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              {mode === 'signup' ? 'CREATE YOUR WARRIOR' : 'ENTER THE ARENA'}
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
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 px-4 font-semibold uppercase tracking-wider transition-all ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                    : 'border border-gray-600 hover:border-red-600'
                }`}
              >
                Sign Up
              </button>
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
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-gray-400">
                  Email Address
                </label>
                <input
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded focus:border-red-600 focus:outline-none transition-colors"
                  type="email"
                  placeholder="warrior@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-gray-400">
                  Password
                </label>
                <input
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded focus:border-red-600 focus:outline-none transition-colors"
                  type="password"
                  placeholder="********"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Minimum 6 characters to protect your warrior's identity
                </p>
              </div>

              <button
                disabled={isSubmitting}
                className="w-full btn-primary mt-6"
              >
                {mode === 'signup' ? 'CREATE ACCOUNT' : 'ENTER ARENA'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                {mode === 'signup'
                  ? 'Already have an account?'
                  : "Don't have an account?"}
                {' '}
                <button
                  onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
                  className="text-red-500 hover:text-red-400 font-semibold"
                >
                  {mode === 'signup' ? 'Log In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
