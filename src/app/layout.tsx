import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Fitness N Fighting',
  description: 'Onboarding for FNF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}


