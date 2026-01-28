"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { supabase } from '@/lib/supabaseClient'

type Question = {
  id: number
  prompt: string
  choices: Array<{ key: string; label: string }>
}

export default function QuestionnairePage() {
  const { user, session } = useAuth()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [page, setPage] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const questionsPerPage = 3
  const maxPage = Math.ceil(questions.length / questionsPerPage) - 1
  const slice = questions.slice(page * questionsPerPage, (page + 1) * questionsPerPage)
  const progress = Object.keys(answers).length
  const total = questions.length

  useEffect(() => {
    loadQuestions()
  }, [])

  useEffect(() => {
    if (user) {
      loadSavedAnswers()
    }
  }, [user])

  const loadQuestions = async () => {
    try {
      const { data } = await supabase
        .from('questionnaire_questions')
        .select('*')
        .order('order_index')
      
      if (data) {
        setQuestions(data.map(q => ({
          id: q.id,
          prompt: q.prompt,
          choices: q.choices
        })))
      }
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSavedAnswers = async () => {
    if (!user) return
    
    try {
      const { data } = await supabase
        .from('questionnaire_responses')
        .select('question_id, choice_key')
        .eq('user_id', user.id)
      
      if (data) {
        const savedAnswers: Record<number, string> = {}
        data.forEach(response => {
          savedAnswers[response.question_id] = response.choice_key
        })
        setAnswers(savedAnswers)
      }
    } catch (error) {
      console.error('Error loading saved answers:', error)
    }
  }

  const selectAnswer = (questionId: number, choiceKey: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: choiceKey
    }))
  }

  const saveAnswers = async () => {
    if (!user) return
    
    try {
      for (const [questionId, choiceKey] of Object.entries(answers)) {
        await supabase
          .from('questionnaire_responses')
          .upsert({
            user_id: user.id,
            question_id: parseInt(questionId),
            choice_key: choiceKey
          })
      }
      alert('Progress saved!')
    } catch (error) {
      console.error('Error saving answers:', error)
      alert('Failed to save progress')
    }
  }

  const submit = async () => {
    if (!user || progress < total) return
    
    setSubmitting(true)
    
    try {
      // Save all answers first
      await saveAnswers()
      
      // Submit for class assignment
      const response = await fetch('/api/questionnaire/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ userId: user.id, responses: answers })
      })
      
      if (response.ok) {
        router.push('/profile')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit questionnaire')
      }
    } catch (error) {
      console.error('Error submitting questionnaire:', error)
      alert('Failed to submit questionnaire. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading warrior assessment...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-6 py-8">
          {/* Progress Header */}
          <div className="glass p-6 rounded-lg mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold title-font mb-2">
                <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  WARRIOR CLASS ASSESSMENT
                </span>
              </h1>
              <p className="text-gray-400">Answer 25 questions to discover your warrior class</p>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Progress: {progress}/{total}</span>
                <span>{Math.round((progress / total) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-red-600 to-orange-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${(progress / total) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button 
                disabled={page === 0} 
                onClick={() => setPage(p => p - 1)} 
                className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-gray-400">
                Page {page + 1} of {maxPage + 1}
              </span>
              <button 
                disabled={page === maxPage} 
                onClick={() => {
                  setPage(p => p + 1)
                  // Scroll to top for next questions
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }} 
                className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {slice.map(q => (
              <div key={q.id} className="glass p-6 rounded-lg border-l-4 border-red-600">
                <div className="mb-4">
                  <div className="text-lg font-medium text-white">{q.prompt}</div>
                </div>
                
                <div className="grid gap-3">
                  {q.choices.map(c => (
                    <button 
                      key={c.key} 
                      onClick={() => selectAnswer(q.id, c.key)} 
                      className={`text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        answers[q.id] === c.key 
                          ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-red-500 shadow-lg scale-105' 
                          : 'bg-black/30 border-gray-700 hover:border-red-500 hover:bg-black/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          answers[q.id] === c.key 
                            ? 'border-white bg-white' 
                            : 'border-gray-500'
                        }`}>
                          {answers[q.id] === c.key && (
                            <div className="w-2 h-2 bg-red-600 rounded-full" />
                          )}
                        </div>
                        <div>
                          <span className="font-semibold">{c.key}.</span> {c.label}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Navigation & Action Buttons */}
          <div className="glass p-6 rounded-lg mt-8">
            {/* Bottom Navigation */}
            <div className="flex justify-between items-center mb-6">
              <button 
                disabled={page === 0} 
                onClick={() => setPage(p => p - 1)} 
                className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Previous Page
              </button>
              <span className="text-gray-400">
                Page {page + 1} of {maxPage + 1}
              </span>
              <button 
                disabled={page === maxPage} 
                onClick={() => {
                  setPage(p => p + 1)
                  // Scroll to top for next questions
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }} 
                className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next Page →
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={saveAnswers} 
                className="btn-secondary text-lg px-8 py-3"
              >
                💾 Save Progress
              </button>
              <button 
                onClick={submit} 
                disabled={submitting || progress < total}
                className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '⚡ Processing...' : '🚀 Submit & Get Class'}
              </button>
            </div>
            
            {progress < total && (
              <div className="text-center mt-4 text-gray-400">
                Complete all {total} questions to discover your warrior class
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}


