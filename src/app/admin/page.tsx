"use client"
import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { supabase } from '@/lib/supabaseClient'

type Popup = {
  id: string
  title: string
  venue: string
  city: string
  start_at: string
  end_at?: string
  description?: string
  signup_url?: string
}

export default function AdminPage() {
  const [popups, setPopups] = useState<Popup[]>([])
  const [formData, setFormData] = useState({
    title: '',
    venue: '',
    city: '',
    start_at: '',
    end_at: '',
    description: '',
    signup_url: ''
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    loadPopups()
  }, [])

  async function loadPopups() {
    const { data } = await supabase
      .from('popups')
      .select('*')
      .order('start_at', { ascending: true })
    
    if (data) setPopups(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const popupData = {
      ...formData,
      start_at: new Date(formData.start_at).toISOString(),
      end_at: formData.end_at ? new Date(formData.end_at).toISOString() : null
    }

    if (editingId) {
      await supabase
        .from('popups')
        .update(popupData)
        .eq('id', editingId)
    } else {
      await supabase
        .from('popups')
        .insert(popupData)
    }

    setFormData({
      title: '',
      venue: '',
      city: '',
      start_at: '',
      end_at: '',
      description: '',
      signup_url: ''
    })
    setEditingId(null)
    loadPopups()
  }

  async function deletePopup(id: string) {
    if (confirm('Delete this popup?')) {
      await supabase
        .from('popups')
        .delete()
        .eq('id', id)
      loadPopups()
    }
  }

  function editPopup(popup: Popup) {
    setFormData({
      title: popup.title,
      venue: popup.venue,
      city: popup.city,
      start_at: popup.start_at.split('T')[0],
      end_at: popup.end_at?.split('T')[0] || '',
      description: popup.description || '',
      signup_url: popup.signup_url || ''
    })
    setEditingId(popup.id)
  }

  return (
    <div>
      <Header />
      <div className="glass p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Admin - Manage Popups</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="px-3 py-2 bg-transparent border border-gray-700 rounded"
              required
            />
            <input
              type="text"
              placeholder="Venue"
              value={formData.venue}
              onChange={e => setFormData({...formData, venue: e.target.value})}
              className="px-3 py-2 bg-transparent border border-gray-700 rounded"
              required
            />
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={e => setFormData({...formData, city: e.target.value})}
              className="px-3 py-2 bg-transparent border border-gray-700 rounded"
              required
            />
            <input
              type="date"
              placeholder="Start Date"
              value={formData.start_at}
              onChange={e => setFormData({...formData, start_at: e.target.value})}
              className="px-3 py-2 bg-transparent border border-gray-700 rounded"
              required
            />
            <input
              type="date"
              placeholder="End Date (optional)"
              value={formData.end_at}
              onChange={e => setFormData({...formData, end_at: e.target.value})}
              className="px-3 py-2 bg-transparent border border-gray-700 rounded"
            />
            <input
              type="url"
              placeholder="Signup URL (optional)"
              value={formData.signup_url}
              onChange={e => setFormData({...formData, signup_url: e.target.value})}
              className="px-3 py-2 bg-transparent border border-gray-700 rounded"
            />
          </div>
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 bg-transparent border border-gray-700 rounded h-24"
          />
          <div className="flex gap-3">
            <button type="submit" className="bg-fnf-accent text-white px-4 py-2 rounded">
              {editingId ? 'Update' : 'Create'} Popup
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setFormData({
                    title: '',
                    venue: '',
                    city: '',
                    start_at: '',
                    end_at: '',
                    description: '',
                    signup_url: ''
                  })
                }}
                className="glass px-4 py-2 rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Existing Popups</h2>
          {popups.map(popup => (
            <div key={popup.id} className="glass p-4 rounded flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{popup.title}</h3>
                <p className="text-sm text-gray-400">
                  {popup.venue}, {popup.city} • {new Date(popup.start_at).toLocaleDateString()}
                  {popup.end_at && ` - ${new Date(popup.end_at).toLocaleDateString()}`}
                </p>
                {popup.description && <p className="text-sm mt-1">{popup.description}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => editPopup(popup)} className="text-fnf-accent hover:underline">
                  Edit
                </button>
                <button onClick={() => deletePopup(popup.id)} className="text-red-400 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}