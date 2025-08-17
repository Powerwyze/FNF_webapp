"use client"
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function QrCard({ payload }: { payload: string }) {
  const [dataUrl, setDataUrl] = useState('')
  useEffect(() => {
    QRCode.toDataURL(payload, { width: 240 }).then(setDataUrl)
  }, [payload])
  return (
    <div className="glass p-4 rounded">
      <div className="text-sm text-gray-300 mb-2">QR Badge</div>
      {dataUrl && <img src={dataUrl} alt="QR" className="rounded" />}
      <div className="text-xs text-gray-400 mt-2 break-all">{payload}</div>
    </div>
  )
}


