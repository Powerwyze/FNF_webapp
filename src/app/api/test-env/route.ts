import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  return Response.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    nodeEnv: process.env.NODE_ENV
  })
}
