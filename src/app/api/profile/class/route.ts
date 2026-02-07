import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/serverAuth'

const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_KEY!
)

const ALLOWED = ['Fighter', 'Archer', 'Wizard', 'Cleric'] as const

export async function POST(req: NextRequest) {
	try {
		const { userId, newClass } = await req.json()

		if (!userId || !newClass) {
			return Response.json({ error: 'Missing userId or newClass' }, { status: 400 })
		}
		const auth = await requireUser(req)
		if (!auth.user) {
			return Response.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
		}
		if (auth.user.id !== userId) {
			return Response.json({ error: 'Forbidden' }, { status: 403 })
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
		const qr_payload = `PXH|class=${newClass}|rank=${rank}`

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


