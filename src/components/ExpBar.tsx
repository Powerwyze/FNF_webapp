type Props = { exp: number }

const thresholds = [0, 50, 150, 350, 650, 1000]
const ranks = ['E', 'D', 'C', 'B', 'A', 'S']

function getNextThreshold(exp: number) {
  for (let i = 0; i < thresholds.length; i++) {
    if (exp < thresholds[i]) return thresholds[i]
  }
  return thresholds[thresholds.length - 1]
}

function getCurrentRank(exp: number) {
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (exp >= thresholds[i]) return ranks[i]
  }
  return 'E'
}

export function ExpBar({ exp }: Props) {
  const next = getNextThreshold(exp)
  const prev = thresholds.slice().reverse().find(t => exp >= t) ?? 0
  const pct = next === prev ? 100 : Math.min(100, ((exp - prev) / (next - prev)) * 100)
  const currentRank = getCurrentRank(exp)
  const nextRankIndex = ranks.indexOf(currentRank) + 1
  const nextRank = nextRankIndex < ranks.length ? ranks[nextRankIndex] : 'MAX'
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">EXP Progress</span>
        <span className="font-bold accent-font">{exp} / {next}</span>
      </div>
      <div className="relative">
        <div className="progress-bar h-6 rounded">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
            {pct.toFixed(0)}%
          </div>
        </div>
      </div>
      <div className="text-xs text-center">
        <span className="text-gray-400">{Math.max(next - exp, 0)} EXP to </span>
        <span className="text-yellow-500 font-bold">RANK {nextRank}</span>
      </div>
    </div>
  )
}


