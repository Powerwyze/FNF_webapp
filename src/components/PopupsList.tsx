type Popup = { id: string; title: string; venue: string; city: string; start_at: string; signup_url: string }

export function PopupsList({ popups }: { popups: Popup[] }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {popups.map(p => (
        <div key={p.id} className="p-4 rounded border border-gray-700">
          <div className="font-medium">{p.title}</div>
          <div className="text-sm text-gray-300">{p.city} — {p.venue}</div>
          <div className="text-sm text-gray-400">{new Date(p.start_at).toLocaleString()}</div>
          <a href={p.signup_url} className="text-fnf-accent text-sm" target="_blank" rel="noopener noreferrer">Sign up</a>
        </div>
      ))}
    </div>
  )
}


