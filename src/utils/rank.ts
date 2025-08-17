export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S'

export const RANK_THRESHOLDS: Array<{ rank: Rank; minExp: number }> = [
  { rank: 'E', minExp: 0 },
  { rank: 'D', minExp: 50 },
  { rank: 'C', minExp: 150 },
  { rank: 'B', minExp: 350 },
  { rank: 'A', minExp: 650 },
  { rank: 'S', minExp: 1000 },
]

export function calculateRank(exp: number): Rank {
  let current: Rank = 'E'
  for (const t of RANK_THRESHOLDS) {
    if (exp >= t.minExp) current = t.rank
  }
  return current
}

export function expToNextRank(exp: number): { nextRank: Rank | null; needed: number } {
  for (const t of RANK_THRESHOLDS) {
    if (exp < t.minExp) {
      return { nextRank: t.rank, needed: t.minExp - exp }
    }
  }
  return { nextRank: null, needed: 0 }
}


