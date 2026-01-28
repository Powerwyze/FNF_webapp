import { ClassBadge } from '@/components/ClassBadge'
import { RankShield } from '@/components/RankShield'
import { ExpBar } from '@/components/ExpBar'
import { QrCard } from '@/components/QrCard'
import { AvatarUploader } from '@/components/AvatarUploader'
import { PopupsList } from '@/components/PopupsList'
import { FitnessFairyChat } from '@/components/FitnessFairyChat'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

type Profile = {
  id: string
  email: string
  display_name: string
  class: 'Fighter'|'Assassin'|'Healer/Mage'|'Tank'|'Ranger' | null
  rank: 'E'|'D'|'C'|'B'|'A'|'S'
  exp: number
  rank_locked_until: string | null
  goal_summary: string | null
  bio: string | null
  avatar_url: string | null
  qr_payload: string | null
  last_workout_at: string | null
}

export function ProfileShell({ profile, onUpdate }: { profile: Profile; onUpdate: () => void }) {
  const { user, session } = useAuth()
  const [bio, setBio] = useState(profile.bio || '')
  const [saving, setSaving] = useState(false)
  const [loggingWorkout, setLoggingWorkout] = useState(false)
  const [editingClass, setEditingClass] = useState(false)
  const [selectedClass, setSelectedClass] = useState(profile.class || 'Fighter')
  const [savingClass, setSavingClass] = useState(false)

  useEffect(() => {
    setBio(profile.bio || '')
  }, [profile.bio])

  const authHeaders = session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {}

  async function saveBio() {
    if (!user) return
    setSaving(true)
    
    try {
      const response = await fetch('/api/profile/bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ userId: user.id, bio })
      })
      
      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error saving bio:', error)
    } finally {
      setSaving(false)
    }
  }

  async function logWorkout() {
    if (!user) return
    setLoggingWorkout(true)
    
    try {
      const response = await fetch('/api/workout/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ userId: user.id, expGain: 10 })
      })
      
      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error logging workout:', error)
    } finally {
      setLoggingWorkout(false)
    }
  }

  async function saveClass() {
    if (!user) return
    setSavingClass(true)
    try {
      const res = await fetch('/api/profile/class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ userId: user.id, newClass: selectedClass })
      })
      if (!res.ok) throw new Error('Failed to update class')
      setEditingClass(false)
      onUpdate()
    } catch (e) {
      console.error('Error updating class:', e)
      alert('Failed to change class. Please try again.')
    } finally {
      setSavingClass(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <aside className="glass rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          {profile.class ? (
            <ClassBadge className={profile.class} />
          ) : (
            <div className="text-gray-400">No class assigned</div>
          )}
          <RankShield rank={profile.rank} />
        </div>
        <div>
          {!editingClass ? (
            <button
              onClick={() => { setSelectedClass(profile.class || 'Fighter'); setEditingClass(true) }}
              className="btn-secondary text-sm"
            >
              Change Class
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as any)}
                className="bg-black/50 border border-gray-700 rounded px-3 py-2"
              >
                <option value="Fighter">Fighter</option>
                <option value="Assassin">Assassin</option>
                <option value="Healer/Mage">Healer/Mage</option>
                <option value="Tank">Tank</option>
                <option value="Ranger">Ranger</option>
              </select>
              <button onClick={saveClass} disabled={savingClass} className="btn-primary text-sm disabled:opacity-50">
                {savingClass ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditingClass(false)} className="btn-secondary text-sm">
                Cancel
              </button>
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold title-font">{profile.exp}</div>
          <div className="text-sm text-gray-400 uppercase tracking-wider">Total EXP</div>
        </div>
        <ExpBar exp={profile.exp} />
        <QrCard payload={`Class: ${profile.class ?? 'Unassigned'} | Rank: ${profile.rank}`} />
        {profile.goal_summary && (
          <div className="p-3 bg-black/30 rounded border border-gray-700">
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Goal</div>
            <div className="text-sm">{profile.goal_summary}</div>
          </div>
        )}
      </aside>
      
      <main className="lg:col-span-1 glass rounded-lg p-6 space-y-3">
        <div className="text-lg font-semibold">Character Bio</div>
        <AvatarUploader avatarUrl={profile.avatar_url ?? undefined} />
        <textarea 
          value={bio} 
          onChange={(e) => setBio(e.target.value)}
          className="w-full h-40 bg-transparent border border-gray-700 rounded p-3" 
          placeholder="Tell us about your warrior..."
        />
        <div className="flex gap-2">
          <button 
            onClick={saveBio} 
            disabled={saving}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Bio'}
          </button>
          <button 
            onClick={logWorkout} 
            disabled={loggingWorkout}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            {loggingWorkout ? 'Logging...' : 'Log Workout (+10 EXP)'}
          </button>
        </div>
      </main>
      
      <section className="lg:col-span-1">
        <FitnessFairyChat />
        <div className="mt-4">
          <a
            href="https://www.instagram.com/fitnessinfandom/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full inline-flex justify-center"
          >
            Check Out Your Quest Masters
          </a>
        </div>
      </section>
      
      <section className="lg:col-span-3 glass rounded-lg p-6">
        <div className="text-lg font-semibold mb-2">Upcoming Pop-ups</div>
        <PopupsList popups={[{ id: '1', title: 'Weekly Training', city: 'NYC', venue: 'Dungeon Gym', start_at: new Date().toISOString(), signup_url: '#' }]} />
      </section>
    </div>
  )
}


