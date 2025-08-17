import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_KEY!
)

const ALLOWED = ['Fighter', 'Assassin', 'Healer/Mage', 'Tank', 'Ranger'] as const

export async function POST(req: NextRequest) {
	try {
		const { userId, newClass } = await req.json()

		if (!userId || !newClass) {
			return Response.json({ error: 'Missing userId or newClass' }, { status: 400 })
		}
		if (!ALLOWED.includes(newClass)) {
			return Response.json({ error: 'Invalid class' }, { status: 400 })
		}

		// Fetch current rank to keep QR consistent
		const { data: existing, error: fetchErr } = await supabaseAdmin
			.from('profiles')
			.select('rank')
			.eq('id', userId)
			.single()

		if (fetchErr || !existing) {
			return Response.json({ error: 'Profile not found' }, { status: 404 })
		}

		const rank = existing.rank || 'E'
		const qr_payload = `Class: ${newClass} | Rank: ${rank}`

		const { error: updateErr } = await supabaseAdmin
			.from('profiles')
			.update({ class: newClass, qr_payload })
			.eq('id', userId)

		if (updateErr) {
			return Response.json({ error: updateErr.message }, { status: 500 })
		}

		return Response.json({ success: true, class: newClass, qr_payload })
	} catch (e: any) {
		return Response.json({ error: e?.message || 'Unknown error' }, { status: 500 })
	}
}


