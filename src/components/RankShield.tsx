type Props = { rank: 'E'|'D'|'C'|'B'|'A'|'S' }

export function RankShield({ rank }: Props) {
  const rankConfig = {
    E: { gradient: 'from-gray-600 to-gray-800', border: 'border-gray-500', glow: '' },
    D: { gradient: 'from-green-600 to-green-800', border: 'border-green-500', glow: 'shadow-glow-yellow' },
    C: { gradient: 'from-blue-600 to-blue-800', border: 'border-blue-500', glow: 'shadow-glow-orange' },
    B: { gradient: 'from-purple-600 to-purple-800', border: 'border-purple-500', glow: 'shadow-glow-orange' },
    A: { gradient: 'from-amber-600 to-amber-800', border: 'border-amber-500', glow: 'shadow-glow-yellow' },
    S: { gradient: 'from-red-600 via-orange-600 to-yellow-600', border: 'border-red-500', glow: 'shadow-glow-red' }
  }[rank]
  
  return (
    <div className={`relative ${rankConfig.glow}`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${rankConfig.gradient} blur-lg opacity-50`} />
      <div className={`relative w-16 h-20 flex items-center justify-center bg-gradient-to-b ${rankConfig.gradient} ${rankConfig.border} border-2`}
           style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider opacity-60">Rank</div>
          <div className="text-2xl font-bold title-font">{rank}</div>
        </div>
      </div>
    </div>
  )
}


