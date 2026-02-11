"use client"
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { user, signOut, loading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="relative overflow-hidden mb-8">
      <div className="glass-dark border-b border-red-900/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative">
                <Image 
                  src="/FNFLogo.png" 
                  alt="Project X Hero" 
                  width={60} 
                  height={60} 
                  className="relative z-10 group-hover:scale-110 transition-transform duration-300" 
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold title-font bg-gradient-to-r from-red-600 via-orange-600 to-yellow-500 bg-clip-text text-transparent">
                  PROJECT X HERO
                </h1>
                <p className="hidden md:block text-xs uppercase tracking-[0.3em] text-gray-400 accent-font">
                  Forge The Golden Age Of Heroes
                </p>
                <p className="hidden md:block text-xs uppercase tracking-[0.2em] text-gray-500 accent-font">
                  Powered By Fitness In Fandom
                </p>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center px-3 py-2 border border-red-900/40 rounded text-gray-200"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? 'Close' : 'Menu'}
            </button>

            <nav className="hidden md:flex items-center gap-6">
              {!loading && (
                <>
                  {user ? (
                    <>
                      <Link href="/profile" className="text-gray-300 hover:text-red-500 transition-colors uppercase text-sm font-semibold tracking-wider">
                        Profile
                      </Link>
                      <Link href="/quest-gallery" className="text-gray-300 hover:text-red-500 transition-colors uppercase text-sm font-semibold tracking-wider">
                        Quest Gallery
                      </Link>
                      <Link href="/onboarding/questionnaire" className="text-gray-300 hover:text-red-500 transition-colors uppercase text-sm font-semibold tracking-wider">
                        Class Assessment
                      </Link>
                      <button 
                        onClick={() => signOut()} 
                        className="text-gray-300 hover:text-red-500 transition-colors uppercase text-sm font-semibold tracking-wider"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link href="/auth" className="btn-primary text-sm">
                      Enter Guild
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>

          <nav className={`${mobileOpen ? 'block' : 'hidden'} md:hidden mt-4 border-t border-red-900/30 pt-4`}>
            {!loading && (
              <div className="flex flex-col gap-3">
                {user ? (
                  <>
                    <Link onClick={() => setMobileOpen(false)} href="/profile" className="text-gray-300 hover:text-red-500 transition-colors uppercase text-sm font-semibold tracking-wider">
                      Profile
                    </Link>
                    <Link onClick={() => setMobileOpen(false)} href="/quest-gallery" className="text-gray-300 hover:text-red-500 transition-colors uppercase text-sm font-semibold tracking-wider">
                      Quest Gallery
                    </Link>
                    <Link onClick={() => setMobileOpen(false)} href="/onboarding/questionnaire" className="text-gray-300 hover:text-red-500 transition-colors uppercase text-sm font-semibold tracking-wider">
                      Class Assessment
                    </Link>
                    <button
                      onClick={() => { setMobileOpen(false); signOut() }}
                      className="text-left text-gray-300 hover:text-red-500 transition-colors uppercase text-sm font-semibold tracking-wider"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link onClick={() => setMobileOpen(false)} href="/auth" className="btn-primary text-sm w-full text-center">
                    Enter Guild
                  </Link>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
      
      {/* Decorative bottom border */}
      <div className="h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />
    </header>
  )
}

