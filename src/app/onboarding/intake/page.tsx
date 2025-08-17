"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { supabase } from '@/lib/supabaseClient'

type IntakeForm = {
  display_name: string
  age: number
  birthday: string
  warrior_name: string
  fitness_experience: string
  primary_goal: string
  current_activity_level: string
  preferred_training_time: string
}

export default function IntakePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<IntakeForm>({
    display_name: '',
    age: 18,
    birthday: '',
    warrior_name: '',
    fitness_experience: 'beginner',
    primary_goal: 'general_fitness',
    current_activity_level: 'sedentary',
    preferred_training_time: 'morning'
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    
    try {
      // Update profile with intake information
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: form.display_name,
          age: form.age,
          birthday: form.birthday,
          warrior_name: form.warrior_name,
          fitness_experience: form.fitness_experience,
          primary_goal: form.primary_goal,
          current_activity_level: form.current_activity_level,
          preferred_training_time: form.preferred_training_time,
          bio: `Warrior Name: ${form.warrior_name}\nAge: ${form.age}\nExperience: ${form.fitness_experience}\nGoal: ${form.primary_goal}`
        })
        .eq('id', user.id)

      if (error) throw error

      // Redirect to questionnaire
      router.push('/onboarding/questionnaire')
    } catch (error) {
      console.error('Error saving intake form:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const updateForm = (field: keyof IntakeForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold title-font mb-4">
                <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  WELCOME WARRIOR
                </span>
              </h1>
              <p className="text-xl text-gray-300">
                Let's get to know you before your quest begins
              </p>
            </div>

            {/* Intake Form */}
            <form onSubmit={handleSubmit} className="glass p-8 rounded-lg">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-gray-300">
                      Real Name
                    </label>
                    <input
                      type="text"
                      value={form.display_name}
                      onChange={(e) => updateForm('display_name', e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded focus:border-red-600 focus:outline-none transition-colors"
                      placeholder="Your actual name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-gray-300">
                      Age
                    </label>
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => updateForm('age', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded focus:border-red-600 focus:outline-none transition-colors"
                      min="13"
                      max="100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-gray-300">
                    Birthday
                  </label>
                  <input
                    type="date"
                    value={form.birthday}
                    onChange={(e) => updateForm('birthday', e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded focus:border-red-600 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-gray-300">
                    🗡️ Warrior Name
                  </label>
                  <input
                    type="text"
                    value={form.warrior_name}
                    onChange={(e) => updateForm('warrior_name', e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded focus:border-red-600 focus:outline-none transition-colors"
                    placeholder="Choose your warrior identity"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be your legendary name in the arena
                  </p>
                </div>

                {/* Fitness Background */}
                <div>
                  <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-gray-300">
                    💪 Fitness Experience
                  </label>
                  <select
                    value={form.fitness_experience}
                    onChange={(e) => updateForm('fitness_experience', e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded focus:border-red-600 focus:outline-none transition-colors"
                  >
                    <option value="beginner">🥚 Beginner - New to fitness</option>
                    <option value="intermediate">🔥 Intermediate - Some experience</option>
                    <option value="advanced">⚡ Advanced - Regular training</option>
                    <option value="expert">👑 Expert - Years of dedication</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-gray-300">
                    🎯 Primary Goal
                  </label>
                  <select
                    value={form.primary_goal}
                    onChange={(e) => updateForm('primary_goal', e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded focus:border-red-600 focus:outline-none transition-colors"
                  >
                    <option value="weight_loss">⚖️ Weight Loss & Toning</option>
                    <option value="muscle_gain">💪 Muscle Building</option>
                    <option value="strength">🏋️ Strength & Power</option>
                    <option value="endurance">🏃 Endurance & Cardio</option>
                    <option value="flexibility">🧘 Flexibility & Mobility</option>
                    <option value="general_fitness">🌟 General Fitness</option>
                    <option value="sport_performance">⚽ Sport Performance</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-gray-300">
                      🚶 Current Activity Level
                    </label>
                    <select
                      value={form.current_activity_level}
                      onChange={(e) => updateForm('current_activity_level', e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded focus:border-red-600 focus:outline-none transition-colors"
                    >
                      <option value="sedentary">😴 Sedentary - Mostly sitting</option>
                      <option value="lightly_active">🚶 Lightly Active - Some walking</option>
                      <option value="moderately_active">🏃 Moderately Active - Regular exercise</option>
                      <option value="very_active">🔥 Very Active - Daily intense training</option>
                      <option value="extremely_active">⚡ Extremely Active - Elite athlete</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-gray-300">
                      ⏰ Preferred Training Time
                    </label>
                    <select
                      value={form.preferred_training_time}
                      onChange={(e) => updateForm('preferred_training_time', e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded focus:border-red-600 focus:outline-none transition-colors"
                    >
                      <option value="morning">🌅 Morning - Start the day strong</option>
                      <option value="afternoon">☀️ Afternoon - Midday energy</option>
                      <option value="evening">🌆 Evening - Unwind with exercise</option>
                      <option value="night">🌙 Night - Late night warrior</option>
                      <option value="flexible">🔄 Flexible - Whenever works</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 text-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-lg px-8 py-4 disabled:opacity-50"
                >
                  {submitting ? '⚡ Processing...' : '🚀 Begin Your Quest'}
                </button>
                <p className="text-sm text-gray-400 mt-3">
                  Next: Complete the 25-question warrior assessment
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
