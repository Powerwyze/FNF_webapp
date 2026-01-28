"use client"
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'

export default function LandingPage() {
  const { user } = useAuth()
  
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-6">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="relative inline-block mb-8">
            <h1 className="text-6xl md:text-8xl font-bold title-font">
              <span className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-500 bg-clip-text text-transparent">
                ENTER THE ARENA
              </span>
            </h1>
            <div className="absolute -inset-4 bg-red-600/20 blur-3xl -z-10" />
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 accent-font max-w-3xl mx-auto">
            Transform your fitness journey into an epic adventure. Choose your class, level up through real workouts, and conquer challenges alongside fellow warriors.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link href="/profile" className="btn-primary text-lg">
                  VIEW YOUR PROFILE
                </Link>
                <Link href="/onboarding/questionnaire" className="btn-secondary text-lg">
                  COMPLETE QUEST
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth" className="btn-primary text-lg">
                  BEGIN YOUR QUEST
                </Link>
                <Link href="/onboarding/questionnaire" className="btn-secondary text-lg">
                  PREVIEW QUESTIONNAIRE
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div className="glass p-6 rounded-lg border-l-4 border-red-600 hover:border-orange-600 transition-colors">
            <h3 className="text-2xl font-bold mb-3 title-font text-red-500">CHOOSE YOUR CLASS</h3>
            <p className="text-gray-300">
              Complete our 25-question assessment to be assigned one of five unique classes: Fighter, Assassin, Healer/Mage, Tank, or Ranger.
            </p>
          </div>
          
          <div className="glass p-6 rounded-lg border-l-4 border-orange-600 hover:border-yellow-500 transition-colors">
            <h3 className="text-2xl font-bold mb-3 title-font text-orange-500">LEVEL UP</h3>
            <p className="text-gray-300">
              Earn EXP through workouts, climb ranks from E to S, and unlock achievements. Your progress is protected with 30-day rank invincibility.
            </p>
          </div>
          
          <div className="glass p-6 rounded-lg border-l-4 border-yellow-500 hover:border-red-600 transition-colors">
            <h3 className="text-2xl font-bold mb-3 title-font text-yellow-500">FITNESS FAIRY</h3>
            <p className="text-gray-300">
              Get personalized workout plans, nutrition tips, and challenge prep from your AI companion tailored to your class and goals.
            </p>
          </div>
        </section>

        {/* Classes Preview */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-8 title-font">
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              WARRIOR CLASSES
            </span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'FIGHTER', borderClass: 'border-red-500', desc: 'Aesthetic warrior' },
              { name: 'ASSASSIN', borderClass: 'border-purple-500', desc: 'Agile striker' },
              { name: 'HEALER', borderClass: 'border-green-500', desc: 'Balanced support' },
              { name: 'TANK', borderClass: 'border-blue-500', desc: 'Strength titan' },
              { name: 'RANGER', borderClass: 'border-yellow-500', desc: 'Athletic hunter' }
            ].map((cls) => (
              <div key={cls.name} className={`glass p-4 text-center rounded-lg border-t-4 ${cls.borderClass}`}>
                <h4 className="font-bold title-font text-lg mb-1">{cls.name}</h4>
                <p className="text-xs text-gray-400">{cls.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16 relative">
          <div className="glass-dark p-12 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-orange-600/10 to-yellow-500/10" />
            <h2 className="text-4xl font-bold mb-4 title-font relative z-10">
              READY TO TRANSFORM?
            </h2>
            <p className="text-xl text-gray-300 mb-8 relative z-10">
              Join the FNF community and start your legendary fitness journey today.
            </p>
            {user ? (
              <Link href="/profile" className="btn-primary text-xl relative z-10">
                VIEW YOUR PROFILE
              </Link>
            ) : (
              <Link href="/auth" className="btn-primary text-xl relative z-10">
                CREATE YOUR CHARACTER
              </Link>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}


