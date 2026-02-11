export type MonsterPhase = 'full' | 'half' | 'dead'

export type MonsterMedia = {
  type: 'video' | 'image'
  src: string
}

export type MonsterPhaseSet = {
  full: MonsterMedia
  half: MonsterMedia
  dead: MonsterMedia
}

export const MONSTER_PHASE_MEDIA: Record<string, MonsterPhaseSet> = {
  Goblin: {
    full: { type: 'video', src: '/quests/Goblin_fullHealth.mp4' },
    half: { type: 'video', src: '/quests/Goblin_halfHealth.mp4' },
    dead: { type: 'image', src: '/quests/Goblin_dead.png' }
  },
  Orc: {
    full: { type: 'image', src: '/quests/orc-full.svg' },
    half: { type: 'image', src: '/quests/orc-half.svg' },
    dead: { type: 'image', src: '/quests/orc-dead.svg' }
  },
  Dragon: {
    full: { type: 'image', src: '/quests/dragon-full.svg' },
    half: { type: 'image', src: '/quests/dragon-half.svg' },
    dead: { type: 'image', src: '/quests/dragon-dead.svg' }
  }
}

