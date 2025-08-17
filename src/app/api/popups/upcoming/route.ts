export async function GET() {
  const now = new Date()
  const in10 = new Date(now.getTime() + 10*24*60*60*1000)
  return Response.json({
    popups: [
      { id: '1', title: 'Weekly Dungeon Run', venue: 'Dungeon Gym', city: 'NYC', start_at: in10.toISOString(), signup_url: '#' }
    ]
  })
}


