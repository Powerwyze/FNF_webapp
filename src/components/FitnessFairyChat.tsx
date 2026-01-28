"use client"
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

type Msg = { role: 'user'|'assistant'; content: string }

export function FitnessFairyChat() {
  const { user, session } = useAuth()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  async function send() {
    if (!input.trim() || !user) return
    setSending(true)
    
    const userMsg: Msg = { role: 'user', content: input }
    setMessages(m => [...m, userMsg])
    setInput('')
    
    try {
      const res = await fetch('/api/fitness-fairy', { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ 
          message: userMsg.content,
          userId: user.id 
        }) 
      })
      const data = await res.json()
      const reply: Msg = { role: 'assistant', content: data.reply ?? '...' }
      setMessages(m => [...m, reply])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Error contacting Fitness Fairy.' }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="glass p-4 rounded">
      <div className="text-lg font-semibold mb-2">Fitness Fairy</div>
      <div className="space-y-2 max-h-64 overflow-auto mb-3">
        {messages.map((m, i) => (
          <div key={i} className={`px-3 py-2 rounded ${m.role==='user' ? 'bg-gray-800' : 'bg-fnf-accent/20'}`}>{m.content}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask for a weekly plan, warm-ups, or diet tips..." className="flex-1 px-3 py-2 bg-transparent border border-gray-700 rounded" />
        <button 
          onClick={send} 
          disabled={sending}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}


