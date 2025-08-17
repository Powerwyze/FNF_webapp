"use client"
import { useRef, useState } from 'react'

type Props = {
  avatarUrl?: string
}

export function AvatarUploader({ avatarUrl }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState<string | undefined>(avatarUrl)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(String(reader.result))
    reader.readAsDataURL(file)
  }

  return (
    <div className="glass p-4 rounded flex items-center gap-4">
      <img src={preview || '/avatar-placeholder.png'} alt="avatar" className="w-16 h-16 rounded object-cover border border-gray-700" />
      <div>
        <button onClick={() => inputRef.current?.click()} className="px-3 py-2 glass rounded">Choose Avatar</button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      </div>
    </div>
  )
}


