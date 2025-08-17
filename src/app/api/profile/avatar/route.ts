import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: NextRequest) {
  const { userId, fileName } = await req.json()
  
  if (!userId || !fileName) {
    return Response.json({ error: 'Missing userId or fileName' }, { status: 400 })
  }

  try {
    // Generate signed URL for upload
    const filePath = `${userId}/${fileName}`
    const { data, error } = await supabase.storage
      .from('avatars')
      .createSignedUploadUrl(filePath)

    if (error) throw error

    return Response.json({ 
      uploadUrl: data.signedUrl,
      filePath,
      publicUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`
    })
  } catch (error) {
    console.error('Avatar upload URL error:', error)
    return Response.json({ error: 'Failed to create upload URL' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const { userId, avatarUrl } = await req.json()
  
  if (!userId || !avatarUrl) {
    return Response.json({ error: 'Missing userId or avatarUrl' }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)

    if (error) throw error

    return Response.json({ success: true, avatarUrl })
  } catch (error) {
    console.error('Avatar URL update error:', error)
    return Response.json({ error: 'Failed to update avatar URL' }, { status: 500 })
  }
}
